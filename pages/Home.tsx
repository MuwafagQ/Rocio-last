import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Search, Filter, ChevronDown, SlidersHorizontal, X, ArrowUpDown, Check, Star, ShoppingCart, Headset } from 'lucide-react';
import { DONATION_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../store/CartContext';
import { useProducts } from '../store/ProductContext';
import { Product } from '../types';
import { LocationPicker } from '../components/LocationPicker';

type SortOption = 'popular' | 'price_asc' | 'price_desc';
type PHLevel = 'all' | 'acidic' | 'neutral' | 'alkaline';

interface HomeProps {
  onGoToCart: () => void;
  onGoToProfile: () => void;
  onGoToSupport: () => void;
  onProductClick: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ onGoToCart, onGoToProfile, onGoToSupport, onProductClick }) => {
  const { items } = useCart();
  const { products: MOCK_PRODUCTS, loading } = useProducts();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('الرياض، حي العليا');

  // Filter States
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [lowSodiumOnly, setLowSodiumOnly] = useState(false);
  const [selectedPh, setSelectedPh] = useState<PHLevel>('all');

  // Derived Options
  const allProducts = useMemo(() => [...MOCK_PRODUCTS, ...DONATION_PRODUCTS], [MOCK_PRODUCTS]);
  const brands = useMemo(() => Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))), [allProducts]);
  const sizes = useMemo(() => {
    // Extract unique sizes (e.g. 330ml, 550ml, 5L)
    const allSizes = allProducts.map(p => {
        const match = p.size?.match(/^([\d\.]+[a-zA-Z]+)/);
        return match ? match[1] : '';
    }).filter(Boolean);
    return Array.from(new Set(allSizes));
  }, [allProducts]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      const nameAr = p.nameAr || '';
      const nameEn = p.nameEn || '';
      const matchesSearch = nameAr.includes(searchTerm) || nameEn.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Quick Filters (Legacy support combined with new logic)
      let matchesQuick = true;
      if (activeQuickFilter === 'best-sellers') matchesQuick = (p.rating || 0) >= 4.5 || (p.reviews || 0) > 1000;
      if (activeQuickFilter === 'low-sodium') matchesQuick = (p.sodiumLevel || 0) < 15;
      if (activeQuickFilter === 'donations') matchesQuick = p.isDonation === true;

      // Advanced Filters
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand || '');
      const matchesPrice = (p.price || 0) <= maxPrice;
      const matchesSodium = !lowSodiumOnly || (p.sodiumLevel || 0) < 15;
      
      // Size Logic (Simple substring match)
      const matchesSize = selectedSizes.length === 0 || selectedSizes.some(s => p.size?.includes(s));

      // pH Logic
      let matchesPh = true;
      if (selectedPh === 'acidic') matchesPh = (p.phLevel || 7) < 7;
      if (selectedPh === 'neutral') matchesPh = (p.phLevel || 7) >= 7 && (p.phLevel || 7) <= 7.5;
      if (selectedPh === 'alkaline') matchesPh = (p.phLevel || 7) > 7.5;

      return matchesSearch && matchesQuick && matchesBrand && matchesPrice && matchesSodium && matchesSize && matchesPh;
    });

    // Sort Logic
    return result.sort((a, b) => {
      switch (sortOption) {
        case 'price_asc': return (a.price || 0) - (b.price || 0);
        case 'price_desc': return (b.price || 0) - (a.price || 0);
        case 'popular': default: return (b.reviews || 0) - (a.reviews || 0); // Sort by reviews for High Demand
      }
    });
  }, [allProducts, searchTerm, activeQuickFilter, selectedBrands, maxPrice, lowSodiumOnly, selectedSizes, selectedPh, sortOption]);

  const activeFiltersCount = [
    selectedBrands.length > 0,
    selectedSizes.length > 0,
    lowSodiumOnly,
    selectedPh !== 'all',
    maxPrice < 200
  ].filter(Boolean).length;

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const resetFilters = () => {
    setSortOption('popular');
    setMaxPrice(200);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setLowSodiumOnly(false);
    setSelectedPh('all');
    setActiveQuickFilter('all');
  };

  const handleLocationConfirm = (loc: string) => {
      setCurrentLocation(loc);
      setIsLocationPickerOpen(false);
  };

  return (
    <div className={`pb-24 min-h-screen relative ${isFilterOpen ? 'overflow-hidden h-screen' : ''}`}>
      {/* Location Picker Modal */}
      <LocationPicker 
        isOpen={isLocationPickerOpen} 
        onClose={() => setIsLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLocation={currentLocation}
      />

      {/* Header Section */}
      <div className="bg-primary pt-12 pb-8 px-4 rounded-b-[2rem] shadow-xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-white">
            <button 
                onClick={() => setIsLocationPickerOpen(true)}
                className="bg-white/20 p-2 rounded-full active:bg-white/30 transition-colors"
            >
                <MapPin size={20} className="text-white" />
            </button>
            <div 
                className="flex flex-col cursor-pointer" 
                onClick={() => setIsLocationPickerOpen(true)}
            >
                <span className="text-xs text-blue-100">التوصيل إلى</span>
                <div className="flex items-center gap-1 font-bold">
                    <span>{currentLocation}</span>
                    <ChevronDown size={14} />
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Customer Service Button */}
             <button 
                onClick={onGoToSupport}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border-2 border-white/30 active:scale-95 transition-transform"
                title="خدمة العملاء"
             >
                <Headset size={20} />
             </button>

             {/* Cart Icon (Top Left in RTL) */}
             <button 
                onClick={onGoToCart}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border-2 border-white/30 relative active:scale-95 transition-transform"
             >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">
                        {cartCount}
                    </span>
                )}
             </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
            <input 
                type="text" 
                placeholder="ابحث عن منتجات (مياه، أحجام...)" 
                className="w-full h-12 rounded-xl px-12 text-sm text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
            <button 
                onClick={() => setIsFilterOpen(true)}
                className={`absolute left-2 top-2 h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${activeFiltersCount > 0 ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                <SlidersHorizontal size={16} />
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="mt-6 px-4">
        <div className="w-full h-40 bg-gradient-to-l from-secondary to-pink-600 rounded-2xl shadow-lg relative overflow-hidden flex items-center px-6">
            <div className="text-white z-10 w-2/3">
                <span className="bg-white/20 text-xs px-2 py-1 rounded mb-2 inline-block">عروض رمضان</span>
                <h2 className="text-2xl font-bold mb-1">خصم 20%</h2>
                <p className="text-sm opacity-90 mb-3">على جميع اشتراكات المياه الشهرية</p>
                <button className="bg-white text-secondary px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">اشترك الآن</button>
            </div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <img 
                src="https://picsum.photos/200/200" 
                alt="Banner" 
                className="absolute left-4 top-4 w-32 h-32 object-contain drop-shadow-2xl rotate-12"
            />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-8 px-4">
        <h3 className="font-bold text-lg mb-3 text-gray-800">التصنيفات السريعة</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[
                { id: 'all', label: 'الكل' },
                { id: 'best-sellers', label: 'الأكثر مبيعاً' },
                { id: 'low-sodium', label: 'صوديوم منخفض' },
                { id: 'donations', label: 'تبرعات المساجد' },
            ].map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActiveQuickFilter(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeQuickFilter === cat.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-6 px-4">
        <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-lg text-gray-800">المنتجات الأكثر طلباً ({filteredProducts.length})</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
                <ArrowUpDown size={12} />
                <span>
                    {sortOption === 'price_asc' ? 'الأقل سعراً' : sortOption === 'price_desc' ? 'الأعلى سعراً' : 'المقترح'}
                </span>
            </div>
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        ) : filteredProducts.length > 0 ? (
             <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onProductClick={onProductClick} isGrouped={false} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Search size={48} className="mb-4 opacity-50" />
                <p>لا توجد منتجات تطابق خياراتك</p>
                <button onClick={resetFilters} className="mt-4 text-primary font-bold text-sm">إعادة تعيين الفلاتر</button>
            </div>
        )}
      </div>

      {/* -------------------- Filter Bottom Sheet -------------------- */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsFilterOpen(false)}
            ></div>

            {/* Sheet Content */}
            <div className="bg-white w-full max-w-md rounded-t-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative animate-slide-up">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Filter size={20} className="text-secondary" />
                        تصفية وترتيب
                    </h2>
                    <div className="flex items-center gap-3">
                        <button onClick={resetFilters} className="text-sm text-gray-500 font-medium hover:text-red-500">مسح الكل</button>
                        <button onClick={() => setIsFilterOpen(false)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">تم</button>
                        <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 space-y-8 no-scrollbar">
                    
                    {/* Sort By */}
                    <section>
                        <h3 className="font-bold text-gray-800 mb-3 text-sm">ترتيب حسب</h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'popular', label: 'المقترح' },
                                { id: 'price_asc', label: 'الأقل سعراً' },
                                { id: 'price_desc', label: 'الأعلى سعراً' },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSortOption(opt.id as SortOption)}
                                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                                        sortOption === opt.id 
                                        ? 'bg-primary/10 border-primary text-primary font-bold' 
                                        : 'bg-white border-gray-200 text-gray-600'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Price Range */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-800 text-sm">نطاق السعر</h3>
                            <span className="text-primary font-bold text-sm">حتى {maxPrice} ر.س</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            step="1"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>0 ر.س</span>
                            <span>200 ر.س</span>
                        </div>
                    </section>

                    {/* Brands */}
                    <section>
                        <h3 className="font-bold text-gray-800 mb-3 text-sm">العلامة التجارية</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {brands.map((brand) => (
                                <button
                                    key={brand}
                                    onClick={() => toggleBrand(brand)}
                                    className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all truncate ${
                                        selectedBrands.includes(brand)
                                        ? 'bg-secondary text-white border-secondary'
                                        : 'bg-gray-50 border-gray-200 text-gray-600'
                                    }`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Sizes */}
                    <section>
                        <h3 className="font-bold text-gray-800 mb-3 text-sm">الحجم</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => toggleSize(size)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        selectedSizes.includes(size)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white border-gray-200 text-gray-600'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Health & Composition */}
                    <section>
                        <h3 className="font-bold text-gray-800 mb-3 text-sm">المحتوى الصحي</h3>
                        <div className="space-y-3">
                            {/* Sodium Toggle */}
                            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Check size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">صوديوم منخفض</div>
                                        <div className="text-[10px] text-gray-500">أقل من 15 ملجم/لتر</div>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${lowSodiumOnly ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setLowSodiumOnly(!lowSodiumOnly)}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${lowSodiumOnly ? '-translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </label>

                            {/* pH Level */}
                            <div>
                                <label className="text-xs text-gray-500 mb-2 block">مستوى الرقم الهيدروجيني (pH)</label>
                                <div className="flex rounded-xl overflow-hidden border border-gray-200 divide-x divide-x-reverse divide-gray-200">
                                    {[
                                        { id: 'all', label: 'الكل' },
                                        { id: 'acidic', label: '< 7' },
                                        { id: 'neutral', label: '7 - 7.5' },
                                        { id: 'alkaline', label: '> 7.5' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSelectedPh(opt.id as PHLevel)}
                                            className={`flex-1 py-2 text-xs font-medium transition-colors ${
                                                selectedPh === opt.id
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <button 
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
                    >
                        عرض النتائج ({filteredProducts.length})
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};