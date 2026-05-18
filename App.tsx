import React, { useState, useEffect } from 'react';
import { CartProvider } from './store/CartContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ProductProvider, useProducts } from './store/ProductContext';
import { Home } from './pages/Home';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { Promotions } from './pages/Promotions';
import { Community } from './pages/Community';
import { Subscriptions } from './pages/Subscriptions';
import { Brands } from './pages/Brands';
import { BrandDetails } from './pages/BrandDetails';
import { ProductDetails } from './pages/ProductDetails';
import { ERP } from './pages/ERP';
import { Login } from './pages/Login';
import { Support } from './pages/Support';
import { BottomNav } from './components/BottomNav';
import { Tab, Product, BrandInfo } from './types';
import { Loader2 } from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { LocationPicker } from './components/LocationPicker';

const AppContent: React.FC = () => {
  const { isLoading: authLoading, user } = useAuth();
  const { loading: productsLoading } = useProducts();
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.HOME);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null);
  const [isHiddenRoute, setIsHiddenRoute] = useState(false);
  
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const [isGlobalLocationPickerOpen, setIsGlobalLocationPickerOpen] = useState(false);
  const [globalAddress, setGlobalAddress] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.pathname === '/admin-secret') {
      setIsHiddenRoute(true);
    }
    
    // Check if we have a saved location
    const savedLocation = localStorage.getItem('user_location');
    if (savedLocation) {
        setGlobalAddress(savedLocation);
    } else {
        // If no location saved, we will ask for it after a short delay (e.g. after splash screen)
    }

    const handleNavigateCart = () => {
      setSelectedProduct(null);
      setSelectedBrand(null);
      setCurrentTab(Tab.CART);
    };

    const handleNavigateHome = () => {
      setSelectedProduct(null);
      setSelectedBrand(null);
      setCurrentTab(Tab.HOME);
    };

    window.addEventListener('navigate-cart', handleNavigateCart);
    window.addEventListener('navigate-home', handleNavigateHome);
    
    return () => {
      window.removeEventListener('navigate-cart', handleNavigateCart);
      window.removeEventListener('navigate-home', handleNavigateHome);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !productsLoading) {
      // Add a minimum display time for the splash screen
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, productsLoading]);
  
  useEffect(() => {
      // Once app is ready and splash screen is gone, check location
      if (!showSplash && !globalAddress && !isHiddenRoute) {
          setIsGlobalLocationPickerOpen(true);
      }
  }, [showSplash, globalAddress, isHiddenRoute]);

  const handleGlobalLocationConfirm = (loc: string) => {
      setGlobalAddress(loc);
      localStorage.setItem('user_location', loc);
      setIsGlobalLocationPickerOpen(false);
      
      // If user is logged in, optionally update their default address in the background
      if (user && user.id) {
          import('firebase/firestore').then(({ doc, updateDoc }) => {
              import('./firebase').then(({ db }) => {
                  updateDoc(doc(db, 'users', user.id), {
                      default_address: loc
                  }).catch(console.error);
              });
          });
      }
  };


  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBrandClick = (brand: BrandInfo) => {
    setSelectedBrand(brand);
  };

  const handleGoToCart = () => {
    setSelectedBrand(null);
    setSelectedProduct(null);
    setCurrentTab(Tab.CART);
  };

  const renderContent = () => {
    switch (currentTab) {
      case Tab.HOME:
        return <Home 
          onGoToCart={() => setCurrentTab(Tab.CART)} 
          onGoToProfile={() => setCurrentTab(Tab.PROFILE)}
          onGoToSupport={() => setCurrentTab(Tab.SUPPORT)}
          onProductClick={handleProductClick} 
        />;
      case Tab.BRANDS:
        return <Brands onBrandClick={handleBrandClick} onGoToCart={() => setCurrentTab(Tab.CART)} />;
      case Tab.COMMUNITY:
        return <Community onGoToCart={() => setCurrentTab(Tab.CART)} onProductClick={handleProductClick} />;
      case Tab.SUBSCRIPTIONS:
        return <Subscriptions onGoToCart={() => setCurrentTab(Tab.CART)} onProductClick={handleProductClick} />;
      case Tab.CART:
        return <Checkout />;
      case Tab.PROFILE:
        return <Profile onGoToSupport={() => setCurrentTab(Tab.SUPPORT)} />;
      case Tab.SUPPORT:
        return <Support onBack={() => setCurrentTab(Tab.HOME)} />;
      default:
        return <Home 
          onGoToCart={() => setCurrentTab(Tab.CART)} 
          onGoToProfile={() => setCurrentTab(Tab.PROFILE)}
          onGoToSupport={() => setCurrentTab(Tab.SUPPORT)}
          onProductClick={handleProductClick} 
        />;
    }
  };

  const renderMainContent = () => {
    if (isHiddenRoute) {
      if (!user) {
        return (
          <div className="min-h-screen bg-gray-50 p-4 pt-12">
              <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2 text-center">تسجيل الدخول للإدارة</h1>
              <Login />
          </div>
        );
      }

      if (user.role === 'admin') {
        return (
          <main className="h-full overflow-y-auto no-scrollbar">
            <ERP />
          </main>
        );
      } else {
        return (
          <div className="flex flex-col items-center justify-center p-4 text-center h-full">
            <h1 className="text-2xl font-bold text-red-500 mb-2">غير مصرح</h1>
            <p className="text-gray-600 mb-6">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
                setIsHiddenRoute(false);
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold"
            >
              العودة للرئيسية
            </button>
          </div>
        );
      }
    }

    if (selectedProduct) {
        return (
          <ProductDetails 
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)} 
            onGoToCart={handleGoToCart}
          />
        );
    }

    if (selectedBrand) {
        return (
            <BrandDetails 
              brand={selectedBrand} 
              onBack={() => setSelectedBrand(null)} 
              onProductClick={handleProductClick}
              onGoToCart={handleGoToCart}
            />
        );
    }

    return (
      <>
        <main className="h-full overflow-y-auto no-scrollbar">
            {renderContent()}
        </main>
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen relative shadow-2xl overflow-hidden font-sans">
      {showSplash && (
        <SplashScreen 
          isReady={isReady} 
          onTransitionEnd={() => setShowSplash(false)} 
        />
      )}
      {(!authLoading && !productsLoading) && renderMainContent()}
      
      <LocationPicker 
          isOpen={isGlobalLocationPickerOpen} 
          onClose={() => {
              // Only allow close if we actually have an address, or force it?
              // The requirement: "So the map or permissions to access location pops-up the moment the customer opened the app".
              // If they close it without setting location, should we allow it? Let's allow it but they might not have a location set.
              setIsGlobalLocationPickerOpen(false);
          }} 
          onConfirm={handleGlobalLocationConfirm} 
          initialLocation={globalAddress || 'الرياض، المملكة العربية السعودية'}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;