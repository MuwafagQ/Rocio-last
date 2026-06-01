import { useEffect, useState } from 'react';

export interface FeatureFlags {
  community_enabled: boolean;
  subscriptions_enabled: boolean;
  wallet_enabled: boolean;
  payment_picker_enabled: boolean;
  active_order_tracking_enabled: boolean;
  auto_delivery_dispatch: boolean;
  beta_banner_enabled: boolean;
}

// Safe fallback — all features off except the informational beta banner
const FALLBACK: FeatureFlags = {
  community_enabled: false,
  subscriptions_enabled: false,
  wallet_enabled: false,
  payment_picker_enabled: false,
  active_order_tracking_enabled: false,
  auto_delivery_dispatch: false,
  beta_banner_enabled: true,
};

// Module-level cache — fetched once per app session
let cached: FeatureFlags | null = null;

export function useFeatureFlags(): { flags: FeatureFlags; loading: boolean } {
  const [flags, setFlags] = useState<FeatureFlags>(cached ?? FALLBACK);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;

    (async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snap = await getDoc(doc(db, 'config', 'features'));
        if (snap.exists() && !cancelled) {
          cached = { ...FALLBACK, ...(snap.data() as Partial<FeatureFlags>) };
          setFlags(cached);
        }
      } catch {
        // Firestore unavailable — FALLBACK already set, no partially-built feature leaks
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { flags, loading };
}
