import React, { useState } from 'react';
import { X, Star, Send, MessageCircle, Check } from 'lucide-react';

const CATEGORIES = [
  'سرعة التوصيل',
  'جودة المياه',
  'سهولة التطبيق',
  'السعر',
  'المندوب',
  'أخرى',
];

const RATING_LABELS = ['', 'سيء جداً', 'سيء', 'مقبول', 'جيد', 'ممتاز! 🌟'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  odooOrderId?: number;
  customerId: string;
  customerName?: string;
  onSubmitted?: () => void;
}

export const FeedbackSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  orderId,
  odooOrderId,
  customerId,
  customerName,
  onSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await fetch('https://n8n.srv1473225.hstgr.cloud/webhook/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          odoo_order_id: odooOrderId || null,
          customer_id: customerId,
          customer_name: customerName || '',
          rating,
          categories: selectedCategories,
          comment: comment.trim() || null,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // fail silently — feedback loss is better than blocking the user
    } finally {
      setSubmitting(false);
      // Mark as reviewed in localStorage
      try {
        const prev = JSON.parse(localStorage.getItem('reviewed_orders_v1') || '[]');
        localStorage.setItem('reviewed_orders_v1', JSON.stringify([...prev, orderId]));
      } catch {}
      setSubmitted(true);
      onSubmitted?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white w-full rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-800">قيّم تجربتك</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">شكراً لتقييمك!</h4>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              رأيك يساعدنا نطوّر الخدمة لك ولكل أهل وادي الدواسر.
            </p>
            <a
              href="https://wa.me/966559881516"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-green-500 text-white font-bold text-sm mb-3 active:scale-[0.98] transition-transform"
            >
              <MessageCircle size={18} />
              تواصل معنا عبر واتساب
            </a>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm active:scale-[0.98] transition-transform"
            >
              إغلاق
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div className="px-6 py-6 space-y-7">
            {/* Star rating */}
            <div className="text-center">
              <p className="text-sm font-bold text-gray-700 mb-4">كيف تقيّم تجربتك الكلية؟</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="active:scale-125 transition-transform"
                  >
                    <Star
                      size={40}
                      className={`transition-colors duration-100 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm font-bold text-primary mt-2 animate-in fade-in duration-200">
                  {RATING_LABELS[rating]}
                </p>
              )}
            </div>

            {/* Category chips */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">
                ما الذي تريد تقييمه؟{' '}
                <span className="text-gray-400 font-normal text-xs">اختياري — يمكنك اختيار أكثر من واحد</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm border-2 font-medium transition-all active:scale-95 ${
                      selectedCategories.includes(cat)
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Free-text comment */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">
                أخبرنا أكثر{' '}
                <span className="text-gray-400 font-normal text-xs">اختياري</span>
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="شاركنا رأيك بحرية — ملاحظاتك تصل مباشرة للفريق..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none leading-relaxed"
              />
              <p className="text-[10px] text-gray-400 text-left mt-1">{comment.length}/500</p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
            >
              <Send size={16} />
              {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>

            {/* WhatsApp direct contact */}
            <a
              href="https://wa.me/966559881516"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-green-400 text-green-600 font-bold text-sm active:scale-[0.98] transition-transform"
            >
              <MessageCircle size={16} />
              تواصل معنا مباشرة عبر واتساب
            </a>

            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
