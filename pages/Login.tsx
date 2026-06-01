import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { Loader2, Smartphone, Mail, Lock, User as UserIcon, ArrowRight, RefreshCw } from 'lucide-react';

interface LoginProps {
  adminMode?: boolean;
}

type Step = 'phone' | 'otp';

const RESEND_SECONDS = 60;

export const Login: React.FC<LoginProps> = ({ adminMode = false }) => {
  const { sendOtp, verifyOtp, loginWithEmail, isLoading, error } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Focus OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    setPhone(val);
  };

  const isValidPhone = phone.length === 9 || (phone.length === 10 && phone.startsWith('0'));
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  const isValidName = nameParts.length >= 3;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidName) {
      setNameError('يرجى إدخال الاسم الثلاثي كاملاً (الاسم الأول والأب والعائلة)');
      return;
    }
    if (!isValidPhone) return;
    setNameError('');
    try {
      await sendOtp(phone, name.trim());
      setStep('otp');
      setCountdown(RESEND_SECONDS);
    } catch {
      // error shown from context
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    try {
      await verifyOtp(phone, otp);
      // onAuthStateChanged in AuthContext handles the rest
    } catch {
      setOtp('');
      otpInputRef.current?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp('');
    try {
      await sendOtp(phone, name.trim());
      setCountdown(RESEND_SECONDS);
    } catch {}
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await loginWithEmail(email, password); } catch {}
  };

  // ── Admin email login ──────────────────────────────────────────────────────
  if (adminMode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تسجيل دخول الإدارة</h2>
          <p className="text-gray-500 text-sm">للمستخدمين المعتمدين فقط</p>
        </div>
        {error && <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium mb-4">{error}</div>}
        <form onSubmit={handleEmailLogin} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><Mail size={20} /></div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                placeholder="admin@example.com" dir="ltr" autoFocus required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><Lock size={20} /></div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="********" dir="ltr" required />
            </div>
          </div>
          <button type="submit" disabled={isLoading || !email || !password}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="animate-spin" /> : 'دخول'}
          </button>
        </form>
      </div>
    );
  }

  // ── Step 1: Name + Phone ───────────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Smartphone size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h2>
          <p className="text-gray-500 text-sm">سنرسل رمز التحقق عبر واتساب</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium mb-4">{error}</div>}

        <form onSubmit={handleSendOtp} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">الاسم الكامل <span className="text-gray-400">(ثلاثي)</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><UserIcon size={18} /></div>
              <input type="text" value={name}
                onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }}
                className={`w-full h-12 px-4 pr-10 rounded-xl border focus:ring-2 outline-none transition-all ${
                  nameError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                }`}
                placeholder="محمد عبدالله الأحمدي" autoFocus required />
            </div>
            {nameError && <p className="text-xs text-red-500 font-medium pt-0.5">{nameError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">رقم الجوال</label>
            <div className="flex h-12 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all" dir="ltr">
              <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-gray-500 font-semibold text-sm select-none whitespace-nowrap">+966</span>
              <input type="tel" value={phone} onChange={handlePhoneChange}
                className="flex-1 px-3 outline-none text-base tracking-widest font-mono bg-white"
                placeholder="05XXXXXXXX" required />
            </div>
            <p className="text-xs text-gray-400 text-right mt-1">أدخل الرقم بصيغة 05XXXXXXXX</p>
          </div>

          <button type="submit" disabled={isLoading || !isValidPhone || !name.trim()}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading
              ? <Loader2 className="animate-spin" size={22} />
              : <><span>إرسال رمز التحقق</span><ArrowRight size={18} /></>
            }
          </button>
        </form>
      </div>
    );
  }

  // ── Step 2: OTP Entry ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
      <div className="mb-6 text-center">
        {/* WhatsApp icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#25D366' }}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">أدخل رمز التحقق</h2>
        <p className="text-gray-500 text-sm">أرسلنا رمزاً مكوناً من 6 أرقام إلى</p>
        <p className="text-primary font-bold text-sm mt-0.5" dir="ltr">+966 {phone}</p>
      </div>

      {error && <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium mb-4">{error}</div>}

      <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
        <div className="space-y-1">
          <input
            ref={otpInputRef}
            type="tel"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full h-14 text-center text-3xl font-bold tracking-[0.5em] rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="––––––"
            dir="ltr"
            maxLength={6}
            required
          />
        </div>

        <button type="submit" disabled={isLoading || otp.length !== 6}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'تأكيد'}
        </button>

        {/* Resend */}
        <div className="text-center">
          {countdown > 0
            ? <p className="text-sm text-gray-400">إعادة الإرسال خلال <span className="font-bold text-gray-600">{countdown}ث</span></p>
            : <button type="button" onClick={handleResend} disabled={isLoading}
                className="text-sm text-primary font-medium flex items-center gap-1 mx-auto disabled:opacity-50">
                <RefreshCw size={14} />
                <span>إعادة إرسال الرمز</span>
              </button>
          }
        </div>

        {/* Back */}
        <button type="button" onClick={() => { setStep('phone'); setOtp(''); }}
          className="w-full text-sm text-gray-400 text-center hover:text-gray-600 transition-colors">
          تعديل رقم الجوال
        </button>
      </form>
    </div>
  );
};
