import React, { useState } from 'react';
import { HeartHandshake, Building2, School, Store, CheckCircle, ArrowRight, ShoppingCart, Heart } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { DONATION_PRODUCTS } from '../constants';
import { useCart } from '../store/CartContext';
import { Product } from '../types';

interface CommunityProps {
  onGoToCart: () => void;
  onProductClick: (product: Product) => void;
}

type CommunityTab = 'donate' | 'b2b';

export const Community: React.FC<CommunityProps> = ({ onGoToCart, onProductClick }) => {
    const { items } = useCart();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const [activeTab, setActiveTab] = useState<CommunityTab>('donate');
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleB2BSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 3000);
    };

    return (
        <div className="pb-24 pt-8 px-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h1 className="text-2xl font-bold text-gray-800">المجتمع والأعمال</h1>
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

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl flex mb-6 border border-gray-100 shadow-sm">
                <button 
                    onClick={() => setActiveTab('donate')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'donate' ? 'bg-secondary text-white shadow-md' : 'text-gray-500'
                    }`}
                >
                    <Heart size={18} />
                    تبرع وسقيا
                </button>
                <button 
                    onClick={() => setActiveTab('b2b')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'b2b' ? 'bg-primary text-white shadow-md' : 'text-gray-500'
                    }`}
                >
                    <Building2 size={18} />
                    قطاع الأعمال
                </button>
            </div>

            {activeTab === 'donate' ? (
                <div className="animate-in slide-in-from-right-4 duration-300">
                     {/* Donation Banner */}
                     <div className="bg-gradient-to-l from-secondary to-pink-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">أفضل الصدقة سقي الماء</h2>
                            <p className="text-sm opacity-90 mb-4 leading-relaxed">
                                ساهم في توفير مياه الشرب للمساجد والجمعيات الخيرية. نوصل تبرعك للمكان الذي تختاره أو للمساجد الأكثر احتياجاً.
                            </p>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <Heart className="absolute left-4 bottom-4 text-white/20 rotate-12" size={64} />
                     </div>

                     <h3 className="font-bold text-gray-800 mb-4 px-1">باقات سقيا المساجد</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {DONATION_PRODUCTS.map(product => (
                            <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
                        ))}
                     </div>

                     <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <HeartHandshake size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">شريك الخير</h4>
                                <p className="text-xs text-gray-500">نتعاون مع الجمعيات الموثوقة</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-justify leading-relaxed">
                            تضمن "وادي" وصول تبرعك لمستحقيه بالتعاون مع جمعية إرواء والجمعيات الخيرية المعتمدة في المنطقة. ستصلك رسالة توثيق عند استلام التبرع.
                        </p>
                     </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-left-4 duration-300">
                    {/* B2B Services Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-1">
                                <Building2 size={24} />
                            </div>
                            <span className="font-bold text-sm text-gray-800">المساجد والجهات</span>
                            <span className="text-[10px] text-gray-400">عقود توريد شهرية</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-1">
                                <Store size={24} />
                            </div>
                            <span className="font-bold text-sm text-gray-800">المطاعم والكافيهات</span>
                            <span className="text-[10px] text-gray-400">أسعار جملة خاصة</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-1">
                                <School size={24} />
                            </div>
                            <span className="font-bold text-sm text-gray-800">المدارس والتعليم</span>
                            <span className="text-[10px] text-gray-400">توصيل دوري</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-1">
                                <CheckCircle size={24} />
                            </div>
                            <span className="font-bold text-sm text-gray-800">تجار التجزئة</span>
                            <span className="text-[10px] text-gray-400">طلبات بالجملة</span>
                        </div>
                    </div>

                    {/* Request Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-2">طلب عرض سعر للشركات</h3>
                        <p className="text-sm text-gray-500 mb-6">املأ النموذج وسيتواصل معك فريق المبيعات خلال 24 ساعة</p>
                        
                        {formSubmitted ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                                <CheckCircle size={32} />
                                <span className="font-bold">تم إرسال طلبك بنجاح!</span>
                                <span className="text-xs">سنتواصل معك قريباً</span>
                            </div>
                        ) : (
                            <form onSubmit={handleB2BSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">اسم المنشأة</label>
                                    <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-primary focus:outline-none" placeholder="مثال: مطعم الخير" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-1 block">نوع النشاط</label>
                                        <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-primary focus:outline-none">
                                            <option>مطعم / مقهى</option>
                                            <option>مسجد / جمعية</option>
                                            <option>مدرسة / تعليم</option>
                                            <option>متجر تجزئة</option>
                                            <option>أخرى</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-1 block">المدينة</label>
                                        <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-primary focus:outline-none" placeholder="الرياض" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">رقم الجوال</label>
                                    <input type="tel" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-primary focus:outline-none text-left" dir="ltr" placeholder="05xxxxxxxx" />
                                </div>
                                
                                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
                                    إرسال الطلب
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
