import React from 'react';
import { ShoppingBag, Sparkles, Menu, X, Heart } from 'lucide-react';
import { StoreSettings } from '../types/store';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenStylist: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onOpenStylist,
  activeSection,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleBrandClick = () => {
    onNavigate('products');
  };

  const navLinks = [
    { id: 'products', label: 'المنتجات' },
    { id: 'about', label: 'عن إيفال' },
    { id: 'reviews', label: 'آراء العملاء' },
    { id: 'contact', label: 'تواصل معنا' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark / Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleBrandClick}
              className="text-right group flex items-center gap-3 cursor-pointer focus:outline-none select-none"
              title="EVAL Fashion | راحة تليق بك"
            >
              {settings.logoUrl ? (
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#C6A15B]/40 shadow-xs bg-[#34452D] shrink-0 flex items-center justify-center p-0.5">
                  <img
                    src={settings.logoUrl}
                    alt={settings.logoText || 'EVAL'}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : null}

              <div className="flex flex-col text-right">
                <span className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-[#34452D] font-serif uppercase">
                  {settings.logoText || 'EVAL'}
                </span>
                <span className="text-[10px] tracking-wider text-[#C6A15B] font-bold">
                  {settings.logoSubtitle || 'راحة تليق بك'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`whitespace-nowrap transition-colors hover:text-stone-900 cursor-pointer ${
                  activeSection === link.id
                    ? 'text-stone-900 font-bold border-b-2 border-emerald-900 pb-0.5'
                    : ''
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={onOpenStylist}
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-emerald-900 transition-colors whitespace-nowrap cursor-pointer text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>مستشار الأزياء الذكي</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 transition-all rounded-xl border border-stone-200/60 cursor-pointer"
              title="قائمة الأمنيات"
              aria-label="قائمة الأمنيات"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag */}
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>حقيبة التسوق</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 lg:hidden rounded-lg hover:bg-stone-200/60 cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className="text-right py-2 px-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => {
                onOpenWishlist();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between py-2 px-3 text-sm font-semibold text-rose-700 bg-rose-50/60 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                <span>قائمة الأمنيات</span>
              </div>
              {wishlistCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenStylist();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-right py-2 px-3 text-sm font-semibold text-amber-800 bg-amber-50/60 rounded-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>مستشار الأزياء الذكي (Gemini)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
