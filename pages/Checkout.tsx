import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { Login } from './Login';
import { TIME_SLOTS, VAT_RATE, DELIVERY_FEE, DONATION_PRODUCTS } from '../constants';
import { StockPreference, SubscriptionFrequency } from '../types';
import { Trash2, Calendar, Clock, MapPin, CheckCircle, Truck, Recycle, RefreshCw, ChevronDown, Heart, Plus, Package, CreditCard, Wallet, Navigation as NavigationIcon, User, AlertCircle, Zap, Phone, Star } from 'lucide-react';
import { LocationPicker } from '../components/LocationPicker';
import { VisualAddress } from '../components/VisualAddress';
import { useOrderStatus } from '../hooks/useOrderStatus';

// Maps last_updated_at (seconds or ms) to Arabic relative time string
function relativeTime(ts: number | undefined): string {
  if (!ts) return '';
  const ms = ts < 1e12 ? ts * 1000 : ts; // handle both unix-seconds and ms
  const diff = Math.floor((Date.now() - ms) / 1000);
  const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
  if (diff < 60) return rtf.format(-diff, 'second');
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
  return rtf.format(-Math.floor(diff / 3600), 'hour');
}

const STEP_LABELS = [
  'في انتظار التعيين',
  'تم تعيين السائق',
  'السائق في الطريق',
  'تم التوصيل',
];

// RTDB status → highest lit step index (0-based).
// 'assigned' conflates steps 1 and 2 (driver assigned + on the way) as we have no in_transit signal.
function statusToStepIdx(status: string | undefined): number {
  switch (status) {
    case 'pending':          return 0;
    case 'assigned':         return 2; // lights steps 0, 1, 2
    case 'delivered':        return 3; // all 4
    default:                 return -1; // failed_delivery or loading → all gray
  }
}

export const OrderTracking: React.FC<{ orderId: string; onDone: () => void; isCard?: boolean }> = ({ orderId, onDone, isCard }) => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading, error, cachedCustomerPhone } = useOrderStatus(orderId, refreshKey);
  const [pendingTooLong, setPendingTooLong] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [isPTRActive, setIsPTRActive] = useState(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const atTop = (scrollRef.current?.scrollTop ?? 0) === 0;
    if (dy > 70 && atTop) {
      setIsPTRActive(true);
      setRefreshKey(k => k + 1);
      setTimeout(() => setIsPTRActive(false), 1200);
    }
  };

  // Show "جاري تعيين السائق…" hint if pending for more than 10s
  useEffect(() => {
    if (data?.status === 'pending') {
      pendingTimer.current = setTimeout(() => setPendingTooLong(true), 10_000);
    } else {
      setPendingTooLong(false);
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    }
    return () => { if (pendingTimer.current) clearTimeout(pendingTimer.current); };
  }, [data?.status]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetch('https://n8n.srv1473225.hstgr.cloud/webhook/delivery-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          customer_id: user?.phone || user?.email || cachedCustomerPhone || '',
          delivery_address: localStorage.getItem('user_location') || '',
        }),
      });
    } finally {
      setRetrying(false);
    }
  };

  const status = data?.status;
  const isFailed = status === 'failed_delivery';
  const isDelivered = status === 'delivered';
  // While loading/null: default to step 0 (pending) so the stepper is never fully dark
  const stepIdx = loading ? 0 : statusToStepIdx(status);
  const showDriverCard = (status === 'assigned') && data?.driver_name;

  return (
    <div className={isCard ? 'flex flex-col bg-transparent' : 'h-screen flex flex-col bg-gray-50'}>
      {!isCard && (
        <div className="bg-white px-4 pt-12 pb-6 shadow-sm text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${isDelivered ? 'bg-green-100' : isFailed ? 'bg-red-100' : 'bg-primary/10'}`}>
            {isDelivered
              ? <CheckCircle size={32} className="text-green-600" />
              : isFailed
              ? <AlertCircle size={32} className="text-red-500" />
              : <Truck size={32} className="text-primary animate-pulse" />}
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {isDelivered ? 'تم التوصيل بنجاح!' : isFailed ? 'تعذّر التوصيل' : 'تتبع طلبك'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">رقم الطلب #{orderId}</p>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto space-y-4 ${isCard ? 'py-2' : 'px-4 py-6'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {isPTRActive && (
          <div className="flex items-center justify-center gap-2 py-2 text-primary text-sm">
            <RefreshCw size={16} className="animate-spin" />
            <span>جاري التحديث…</span>
          </div>
        )}

        {/* Failed delivery — red banner + retry */}
        {isFailed && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-bold text-sm mb-3 text-center">تعذّر التوصيل — يرجى المحاولة مجدداً</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
            >
              {retrying ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              إعادة تعيين السائق
            </button>
          </div>
        )}

        {/* 4-step stepper */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, i) => {
              const active = stepIdx >= 0 && i <= stepIdx;
              const completed = stepIdx >= 0 && i < stepIdx;
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isFailed ? 'bg-gray-100 text-gray-300' : active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {completed && !isFailed ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span className={`text-[10px] text-center leading-tight ${isFailed ? 'text-gray-300' : active ? 'text-primary font-bold' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 ${isFailed ? 'bg-gray-100' : i < stepIdx ? 'bg-primary' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Pending too long hint */}
        {pendingTooLong && status === 'pending' && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-600 text-center">
            جاري تعيين السائق…
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="text-center py-8 text-gray-400">
            <RefreshCw size={28} className="mx-auto mb-3 animate-spin" />
            <p className="text-sm">جاري تحديث حالة الطلب...</p>
          </div>
        )}

        {/* RTDB connection error — bright so we can distinguish "no data" from "rules blocked" */}
        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-sm text-red-700 text-center font-bold">
            ⚠️ تعذّر الاتصال بقاعدة بيانات التتبع
            <p className="text-xs font-normal mt-1 text-red-500">قد تكون قواعد RTDB تمنع القراءة — راجع Firebase Console</p>
          </div>
        )}

        {/* Driver info card — visible when assigned */}
        {showDriverCard && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <User size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">السائق</p>
                <p className="font-bold text-gray-800 truncate">{data.driver_name}</p>
                {data.vehicle_type && (
                  <p className="text-xs text-gray-500 mt-0.5">{data.vehicle_type}</p>
                )}
              </div>
              {data.last_updated_at && (
                <p className="text-[10px] text-gray-400 shrink-0">{relativeTime(data.last_updated_at)}</p>
              )}
            </div>
            <div className="flex gap-3">
              {data.driver_phone && (
                <a
                  href={`tel:${data.driver_phone}`}
                  className="flex-1 py-2.5 rounded-xl bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Phone size={16} />
                  اتصل بالسائق
                </a>
              )}
              {data.navigation_link && (
                <a
                  href={data.navigation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <NavigationIcon size={16} />
                  افتح الخريطة
                </a>
              )}
            </div>
          </div>
        )}

        {/* Delivered success block */}
        {isDelivered && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-2xl mb-2">🙌</p>
            <p className="font-bold text-green-800 text-lg mb-1">تم التسليم</p>
            {data?.last_updated_at && (
              <p className="text-xs text-green-600 mb-4">{relativeTime(data.last_updated_at)}</p>
            )}
            <button
              onClick={() => {
                // TODO: wire to rating endpoint when available
                console.log('TODO: POST /webhook/rate-delivery for order', orderId);
              }}
              className="w-full py-2.5 rounded-xl bg-white border border-green-300 text-green-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Star size={16} />
              قيّم التوصيل
            </button>
          </div>
        )}

        {/* Node missing entirely */}
        {!loading && !error && data === null && (
          <div className="text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-medium text-gray-600 mb-1">الطلب غير موجود</p>
            <p className="text-sm">تحقق من رقم الطلب أو عد للرئيسية</p>
          </div>
        )}
      </div>

      {!isCard && (
        <div className="bg-white px-4 pb-8 pt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button onClick={onDone} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold active:scale-[0.98] transition-transform">
            العودة للرئيسية
          </button>
        </div>
      )}
    </div>
  );
};

const CartItemImage = ({ item }: { item: any }) => {
    const [error, setError] = useState(false);
    return (
        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center p-2 relative">
            {item.imageUrl && !error ? (
                <img
                    src={item.imageUrl}
                    alt={item.nameAr}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onError={() => setError(true)}
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="text-gray-300"><Package size={32} strokeWidth={1.5} /></div>
            )}
            {item.isSubscribed && (
                <div className="absolute -top-2 -right-2 bg-secondary text-white p-1 rounded-full shadow-md">
                    <RefreshCw size={12} className="animate-spin-slow" />
                </div>
            )}
            {item.isDonation && (
                <div className="absolute -top-2 -right-2 bg-secondary text-white p-1 rounded-full shadow-md">
                    <Heart size={12} className="fill-current" />
                </div>
            )}
        </div>
    );
};

export const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, updateSubscriptionFrequency, subtotal, savings, clearCart, addToCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<'urgent' | 'scheduled'>('scheduled');
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [stockPref, setStockPref] = useState<StockPreference>(StockPreference.CALL_ME);
  const [recycling, setRecycling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'cod'>('card');
  const [visualDescription, setVisualDescription] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(localStorage.getItem('user_location') || 'المنزل - الرياض، حي العليا 2344');

  React.useEffect(() => {
    if (user?.id) {
      (async () => {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          const snap = await getDoc(doc(db, 'users', user.id));
          const addr = snap.data()?.default_address;
          if (addr) { setDeliveryAddress(addr); localStorage.setItem('user_location', addr); }
        } catch {}
      })();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2 text-center">إتمام الطلب</h1>
        <div className="mb-8"><Login /></div>
        <div className="text-center text-gray-400 text-sm px-8">
          يجب تسجيل الدخول برقم الجوال لإتمام عملية الطلب وتتبع التوصيل.
        </div>
      </div>
    );
  }

  const getAddressText = (addr: string) => {
    try { return JSON.parse(addr).address || addr; } catch { return addr; }
  };
  const getAddressCoords = (addr: string) => {
    try { const p = JSON.parse(addr); return { lat: p.lat, lng: p.lng }; } catch { return null; }
  };
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const coords = getAddressCoords(deliveryAddress);
  const distanceKm = coords?.lat && coords?.lng ? getDistanceFromLatLonInKm(24.7136, 46.6753, coords.lat, coords.lng) : 0;
  const distanceFee = distanceKm > 5 ? Math.min(Math.round((distanceKm - 5) * 1.5), 100) : 0;

  let calculatedDeliveryFee = DELIVERY_FEE;
  if (deliveryType === 'urgent') {
    calculatedDeliveryFee = 45 + distanceFee;
  } else if (selectedDate === 0) {
    calculatedDeliveryFee = (selectedTime === 'morning' ? 35 : selectedTime === 'afternoon' ? 30 : 25) + distanceFee;
  } else if (selectedDate === 1) {
    calculatedDeliveryFee = 20 + distanceFee;
  } else {
    calculatedDeliveryFee = 10 + Math.floor(distanceFee / 2);
  }

  const vatAmount = subtotal * VAT_RATE;
  const total = subtotal + vatAmount + calculatedDeliveryFee;

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { dayName: d.toLocaleDateString('ar-SA', { weekday: 'short' }), dayNum: d.getDate(), fullDate: d };
  });

  const handleLocationConfirm = (loc: string) => {
    setDeliveryAddress(loc); localStorage.setItem('user_location', loc); setIsLocationPickerOpen(false);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const coords = getAddressCoords(deliveryAddress);
      const orderPayload = {
        firebase_uid: user.id,
        customer_id: user.phone || user.email || '',
        customer_name: user.name || 'Customer',
        delivery_address: getAddressText(deliveryAddress),
        customer_location_lat: coords?.lat || null,
        customer_location_lng: coords?.lng || null,
        visual_description: visualDescription || '',
        payment_method: paymentMethod,
        delivery_type: deliveryType,
        delivery_date: deliveryType === 'scheduled'
          ? new Date(dates[selectedDate].fullDate).toISOString()
          : new Date().toISOString(),
        delivery_time: deliveryType === 'scheduled' ? selectedTime : 'now',
        delivery_fee: calculatedDeliveryFee,
        items: items.map(item => ({
          product_id: item.internalReference,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('https://n8n.srv1473225.hstgr.cloud/webhook/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      let responseData: any = {};
      try { const t = await response.text(); responseData = t ? JSON.parse(t) : {}; } catch {}

      if (!response.ok) {
        throw new Error(responseData.errorMessage || 'فشل في إتمام الطلب، يرجى المحاولة مرة أخرى');
      }

      if (user?.id) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        updateDoc(doc(db, 'users', user.id), { default_address: deliveryAddress }).catch(() => {});
      }

      setPlacedOrderId(responseData?.order_id || 'ROCIO-0001');
      localStorage.setItem('activeOrderId', responseData?.order_id || 'ROCIO-0001');
      setOrderPlaced(true);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      setSubmitError(error.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showTracking, setShowTracking] = useState(false);

  if (orderPlaced && showTracking && placedOrderId) {
    return <OrderTracking orderId={placedOrderId} onDone={() => { setOrderPlaced(false); setShowTracking(false); clearCart(); }} />;
  }

  if (orderPlaced) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح!</h2>
        <p className="text-gray-500 mb-8">رقم الطلب #{placedOrderId}</p>
        <button onClick={() => setShowTracking(true)} className="w-full bg-primary text-white py-3 rounded-xl font-bold mb-3">
          تتبع الطلب
        </button>
        <button onClick={() => { setOrderPlaced(false); clearCart(); }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8 text-center bg-transparent">
        <div className="w-48 h-48 mb-8 relative flex items-center justify-center group">
          <div className="absolute w-32 h-32 bg-primary/10 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-4 border-gray-50">
            <Package size={72} className="text-secondary opacity-90 drop-shadow-sm" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">سلتك فارغة</h2>
        <p className="text-base text-gray-500 mb-10 max-w-[280px] leading-relaxed">
          لم تقم بإضافة أي منتجات إلى سلتك حتى الآن، تصفح منتجاتنا المميزة وعد إلى هنا!
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-home'))}
          className="bg-primary text-white w-full max-w-[280px] py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
        >
          تصفح المنتجات
        </button>
      </div>
    );
  }

  return (
    <div className="pb-[320px] pt-6 px-4 bg-gray-50 min-h-screen">
      <LocationPicker isOpen={isLocationPickerOpen} onClose={() => setIsLocationPickerOpen(false)} onConfirm={handleLocationConfirm} initialLocation={deliveryAddress} />

      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2">ملخص الطلب</h1>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border ${item.isDonation ? 'border-secondary/50 bg-pink-50/30' : item.isSubscribed ? 'border-secondary/30' : 'border-gray-100'}`}>
            <div className="flex gap-4 mb-3">
              <CartItemImage item={item} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800">{item.nameAr}</h4>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-1"><Trash2 size={16} /></button>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {item.isDonation ? 'توصيل للمساجد' : `${item.size} - ${item.packagingType === 'CRT' ? 'كرتون' : item.packagingType === 'PCS' ? 'حبة' : 'أخرى'}`}
                </p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white shadow rounded text-gray-600">-</button>
                    <span className="font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white shadow rounded text-primary">+</button>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    {item.isSubscribed && <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded mb-1 font-bold">خصم 10%</span>}
                    <span className="font-bold text-primary">{(Number(item.price || 0) * item.quantity * (item.isSubscribed ? 0.9 : 1)).toFixed(2)} ر.س</span>
                    {item.isSubscribed && <span className="text-xs text-gray-400 line-through">{(Number(item.price || 0) * item.quantity).toFixed(2)}</span>}
                  </div>
                </div>
              </div>
            </div>
            {item.isSubscribed && (
              <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-secondary text-sm font-medium">
                  <RefreshCw size={14} />
                  <span>تكرار التوصيل:</span>
                </div>
                <div className="relative">
                  <select value={item.subscriptionFrequency} onChange={(e) => updateSubscriptionFrequency(item.id, e.target.value as SubscriptionFrequency)}
                    className="appearance-none bg-pink-50 border border-secondary/20 text-secondary text-xs font-bold py-1.5 pl-8 pr-3 rounded-lg focus:outline-none">
                    <option value="weekly">كل أسبوع</option>
                    <option value="biweekly">كل أسبوعين</option>
                    <option value="monthly">كل شهر</option>
                  </select>
                  <ChevronDown size={14} className="absolute left-2 top-2 text-secondary pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => setIsLocationPickerOpen(true)}>
        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
          <MapPin size={18} className="text-secondary" />
          <h3>عنوان التوصيل</h3>
        </div>
        <div className="h-32 bg-blue-50 rounded-lg relative overflow-hidden flex items-center justify-center border border-blue-100 group">
          <div className="z-10 bg-white/90 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium">
            <MapPin size={14} className="text-red-500" />
            {getAddressText(deliveryAddress)}
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity">تغيير الموقع</span>
          </div>
        </div>
      </div>

      {/* Delivery Type */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
          <Truck size={18} className="text-secondary" />
          <h3>نوع التوصيل</h3>
        </div>
        <div className="flex gap-3 mb-4">
          <button onClick={() => setDeliveryType('scheduled')} className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${deliveryType === 'scheduled' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-white text-gray-500'}`}>
            <Calendar size={24} />
            <span className="font-bold text-sm">مجدول</span>
            <span className="text-[10px] opacity-80">توفير بالرسوم</span>
          </button>
          <button onClick={() => setDeliveryType('urgent')} className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${deliveryType === 'urgent' ? 'border-secondary bg-pink-50 text-secondary' : 'border-gray-100 bg-white text-gray-500'}`}>
            <Zap size={24} />
            <span className="font-bold text-sm">عاجل (الآن)</span>
            <span className="text-[10px] opacity-80">توصيل فوراً</span>
          </button>
        </div>
        {deliveryType === 'scheduled' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-bold text-gray-500 mb-2 block">اختر اليوم</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2">
              {dates.map((d, i) => (
                <button key={i} onClick={() => setSelectedDate(i)}
                  className={`flex flex-col items-center justify-center min-w-[4rem] p-2 rounded-xl border transition-all ${selectedDate === i ? 'bg-primary text-white border-primary shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200'}`}>
                  <span className="text-xs">{i === 0 ? 'اليوم' : i === 1 ? 'غداً' : d.dayName}</span>
                  <span className="text-lg font-bold">{d.dayNum}</span>
                </button>
              ))}
            </div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">اختر الوقت</label>
            <div className="space-y-2">
              {TIME_SLOTS.map((slot) => (
                <button key={slot.id} onClick={() => setSelectedTime(slot.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedTime === slot.id ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-2"><Clock size={16} /><span className="text-sm font-medium">{slot.label}</span></div>
                  <span className="text-xs opacity-75 dir-ltr">{slot.range}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recycling */}
      <div className={`transition-all duration-300 p-4 rounded-xl border mb-6 flex items-center justify-between relative overflow-hidden ${recycling ? 'bg-green-50 border-green-200 shadow-md' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3 z-10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm border ${recycling ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
            <Recycle size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-sm ${recycling ? 'text-green-800' : 'text-gray-700'}`}>استلام القوارير الفارغة</h3>
              {recycling && <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-pulse">+10 نقاط</span>}
            </div>
            <p className={`text-xs mt-0.5 ${recycling ? 'text-green-700' : 'text-gray-400'}`}>
              {recycling ? 'سيقوم السائق باستلام القوارير لإعادة التدوير' : 'هل لديك قوارير فارغة؟ اكسب نقاط ولاء'}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer z-10">
          <input type="checkbox" checked={recycling} onChange={(e) => setRecycling(e.target.checked)} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      <VisualAddress onDescriptionGenerated={setVisualDescription} />

      {/* Payment */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
          <CreditCard size={18} className="text-secondary" />
          <h3>طريقة الدفع</h3>
        </div>
        <div className="space-y-3">
          {[
            { value: 'applepay', label: 'Apple Pay', sub: 'الدفع السريع والآمن', icon: <div className="w-11 h-7 bg-black rounded flex items-center justify-center text-white px-1"><svg viewBox="0 0 384 512" width="16" height="16" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg></div> },
            { value: 'card', label: 'البطاقة البنكية', sub: 'مدى، فيزا، ماستركارد', icon: <div className="flex items-center gap-1"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Mada_Logo.svg/256px-Mada_Logo.svg.png" alt="Mada" className="h-3.5 object-contain" /><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/256px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 object-contain ml-1" /></div> },
            { value: 'cod', label: 'الدفع عند الاستلام', sub: 'نقداً أو شبكة للمندوب', icon: <Wallet size={20} strokeWidth={1.5} className="text-gray-400" /> },
          ].map(opt => (
            <label key={opt.value} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value as any)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2" />
                <div>
                  <span className="font-bold text-sm text-gray-800 block">{opt.label}</span>
                  <span className="text-xs text-gray-400">{opt.sub}</span>
                </div>
              </div>
              {opt.icon}
            </label>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white p-6 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] fixed left-0 right-0 z-20" style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}>
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between text-gray-500"><span>المجموع الفرعي</span><span>{Number(subtotal || 0).toFixed(2)} ر.س</span></div>
          {savings > 0 && <div className="flex justify-between text-secondary font-bold"><span>توفير (اشتراك)</span><span>-{Number(savings || 0).toFixed(2)} ر.س</span></div>}
          <div className="flex justify-between text-gray-500"><span>ضريبة القيمة المضافة (15%)</span><span>{Number(vatAmount || 0).toFixed(2)} ر.س</span></div>
          <div className="flex justify-between text-gray-500"><span>رسوم التوصيل</span><span className={deliveryType === 'urgent' ? 'text-secondary font-bold' : ''}>{Number(calculatedDeliveryFee || 0).toFixed(2)} ر.س</span></div>
          <div className="border-t border-dashed border-gray-300 my-2"></div>
          <div className="flex justify-between font-bold text-lg text-gray-900"><span>الإجمالي</span><span>{Number(total || 0).toFixed(2)} ر.س</span></div>
        </div>
        {submitError && (
          <div className="mb-4 text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg border border-red-100">{submitError}</div>
        )}
        <button onClick={handleCheckout} disabled={isSubmitting}
          className={`w-full text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform flex justify-between px-6 items-center ${isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary'}`}>
          <span>{isSubmitting ? 'جاري التنفيذ...' : 'تأكيد الطلب'}</span>
          {!isSubmitting && <div className="bg-white/20 px-2 py-1 rounded text-sm">{items.length} منتجات</div>}
        </button>
      </div>
    </div>
  );
};
