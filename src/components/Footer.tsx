import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types/store';

interface FooterProps {
  settings: StoreSettings;
  onOpenStylist: () => void;
  onOpenSecurity?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenStylist }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div className="space-y-1 text-center md:text-right">
            <span className="text-2xl font-black tracking-widest text-white font-serif">
              EVAL
            </span>
            <p className="text-xs text-stone-400">
              أناقة وأصالة بلا حدود · راحة تليق بكِ · السوق المصري
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
            <button
              onClick={onOpenStylist}
              className="hover:text-white transition-colors cursor-pointer"
            >
              مستشار الأزياء (Gemini)
            </button>

            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>واتساب: +{settings.whatsapp}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} EVAL Fashion. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>تصميم آمن ومحمي ضد الثغرات البرمجية</span>
            <span>·</span>
            <span>القاهرة، مصر</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
