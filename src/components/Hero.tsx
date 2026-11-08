import React from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types/store';

interface HeroProps {
  settings: StoreSettings;
  onExploreProducts: () => void;
  onOpenStylist: () => void;
  onOpenSecurity?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreProducts,
  onOpenStylist,
}) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Card Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200/80 bg-stone-900 text-white min-h-[460px] sm:min-h-[520px] flex flex-col justify-end">
          {/* Background Image with Contrast Scrim */}
          <div className="absolute inset-0 z-0">
            <img
              src={settings.heroBg}
              alt="EVAL Fashion Campaign"
              className="w-full h-full object-cover object-center opacity-85"
              referrerPolicy="no-referrer"
            />
            {/* Measured contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-transparent hidden md:block" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold text-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{settings.heroBadge || 'تشكيلة الموسم الجديد 2026'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-serif leading-tight">
              {settings.heroTitle || 'EVAL | إيفال'}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-stone-300 font-normal leading-relaxed max-w-2xl text-balance">
              {settings.heroDesc ||
                'نحضّر لكم عالماً يجمع بين الأناقة، الاحتشام والراحة، حيث لكل تفصيلة معنى ولكل قطعة حكاية تليق بكِ.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={onExploreProducts}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-stone-900 rounded-xl text-sm font-bold hover:bg-stone-100 transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <span>تصفحي المجموعة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenStylist}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-900/80 hover:bg-stone-800 text-stone-200 rounded-xl text-sm font-semibold border border-stone-700/80 backdrop-blur-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>استشيري الذكاء الاصطناعي</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Pillar Brand Quality Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">خامات ملكية مختارة</h3>
              <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                أقمشة كريب ياباني وحرير وكتان طبيعي باردة وانسيابية لا تنكمش.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">طلب فوري وتأكيد عبر واتساب</h3>
              <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                سلة مشتريات تجهز تفاصيل طلبك بالمقاس واللون وترسلها للواتساب فوراً.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">تسوق آمن وشحن سريع</h3>
              <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                خصوصية تامة وتغليف فاخر مع شحن وتوصيل لجميع محافظات مصر.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
