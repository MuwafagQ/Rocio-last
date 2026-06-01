import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { Package, RefreshCw, ChevronDown, ChevronUp, MapPin, Truck, Star } from 'lucide-react';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { ref, query as rtdbQuery, orderByChild, equalTo, get } from 'firebase/database';
import { rtdb } from '../firebase';
import { toCustomerStatus, customerStatusLabel } from '../utils/orderStatus';

interface MergedOrder {
  id: string;
  // From user_orders/{phone}/{id} — immutable snapshot written by n8n WF#1
  total_amount?: number;
  delivery_address?: string;
  odoo_order_id?: number;
  created_at?: number;
  // From order_status/{id} — live status written/updated by n8n WF#3
  status?: string;
  driver_name?: string;
  driver_phone?: string;
  delivery_id?: string;
  last_updated_at?: number | string;
}

// Strip Saudi country code so "+966552311245" → "552311245"
function toCustomerId(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/^\+966/, '').replace(/^0/, '');
}

function toMs(ts: number | string | undefined | null): number {
  if (!ts) return 0;
  return typeof ts === 'string' ? new Date(ts).getTime() : ts < 1e12 ? ts * 1000 : ts;
}

function formatTs(ts: number | string | undefined): string {
  if (!ts) return '';
  try {
    return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(toMs(ts)));
  } catch { return ''; }
}

function getDisplayAddress(raw: string | undefined | null): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return parsed.label || parsed.address || raw;
  } catch { return raw; }
}

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MergedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPTR, setIsPTR] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('reviewed_orders_v1') || '[]');
      return new Set(stored as string[]);
    } catch { return new Set(); }
  });
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.phone && !user?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const customerId = toCustomerId(user.phone);

    const fetchOrders = async () => {
      try {
        // Primary source: user_orders/{phone} — immutable snapshots from n8n WF#1
        // Wrapped individually so a permission error here doesn't kill the fallback query
        const historySnap = await get(ref(rtdb, `user_orders/${customerId}`)).catch(() => null);

        // Fallback source: order_status indexed by customer_id
        const statusQuery = rtdbQuery(
          ref(rtdb, 'order_status'),
          orderByChild('customer_id'),
          equalTo(customerId)
        );
        const statusSnap = await get(statusQuery);

        // Build a map of all live statuses keyed by order id
        const liveStatus: Record<string, any> = {};
        if (statusSnap.exists()) {
          statusSnap.forEach(child => { liveStatus[child.key as string] = child.val(); });
        }

        const merged: Record<string, MergedOrder> = {};

        // 1. Seed from live status (fallback — covers pre-migration orders)
        Object.entries(liveStatus).forEach(([id, live]) => {
          merged[id] = {
            id,
            status: live.status,
            driver_name: live.driver_name,
            driver_phone: live.driver_phone,
            delivery_id: live.delivery_id,
            last_updated_at: live.last_updated_at,
            // WF#3 may have overwritten these fields; they may be missing
            total_amount: live.total_amount,
            delivery_address: live.delivery_address,
            odoo_order_id: live.odoo_order_id,
          };
        });

        // 2. Overlay with immutable snapshots (richer data — overrides WF#3 clobber)
        if (historySnap?.exists()) {
          historySnap.forEach(child => {
            const snap = child.val();
            const id = child.key as string;
            merged[id] = {
              ...merged[id],   // keep live status fields if already present
              id,
              total_amount: snap.total_amount,
              delivery_address: snap.delivery_address,
              odoo_order_id: snap.odoo_order_id,
              created_at: snap.created_at,
              // keep live status from liveStatus map if available
              status: liveStatus[id]?.status ?? snap.status,
              driver_name: liveStatus[id]?.driver_name,
              driver_phone: liveStatus[id]?.driver_phone,
              delivery_id: liveStatus[id]?.delivery_id,
              last_updated_at: liveStatus[id]?.last_updated_at,
            };
          });
        }

        const result = Object.values(merged);

        if (result.length === 0) {
          console.log('[Orders] no orders for', customerId);
          setOrders([]);
          setLoading(false);
          return;
        }

        // Sort newest first — prefer created_at (immutable), fall back to last_updated_at
        result.sort((a, b) => toMs(b.created_at || b.last_updated_at) - toMs(a.created_at || a.last_updated_at));

        console.log('[Orders] found', result.length, 'orders for', customerId);
        setOrders(result);
      } catch (err) {
        console.error('[Orders] fetch failed:', err);
        setError('تعذّر تحميل سجل الطلبات');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.phone, user?.id, refreshKey]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const atTop = (scrollRef.current?.scrollTop ?? 0) === 0;
    if (dy > 70 && atTop) {
      setIsPTR(true);
      setRefreshKey(k => k + 1);
      setTimeout(() => setIsPTR(false), 1200);
    }
  };

  return (
    <div
      ref={scrollRef}
      className="min-h-screen bg-gray-50 pb-28 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">طلباتي</h1>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {isPTR && (
          <div className="flex items-center justify-center gap-2 py-2 text-primary text-sm">
            <RefreshCw size={16} className="animate-spin" />
            <span>جاري التحديث…</span>
          </div>
        )}

        {error && (
          <div className="text-center py-6 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-medium text-gray-600 mb-1">لا توجد طلبات</p>
            <p className="text-sm">ستظهر هنا طلباتك بعد إتمام أول طلب</p>
          </div>
        )}

        {orders.map(order => {
          const cs = toCustomerStatus(order.status ?? '');
          const isExpanded = expandedId === order.id;
          const isDelivered = cs === 'delivered';
          const displayId = order.odoo_order_id
            ? `#${order.odoo_order_id}`
            : order.delivery_id
            ? order.delivery_id
            : `#${order.id.slice(-6).toUpperCase()}`;
          const dateTs = order.created_at || order.last_updated_at;

          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="bg-gray-100 text-gray-700 font-mono text-xs font-bold px-3 py-1.5 rounded-full tracking-wide">
                    {displayId}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    isDelivered
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    {isDelivered ? '✓ ' : '⏳ '}{customerStatusLabel(cs)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatTs(dateTs)}</span>
                  {order.total_amount != null && (
                    <span className="font-bold text-primary text-sm">{Number(order.total_amount).toFixed(2)} ر.س</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setExpandedId(prev => prev === order.id ? null : order.id)}
                className="w-full border-t border-gray-100 px-4 py-3 flex items-center justify-center gap-2 text-primary text-sm font-medium active:bg-gray-50 transition-colors"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isExpanded ? 'إخفاء التفاصيل' : 'تفاصيل الطلب'}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
                  {order.delivery_address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                      <span className="leading-relaxed text-xs">{getDisplayAddress(order.delivery_address)}</span>
                    </div>
                  )}
                  {order.driver_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Truck size={15} className="shrink-0 text-gray-400" />
                      <span className="text-xs">{order.driver_name}</span>
                      {order.driver_phone && (
                        <span className="text-xs text-gray-400" dir="ltr">· {order.driver_phone}</span>
                      )}
                    </div>
                  )}
                  {!order.delivery_address && !order.driver_name && (
                    <p className="text-xs text-gray-400 text-center py-1">لا تتوفر تفاصيل إضافية</p>
                  )}
                  {isDelivered && !reviewedOrders.has(order.id) && (
                    <button
                      onClick={() => setFeedbackOrderId(order.id)}
                      className="w-full mt-1 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      قيّم طلبك
                    </button>
                  )}
                  {isDelivered && reviewedOrders.has(order.id) && (
                    <p className="text-center text-xs text-green-600 font-medium py-1">✓ شكراً على تقييمك</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="text-center py-10 text-gray-400">
            <RefreshCw size={28} className="mx-auto mb-3 animate-spin" />
          </div>
        )}
      </div>

      <FeedbackSheet
        isOpen={!!feedbackOrderId}
        onClose={() => setFeedbackOrderId(null)}
        orderId={feedbackOrderId ?? ''}
        odooOrderId={orders.find(o => o.id === feedbackOrderId)?.odoo_order_id}
        customerId={toCustomerId(user?.phone)}
        customerName={(user as any)?.name}
        onSubmitted={() => {
          if (feedbackOrderId) {
            setReviewedOrders(prev => new Set([...prev, feedbackOrderId]));
          }
          setFeedbackOrderId(null);
        }}
      />
    </div>
  );
};
