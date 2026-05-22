import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { Login } from './Login';
import { OrderTracking } from './Checkout';
import { 
  CreditCard, History as HistoryIcon, Settings, ChevronLeft, MapPin, Truck, Phone, LogOut,
  ArrowRight, Plus, Bell, Globe, Lock, User as UserIcon, Package, CheckCircle, XCircle, Headset, Navigation as NavigationIcon
} from 'lucide-react';

type ProfileView = 'main' | 'history' | 'addresses' | 'settings';

interface ProfileProps {
  onGoToSupport?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onGoToSupport }) => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<ProfileView>('main');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    setActiveOrderId(localStorage.getItem('activeOrderId'));
    const interval = setInterval(() => {
      setActiveOrderId(localStorage.getItem('activeOrderId'));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
        <div className="min-h-screen bg-gray-50 p-4 pt-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2 text-center">حسابي</h1>
            <Login />
        </div>
    );
  }

  const Header = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-4 flex items-center gap-3">
      <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
        <ArrowRight size={24} className="text-gray-700" />
      </button>
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
    </div>
  );

  if (activeView === 'history') {
    const mockOrders = [
      { id: '#8820', date: '2026-03-25', total: 145.50, status: 'delivered', items: 3 },
      { id: '#8750', date: '2026-03-10', total: 89.00, status: 'delivered', items: 2 },
      { id: '#8612', date: '2026-02-28', total: 210.00, status: 'cancelled', items: 5 },
    ];

    return (
      <div className="min-h-screen bg-gray-50 pb-24 animate-in slide-in-from-left-4 duration-200">
         <Header title="سجل الطلبات" onBack={() => setActiveView('main')} />
         <div className="p-4 space-y-4">
           {mockOrders.map(order => (
             <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2">
                    <Package size={18} className="text-gray-400" />
                    <span className="font-bold text-gray-800">طلب {order.id}</span>
                 </div>
                 <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {order.status === 'delivered' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                   {order.status === 'delivered' ? 'مكتمل' : 'ملغي'}
                 </span>
               </div>
               <div className="text-sm text-gray-500 mb-3">التاريخ: {order.date} • {order.items} منتجات</div>
               <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                 <span className="font-bold text-primary">{order.total} ر.س</span>
                 <button className="text-sm text-primary font-medium bg-primary/10 px-4 py-1.5 rounded-lg active:scale-95 transition-transform">إعادة الطلب</button>
               </div>
             </div>
           ))}
         </div>
      </div>
    );
  }

  if (activeView === 'addresses') {
    const mockAddresses = [
      { id: 1, title: 'المنزل', address: 'الرياض، حي الملقا، شارع وادي وج', isDefault: true },
      { id: 2, title: 'العمل', address: 'الرياض، حي العليا، طريق الملك فهد', isDefault: false },
    ];

    return (
      <div className="min-h-screen bg-gray-50 pb-24 animate-in slide-in-from-left-4 duration-200">
         <Header title="العناوين المحفوظة" onBack={() => setActiveView('main')} />
         <div className="p-4 space-y-4">
           {mockAddresses.map(addr => (
             <div key={addr.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
               <div className="bg-gray-100 p-2 rounded-full text-gray-500 mt-1"><MapPin size={20} /></div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="font-bold text-gray-800">{addr.title}</h4>
                   {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">الافتراضي</span>}
                 </div>
                 <p className="text-sm text-gray-500">{addr.address}</p>
               </div>
             </div>
           ))}
           <button className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors active:scale-[0.98]">
             <Plus size={20} /> إضافة عنوان جديد
           </button>
         </div>
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 animate-in slide-in-from-left-4 duration-200">
         <Header title="الإعدادات" onBack={() => setActiveView('main')} />
         <div className="p-4 space-y-6">
           {/* Account Settings */}
           <div>
             <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">إعدادات الحساب</h3>
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <button className="w-full p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition-colors">
                 <div className="flex items-center gap-3 text-gray-700"><UserIcon size={20} className="text-gray-400"/><span>تعديل الملف الشخصي</span></div>
                 <ChevronLeft size={18} className="text-gray-300" />
               </button>
               <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition-colors">
                 <div className="flex items-center gap-3 text-gray-700"><Lock size={20} className="text-gray-400"/><span>تغيير كلمة المرور</span></div>
                 <ChevronLeft size={18} className="text-gray-300" />
               </button>
             </div>
           </div>
           
           {/* App Settings */}
           <div>
             <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">إعدادات التطبيق</h3>
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                 <div className="flex items-center gap-3 text-gray-700"><Bell size={20} className="text-gray-400"/><span>الإشعارات</span></div>
                 <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                 >
                   <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 ${notificationsEnabled ? 'left-0.5' : 'right-0.5'}`}></div>
                 </button>
               </div>
               <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition-colors">
                 <div className="flex items-center gap-3 text-gray-700"><Globe size={20} className="text-gray-400"/><span>اللغة</span></div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">العربية</span>
                    <ChevronLeft size={18} className="text-gray-300" />
                 </div>
               </button>
             </div>
           </div>
         </div>
      </div>
    );
  }

  // --- Main View ---

  return (
    <div className="pb-24 pt-8 px-4 bg-gray-50 min-h-screen animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-primary relative">
             <img 
               src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.phone || user.name}&background=random`} 
               alt="User" 
               className="w-full h-full object-cover"
             />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm" dir="ltr">{user.phone || user.email}</p>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-primary to-blue-800 rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10">
            <span className="text-blue-200 text-sm mb-1 block">رصيد المحفظة</span>
            <h3 className="text-3xl font-bold mb-4">245.50 <span className="text-lg font-normal">ر.س</span></h3>
            <button className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold border border-white/30 flex items-center gap-2 active:scale-95 transition-transform">
                <CreditCard size={16} />
                شحن المحفظة
            </button>
        </div>
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Active Order Status */}
      {!activeOrderId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Package size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">لا توجد طلبات جارية</h3>
            <p className="text-sm text-gray-500 mb-4">تصفح منتجاتنا واطلب الآن ليصلك في أسرع وقت.</p>
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-home'))}
                className="bg-primary/10 text-primary font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-transform"
            >
                تصفح المنتجات
            </button>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
            <OrderTracking orderId={activeOrderId} isCard onDone={() => {}} />
        </div>
      )}

      {/* Menu Options */}

      <div className="space-y-2 mb-6">
        {[
            { icon: HistoryIcon, label: 'سجل الطلبات', view: 'history' as ProfileView },
            { icon: MapPin, label: 'العناوين المحفوظة', view: 'addresses' as ProfileView },
            { icon: Settings, label: 'الإعدادات', view: 'settings' as ProfileView },
        ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveView(item.view)}
              className="w-full bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3 text-gray-700">
                    <item.icon size={20} className="text-gray-400" />
                    <span className="font-medium">{item.label}</span>
                </div>
                <ChevronLeft size={18} className="text-gray-300" />
            </button>
        ))}
        {onGoToSupport && (
            <button 
              onClick={onGoToSupport}
              className="w-full bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3 text-gray-700">
                    <Headset size={20} className="text-gray-400" />
                    <span className="font-medium">الدعم الفني والشكاوي</span>
                </div>
                <ChevronLeft size={18} className="text-gray-300" />
            </button>
        )}
      </div>

      {/* Logout */}
      <button 
        onClick={logout}
        className="w-full bg-red-50 p-4 rounded-xl flex items-center justify-center gap-2 text-red-600 font-bold border border-red-100 active:scale-[0.98] transition-transform"
      >
        <LogOut size={20} />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
};