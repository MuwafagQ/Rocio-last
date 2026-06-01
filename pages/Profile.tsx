import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Login } from './Login';
import { GoogleMapsLocationPicker } from '../components/GoogleMapsLocationPicker';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Settings, ChevronLeft, MapPin, LogOut,
  ArrowRight, Plus, Bell, Globe, Lock, User as UserIcon, Headset,
  Trash2, Check, Edit2,
} from 'lucide-react';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

type ProfileView = 'main' | 'addresses' | 'settings' | 'edit-profile';

interface ProfileProps {
  onGoToSupport?: () => void;
}

const ADDRESS_LABELS = ['المنزل', 'العمل', 'أخرى'];
const LANG_KEY = 'app_language_v1';
const ADDR_KEY = 'saved_addresses_v1';

export const Profile: React.FC<ProfileProps> = ({ onGoToSupport }) => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<ProfileView>('main');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>(() =>
    (localStorage.getItem(LANG_KEY) as 'ar' | 'en') || 'ar'
  );
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try { return JSON.parse(localStorage.getItem(ADDR_KEY) || '[]'); }
    catch { return []; }
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [pendingLabel, setPendingLabel] = useState('المنزل');
  const [showLabelSheet, setShowLabelSheet] = useState(false);

  // Edit profile
  const [editName, setEditName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2 text-center">حسابي</h1>
        <Login />
      </div>
    );
  }

  const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-4 flex items-center gap-3">
      <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
        <ArrowRight size={24} className="text-gray-700" />
      </button>
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
    </div>
  );

  const persistAddresses = (list: SavedAddress[]) => {
    localStorage.setItem(ADDR_KEY, JSON.stringify(list));
    setSavedAddresses(list);
  };

  const handleLocationConfirm = (locJson: string) => {
    setShowLocationPicker(false);
    try {
      const loc = JSON.parse(locJson);
      setPendingLocation({ address: loc.address, lat: loc.lat, lng: loc.lng });
      setPendingLabel('المنزل');
      setShowLabelSheet(true);
    } catch {}
  };

  const savePendingAddress = () => {
    if (!pendingLocation) return;
    const newAddr: SavedAddress = {
      id: Date.now().toString(),
      label: pendingLabel,
      address: pendingLocation.address,
      lat: pendingLocation.lat,
      lng: pendingLocation.lng,
      isDefault: savedAddresses.length === 0,
    };
    persistAddresses([...savedAddresses, newAddr]);
    setShowLabelSheet(false);
    setPendingLocation(null);
  };

  const deleteAddress = (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0] = { ...updated[0], isDefault: true };
    }
    persistAddresses(updated);
  };

  const setDefaultAddress = (id: string) => {
    persistAddresses(savedAddresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.id), { name: editName.trim() }, { merge: true });
    } catch { /* best-effort */ }
    finally {
      setSavingProfile(false);
      setActiveView('settings');
    }
  };

  // ── Addresses view ──
  if (activeView === 'addresses') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 animate-in slide-in-from-left-4 duration-200">
        <Header title="العناوين المحفوظة" onBack={() => setActiveView('main')} />

        <div className="p-4 space-y-3">
          {savedAddresses.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MapPin size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">لا توجد عناوين محفوظة</p>
            </div>
          )}

          {savedAddresses.map(addr => (
            <div key={addr.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary mt-0.5 shrink-0">
                <MapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-800">{addr.label}</h4>
                  {addr.isDefault && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">الافتراضي</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{addr.address}</p>
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-[11px] text-primary font-medium mt-1.5 active:opacity-70"
                  >
                    تعيين كافتراضي
                  </button>
                )}
              </div>
              <button
                onClick={() => deleteAddress(addr.id)}
                className="p-2 text-gray-300 hover:text-red-500 active:scale-95 transition-all shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowLocationPicker(true)}
            className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors active:scale-[0.98]"
          >
            <Plus size={20} /> إضافة عنوان جديد
          </button>
        </div>

        <GoogleMapsLocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onConfirm={handleLocationConfirm}
        />

        {/* Label selection sheet */}
        {showLabelSheet && pendingLocation && (
          <div className="fixed inset-0 z-[400] flex items-end" dir="rtl">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowLabelSheet(false)} />
            <div className="relative bg-white w-full rounded-t-3xl p-6 shadow-2xl">
              <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
              <h3 className="text-base font-bold text-gray-800 mb-1">سمِّ هذا العنوان</h3>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed line-clamp-2">{pendingLocation.address}</p>
              <div className="flex gap-2 mb-6">
                {ADDRESS_LABELS.map(lbl => (
                  <button
                    key={lbl}
                    onClick={() => setPendingLabel(lbl)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      pendingLabel === lbl
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <button
                onClick={savePendingAddress}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Check size={18} />
                حفظ العنوان
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Settings view ──
  if (activeView === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 animate-in slide-in-from-left-4 duration-200">
        <Header title="الإعدادات" onBack={() => setActiveView('main')} />
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">إعدادات الحساب</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => { setEditName(user.name || ''); setActiveView('edit-profile'); }}
                className="w-full p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <UserIcon size={20} className="text-gray-400" />
                  <span>تعديل الملف الشخصي</span>
                </div>
                <ChevronLeft size={18} className="text-gray-300" />
              </button>
              {user.email && !user.email.endsWith('@rocio.app') && (
                <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Lock size={20} className="text-gray-400" />
                    <span>تغيير كلمة المرور</span>
                  </div>
                  <ChevronLeft size={18} className="text-gray-300" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">إعدادات التطبيق</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3 text-gray-700">
                  <Bell size={20} className="text-gray-400" />
                  <span>الإشعارات</span>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(v => !v)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 ${notificationsEnabled ? 'left-0.5' : 'right-0.5'}`} />
                </button>
              </div>
              <button
                onClick={() => setShowLanguagePicker(true)}
                className="w-full p-4 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe size={20} className="text-gray-400" />
                  <span>اللغة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{selectedLanguage === 'ar' ? 'العربية' : 'English'}</span>
                  <ChevronLeft size={18} className="text-gray-300" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Language picker sheet */}
        {showLanguagePicker && (
          <div className="fixed inset-0 z-[400] flex items-end" dir="rtl">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowLanguagePicker(false)} />
            <div className="relative bg-white w-full rounded-t-3xl p-6 shadow-2xl">
              <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
              <h3 className="text-base font-bold text-gray-800 mb-5">اختر اللغة</h3>
              <div className="space-y-3 mb-2">
                {([
                  { id: 'ar' as const, label: 'العربية', sub: 'Arabic' },
                  { id: 'en' as const, label: 'English', sub: 'الإنجليزية — قريباً' },
                ] as const).map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      if (lang.id === 'en') return;
                      setSelectedLanguage(lang.id);
                      localStorage.setItem(LANG_KEY, lang.id);
                      setShowLanguagePicker(false);
                    }}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                      selectedLanguage === lang.id
                        ? 'border-primary bg-primary/5'
                        : lang.id === 'en'
                        ? 'border-gray-100 bg-gray-50 opacity-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="text-right">
                      <p className={`font-bold text-sm ${selectedLanguage === lang.id ? 'text-primary' : 'text-gray-700'}`}>{lang.label}</p>
                      <p className="text-xs text-gray-400">{lang.sub}</p>
                    </div>
                    {selectedLanguage === lang.id && <Check size={18} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Edit Profile view ──
  if (activeView === 'edit-profile') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 animate-in slide-in-from-left-4 duration-200">
        <Header title="تعديل الملف الشخصي" onBack={() => setActiveView('settings')} />
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">الاسم</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                placeholder="اسمك الكامل"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">رقم الجوال</label>
              <input
                type="tel"
                value={user.phone || ''}
                readOnly
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={savingProfile || !editName.trim()}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {savingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    );
  }

  // ── Main view ──
  return (
    <div className="pb-24 pt-8 px-4 bg-gray-50 min-h-screen animate-in fade-in duration-300">
      {/* User header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-primary relative">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.phone || user.name}&background=random`}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm" dir="ltr">{user.phone || user.email}</p>
        </div>
        <button
          onClick={() => { setEditName(user.name || ''); setActiveView('edit-profile'); }}
          className="p-2 rounded-full bg-gray-100 text-gray-500 active:scale-95 transition-transform"
        >
          <Edit2 size={16} />
        </button>
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-6">
        {([
          { icon: MapPin,   label: 'العناوين المحفوظة', view: 'addresses' as ProfileView },
          { icon: Settings, label: 'الإعدادات',         view: 'settings'  as ProfileView },
        ] as const).map((item, idx) => (
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
