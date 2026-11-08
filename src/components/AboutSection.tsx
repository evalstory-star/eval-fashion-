import React from 'react';
import { StoreSettings } from '../types/store';
import { Sparkles, MessageCircle, Instagram, Facebook, ShieldCheck, HeartHandshake } from 'lucide-react';

interface AboutSectionProps {
  settings: StoreSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Story Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>فلسفة إيفال في الأزياء</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif leading-tight">
              أناقة محتشمة صُنعت لتمنحكِ الراحة والتميز
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {settings.aboutText}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <p className="text-xs sm:text-sm text-stone-700">
                  <strong>خامات مستوردة ناعمة:</strong> اختيار دقيق لأقمشة الكريب والساتان الإيطالي والكتان الخالص المقاوم للانكماش والحرارة.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <p className="text-xs sm:text-sm text-stone-700">
                  <strong>تفصيل وخياطة متقنة:</strong> تقفيل داخلي ناعم وتشطيب يدوي دقيق لكل درزة وتطريز ليضمن بقاء القطعة لسنوات.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <p className="text-xs sm:text-sm text-stone-700">
                  <strong>دعم وخدمة ما بعد البيع:</strong> إمكانية معاينة القطعة والاستبدال الفوري في حال الرغبة في تعديل المقاس.
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Connect Box */}
          <div id="contact" className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-md space-y-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">تواصلي معنا مباشرة</h3>
              <p className="text-xs text-stone-500">
                {settings.contactText}
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-950 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">محادثة واتساب مباشرة</h4>
                    <p className="text-xs text-emerald-800 tabular-nums font-semibold mt-0.5">
                      +{settings.whatsapp}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800">متاح الآن ←</span>
              </a>

              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">حساب إنستغرام</h4>
                    <p className="text-xs text-stone-500 mt-0.5">@eval_store_fashion</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-600">متابعة ←</span>
              </a>

              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">صفحة فيسبوك الرسمية</h4>
                    <p className="text-xs text-stone-500 mt-0.5">EVAL Fashion Egypt</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-600">زيارة ←</span>
              </a>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-800" />
                <span>شحن وتوصيل لجميع محافظات جمهورية مصر العربية</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
