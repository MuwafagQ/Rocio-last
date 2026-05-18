import React from 'react';
import { BrandInfo, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../store/CartContext';
import { useProducts } from '../store/ProductContext';
import { ChevronRight, FlaskConical, Droplet, ShoppingCart, Search } from 'lucide-react';

interface BrandDetailsProps {
  brand: BrandInfo;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onGoToCart: () => void;
}

export const BrandDetails: React.FC<BrandDetailsProps> = ({ brand, onBack, onProductClick, onGoToCart }) => {
    const { items } = useCart();
    const { products: MOCK_PRODUCTS, loading } = useProducts();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    // Filter products for this brand (Case insensitive match)
    const brandProducts = MOCK_PRODUCTS.filter(p => {
        const pBrand = p.brand || '';
        const pNameAr = p.nameAr || '';
        return pBrand.toLowerCase() === brand.nameEn.toLowerCase() || 
        pBrand === brand.nameAr || 
        pNameAr.includes(brand.nameAr);
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-safe relative animate-in slide-in-from-bottom-4 duration-300">
            {/* Sticky Header */}
            <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
                        <ChevronRight size={24} className="text-gray-700" />
                    </button>
                    <div className="w-8 h-8 bg-gray-50 rounded p-0.5 border border-gray-100">
                        <img src={brand.logoUrl} alt={brand.nameEn} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-900">{brand.nameAr}</h1>
                </div>

                <button 
                    onClick={onGoToCart}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 relative active:scale-95 transition-transform hover:bg-gray-100"
                >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto">
                {/* Description */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {brand.description}
                    </p>
                </div>

                {/* Products List - Prominent */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Droplet size={20} className="text-secondary" />
                            <h3 className="font-bold text-lg">منتجات {brand.nameAr}</h3>
                            <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{brandProducts.length}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : brandProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {brandProducts.map(product => (
                                <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Search size={32} className="mb-2 opacity-50" />
                            <p>لا توجد منتجات متاحة حالياً لهذه الماركة</p>
                        </div>
                    )}
                </div>

                {/* Composition Card (Moved to bottom or kept for reference) */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <FlaskConical size={20} />
                        <h3 className="font-bold text-lg">التركيب الكيميائي</h3>
                        <span className="text-xs font-normal opacity-70">(ملجم/لتر)</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                         <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center justify-center border border-blue-100/50">
                             <span className="text-xs text-gray-500 mb-1">الرقم الهيدروجيني</span>
                             <span className="text-lg font-bold text-blue-600">{brand.composition.ph}</span>
                             <span className="text-[10px] text-gray-400">pH</span>
                         </div>
                         <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center justify-center border border-blue-100/50">
                             <span className="text-xs text-gray-500 mb-1">صوديوم</span>
                             <span className="text-lg font-bold text-blue-600">{brand.composition.sodium}</span>
                             <span className="text-[10px] text-gray-400">Na</span>
                         </div>
                         <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center justify-center border border-blue-100/50">
                             <span className="text-xs text-gray-500 mb-1">كالسيوم</span>
                             <span className="text-lg font-bold text-blue-600">{brand.composition.calcium}</span>
                             <span className="text-[10px] text-gray-400">Ca</span>
                         </div>
                         <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center justify-center border border-blue-100/50">
                             <span className="text-xs text-gray-500 mb-1">مغنيسيوم</span>
                             <span className="text-lg font-bold text-blue-600">{brand.composition.magnesium}</span>
                             <span className="text-[10px] text-gray-400">Mg</span>
                         </div>
                         <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center justify-center border border-blue-100/50">
                             <span className="text-xs text-gray-500 mb-1">بوتاسيوم</span>
                             <span className="text-lg font-bold text-blue-600">{brand.composition.potassium}</span>
                             <span className="text-[10px] text-gray-400">K</span>
                         </div>
                         <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center justify-center border border-blue-100/50">
                             <span className="text-xs text-gray-500 mb-1">بيكربونات</span>
                             <span className="text-lg font-bold text-blue-600">{brand.composition.bicarbonate}</span>
                             <span className="text-[10px] text-gray-400">HCO3</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};