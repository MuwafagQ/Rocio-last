import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useCart } from '../store/CartContext';
import { useProducts } from '../store/ProductContext';
import { DONATION_PRODUCTS } from '../constants';
import { Plus, Minus, RefreshCw, Star, Package, ChevronLeft } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  isGrouped?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, isGrouped = false }) => {
  const { items, addToCart, updateQuantity, toggleSubscription } = useCart();
  const { products: MOCK_PRODUCTS } = useProducts();
  const [imgError, setImgError] = useState(false);
  
  const allProducts = useMemo(() => [...MOCK_PRODUCTS, ...DONATION_PRODUCTS], [MOCK_PRODUCTS]);
  const variants = useMemo(() => {
    return allProducts.filter(p => p.brand === product.brand);
  }, [allProducts, product.brand]);
  
  const hasVariants = isGrouped && variants.length > 1;

  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const isSubscribed = cartItem?.isSubscribed || false;

  const handleCardClick = () => {
    if (onProductClick) {
        onProductClick(product);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVariants && onProductClick) {
        onProductClick(product);
    } else {
        addToCart(product);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, -1);
  };

  const handleSubscribeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 0) {
      toggleSubscription(product.id);
    } else {
        // Auto add if toggling subscription on empty item
        addToCart(product);
        setTimeout(() => toggleSubscription(product.id), 0);
    }
  };

  const formatReviews = (count: number = 0) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count;
  };

  return (
    <div 
        onClick={handleCardClick}
        className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full relative group cursor-pointer active:scale-[0.99] transition-all duration-300 ${
            isSubscribed 
            ? 'border-2 border-secondary/60 shadow-lg shadow-secondary/10 bg-pink-50/10' 
            : 'border border-gray-100 hover:shadow-md'
        }`}
    >
      {/* Badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        {product.sodiumLevel < 15 && (
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold">
            صوديوم منخفض
            </span>
        )}
        {isSubscribed && (
            <span className="bg-secondary text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md animate-pulse flex items-center gap-1">
                <RefreshCw size={8} className="animate-spin-slow" />
                مشترك حالياً
            </span>
        )}
      </div>

      {/* Image Area */}
      <div className="h-40 relative flex items-center justify-center p-4 transition-colors">
        <div className={`absolute inset-0 ${isSubscribed ? 'bg-secondary/5' : 'bg-gray-50'}`}></div>
        {product.imageUrl && !imgError ? (
            <img
              src={product.imageUrl}
              alt={product.nameEn}
              className="max-h-full max-w-full object-contain mix-blend-multiply relative z-10"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
        ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-gray-300">
                <Package size={48} strokeWidth={1.5} />
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-bold text-gray-800 text-base leading-tight">
              {product.nameAr} {!isGrouped && product.size ? ` - ${product.size}` : ''}
            </h3>
            <p className="text-gray-400 text-xs font-sans mt-0.5">
              {product.nameEn} {!isGrouped && product.size ? ` - ${product.size}` : ''}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
             <Star size={12} className="fill-orange-400 text-orange-400" />
             <span className="text-xs font-bold text-gray-700">{product.rating}</span>
             <span className="text-[10px] text-gray-400">({formatReviews(product.reviews)})</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            {hasVariants ? (
                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{variants.length} خيارات متاحة</span>
            ) : (
                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                    {product.size} - {product.packagingType === 'CRT' ? 'كرتون' : product.packagingType === 'PCS' ? 'حبة' : 'أخرى'}
                </span>
            )}
            <span>pH {product.phLevel}</span>
        </div>

        <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                    {hasVariants && <span className="text-[10px] text-gray-500 mb-0.5">تبدأ من</span>}
                    <span className={`font-bold text-lg transition-colors ${isSubscribed ? 'text-secondary' : 'text-primary'}`}>
                        {isSubscribed ? (Number(product.price || 0) * 0.9).toFixed(2) : Number(product.price || 0).toFixed(2)}
                        <span className="text-xs text-gray-500 mr-1 font-normal">ر.س</span>
                    </span>
                     {isSubscribed && <span className="text-[10px] text-gray-400 line-through">{Number(product.price || 0).toFixed(2)}</span>}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-2">
                {quantity === 0 || hasVariants ? (
                    <button
                        onClick={handleAdd}
                        className={`w-full py-2 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 ${hasVariants ? 'bg-white text-primary border border-primary' : 'bg-primary text-white'}`}
                    >
                        {hasVariants ? (
                            <>
                                <span>اختر الحجم</span>
                                <ChevronLeft size={16} />
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                <span>أضف للسلة</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center bg-gray-100 rounded-lg w-full justify-between p-1">
                            <button onClick={handleIncrement} className="w-8 h-8 bg-white rounded shadow-sm text-primary flex items-center justify-center active:scale-95">
                                <Plus size={16} />
                            </button>
                            <span className="font-bold text-gray-800 text-sm mx-2">{quantity}</span>
                            <button onClick={handleDecrement} className="w-8 h-8 bg-white rounded shadow-sm text-gray-500 flex items-center justify-center active:scale-95">
                                <Minus size={16} />
                            </button>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('navigate-cart')); }} 
                            className="w-full py-1.5 rounded-lg font-bold text-xs bg-[#10B981] text-white shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                            <span>إتمام الدفع</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Subscription Toggle */}
            {product.isSubscriptionAvailable && !hasVariants && (
                 <button
                    onClick={handleSubscribeToggle}
                    className={`w-full mt-2 py-1.5 px-2 rounded border border-dashed flex items-center justify-center gap-1.5 text-xs transition-colors ${
                        isSubscribed
                        ? 'border-secondary text-secondary bg-pink-50 font-bold'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                 >
                    <RefreshCw size={12} className={isSubscribed ? 'animate-spin-slow' : ''} />
                    <span>{isSubscribed ? 'إلغاء الاشتراك' : 'اشترك ووفر 10%'}</span>
                 </button>
            )}
        </div>
      </div>
    </div>
  );
};