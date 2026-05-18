import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useCart } from '../store/CartContext';
import { useProducts } from '../store/ProductContext';
import { DONATION_PRODUCTS } from '../constants';
import { ChevronRight, Share2, Heart, Plus, Minus, RefreshCw, Droplets, FlaskConical, Scaling, Tag, Check, Star, Package, ShoppingCart } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onGoToCart: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onGoToCart }) => {
  const { items, addToCart, updateQuantity, toggleSubscription } = useCart();
  const { products: MOCK_PRODUCTS } = useProducts();
  const [imgError, setImgError] = useState(false);
  
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const allProducts = useMemo(() => [...MOCK_PRODUCTS, ...DONATION_PRODUCTS], [MOCK_PRODUCTS]);
  const variants = useMemo(() => {
    return allProducts.filter(p => p.brand === product.brand);
  }, [allProducts, product.brand]);

  const [selectedVariantId, setSelectedVariantId] = useState(product.id);
  const currentProduct = variants.find(v => v.id === selectedVariantId) || product;

  const cartItem = items.find((i) => i.id === currentProduct.id);
  const quantity = cartItem?.quantity || 0;
  const isSubscribed = cartItem?.isSubscribed || false;

  const handleAdd = () => addToCart(currentProduct);
  const handleIncrement = () => updateQuantity(currentProduct.id, 1);
  const handleDecrement = () => updateQuantity(currentProduct.id, -1);
  
  const handleSubscribeToggle = () => {
    if (quantity > 0) {
      toggleSubscription(currentProduct.id);
    } else {
        addToCart(currentProduct);
        setTimeout(() => toggleSubscription(currentProduct.id), 0);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24 relative animate-slide-up">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button onClick={onBack} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform">
            <ChevronRight size={24} />
        </button>
        <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform">
                <Share2 size={20} />
            </button>
            <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform">
                <Heart size={20} />
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
      <div className={`h-[45vh] flex items-center justify-center p-8 pb-12 transition-colors duration-500 ${isSubscribed ? 'bg-pink-50/50' : 'bg-gray-50'}`}>
        {currentProduct.imageUrl && !imgError ? (
            <img 
                src={currentProduct.imageUrl} 
                alt={currentProduct.nameEn} 
                className="max-h-full max-w-full object-contain mix-blend-multiply" 
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
            />
        ) : (
            <div className="text-gray-300 flex flex-col items-center justify-center">
                <Package size={64} strokeWidth={1.5} />
            </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-8 bg-white rounded-t-[2.5rem] relative z-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] min-h-[60vh]">
         <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
         
         <div className="flex justify-between items-start mb-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentProduct.nameAr}</h1>
                <p className="text-gray-500 font-sans text-sm mt-1 mb-2">{currentProduct.nameEn}</p>
                 {/* Rating */}
                <div className="flex items-center gap-1.5">
                    <div className="flex text-orange-400">
                        <Star size={16} className="fill-orange-400" />
                    </div>
                    <span className="font-bold text-gray-800">{currentProduct.rating}</span>
                    <span className="text-sm text-gray-400">({currentProduct.reviews} تقييم)</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                 <span className={`text-2xl font-bold ${isSubscribed ? 'text-secondary' : 'text-primary'}`}>
                    {isSubscribed ? (Number(currentProduct.price || 0) * 0.9).toFixed(2) : Number(currentProduct.price || 0).toFixed(2)} 
                    <span className="text-sm font-normal text-gray-500 mr-1">ر.س</span>
                 </span>
                 {isSubscribed && (
                     <span className="text-sm text-gray-400 line-through">{Number(currentProduct.price || 0).toFixed(2)}</span>
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
            {currentProduct.sodiumLevel < 15 && (
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold border border-green-100">
                    صوديوم منخفض
                </span>
            )}
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-bold border border-blue-100">
                {currentProduct.brand}
            </span>
         </div>

         {/* Variant Selector */}
         {variants.length > 1 && (
             <div className="mb-8">
                 <h3 className="font-bold text-lg mb-3 text-gray-800">اختر الحجم والتعبئة</h3>
                 <div className="grid grid-cols-2 gap-3">
                     {variants.map(variant => (
                         <button
                             key={variant.id}
                             onClick={() => setSelectedVariantId(variant.id)}
                             className={`p-3 rounded-xl border-2 text-right transition-all ${
                                 selectedVariantId === variant.id
                                 ? 'border-primary bg-primary/5'
                                 : 'border-gray-100 bg-white hover:border-gray-200'
                             }`}
                         >
                             <div className="font-bold text-gray-900 text-sm mb-1">{variant.size}</div>
                             <div className="text-xs text-gray-500 flex justify-between">
                                 <span>{variant.packagingType === 'CRT' ? 'كرتون' : variant.packagingType === 'PCS' ? 'حبة' : 'أخرى'}</span>
                                 <span className="font-bold text-primary">{Number(variant.price || 0).toFixed(2)} ر.س</span>
                             </div>
                         </button>
                     ))}
                 </div>
             </div>
         )}

         {/* Specs Grid */}
         <div className="grid grid-cols-2 gap-3 mb-8">
             <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                    <FlaskConical size={20} />
                 </div>
                 <div className="min-w-0">
                     <p className="text-[10px] text-gray-500 truncate">الصوديوم</p>
                     <p className="font-bold text-gray-900 text-sm">{currentProduct.sodiumLevel} mg/L</p>
                 </div>
             </div>
             <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                    <Droplets size={20} />
                 </div>
                 <div className="min-w-0">
                     <p className="text-[10px] text-gray-500 truncate">الرقم الهيدروجيني</p>
                     <p className="font-bold text-gray-900 text-sm">{currentProduct.phLevel} pH</p>
                 </div>
             </div>
             <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                    <Scaling size={20} />
                 </div>
                 <div className="min-w-0">
                     <p className="text-[10px] text-gray-500 truncate">الحجم</p>
                     <p className="font-bold text-gray-900 text-sm truncate">{currentProduct.size}</p>
                 </div>
             </div>
             <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                    <Tag size={20} />
                 </div>
                 <div className="min-w-0">
                     <p className="text-[10px] text-gray-500 truncate">الماركة</p>
                     <p className="font-bold text-gray-900 text-sm">{currentProduct.brand}</p>
                 </div>
             </div>
         </div>

         {/* Subscription Option */}
         {currentProduct.isSubscriptionAvailable && (
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
                 مياه {currentProduct.nameAr} هي مياه جوفية طبيعية نقية، معبأة من مصادر محمية لضمان أعلى مستويات الجودة والنقاء. تتميز بتوازن مثالي في الأملاح والمعادن، مما يجعلها خيارك الأمثل للترطيب اليومي لك ولعائلتك. تأتي في عبوات صحية وآمنة، مثالية للمنازل والمكاتب والمساجد.
             </p>
         </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        <div className="flex items-center gap-4">
             {/* Quantity Controls */}
             <div className="flex items-center bg-gray-100 rounded-xl px-2 py-3">
                <button 
                    onClick={handleDecrement}
                    disabled={quantity === 0}
                    className="w-8 h-8 bg-white rounded-lg shadow-sm text-gray-600 flex items-center justify-center active:scale-95 disabled:opacity-50 transition-transform"
                >
                    <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                    onClick={quantity === 0 ? handleAdd : handleIncrement}
                    className="w-8 h-8 bg-white rounded-lg shadow-sm text-primary flex items-center justify-center active:scale-95 transition-transform"
                >
                    <Plus size={18} />
                </button>
             </div>

             {/* Add Button */}
             {quantity === 0 ? (
                 <button 
                    onClick={handleAdd}
                    className="flex-1 text-white h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-primary shadow-primary/30"
                 >
                    <Plus size={20} />
                    أضف للسلة
                 </button>
             ) : (
                 <div className="flex-1 flex gap-2">
                     <button 
                        onClick={onBack}
                        className="flex-1 text-primary h-14 rounded-xl font-bold text-sm border-2 border-primary active:scale-[0.98] transition-all flex items-center justify-center gap-1 bg-white"
                     >
                        <Check size={16} />
                        إتمام التسوق
                     </button>
                     <button 
                        onClick={onGoToCart}
                        className="flex-1 text-white h-14 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1 bg-primary shadow-primary/30"
                     >
                        <ShoppingCart size={16} />
                        الدفع
                     </button>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};