import { useEffect, useState } from 'react';
import { ShippingConfig } from '../types';

let cached: ShippingConfig | null = null;

export function useShippingConfig(): { config: ShippingConfig | null; loading: boolean } {
  const [config, setConfig] = useState<ShippingConfig | null>(cached);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;

    (async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snap = await getDoc(doc(db, 'config', 'shipping'));
        if (snap.exists() && !cancelled) {
          cached = snap.data() as ShippingConfig;
          setConfig(cached);
        }
      } catch {
        // Config unavailable — caller falls back to hardcoded defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { config, loading };
}
