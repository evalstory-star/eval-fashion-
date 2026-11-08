import React from 'react';
import { ShoppingBag, Sparkles, Lock, Menu, X, Heart } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenSecurity?: () => void;
  onOpenStylist: () => void;
  onOpenAdmin: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onOpenStylist,
  onOpenAdmin,
  activeSection,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('products')}
              className="text-left group flex items-baseline gap-2 cursor-pointer focus:outline-none"
            >
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest text-stone-900 font-serif">
                EVAL
              </span>
              <span className="text-xs tracking-wider text-emerald-800 font-bold hidden sm:inline-block">
                أناقة وأصالة
              </span>
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

            <button
              onClick={onOpenAdmin}
              title="لوحة الإدارة الآمنة"
              className="p-2 text-stone-500 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-200/50 cursor-pointer"
              aria-label="لوحة الإدارة"
            >
              <Lock className="w-4 h-4" />
            </button>

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

            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-right py-2 px-3 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <Lock className="w-4 h-4" />
              <span>لوحة الإدارة المشفرة</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
