import React, { useRef, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, Loader2, CheckCircle, Home } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface VisualAddressProps {
  onDescriptionGenerated: (description: string) => void;
}

export const VisualAddress: React.FC<VisualAddressProps> = ({ onDescriptionGenerated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Need to extract just the base64 string without the prefix
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const base64Image = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const prompt = `أنت مساعد توصيل ذكي في وادي الدواسر (منطقة ريفية سعودية تعتمد على الوصف البصري بدلاً من أسماء الشوارع). 
      صف هذا المنزل ومعالمه البارزة (لون الباب، شكل السور، أشجار مميزة، إلخ) في جملة واحدة سريعة ومختصرة جداً لمساعدة مندوب التوصيل في التعرف على المنزل فور الوصول للموقع. مثال: "منزل أبيض بباب حديدي أخضر، بجانبه نخلة."`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: file.type
            }
          }
        ]
      });

      const resultText = response.text || "منزل العميل (تم إرفاق الصورة)";
      setDescription(resultText);
      onDescriptionGenerated(resultText);
      setSuccess(true);

    } catch (error) {
      console.error("AI Error:", error);
      // Fallback
      setDescription("تم حفظ صورة المنزل لتسهيل الوصول.");
      onDescriptionGenerated("تم حفظ صورة المنزل لتسهيل الوصول.");
      setSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Home size={20} className="text-indigo-600" />
        </div>
        <div>
           <h3 className="font-bold text-gray-800 text-sm">العنوان البصري الذكي (ميزة حصرية)</h3>
           <p className="text-xs text-gray-400 mt-1">
             في وادي الدواسر قد لا يتطابق الموقع بدقة. التقط صورة سريعة لواجهة المنزل، وسيقوم الذكاء الاصطناعي بوصفها للمندوب لضمان الوصول "بدون اتصال".
           </p>
        </div>
      </div>

      {!success && !isProcessing && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full mt-2 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <Camera size={18} />
          التقط صورة للباب أو المنزل
        </button>
      )}

      {isProcessing && (
        <div className="w-full mt-2 py-4 bg-indigo-50 rounded-xl text-sm font-medium text-indigo-600 flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          جاري استخراج الوصف الدقيق للمندوب...
        </div>
      )}

      {success && description && (
        <div className="w-full mt-2 p-3 bg-green-50 rounded-xl border border-green-100 flex items-start gap-2 text-sm text-green-800">
          <CheckCircle size={18} className="text-green-600 mt-0.5 shrink-0" />
          <div>
              <span className="font-bold block">تم تحليل الموقع:</span>
              <span className="opacity-90">{description}</span>
          </div>
        </div>
      )}

      {/* Hidden file input for camera/gallery */}
      <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef} 
          onChange={handleImageCapture}
          className="hidden" 
      />
    </div>
  );
};
