import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Loader2, ArrowRight, Smartphone, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  adminMode?: boolean;
}

export const Login: React.FC<LoginProps> = ({ adminMode = false }) => {
  const { sendOtp, verifyOtp, loginWithEmail, isLoading, error } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'email-login'>(adminMode ? 'email-login' : 'phone');

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    setPhone(val);
  };

  const isValidPhone = phone.length === 9 || (phone.length === 10 && phone.startsWith('0'));
  const isValidName = name.trim().length >= 2;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone || !isValidName) return;
    try {
      await sendOtp(phone, name.trim());
      setStep('otp');
    } catch {
      // error displayed via context state
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtp(phone, otp);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await loginWithEmail(email, password); } catch {}
  };

  const renderHeader = () => {
    const config = {
      phone: { icon: <Smartphone size={32} />, title: 'تسجيل الدخول', subtitle: 'أدخل اسمك ورقم جوالك للمتابعة' },
      otp:   { icon: <ShieldCheck size={32} />, title: 'تأكيد الرقم', subtitle: `تم إرسال رمز التحقق عبر واتسآب إلى ${phone}` },
      'email-login': { icon: <Mail size={32} />, title: 'تسجيل دخول الإدارة', subtitle: 'للمستخدمين المعتمدين فقط' },
    };
    const { icon, title, subtitle } = config[step];
    return (
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
      {renderHeader()}

      {error && (
        <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium mb-4">
          {error}
        </div>
      )}

      {/* ── Phone + Name step ── */}
      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">الاسم الكريم</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="محمد عبدالله"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">رقم الجوال</label>
            <div className="relative text-left" dir="ltr">
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full h-12 px-4 pl-14 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg tracking-widest font-mono"
                placeholder="05XXXXXXXX"
                required
              />
              <div className="absolute left-3 top-3.5 text-gray-500 font-bold border-r pr-2 border-gray-200 select-none bg-white">
                +966
              </div>
            </div>
            <p className="text-xs text-gray-400 text-right mt-1">أدخل الرقم بصيغة 05XXXXXXXX أو 5XXXXXXXX</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValidPhone || !isValidName}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'إرسال الرمز عبر واتسآب'}
          </button>
        </form>
      )}

      {/* ── OTP step ── */}
      {step === 'otp' && (
        <form onSubmit={handleVerify} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">رمز التحقق</label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-2xl tracking-[1em] font-mono"
              placeholder="------"
              maxLength={6}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'تحقق'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('phone'); setOtp(''); }}
            className="w-full text-gray-500 text-sm py-2 flex items-center justify-center gap-1 hover:text-gray-700"
          >
            <ArrowRight size={14} />
            تغيير رقم الجوال
          </button>
        </form>
      )}

      {/* ── Admin email-login step (adminMode only) ── */}
      {step === 'email-login' && (
        <form onSubmit={handleEmailLogin} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                placeholder="admin@example.com"
                dir="ltr"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="********"
                dir="ltr"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'دخول'}
          </button>
        </form>
      )}
    </div>
  );
};
