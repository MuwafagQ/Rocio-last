import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { OrderTracking } from './Checkout';
import { Package, RefreshCw } from 'lucide-react';
import { getDataConnect, queryRef, executeQuery } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/rocio-mobile-sdk-connector';

interface PastOrder {
  id: string;
  status: string;
  totalAmount: number;
  deliveryAddress?: string | null;
  createdAt: string;
  odooOrderId?: number | null;
  orderItems_on_order: Array<{
    quantity: number;
    priceAtPurchase?: number | null;
    sku: {
      size: string;
      uom: string;
      product: {
        nameAr: string;
        imageUrl?: string | null;
      };
    };
  }>;
}

const PAGE_SIZE = 10;

const statusLabel = (s: string) => {
  switch (s) {
    case 'pending':   return { label: 'قيد المعالجة',       color: 'bg-yellow-100 text-yellow-700' };
    case 'assigned':  return { label: 'السائق في الطريق',   color: 'bg-blue-100 text-blue-700' };
    case 'delivered': return { label: 'مكتمل',              color: 'bg-green-100 text-green-700' };
    case 'cancelled': return { label: 'ملغي',               color: 'bg-red-100 text-red-700' };
    default:          return { label: s,                    color: 'bg-gray-100 text-gray-600' };
  }
};

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch { return iso; }
};

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [activeOrderId] = useState<string | null>(() => localStorage.getItem('activeOrderId'));
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorPast, setErrorPast] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPTR, setIsPTR] = useState(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async (newOffset: number, replace: boolean) => {
    if (!user?.id) { setLoadingPast(false); return; }
    setLoadingPast(true);
    try {
      const dc = getDataConnect(connectorConfig);
      const ref = queryRef(dc, 'GetUserOrdersPaginated', { userId: user.id, limit: PAGE_SIZE, offset: newOffset });
      const { data } = await executeQuery(ref as any);
      const orders: PastOrder[] = (data as any)?.orders ?? [];
      setPastOrders(prev => replace ? orders : [...prev, ...orders]);
      setHasMore(orders.length === PAGE_SIZE);
    } catch {
      setErrorPast('تعذّر تحميل سجل الطلبات');
    } finally {
      setLoadingPast(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, refreshKey]);

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchOrders(nextOffset, false);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const atTop = (scrollRef.current?.scrollTop ?? 0) === 0;
    if (dy > 70 && atTop) {
      setIsPTR(true);
      setRefreshKey(k => k + 1);
      setOffset(0);
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

      <div className="px-4 pt-4 space-y-4">
        {isPTR && (
          <div className="flex items-center justify-center gap-2 py-2 text-primary text-sm">
            <RefreshCw size={16} className="animate-spin" />
            <span>جاري التحديث…</span>
          </div>
        )}

        {/* Active order */}
        {activeOrderId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
              <p className="text-xs font-bold text-primary uppercase tracking-wide">الطلب الحالي</p>
            </div>
            <OrderTracking orderId={activeOrderId} onDone={() => {}} isCard />
          </div>
        )}

        <h2 className="text-sm font-bold text-gray-500 px-1 pt-2">سجل الطلبات</h2>

        {errorPast && (
          <div className="text-center py-6 text-red-500 text-sm">{errorPast}</div>
        )}

        {!loadingPast && !errorPast && pastOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-medium text-gray-600 mb-1">لا توجد طلبات سابقة</p>
            <p className="text-sm">ستظهر هنا طلباتك بعد إتمام أول طلب</p>
          </div>
        )}

        {pastOrders.map(order => {
          const { label, color } = statusLabel(order.status);
          const firstItem = order.orderItems_on_order[0];
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  {order.odooOrderId && <p className="text-[10px] text-gray-400 font-mono">#{order.odooOrderId}</p>}
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${color}`}>{label}</span>
              </div>
              {firstItem && (
                <div className="flex items-center gap-3 mb-3">
                  {firstItem.sku.product.imageUrl ? (
                    <img
                      src={firstItem.sku.product.imageUrl}
                      alt={firstItem.sku.product.nameAr}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-1"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{firstItem.sku.product.nameAr}</p>
                    <p className="text-xs text-gray-400">{firstItem.sku.size} × {firstItem.quantity}</p>
                    {order.orderItems_on_order.length > 1 && (
                      <p className="text-[10px] text-gray-400">+{order.orderItems_on_order.length - 1} منتجات أخرى</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{Number(order.totalAmount).toFixed(2)} ر.س</span>
              </div>
            </div>
          );
        })}

        {loadingPast && (
          <div className="text-center py-8 text-gray-400">
            <RefreshCw size={28} className="mx-auto mb-3 animate-spin" />
          </div>
        )}

        {!loadingPast && hasMore && pastOrders.length > 0 && (
          <button
            onClick={handleLoadMore}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm flex items-center justify-center gap-2 active:bg-gray-50"
          >
            <RefreshCw size={16} />
            تحميل المزيد
          </button>
        )}
      </div>
    </div>
  );
};
