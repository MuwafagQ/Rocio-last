import React, { useState } from 'react';
import { RefreshCw, TrendingUp, Calendar, CheckCircle, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useProducts } from '../store/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

const SubscriptionItemImage: React.FC<{ product: Product }> = ({ product }) => {
    const [imgError, setImgError] = useState(false);
    
    if (!product.imageUrl || imgError) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={24} strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <img 
            src={product.imageUrl} 
            alt={product.nameEn} 
            className="max-h-full max-w-full object-contain mix-blend-multiply" 
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
        />
    );
};

interface SubscriptionsProps {
  onGoToCart: () => void;
  onProductClick: (product: Product) => void;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({ onGoToCart, onProductClick }) => {
  const { items, savings } = useCart();
  const { products: MOCK_PRODUCTS, loading } = useProducts();
  const subscribedItems = items.filter(item => item.isSubscribed);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Filter products that are available for subscription but not currently subscribed in cart
  const suggestedProducts = MOCK_PRODUCTS.filter(
    p => p.isSubscriptionAvailable && !subscribedItems.find(i => i.id === p.id)
  );

  return (
    <div className="pb-24 pt-8 px-4 bg-gray-50 min-h-screen">
       {/* Header */}
       <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-2xl font-bold text-gray-800">الاشتراكات والتوفير</h1>
            <button
                onClick={onGoToCart}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 border border-gray-100 relative active:scale-95 transition-transform"
            >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {cartCount}
                    </span>
                )}
            </button>
        </div>

        {/* Savings Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-indigo-100">
                    <TrendingUp size={18} />
                    <span className="text-sm font-medium">مجموع توفيرك</span>
                </div>
                <h2 className="text-4xl font-bold mb-1">{Number(savings || 0).toFixed(2)} <span className="text-lg font-normal">ر.س</span></h2>
                <p className="text-xs text-indigo-200">من خلال اشتراكاتك النشطة في السلة</p>
             </div>
             <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <div className="absolute left-0 bottom-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl -ml-6 -mb-6"></div>
        </div>

        {/* Active Subscriptions */}
        <div className="mb-8">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <RefreshCw size={20} className="text-secondary" />
                اشتراكاتي النشطة ({subscribedItems.length})
            </h3>

            {subscribedItems.length > 0 ? (
                <div className="space-y-3">
                    {subscribedItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-secondary/20 flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                                <SubscriptionItemImage product={item} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 text-sm">{item.nameAr}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {item.subscriptionFrequency === 'weekly' ? 'أسبوعي' : item.subscriptionFrequency === 'biweekly' ? 'كل أسبوعين' : 'شهري'}
                                    </span>
                                    <span className="text-xs text-green-600 font-bold">توفير 10%</span>
                                </div>
                            </div>
                            <CheckCircle size={20} className="text-green-500" />
                        </div>
                    ))}
                    <button onClick={onGoToCart} className="w-full mt-2 py-3 text-sm text-primary font-bold bg-white border border-primary/20 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                        إدارة الاشتراكات في السلة
                        <ArrowRight size={16} />
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Calendar size={32} />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">لا توجد اشتراكات نشطة</p>
                    <p className="text-xs text-gray-400">اشترك الآن ووفر 10% على طلباتك الدورية</p>
                </div>
            )}
        </div>

        {/* Suggestions */}
        <div>
             <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800">ابدأ اشتراك جديد</h2>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {suggestedProducts.slice(0, 4).map(p => (
                        <ProductCard key={p.id} product={p} onProductClick={onProductClick} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};