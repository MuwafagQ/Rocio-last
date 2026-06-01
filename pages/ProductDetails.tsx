import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../store/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  ChevronRight, Share2, Heart, Plus, Minus, RefreshCw,
  Droplets, FlaskConical, Scaling, Tag, Check, Star, Package,
  ShoppingCart, Snowflake, Thermometer, Copy, X, MessageCircle,
  Twitter,
} from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onGoToCart: () => void;
}

const FAVORITES_KEY = 'favorites_v1';

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onGoToCart }) => {
  const { items, addToCart, updateQuantity, toggleSubscription, outsideServiceArea } = useCart();
  const [imgError, setImgError] = useState(false);
  const [temperature, setTemperature] = useState<'normal' | 'cold'>('normal');

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
    catch { return []; }
  });
  const isFavorited = favorites.includes(product.id);

  // Share
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real reviews from Firestore
  const [productRating, setProductRating] = useState<{ rating: number; count: number } | null>(null);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const isSubscribed = cartItem?.isSubscribed || false;
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  // Load real product rating
  useEffect(() => {
    getDoc(doc(db, 'product_ratings', product.id))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          setProductRating({ rating: Number(d.rating), count: Number(d.count) });
        }
      })
      .catch(() => {});
  }, [product.id]);

  const handleAdd = () => { if (!isOutOfStock) addToCart(product); };
  const handleIncrement = () => updateQuantity(product.id, 1);
  const handleDecrement = () => updateQuantity(product.id, -1);

  const handleSubscribeToggle = () => {
    if (quantity > 0) {
      toggleSubscription(product.id);
    } else {
      addToCart(product);
      setTimeout(() => toggleSubscription(product.id), 0);
    }
  };

  const toggleFavorite = () => {
    const updated = isFavorited
      ? favorites.filter(id => id !== product.id)
      : [...favorites, product.id];
    setFavorites(updated);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const shareText = `${product.nameAr} — ${product.nameEn} | ${product.price} ر.س\nروسيِّو — توصيل المياه في وادي الدواسر`;
  const shareUrl = window.location.origin;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.nameAr, text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    setShowShareSheet(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-white min-h-screen pb-24 relative animate-slide-up">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button onClick={onBack} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform">
          <ChevronRight size={24} />
        </button>
        <div className="flex gap-2">
          <button onClick={handleShare} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform">
            <Share2 size={20} />
          </button>
          <button onClick={toggleFavorite} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center active:scale-95 transition-transform">
            <Heart size={20} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
          </button>
          <button onClick={onGoToCart} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Image */}
      <div className={`h-[45vh] flex items-center justify-center p-8 pb-12 transition-colors duration-500 relative ${isSubscribed ? 'bg-pink-50/50' : 'bg-gray-50'}`}>
        {isOutOfStock && <div className="absolute inset-0 bg-gray-200/60 z-20" />}
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.nameEn}
            className={`max-h-full max-w-full object-contain mix-blend-multiply relative z-10 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-gray-300 flex flex-col items-center justify-center relative z-10">
            <Package size={64} strokeWidth={1.5} />
          </div>
        )}
        {isOutOfStock && (
          <span className="absolute top-4 right-4 z-30 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold">
            نفذت الكمية
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-8 bg-white rounded-t-[2.5rem] relative z-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] min-h-[60vh]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.nameAr}</h1>
            <p className="text-gray-500 font-sans text-sm mt-1 mb-2">{product.nameEn}</p>
            {/* Real rating from Firestore */}
            {productRating ? (
              <div className="flex items-center gap-1.5">
                <Star size={16} className="fill-orange-400 text-orange-400" />
                <span className="font-bold text-gray-800">{productRating.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({productRating.count} تقييم)</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">جديد — لا توجد تقييمات بعد</span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-2xl font-bold ${isSubscribed ? 'text-secondary' : 'text-primary'}`}>
              {isSubscribed ? (Number(product.price || 0) * 0.9).toFixed(2) : Number(product.price || 0).toFixed(2)}
              <span className="text-sm font-normal text-gray-500 mr-1">ر.س</span>
            </span>
            {isSubscribed && (
              <span className="text-sm text-gray-400 line-through">{Number(product.price || 0).toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-8 mt-4 flex-wrap">
          {isSubscribed && (
            <span className="bg-secondary text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1.5 animate-pulse">
              <RefreshCw size={12} className="animate-spin-slow" />
              مشترك حالياً
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-full font-bold border border-red-200">
              نفذت الكمية
            </span>
          )}
          {product.sodiumLevel < 15 && (
            <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold border border-green-100">
              صوديوم منخفض
            </span>
          )}
          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-bold border border-blue-100">
            {product.brand}
          </span>
        </div>

        {/* Temperature Preference */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3 text-gray-800">درجة الحرارة</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setTemperature('normal')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                temperature === 'normal' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-white text-gray-500'
              }`}
            >
              <Thermometer size={18} />
              عادي
            </button>
            <button
              onClick={() => setTemperature('cold')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                temperature === 'cold' ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-100 bg-white text-gray-500'
              }`}
            >
              <Snowflake size={18} />
              بارد
            </button>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0">
              <FlaskConical size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 truncate">الصوديوم</p>
              <p className="font-bold text-gray-900 text-sm">{product.sodiumLevel} mg/L</p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm shrink-0">
              <Droplets size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 truncate">الرقم الهيدروجيني</p>
              <p className="font-bold text-gray-900 text-sm">{product.phLevel} pH</p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm shrink-0">
              <Scaling size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 truncate">الحجم</p>
              <p className="font-bold text-gray-900 text-sm truncate">{product.size}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm shrink-0">
              <Tag size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 truncate">الماركة</p>
              <p className="font-bold text-gray-900 text-sm">{product.brand}</p>
            </div>
          </div>
        </div>

        {/* Subscription Option */}
        {product.isSubscriptionAvailable && !outsideServiceArea && !isOutOfStock && (
          <div
            onClick={handleSubscribeToggle}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all mb-8 flex items-center justify-between ${
              isSubscribed
                ? 'border-secondary bg-pink-50 shadow-md shadow-secondary/5'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSubscribed ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>
                <RefreshCw size={24} className={isSubscribed ? 'animate-spin-slow' : ''} />
              </div>
              <div>
                <p className={`font-bold text-sm ${isSubscribed ? 'text-secondary' : 'text-gray-900'}`}>
                  {isSubscribed ? 'اشتراكك مفعل' : 'اشترك ووفر 10%'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">توصيل دوري (أسبوعي / شهري) تلقائي</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSubscribed ? 'border-secondary bg-secondary' : 'border-gray-300'}`}>
              {isSubscribed && <Check size={14} className="text-white" />}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-2 text-gray-800">عن المنتج</h3>
          <p className="text-gray-500 text-sm leading-relaxed text-justify">
            مياه {product.nameAr} هي مياه جوفية طبيعية نقية، معبأة من مصادر محمية لضمان أعلى مستويات الجودة والنقاء. تتميز بتوازن مثالي في الأملاح والمعادن، مما يجعلها خيارك الأمثل للترطيب اليومي لك ولعائلتك. تأتي في عبوات صحية وآمنة، مثالية للمنازل والمكاتب والمساجد.
          </p>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        {outsideServiceArea ? (
          <button disabled className="w-full py-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-bold text-sm flex items-center justify-center cursor-not-allowed">
            خارج نطاق التوصيل — للتصفح فقط
          </button>
        ) : isOutOfStock ? (
          <button disabled className="w-full py-4 rounded-xl bg-gray-100 border border-gray-200 text-gray-400 font-bold text-sm flex items-center justify-center cursor-not-allowed">
            نفذت الكمية — طلب مسبق قريباً
          </button>
        ) : (
          <div className="flex items-center gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center bg-gray-100 rounded-xl px-2 py-3">
              <button onClick={handleDecrement} disabled={quantity === 0} className="w-8 h-8 bg-white rounded-lg shadow-sm text-gray-600 flex items-center justify-center active:scale-95 disabled:opacity-50 transition-transform">
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button onClick={quantity === 0 ? handleAdd : handleIncrement} className="w-8 h-8 bg-white rounded-lg shadow-sm text-primary flex items-center justify-center active:scale-95 transition-transform">
                <Plus size={18} />
              </button>
            </div>

            {quantity === 0 ? (
              <button onClick={handleAdd} className="flex-1 text-white h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-primary shadow-primary/30">
                <Plus size={20} />
                أضف للسلة
              </button>
            ) : (
              <div className="flex-1 flex gap-2">
                <button onClick={onBack} className="flex-1 text-primary h-14 rounded-xl font-bold text-sm border-2 border-primary active:scale-[0.98] transition-all flex items-center justify-center gap-1 bg-white">
                  <Check size={16} />
                  إتمام التسوق
                </button>
                <button onClick={onGoToCart} className="flex-1 text-white h-14 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1 bg-primary shadow-primary/30">
                  <ShoppingCart size={16} />
                  الدفع
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share bottom sheet */}
      {showShareSheet && (
        <div className="fixed inset-0 z-[300] flex items-end" dir="rtl">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareSheet(false)} />
          <div className="relative bg-white w-full rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-800">مشاركة المنتج</h3>
              <button onClick={() => setShowShareSheet(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowShareSheet(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-50 active:scale-95 transition-transform"
              >
                <MessageCircle size={28} className="text-green-600" />
                <span className="text-xs font-bold text-green-700">واتساب</span>
              </a>
              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowShareSheet(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-100 active:scale-95 transition-transform"
              >
                <Twitter size={28} className="text-gray-800" />
                <span className="text-xs font-bold text-gray-700">تويتر / X</span>
              </a>
              {/* Copy link */}
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 active:scale-95 transition-transform"
              >
                {copied ? <Check size={28} className="text-blue-600" /> : <Copy size={28} className="text-blue-600" />}
                <span className="text-xs font-bold text-blue-700">{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
