import React from 'react';
import { BrandInfo } from '../types';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { MOCK_BRANDS } from '../constants';

interface BrandsProps {
  onBrandClick: (brand: BrandInfo) => void;
  onGoToCart: () => void;
}

export const Brands: React.FC<BrandsProps> = ({ onBrandClick, onGoToCart }) => {
    const { items } = useCart();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="pb-24 pt-8 px-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h1 className="text-2xl font-bold text-gray-800">تسوق حسب الماركة</h1>
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

            <div className="grid grid-cols-2 gap-4">
                {MOCK_BRANDS.map((brand) => (
                    <div 
                        key={brand.id}
                        onClick={() => onBrandClick(brand)}
                        className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full p-2 border border-gray-100 flex items-center justify-center">
                            <img src={brand.logoUrl} alt={brand.nameEn} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-800">{brand.nameAr}</h3>
                            <p className="text-xs text-gray-500">{brand.nameEn}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 px-2">
                <h3 className="font-bold text-gray-800 mb-2">لماذا تختار الماركات الموثوقة؟</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                    نحن في وادي نتعاون فقط مع المصانع والشركات المرخصة من هيئة الغذاء والدواء لضمان أعلى معايير الجودة والسلامة لمياه الشرب لك ولعائلتك.
                </p>
            </div>
        </div>
    );
};
