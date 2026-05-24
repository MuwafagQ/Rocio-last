/**
 * One-time script to create /config/shipping in Firestore.
 * Run from the project root: node scripts/seed-shipping-config.js
 *
 * Requires: firebase-admin installed, and the SA JSON file path set below.
 * The SA file should already be on your machine from the earlier Firebase setup.
 *
 * Usage:
 *   npm install firebase-admin   (if not already installed globally)
 *   SA_KEY=/path/to/your-firebase-adminsdk.json node scripts/seed-shipping-config.js
 */

const admin = require('firebase-admin');
const path = require('path');

const saKeyPath = process.env.SA_KEY;
if (!saKeyPath) {
  console.error('Error: set SA_KEY env var to the path of your Firebase service account JSON');
  console.error('Example: SA_KEY=/path/to/key.json node scripts/seed-shipping-config.js');
  process.exit(1);
}

const serviceAccount = require(path.resolve(saKeyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Use your actual project ID:
  projectId: 'project-0a287015-616b-4f71-bbf',
});

const db = admin.firestore();

// ─── EDIT THESE VALUES before running ────────────────────────────────────────
// Replace warehouse.lat/lng with the actual warehouse GPS coordinates.
// The placeholder below is Wadi Aldawaseer town centre — confirm with MuwafaQ.
const CONFIG = {
  base_fee_sar: 7,
  free_distance_km: 10,
  per_km_rate_sar: 1,
  warehouse: {
    lat: 20.4922,    // <── replace with exact warehouse latitude
    lng: 44.8086,    // <── replace with exact warehouse longitude
    label: 'Wadi Aldawaseer Warehouse',
  },
  service_radius_km: 30,
  urgency_multipliers: {
    urgent_now: 2.0,
    same_day_within_5h: 1.5,
    same_day_after_5h: 1.2,
    next_day_or_later: 1.0,
  },
  operating_hours: {
    start: '08:00',
    end: '22:00',
    timezone: 'Asia/Riyadh',
  },
  urgent_now_enabled: true,
};
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const ref = db.collection('config').doc('shipping');
  const snap = await ref.get();

  if (snap.exists) {
    console.log('⚠️  /config/shipping already exists. Current value:');
    console.log(JSON.stringify(snap.data(), null, 2));
    console.log('\nTo overwrite, delete the doc in Firebase Console first, then re-run.');
    process.exit(0);
  }

  await ref.set(CONFIG);
  console.log('✅  /config/shipping created successfully:');
  console.log(JSON.stringify(CONFIG, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
