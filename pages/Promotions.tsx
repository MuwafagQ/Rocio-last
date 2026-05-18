import React from 'react';
import { Tag, Copy, Percent, ShoppingCart } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../store/CartContext';
import { useProducts } from '../store/ProductContext';
import { Product } from '../types';

interface PromotionsProps {
  onGoToCart: () => void;
  onProductClick: (product: Product) => void;
}

export const Promotions: React.FC<PromotionsProps> = ({ onGoToCart, onProductClick }) => {
    const { items } = useCart();
    const { products: MOCK_PRODUCTS, loading } = useProducts();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    // Mocking promo products (e.g., specific IDs or just first 4 for demo)
    const promoProducts = MOCK_PRODUCTS.slice(0, 4);

    return (
        <div className="pb-24 pt-8 px-4 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6 px-2">
                <h1 className="text-2xl font-bold text-gray-800">العروض والخصومات</h1>
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

            {/* Coupons Section */}
            <div className="space-y-4 mb-8">
                {/* Coupon 1 */}
                <div className="bg-gradient-to-l from-purple-600 to-indigo-600 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">توصيل مجاني</span>
                            <h3 className="font-bold text-xl mb-1">شحن مجاني لأول طلب</h3>
                            <p className="text-xs opacity-90 mb-4">استخدم الكود عند الدفع للحصول على العرض</p>
                            <div className="bg-white/10 border border-white/20 rounded-lg p-2 flex items-center gap-3 w-fit cursor-pointer active:bg-white/20 transition-colors">
                                <code className="font-mono font-bold text-lg tracking-wider">STOREDB2024</code>
                                <Copy size={16} className="opacity-70" />
                            </div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-full text-white backdrop-blur-sm border border-white/20">
                             <Tag size={32} />
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full"></div>
                </div>

                {/* Coupon 2 */}
                <div className="bg-gradient-to-l from-pink-500 to-rose-500 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-pink-200">
                     <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">عرض خاص</span>
                            <h3 className="font-bold text-xl mb-1">خصم 50% على مياه نوفا</h3>
                            <p className="text-xs opacity-90">عند شراء 5 كراتين أو أكثر</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full">
                            <Percent size={28} />
                        </div>
                     </div>
                     <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-white/10 rounded-full rotate-45 blur-xl"></div>
                </div>
            </div>

            {/* Discounted Products Grid */}
            <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800">عروض حصرية</h2>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {promoProducts.map(p => (
                        <ProductCard key={p.id} product={p} onProductClick={onProductClick} />
                    ))}
                </div>
            )}
        </div>
    );
};