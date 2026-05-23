import { useEffect, useRef, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

export interface OrderStatusData {
  status: 'pending' | 'assigned' | 'delivered' | 'failed_delivery';
  // pending fields (gone after assigned overwrites)
  order_id?: string;
  total_amount?: number;
  customer_phone?: string;
  delivery_address?: string;
  odoo_order_id?: number;
  last_updated_at?: number | string; // n8n writes ISO string; handle both
  // assigned fields
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_type?: string;
  navigation_link?: string;
  delivery_id?: string;
  // delivered / failed fields
  outcome?: string;
  delivered_at?: number | string;
}

interface UseOrderStatusResult {
  data: OrderStatusData | null;
  loading: boolean;
  error: boolean;
  cachedCustomerPhone: string | null;
}

// refreshKey increment forces re-subscribe (used by pull-to-refresh)
export function useOrderStatus(orderId: string | null, refreshKey = 0): UseOrderStatusResult {
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Cached because RTDB node is replaced on each write — customer_phone is gone after 'assigned'
  const phoneRef = useRef<string | null>(null);
  const [cachedCustomerPhone, setCachedCustomerPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    const statusRef = ref(rtdb, `order_status/${orderId}`);
    const unsub = onValue(
      statusRef,
      (snapshot) => {
        let raw = snapshot.val();

        // WF#3 sends bodyParameters with name="body", so Firebase stores:
        // { body: "{\"status\":\"assigned\",...}" } instead of the object directly.
        // Unwrap and parse either shape.
        if (raw && typeof raw === 'object' && typeof raw.body === 'string') {
          try { raw = JSON.parse(raw.body); } catch { raw = null; }
        } else if (typeof raw === 'string') {
          // WF#1 double-serializes via JSON.stringify inside jsonBody
          try { raw = JSON.parse(raw); } catch { raw = null; }
        }

        const val = raw as OrderStatusData | null;

        if (val?.customer_phone && !phoneRef.current) {
          phoneRef.current = val.customer_phone;
          setCachedCustomerPhone(val.customer_phone);
        }

        setData(val);
        setLoading(false);

        if (val?.status === 'delivered' || val?.status === 'failed_delivery') {
          localStorage.removeItem('activeOrderId');
        }
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [orderId, refreshKey]);

  return { data, loading, error, cachedCustomerPhone };
}
