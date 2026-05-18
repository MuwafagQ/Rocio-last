import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Loader2, ArrowRight, Smartphone, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

export const Login: React.FC = () => {
  const { sendOtp, verifyOtp, loginWithEmail, registerWithEmail, isLoading, error } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'email-login' | 'email-register'>('phone');
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // Email state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val.length > 10) {
        val = val.slice(0, 10); // Limit to 10 digits (e.g. 05XXXXXXXX)
    }
    setPhone(val);
  };

  const isValidPhone = phone.length === 9 || (phone.length === 10 && phone.startsWith('0'));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) return;
    await sendOtp(phone);
    setStep('otp');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await verifyOtp(phone, otp);
    } catch (err) {
        // Error handled in context
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await loginWithEmail(email, password);
    } catch (err) {
        // Error handled in context
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await registerWithEmail(name, email, password);
    } catch (err) {
        // Error handled in context
    }
  };

  const renderHeader = () => {
    let icon = <Smartphone size={32} />;
    let title = 'تسجيل الدخول';
    let subtitle = 'أدخل رقم جوالك للمتابعة وإتمام الطلب';

    if (step === 'otp') {
      icon = <ShieldCheck size={32} />;
      title = 'تأكيد الرقم';
      subtitle = `تم إرسال رمز التحقق إلى ${phone}`;
    } else if (step === 'email-login') {
      icon = <Mail size={32} />;
      title = 'تسجيل الدخول بالبريد';
      subtitle = 'أدخل بريدك الإلكتروني وكلمة المرور';
    } else if (step === 'email-register') {
      icon = <UserIcon size={32} />;
      title = 'إنشاء حساب جديد';
      subtitle = 'أدخل بياناتك لإنشاء حساب جديد';
    }

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

      {step === 'otp' && (
        <div className="w-full bg-blue-50 text-blue-700 p-3 rounded-lg text-sm text-center font-medium mb-4">
            للتجربة، استخدم الرمز: 123456
        </div>
      )}

      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="w-full space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">رقم الجوال</label>
                <div className="relative text-left" dir="ltr">
                    <input 
                        type="tel" 
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full h-12 px-4 pl-14 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg tracking-widest font-mono"
                        placeholder="05XXXXXXXX"
                        autoFocus
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
                disabled={isLoading || !isValidPhone}
                className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'أرسل الرمز'}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">أو</span>
                </div>
            </div>

            <button 
                type="button"
                onClick={() => setStep('email-login')}
                className="w-full h-12 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-gray-50"
            >
                <Mail size={20} />
                تسجيل الدخول بالبريد الإلكتروني
            </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerify} className="w-full space-y-4">
             <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">رمز التحقق (OTP)</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-2xl tracking-[1em] font-mono"
                        placeholder="----"
                        maxLength={6}
                        autoFocus
                        required
                    />
                </div>
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
                onClick={() => setStep('phone')}
                className="w-full text-gray-500 text-sm py-2 flex items-center justify-center gap-1 hover:text-gray-700"
            >
                <ArrowRight size={14} />
                تغيير رقم الجوال
            </button>
        </form>
      )}

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
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                        placeholder="example@email.com"
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
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
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
                {isLoading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
            </button>

            <div className="flex flex-col gap-2 mt-4">
                <button 
                    type="button"
                    onClick={() => setStep('email-register')}
                    className="w-full text-primary font-medium text-sm py-2 hover:underline"
                >
                    ليس لديك حساب؟ إنشاء حساب جديد
                </button>
                <button 
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-full text-gray-500 text-sm py-2 flex items-center justify-center gap-1 hover:text-gray-700"
                >
                    <ArrowRight size={14} />
                    العودة لتسجيل الدخول برقم الجوال
                </button>
            </div>
        </form>
      )}

      {step === 'email-register' && (
        <form onSubmit={handleEmailRegister} className="w-full space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">الاسم الكامل</label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <UserIcon size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="الاسم الكامل"
                        autoFocus
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={20} />
                    </div>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                        placeholder="example@email.com"
                        dir="ltr"
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
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                        placeholder="********"
                        dir="ltr"
                        required
                        minLength={6}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading || !name || !email || !password}
                className="w-full h-12 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'إنشاء حساب'}
            </button>

            <div className="flex flex-col gap-2 mt-4">
                <button 
                    type="button"
                    onClick={() => setStep('email-login')}
                    className="w-full text-primary font-medium text-sm py-2 hover:underline"
                >
                    لديك حساب بالفعل؟ تسجيل الدخول
                </button>
                <button 
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-full text-gray-500 text-sm py-2 flex items-center justify-center gap-1 hover:text-gray-700"
                >
                    <ArrowRight size={14} />
                    العودة لتسجيل الدخول برقم الجوال
                </button>
            </div>
        </form>
      )}
    </div>
  );
};