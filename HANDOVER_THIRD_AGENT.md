# Rocío Water Retail — Unified Handover for Agent #3

You have three views the prior two agents only had partially:
- **Agent #1 (Claude Code "PC1"):** Full app repo access (the source you're reading). NO n8n access.
- **Agent #2 (Cowork):** Full n8n + Odoo + Firebase Console access. NO repo access — wrote the brief at the bottom of this file blind.
- **You (Agent #3):** All of the above plus local files.

This doc is the consolidated source of truth as of the last commit on `claude/review-project-architecture-gHZnc`. Read sections 1–6 before touching code; section 7 is your incoming task verbatim from Agent #2.

---

## 1. Project at a glance

**Rocío** is a React 19 + TypeScript + Vite + Tailwind water delivery storefront for Saudi customers. Arabic-first RTL UI. Backend is glued together with n8n workflows that read/write Odoo (ERP) and Firebase DataConnect (PostgreSQL via GraphQL). Realtime order status lives in Firebase RTDB; profile data in Firestore.

- **Live app:** `https://project-0a287015-616b-4f71-bbf.web.app`
- **Firebase project ID:** `project-0a287015-616b-4f71-bbf`
- **Repo:** `MuwafagQ/Rocio-last`
- **Active dev branch:** `claude/review-project-architecture-gHZnc` (deployed by CI alongside `main`)
- **CI:** `.github/workflows/deploy.yml` — builds Vite, injects Firebase creds from GitHub Secrets, runs `firebase deploy --only hosting`. **Does NOT deploy DataConnect** — that has to be done manually from a developer machine (see §3).

---

## 2. Architecture map

```
                    ┌──────────────────────────────────┐
                    │  React App (Firebase Hosting)    │
                    │  /, /track, /checkout, etc.      │
                    └────────┬──────────┬──────────────┘
                             │          │
            ┌────────────────┘          └──────────────────┐
            │ reads catalog                                │ writes order
            │ (DataConnect GraphQL)                        │ (n8n webhook)
            ▼                                              ▼
   ┌───────────────────┐                  ┌──────────────────────────────┐
   │ Firebase          │                  │ n8n WF#1 (#1-Order Odoo)     │
   │ DataConnect       │                  │ id evly3w6VusxkwZ0p          │
   │ (us-east4)        │                  │  - creates Odoo sale.order   │
   │ → Cloud SQL pg    │                  │  - writes /order_status/{id} │
   │   instance:       │                  │    {status:"pending",...}    │
   │   project-...-bbf-│                  │  - fires WF#3 via HTTP node  │
   │   instance        │                  └──────────────┬───────────────┘
   │   db: postgres    │                                 │
   └───────────────────┘                                 ▼
            ▲                              ┌──────────────────────────────┐
            │ SYNC workflow                │ n8n WF#3 (#3.JOOD-Delivery)  │
            │ (Odoo → DataConnect)         │ id aLwMDXVM6OsR7ubk          │
   ┌────────┴──────────┐                   │  - assigns driver            │
   │     Odoo ERP      │                   │  - writes status:"assigned"  │
   └───────────────────┘                   │    {driver_*, vehicle_type,  │
                                           │     navigation_link, ...}    │
                                           └──────────────────────────────┘
                                                          ▲
                                           POST /webhook/delivery-complete
                                           → flips to "delivered" | "failed_delivery"

   ┌──────────────────────────────────────────────────────────────────┐
   │ Firebase RTDB  /order_status/{order_id}  ← React app subscribes  │
   │ (default-rtdb in same project)                                   │
   └──────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────┐
   │ Firebase Auth  (Anonymous + email/password for admin only)       │
   │ Firestore users/{uid}  — profile, role, tier, default_address    │
   └──────────────────────────────────────────────────────────────────┘
```

### n8n endpoints the app currently calls
| Endpoint | Called from | Payload | Purpose |
|---|---|---|---|
| `POST /webhook/register-user` | `AuthContext.registerAnonymous` | `{ firebase_uid, name, phone, email }` | Upsert customer into Odoo + DataConnect |
| `POST /webhook/create-order` | `Checkout.handleCheckout` | see §4.3 | Triggers WF#1 → WF#3 chain |
| `POST /webhook/delivery-complete` | n8n-only (not the app) | `{ delivery_id, driver_id, order_id, outcome, customer_id }` | Driver app reports outcome; flips RTDB to delivered/failed |
| `POST /webhook/delivery-trigger` | *not yet called by app* | `{ order_id, customer_id, delivery_address }` | Re-fires WF#3 for retry. Will be used by the new tracking page (§7). |
| `POST /webhook/send-otp`, `/webhook/verify-otp` | **Disabled.** | n/a | OTP flow parked — see §6. |

---

## 3. DataConnect — what was a nightmare, what's true now

The catalog (`ListProducts` / `ListBrands` queries) reads from a Firebase DataConnect service backed by Cloud SQL Postgres.

**Service identity (must match the deployed service exactly):**
- `serviceId: project-0a287015-616b-4f71-bbf-service`
- `location: us-east4` *(NOT us-central1 — that mistake cost a full session)*
- `cloudSql.instanceId: project-0a287015-616b-4f71-bbf-instance`
- `database: postgres` *(NOT `fdc`)*

All four values live in `dataconnect/dataconnect.yaml`. The generated SDK at `src/generated/` was regenerated to point at `us-east4`. If you regenerate the SDK, ensure `connectorConfig.location` in `src/generated/esm/index.esm.js` and `src/generated/index.cjs.js` matches.

**Schema lives at `dataconnect/schema/schema.gql`.** Earlier in the project this file was *not committed* — it only lived on the deploy developer's machine. That meant nobody could re-deploy DataConnect from CI. It's now committed and includes `internalReference: String! @unique` and `odooVariantId: Int! @unique` (the latter preserves the Postgres UNIQUE constraint the SYNC workflow relies on).

**Catalog status:** 9 brands × ~60 SKUs are live with real images, verified visually in production.

**CI does NOT deploy DataConnect.** Schema/query/mutation changes still require a manual `firebase deploy --only dataconnect` from a developer machine. Phase B (planned) extends CI to do this automatically.

---

## 4. App state — what's done, what's wired, what's open

### 4.1 Auth — current direction
Originally: WhatsApp OTP via n8n → Firebase custom token → `signInWithCustomToken`.
**Now (as of commit `534eb65`):** anonymous auth + name/phone, OTP parked. See §6 for the why.

`store/AuthContext.tsx` exposes:
- `registerAnonymous(name, phone)` — `signInAnonymously` → `setDoc(users/{uid}, {uid, name, phone, email:''}, {merge:true})` → `setUser(...)` → fire-and-forget `POST /webhook/register-user`.
- `loginWithEmail(email, pass)` — admin only.
- `logout`.
- `sendOtp` / `verifyOtp` are commented out with a TODO pointing to §6 for restoration.

**Known open issue (commit `00fc1c8` exposes the error code so you can confirm):** the `setDoc` payload was redesigned to satisfy `firestore.rules` (`hasOnly([uid, name, email, phone, avatarUrl, default_address])`). If you still see an error message ending in `(auth/operation-not-allowed)`, **enable Anonymous Auth in Firebase Console → Auth → Sign-in method**. The user has not yet confirmed whether that toggle is on.

### 4.2 Catalog (Home / ProductCard)
- `store/ProductContext.tsx` calls `getDataConnect(getApp(), connectorConfig)` lazily *inside* `useEffect` (calling it at module init crashes with a blank page — committed lesson at `2aaba3a`).
- `listProducts(dc)` must be called with explicit `dc` instance — the no-arg form fails silently.
- `isActive` filters are **currently disabled** (`c473a57`) so all SKUs show even if the sync forgets the flag. Re-enable once Cowork confirms the SYNC sets `is_active = true` reliably.
- **Out-of-stock UI** (`aadd24c`): `Product.stock?: number`; `stock === 0` renders red badge `نفذت الكمية`, grayscale image, disabled `طلب مسبق` button (placeholder for future pre-order endpoint).
- `Home.tsx` surfaces DataConnect errors as a red banner (good debugging hygiene — leave it).
- `constants.ts` `MOCK_PRODUCTS` is no longer used by `ProductContext` but is still merged into the catalog by `Home.tsx`. `DONATION_PRODUCTS` (2 mosque items) are hardcoded and intentionally never go through the order webhook.

### 4.3 Checkout & current tracking UI
`pages/Checkout.tsx` has TWO concerns in one file (split later):

**Order placement (`handleCheckout`):**
```ts
POST https://n8n.srv1473225.hstgr.cloud/webhook/create-order
{
  firebase_uid,
  customer_id,              // user.phone || user.email
  customer_name,
  delivery_address,         // text
  customer_location_lat,    // number | null
  customer_location_lng,    // number | null
  visual_description,
  payment_method,
  delivery_type,            // 'now' | 'scheduled'
  delivery_date,            // ISO
  delivery_time,            // 'now' or slot id
  delivery_fee,
  items: [{ product_id, quantity }]   // product_id IS Sku.internal_reference (e.g. NOVA-200ml-C48)
}
```
Response: `{ order_id: "ROCIO-XXXX" }`. The app stashes it in `localStorage.activeOrderId` and uses it for tracking subscription.

**Existing tracking component (`OrderTracking`, exported from `Checkout.tsx`):**
This is what §7 wants you to refactor / extend / replace. It already exists and is partially wired:
- Subscribes to `ref(rtdb, /order_status/${orderId})` with dynamic imports (`Checkout.tsx:39-42`).
- Has a 4-step horizontal stepper at lines 90–108. The `STATUS_LABELS` at line 21 maps:
  - `pending` → في انتظار التعيين
  - `assigned` → تم تعيين السائق
  - `en_route` → السائق في الطريق  *(no longer produced by n8n per the new schema — see §7)*
  - `delivered` → تم التوصيل
  - `cancelled` → تم الإلغاء
- Has a driver-info card (lines 111–129) with phone-call button.
- Has a Google Maps link (lines 131–137) but only if `driver_lat`/`driver_lng` exist. **The new RTDB schema does NOT emit lat/lng — it emits `navigation_link` as a complete URL.** This is one of the things you'll fix in §7.
- Has an `rtdbError` fallback banner (lines 146–150).
- Used in two places:
  - `Checkout.tsx:343` — full-screen mode after order placement.
  - `Profile.tsx:211` — card mode in the Profile page, reads `localStorage.activeOrderId`.

### 4.4 Firestore rules
`firestore.rules` is committed but **may not be deployed**. CI only deploys hosting. The rules file expects users to write `{uid, name, email, phone, avatarUrl, default_address}` only (no role/tier from the client). If `permission-denied` appears anywhere, run `firebase deploy --only firestore:rules` from a dev machine.

### 4.5 RTDB rules
**Not in the repo. Status unknown.** Cowork's brief in §7 explicitly says document this as open tech debt — security rules for `/order_status/{order_id}` haven't been audited.

---

## 5. Branch & commit lineage you need

```
00fc1c8 fix: match setDoc payload to Firestore rules, surface real error code in UI
534eb65 feat: replace OTP flow with anonymous auth + name/phone onboarding
1c972ea Declare odooVariantId as Int! @unique to preserve SYNC's ON CONFLICT key
d66dbac Fix dataconnect.yaml: match deployed Cloud SQL instance and database name
a0c25ce Fix DataConnect location to us-east4 to match deployed service
fd0a84e Add dataconnect/schema/schema.gql with internalReference on Sku
c473a57 fix: remove isActive filter, fix constants TS errors, surface DataConnect errors in UI
aadd24c feat: show all products with out-of-stock UI indicator
70e9ad2 fix: remove stock > 0 filter so all active SKUs appear in catalog
58b0a41 fix: initialize DataConnect lazily inside useEffect to load products
2aaba3a fix: remove getDataConnect from firebase.ts to prevent blank page crash
ddee47b feat: initialize DataConnect explicitly and rewrite ProductContext to read from it
095c4cd fix: wire register-user webhook in verifyOtp and fix syntax error
84d21fa feat: WhatsApp OTP auth — real send-otp/verify-otp via n8n
b3378e4 feat: tier-based pricing
e8b1036 security: tighten Firestore rules
```

`git pull origin claude/review-project-architecture-gHZnc` before starting. The branch is ahead of `main`.

---

## 6. Why OTP is parked

n8n's `verify-otp` workflow hits a sandbox error `Module 'crypto' is disallowed` when minting Firebase custom tokens. Even with a working WhatsApp template, the token-minting step is blocked. Separately, Meta hasn't approved the `rocio_otp` WhatsApp template yet.

**Decision:** ship anonymous auth now; restore OTP later as an **upgrade** path (`linkWithCredential` preserves the anonymous UID, so cart/addresses/profile carry over). The restoration plan: replace n8n token minting with a Firebase Cloud Function that uses the Admin SDK directly. `sendOtp`/`verifyOtp` remain commented in `AuthContext.tsx` for that day.

---

## 7. YOUR INCOMING TASK (verbatim from Agent #2)

> *Below is what Agent #2 ("Cowork") wrote for you. They had no view of the repo, so a few of their assumptions don't match what's actually there. The reconciliation notes underneath each section ("📝 PC1 NOTE") flag those mismatches so you don't waste time chasing things.*

### Task: Wire the customer-facing live order tracking page to Firebase Realtime DB

There is a 4-step stepper UI already on the tracking page but is statically rendered and not subscribed to anything. Your job:
- (a) Subscribe the stepper to RTDB so it advances live.
- (b) Build a driver-info card with call/map buttons that appears once a driver is assigned (this card does NOT exist yet; design it to visually match the stepper's style).

> 📝 **PC1 NOTE on (a) and (b):** Both ALREADY EXIST in `pages/Checkout.tsx` as the exported `OrderTracking` component. The stepper *is* subscribed (lines 34–65). The driver card *does* exist (lines 111–129). But:
> 1. The current stepper maps to the **old** schema with `en_route` as a discrete status, which no longer exists.
> 2. The current driver card reads `driver_lat`/`driver_lng`, but the **new** RTDB schema emits `navigation_link` (a full Google Maps URL string) + `vehicle_type`.
> 3. No relative-time display ("منذ دقيقتين").
> 4. No `failed_delivery` UI — only a generic `cancelled` label.
> 5. No retry button for `failed_delivery` → POST `/webhook/delivery-trigger`.
> 6. No 10-second-stuck `جاري تعيين السائق…` hint while pending.
> 7. The Profile.tsx card embeds `OrderTracking` but doesn't know about the new states.
>
> **Recommended approach:** don't build from scratch. Extract the existing `OrderTracking` from `Checkout.tsx` into `pages/Track.tsx` (or `components/OrderTracking.tsx`) and a new hook `src/hooks/useOrderStatus.ts`. Update the schema mapping, fields, and add the missing edge-case UIs. Keep `OrderTracking`'s existing usage points working (full-screen in Checkout success, card in Profile).

### What's already working (DO NOT TOUCH)
- n8n WF#1 (id `evly3w6VusxkwZ0p`) creates the order, writes `status:"pending"` to RTDB, AND fires WF#3 with `{ order_id, customer_id, delivery_address }`.
- n8n WF#3 (id `aLwMDXVM6OsR7ubk`) assigns a driver, writes `status:"assigned"` + driver block to the same RTDB path.
- `POST /webhook/delivery-complete` flips it to `delivered` or `failed_delivery`.
- Firebase project: `project-0a287015-616b-4f71-bbf-default-rtdb`.

### Status → stepper mapping (implement exactly this)
4 stepper steps RTL: 1️⃣ `في انتظار التعيين` → 2️⃣ `تم تعيين السائق` → 3️⃣ `السائق في الطريق` → 4️⃣ `تم التوصيل`
- `pending`           → step 1 active, 2–4 inactive
- `assigned`          → steps 1, 2, 3 lit simultaneously (we don't track in-transit separately), 4 inactive
- `delivered`         → all 4 complete
- `failed_delivery`   → stepper grayed out + red banner above with retry CTA

### RTDB schema at `/order_status/{order_id}` (PUT, full replace each write)

**Pending** (brief, right after checkout):
```json
{ "status":"pending", "order_id":"…", "total_amount":…, "customer_phone":"…",
  "delivery_address":"…", "odoo_order_id":…, "last_updated_at":… }
```

**Assigned** (within seconds of pending):
```json
{ "status":"assigned", "driver_id":"…", "driver_name":"…", "driver_phone":"…",
  "vehicle_type":"…", "navigation_link":"https://…", "delivery_id":"…",
  "last_updated_at":… }
```

**Delivered / failed:**
```json
{ "status":"delivered"|"failed_delivery", "delivery_id":"…", "driver_id":"…",
  "outcome":"…", "delivered_at":…, "last_updated_at":… }
```

⚠️ **Each write REPLACES the node.** After `assigned` lands, the pending fields are gone (no more `customer_phone`, `delivery_address`, etc.). UI must derive everything from the current snapshot only. Don't assume earlier fields survive.

> 📝 **PC1 NOTE:** the existing `OrderTracking` component DOES assume earlier fields survive (it merges every snapshot into the same `orderStatus` object). You'll need to either replace state on every snapshot OR cache the once-seen fields client-side. The brief recommends caching `customer_phone` from the first read (needed for the auth check).

### What to build

**1. RTDB subscription hook**
Create `src/hooks/useOrderStatus.ts` subscribing to `ref(rtdb, 'order_status/'+orderId)` with `onValue`. Return `{ status, data, loading, error }`. Clean up on unmount. Use the existing `rtdb` export from `firebase.ts` — do not call `initializeApp` again.

**2. Route + page wiring**
Grep the repo for `SuccessScreen`, `Track Order`, `track` to find how the existing tracking flow is invoked. Match whatever convention is there. If nothing fits, use `/track/:orderId`.

> 📝 **PC1 NOTE:** There is no router in the app currently. `App.tsx` uses a manual tab/state-driven page switcher. The handoff from checkout success → tracking is a state flip (`showTracking`) plus `localStorage.activeOrderId`, not a URL route. Match that convention — don't introduce React Router for a single page.

**3. Driver-info card (NEW)**
Visible when `status === 'assigned' || 'delivered'`. Show `driver_name`, `driver_phone`, `vehicle_type`, plus:
- `اتصل بالسائق` → `tel:{driver_phone}`
- `افتح الخريطة` → opens `navigation_link` in new tab (`target="_blank" rel="noopener noreferrer"`)

Match the stepper container's visual style (rounded corners, off-white surface, RTL spacing). Show `last_updated_at` as relative time (`منذ دقيقتين`). dayjs/relativeTime is likely already a dep; if not, add it.

> 📝 **PC1 NOTE:** dayjs is NOT currently a dependency. Check `package.json` first; add `dayjs` + import `dayjs/locale/ar` + plugin `relativeTime` if you go that route. A lightweight inline `Intl.RelativeTimeFormat('ar')` is also fine and avoids adding a dep.

**4. State handling**
- `pending`: step 1 only, no driver card. After ~10s still pending → small non-blocking note `جاري تعيين السائق…`.
- `assigned`: steps 1–3 lit, driver card visible.
- `delivered`: all 4 lit, replace driver card with `تم التسليم 🙌` block + a `Rate this delivery` CTA. Stub the action (log a TODO if the rating endpoint doesn't exist yet — it doesn't).
- `failed_delivery`: stepper grayed, red banner `تعذّر التوصيل` with retry button → `POST https://n8n.srv1473225.hstgr.cloud/webhook/delivery-trigger` with `{ order_id, customer_id, delivery_address }`. **Pull `customer_id` and `delivery_address` from the user's stored profile / last order, NOT from the current snapshot** — failed-state snapshot doesn't carry them.
- RTDB node is `null` (snapshot missing) → `Order not found` with back-to-home CTA.
- Refresh mid-flow → hook re-subscribes (free if you use `onValue` correctly).
- Auth check: only allow viewing if the logged-in user's phone matches `customer_phone`. Once `assigned` overwrites, the field is gone — cache it on first read, or fall back to Firestore lookup against the user's last `order_id`.

> 📝 **PC1 NOTE on retry payload:** `customer_id` in the current `create-order` payload is `user.phone || user.email`. For consistency, retry should pass the same shape. `delivery_address` should be the stringified address from the user's profile (`user.default_address` if you've fetched it, or re-read from Firestore `users/{uid}.default_address`).

### Out of scope (DO NOT DO)
- Don't modify any n8n workflow.
- Don't touch `order`, `order_item`, or `factory_intelligence` DataConnect tables — app is read-only there.
- Don't redesign the stepper component visually; just wire it.
- Don't modify Firebase config or RTDB security rules. If rules are missing or too permissive, log it under "Open Tech Debt".

### Deliverable: PR
- Branch: `feat/tracking-rtdb-live` *(branched from `claude/review-project-architecture-gHZnc`, not `main` — there's unmerged work there you need)*

> 📝 **PC1 NOTE:** Cowork wrote `Target branch: main`. **Do NOT target main** — the active development branch is `claude/review-project-architecture-gHZnc`. `main` is behind by ~15 commits including the entire DataConnect migration, anonymous auth, and out-of-stock UI. Confirm with the user before opening the PR, but the right target is `claude/review-project-architecture-gHZnc`.

- PR title: `feat(tracking): live order status from RTDB`
- PR description must include:
  - Bullet list of user-visible changes (states wired, driver card built, buttons functional, edge cases handled).
  - Files added vs modified.
  - Screen recording OR three screenshots: pending → assigned → delivered transitions. Real (or staging) order, not mocked.
  - Confirmation of `tsc --noEmit` clean (lint script may not exist; check `package.json`).
  - "Open items" section.

### Verification (DO NOT SKIP)
- Place a real order via checkout. Stepper should show step 1 briefly, then 1–3 lit within seconds. Driver card appears with real driver data.
- Tap each button — phone dialer + map link.
- POST to `/webhook/delivery-complete` with `outcome:"delivered"` — stepper fills to 4 live, no refresh.
- Repeat with `outcome:"failed"` — failed UI appears; retry button re-fires WF#3.
- If `assigned` doesn't auto-arrive after checkout, inspect WF#1's execution log. **Do not fix WF#1 — flag and ask.**

### When done
- Add to this `HANDOVER_THIRD_AGENT.md` under §8 "Latest dev status": `✅ Live tracking page subscribed to RTDB, driver card + actions built`.
- Note any newly-discovered open tech debt under §9.

If anything in the RTDB schema doesn't match what's actually written when you test, query `https://project-0a287015-616b-4f71-bbf-default-rtdb.firebaseio.com/order_status/<some_real_order_id>.json` and use the actual fields. Do not invent fields.

---

## 8. Latest dev status (rolling log — append as you go)

- ✅ DataConnect catalog live (60 SKUs, 9 brands, real images)
- ✅ Out-of-stock UI shipped
- ✅ Anonymous auth migration shipped (`534eb65`, `00fc1c8`)
- ✅ `dataconnect/schema/schema.gql` committed
- ✅ Live tracking page subscribed to RTDB — `useOrderStatus` hook, 4-step stepper, driver card, pull-to-refresh, `failed_delivery` retry (`9bd4313`)
- ✅ Google Maps location picker — replaces Leaflet; service-area gate; `outsideServiceArea` in CartContext (`9bd4313`)
- ✅ Live shipping pricing — `useShippingConfig` + `computeShipping` + `isWithinOperatingHours`; urgent gate; `delivery_slot` + `shipping_fee_sar` in create-order payload (`9bd4313`)
- ✅ Orders history screen — `pages/Orders.tsx`; active RTDB order + paginated DataConnect past orders (`9bd4313`)
- ✅ `BottomNav` "طلباتي" tab (`9bd4313`)
- ✅ `firebase.ts` exports `rtdb`; `firebase-applet-config.json` has `databaseURL` placeholder; RTDB rules committed (`database.rules.json`)
- ✅ `store/AuthContext.tsx` calls `/webhook/register-user` after anonymous signup
- ✅ `firestore.rules` — added `/config/{docId}` read rule for authenticated users (P0 fix for `useShippingConfig`)
- ⬜ Firestore `/config/shipping` doc needs to be created — script at `scripts/seed-shipping-config.js`
- ⬜ Google Maps API key in `.env` (user action — see `.env.example`)
- ⬜ WF#1 accept `delivery_slot` + `shipping_fee_sar` — see §11 below
- ⬜ WF3-Clean activate (user mid-import; Cowork handed off)
- ⬜ `telegram_username` column in drivers sheet
- ⬜ Admin Telegram chat ID (user creates group, captures ID)
- ⬜ `firestore.rules` deploy (`firebase deploy --only firestore:rules`) — CI doesn't do this
- ⬜ End-to-end order flow smoke test
- ⬜ Phase B — CI auto-deploys DataConnect
- ⬜ App-Mutations-Spec — Profile / Favorites / Reviews
- ⬜ Restore OTP via Cloud Function token minting (once Meta approves)

## 9. Open tech debt

- **Firestore rules deployment is manual.** CI deploys hosting only. `firestore.rules` may be ahead of what's actually live. Run `firebase deploy --only firestore:rules` from a dev machine after any rules change.
- **RTDB rules** — committed to `database.rules.json` (authenticated read, no client write on `order_status/*`). Deploy with `firebase deploy --only database` (use `firebase.cmd` on Windows to avoid PowerShell execution policy issues).
- **Anonymous Auth toggle** in Firebase Console may not be enabled — if `auth/operation-not-allowed` appears in registration error, that's why (Firebase Console → Auth → Sign-in method → Anonymous).
- **`signInWithCustomToken` is still imported in n8n's verify-otp** even though OTP is parked. App side cleaned up; backend side parked workflows still reference it.
- **`Checkout.tsx` is 700+ lines, two concerns.** `OrderTracking` should be extracted to its own file in a future cleanup pass.
- **`MOCK_PRODUCTS` in `constants.ts`** is dead code merged with the live catalog in `Home.tsx` — harmless but should be deleted in a cleanup pass.
- **DataConnect deploys are manual** from a developer machine; CI doesn't run them.
- **Pre-order endpoint** referenced by the disabled `طلب مسبق` button doesn't exist yet.
- **`GetUserOrdersPaginated` query** added to `queries.gql` but not yet deployed to DataConnect. Run `firebase deploy --only dataconnect` from dev machine.
- **Body-unwrap in `useOrderStatus.ts`** — TODO comment: remove after 2026-07-01 once WF#3 is updated to use jsonBody instead of bodyParameters.
- **`VITE_GOOGLE_MAPS_API_KEY` must be set in `.env`** — see `.env.example`. Currently shows "مفتاح Google Maps غير مُعيَّن" fallback in location picker if missing.

## 11. WF#1 changes needed (delivery_slot + shipping_fee_sar)

The app now sends two additional fields in the `/create-order` payload. WF#1 currently drops them. Changes needed in n8n:

### In WF#1 "Validate Input" (or equivalent Input node):

Accept these new optional fields without erroring:
```
delivery_slot: { type, scheduled_at, window_label }
shipping_fee_sar: number
```

### Forward to Odoo sale.order:

Option A (recommended — no Odoo schema change): append to the order's internal `note` field:
```
Delivery slot: {{ $json.body.delivery_slot.window_label }} ({{ $json.body.delivery_slot.scheduled_at }})
Shipping fee: {{ $json.body.shipping_fee_sar }} SAR
```

Option B: create a shipping line item on the sale.order with a "Shipping" product in Odoo, `price_unit = shipping_fee_sar`.

### Forward to WF#3:

In the HTTP Request node that POSTs to `/webhook/delivery-trigger`, add to the body:
```json
{
  "order_id": "...",
  "customer_id": "...",
  "delivery_address": "...",
  "delivery_slot": "{{ $json.body.delivery_slot }}",
  "shipping_fee_sar": "{{ $json.body.shipping_fee_sar }}"
}
```

WF#3 can then show the delivery window in the driver's Telegram notification.

---

## 10. Contact protocol between agents

- **You ↔ User:** direct chat.
- **You → Agent #1 (PC1):** ask the user to relay; PC1 has no n8n view and no local files but full repo control.
- **You → Agent #2 (Cowork):** ask the user to relay; Cowork has n8n + Odoo + Firebase Console but no repo view.
- **Trust hierarchy when conflict:** repo > deployed Firebase config > n8n config > this doc. If anything here doesn't match what you see, the repo and the deployed services are truth — patch this doc.
