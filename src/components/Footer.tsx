import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types/store';

interface FooterProps {
  settings: StoreSettings;
  onOpenStylist: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenStylist }) => {
  return (
    <footer className="bg-[#1E281A] text-stone-300 py-12 border-t border-[#34452D]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#34452D]/80">
          <div className="flex items-center gap-3.5 text-center md:text-right">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#C6A15B]/30 bg-[#34452D] shrink-0 p-1">
              <img
                src="./assets/brand/eval_app_icon_dark.png"
                alt="EVAL"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl font-black tracking-[0.2em] text-[#F5F0E5] font-serif block">
                {settings.logoText || 'EVAL'}
              </span>
              <p className="text-xs text-[#C6A15B] font-bold">
                {settings.logoSubtitle || 'راحة تليق بك'} · COMFORT THAT SUITS YOU
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-300">
            <button
              onClick={onOpenStylist}
              className="hover:text-[#C6A15B] transition-colors cursor-pointer"
            >
              مستشار الأزياء (Gemini)
            </button>

            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C6A15B] transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#C6A15B]" />
              <span>واتساب: +{settings.whatsapp}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="select-none">
            © {new Date().getFullYear()} EVAL Fashion. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>راحة تليق بكِ</span>
            <span>·</span>
            <span>أزياء راقية وعبايات</span>
            <span>·</span>
            <span>القاهرة، مصر</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
