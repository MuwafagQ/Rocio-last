import React, { useState } from 'react';
import { ChevronRight, MessageCircle, Phone, Mail, HelpCircle, FileText, Send, CheckCircle } from 'lucide-react';

interface SupportProps {
  onBack: () => void;
}

export const Support: React.FC<SupportProps> = ({ onBack }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'يمكنك تتبع طلبك من خلال صفحة "حسابي" ثم اختيار "سجل الطلبات". ستجد هناك حالة الطلب بالتفصيل وموقع المندوب إذا كان الطلب في الطريق.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نوفر عدة طرق للدفع تشمل: الدفع عند الاستلام، البطاقات الائتمانية (مدى، فيزا، ماستركارد)، و Apple Pay.'
    },
    {
      question: 'هل يمكنني إلغاء أو تعديل الطلب؟',
      answer: 'نعم، يمكنك إلغاء أو تعديل الطلب من خلال سجل الطلبات طالما أن حالة الطلب "قيد التجهيز". إذا تم خروج المندوب، يرجى التواصل مع خدمة العملاء.'
    },
    {
      question: 'كيف يعمل نظام الاشتراكات؟',
      answer: 'يمكنك الاشتراك لتوصيل المياه بشكل دوري (أسبوعي، كل أسبوعين، أو شهرياً) بخصم يصل إلى 10%. سيتم خصم المبلغ تلقائياً وتوصيل المياه في الموعد المحدد.'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessageSent(true);
      setMessage('');
      setTimeout(() => setMessageSent(false), 3000);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-safe relative animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
          <ChevronRight size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">خدمة العملاء والدعم</h1>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto pb-24">
        
        {/* Contact Options */}
        <div className="grid grid-cols-3 gap-3">
          <a href="tel:920000000" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Phone size={24} />
            </div>
            <span className="text-xs font-bold text-gray-700">اتصال</span>
          </a>
          <a href="https://wa.me/966500000000" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <MessageCircle size={24} />
            </div>
            <span className="text-xs font-bold text-gray-700">واتساب</span>
          </a>
          <a href="mailto:support@wadi.com" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <Mail size={24} />
            </div>
            <span className="text-xs font-bold text-gray-700">إيميل</span>
          </a>
        </div>

        {/* Send Message Form */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <FileText size={20} className="text-secondary" />
            <h2 className="font-bold text-lg">أرسل لنا رسالة</h2>
          </div>
          
          {messageSent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">تم إرسال رسالتك بنجاح!</p>
                <p className="text-xs mt-1">سيقوم فريق الدعم بالرد عليك في أقرب وقت.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3">
              <textarea 
                placeholder="كيف يمكننا مساعدتك اليوم؟" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
              <button 
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Send size={18} />
                <span>إرسال الرسالة</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-800 px-1">
            <HelpCircle size={20} className="text-secondary" />
            <h2 className="font-bold text-lg">الأسئلة الشائعة</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-4 text-right flex justify-between items-center focus:outline-none"
                >
                  <span className="font-bold text-sm text-gray-800">{faq.question}</span>
                  <ChevronRight 
                    size={18} 
                    className={`text-gray-400 transition-transform duration-300 ${activeFaq === index ? '-rotate-90' : 'rotate-180'}`} 
                  />
                </button>
                
                <div 
                  className={`px-4 text-sm text-gray-600 leading-relaxed transition-all duration-300 overflow-hidden ${
                    activeFaq === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
