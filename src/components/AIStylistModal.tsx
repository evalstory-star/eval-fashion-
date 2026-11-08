import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw, ShoppingBag } from 'lucide-react';
import { Product } from '../types/store';

interface AIStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  initialQuery?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIStylistModal: React.FC<AIStylistModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  initialQuery,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialQuery
        ? `أهلاً بكِ في إيفال! يسعدني جداً مساعدتكِ في استفسارك عن "${initialQuery}". هل تودين معرفة خامة القطعة، المقاس الأنسب، أو كيفية تنسيقها مع باقي التشكيلة؟`
        : 'أهلاً بكِ في إيفال! أنا مستشاركِ الذكي للأزياء والعبايات. كيف يمكنني مساعدتك اليوم في اختيار إطلالتك وتنسيق الخامات والألوان؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'ما هي أفضل عباية تناسب مناسبة رسمية مسائية؟',
    'كيف أنسق الطرحة الحريرية مع الفستان الزمردي؟',
    'ما طريقة العناية والغسيل المناسبة لأقمشة الكريب الملكي؟',
    'ساعدني في اختيار المقاس المناسب لعباية إيفال.',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال بمستشار الأزياء');
      }

      const data = await response.json();
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.text || 'يسعدني تقديم أي استشارة تخص تشكيلة إيفال للأزياء والعبايات في مصر.',
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            'أنصحكِ باختيار أقمشة الكريب الملكي والحرير الساتان للإطلالات الراقية، وتنسيقها مع درجات الشامبين والبيج. يسعدنا أيضاً خدمتكم مباشرة عبر الواتساب لاختيار المقاس بالظبط.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full h-[600px] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">مستشار إيفال للأزياء (Gemini AI)</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  متصل
                </span>
              </div>
              <p className="text-xs text-stone-300">استشارات فورية في تنسيق الإطلالات، المقاسات، وخامات الأقمشة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white'
                    : 'bg-emerald-900 text-amber-300 shadow-sm'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white rounded-tr-none'
                    : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-stone-200/80 rounded-2xl p-3.5 text-xs text-stone-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-800" />
                <span>جاري استحضار النصيحة وتنسيق القطع...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 flex gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-white hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold whitespace-nowrap border border-stone-200 transition-colors shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتبي سؤالك عن التنسيق، الخامات، أو المقاسات..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
              aria-label="إرسال"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
