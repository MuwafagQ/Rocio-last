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
  last_updated_at?: number;
  // assigned fields
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_type?: string;
  navigation_link?: string;
  delivery_id?: string;
  // delivered / failed fields
  outcome?: string;
  delivered_at?: number;
}

interface UseOrderStatusResult {
  data: OrderStatusData | null;
  loading: boolean;
  error: boolean;
  cachedCustomerPhone: string | null;
}

export function useOrderStatus(orderId: string | null): UseOrderStatusResult {
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Cached because RTDB node is replaced on each status change — customer_phone is gone after 'assigned'
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
        const val = snapshot.val() as OrderStatusData | null;

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
  }, [orderId]);

  return { data, loading, error, cachedCustomerPhone };
}
