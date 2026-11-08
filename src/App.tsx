import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AIStylistModal } from './components/AIStylistModal';
import { SecurityCenterModal } from './components/SecurityCenterModal';
import { AdminModal } from './components/AdminModal';
import { ReviewsSection } from './components/ReviewsSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

import {
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  STORE_CATEGORIES,
} from './data/initialData';
import { Product, CartItem, StoreSettings, Review } from './types/store';
import { ShieldAlert, Sparkles, X, Check, ArrowUpDown } from 'lucide-react';

export default function App() {
  // Store States with LocalStorage Persistence
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('eval_store_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('eval_store_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eval_store_categories');
      return saved ? JSON.parse(saved) : (settings.categories || ['عبايات', 'طرح', 'فساتين', 'ملابس كاجوال']);
    } catch {
      return ['عبايات', 'طرح', 'فساتين', 'ملابس كاجوال'];
    }
  });

  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('eval_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eval_store_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('eval_store_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('eval_store_categories', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('eval_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityInitialTab, setSecurityInitialTab] = useState<'issues' | 'sql' | 'xss-test' | 'export'>('issues');
  const [stylistModalOpen, setStylistModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [stylistInitialQuery, setStylistInitialQuery] = useState('');

  // UI States
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('products');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    size: string,
    color: string,
    quantity: number = 1
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id && item.size === size && item.color === color
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [
        ...prev,
        {
          id: `${product.id}-${size}-${color}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          size,
          color,
          quantity,
          imageUrl: product.imageUrl,
        },
      ];
    });
    showToast(`تمت إضافة "${product.name}" إلى حقيبة التسوق`);
  };

  const handleQuickAdd = (product: Product) => {
    handleAddToCart(
      product,
      product.sizes[0] || 'Free Size',
      product.colors[0] || 'افتراضي',
      1
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('تم حذف المنتج من الحقيبة');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('تم إفراغ حقيبة التسوق');
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`تمت إزالة "${product.name}" من قائمة الأمنيات`);
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`تم حفظ "${product.name}" في قائمة الأمنيات ❤️`);
        return [...prev, product];
      }
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    showToast('تمت إزالة القطعة من قائمة الأمنيات');
  };

  const handleMoveWishlistToCart = (product: Product) => {
    handleQuickAdd(product);
  };

  const handleAddAllWishlistToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((prod) => {
      handleQuickAdd(prod);
    });
    showToast(`تمت إضافة جميع قطع قائمة الأمنيات (${wishlist.length}) إلى حقيبة التسوق`);
  };

  const handleClearWishlist = () => {
    setWishlist([]);
    showToast('تم إفراغ قائمة الأمنيات');
  };

  // Navigation smoothly scrolls to anchor
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isAvailable);

    if (selectedCategory !== 'الكل') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, sortBy]);

  // Admin Actions
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [created, ...prev]);
    showToast('تمت إضافة المنتج الجديد بنجاح');
  };

  const handleToggleProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
    showToast('تم تحديث حالة المنتج');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('هل أنتِ متأكدة من حذف هذا المنتج نهائياً؟')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('تم حذف المنتج');
    }
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    if (selectedProduct && selectedProduct.id === updatedProd.id) {
      setSelectedProduct(updatedProd);
    }
    showToast('تم حفظ تعديلات المنتج والسعر والخصم بنجاح');
  };

  const handleAddCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed) || trimmed === 'الكل') {
      showToast('هذا القسم موجود بالفعل');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    showToast(`تمت إضافة قسم "${trimmed}" بنجاح`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      showToast('يجب الإبقاء على قسم واحد على الأقل في المتجر');
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== catToDelete));
    if (selectedCategory === catToDelete) {
      setSelectedCategory('الكل');
    }
    showToast(`تم حذف قسم "${catToDelete}"`);
  };

  const handleAddReview = (newReview: Omit<Review, 'id' | 'createdAt'>) => {
    const rev: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      createdAt: 'الآن',
    };
    setReviews((prev) => [rev, ...prev]);
    showToast('تم إضافة تقييمك بنجاح وشكراً لثقتكِ في إيفال');
  };

  const handleConsultStylistForProduct = (productName: string) => {
    setSelectedProduct(null);
    setStylistInitialQuery(`أود استشارة بخصوص قطعة: ${productName}`);
    setStylistModalOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between selection:bg-emerald-900 selection:text-white">
      {/* Dynamic Announcement Bar */}
      {announcementVisible && settings.announcement && settings.showAnnouncement !== false && (
        <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 flex items-center justify-between border-b border-stone-800">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-1">
            <span className="font-medium text-balance">{settings.announcement}</span>
          </div>

          <button
            onClick={() => setAnnouncementVisible(false)}
            className="text-stone-400 hover:text-white p-1 cursor-pointer"
            aria-label="إغلاق الإعلان"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        settings={settings}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenStylist={() => {
          setStylistInitialQuery('');
          setStylistModalOpen(true);
        }}
        onOpenAdmin={() => setAdminModalOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner Section */}
        <Hero
          settings={settings}
          onExploreProducts={() => handleNavigate('products')}
          onOpenStylist={() => {
            setStylistInitialQuery('');
            setStylistModalOpen(true);
          }}
        />

        {/* Products Section */}
        <section id="products" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header and Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
                التشكيلة الحصرية
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                قطع صُممت بأقمشة عالية الجودة ومقاسات تناسب جميع الأذواق.
              </p>
            </div>

            {/* Category Segmented Controls & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl overflow-x-auto">
                {['الكل', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="newest">الأحدث وصولاً</option>
                  <option value="price-asc">السعر: من الأقل</option>
                  <option value="price-desc">السعر: من الأعلى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 space-y-3">
              <p className="text-sm font-bold text-stone-700">لا توجد منتجات في هذا القسم حالياً.</p>
              <button
                onClick={() => setSelectedCategory('الكل')}
                className="text-xs font-bold text-emerald-800 underline cursor-pointer"
              >
                عرض جميع المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                  onQuickAdd={handleQuickAdd}
                  isWishlisted={wishlist.some((item) => item.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}

          {/* Ask AI Stylist Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مستشار الأزياء الذكي (Gemini)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-serif">
                محتارة في اختيار وتنسيق القطع والمقاسات؟
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                اطرحي أي سؤال على مستشار إيفال الذكي للحصول على نصائح تنسيق مخصصة حسب مناسبتك وطبيعة القطعة.
              </p>
            </div>

            <button
              onClick={() => {
                setStylistInitialQuery('');
                setStylistModalOpen(true);
              }}
              className="px-6 py-3 bg-white text-stone-900 rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-100 transition-all shadow-md shrink-0 cursor-pointer"
            >
              بدء الاستشارة الفورية
            </button>
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection reviews={reviews} onAddReview={handleAddReview} />

        {/* About & Contact Section */}
        <AboutSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenStylist={() => {
          setStylistInitialQuery('');
          setStylistModalOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onConsultStylist={handleConsultStylistForProduct}
        whatsappNumber={settings.whatsapp}
        isWishlisted={selectedProduct ? wishlist.some((item) => item.id === selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onMoveToCart={handleMoveWishlistToCart}
        onAddAllToCart={handleAddAllWishlistToCart}
        onClearWishlist={handleClearWishlist}
      />

      {/* Security & Hardening Center Modal */}
      <SecurityCenterModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        initialTab={securityInitialTab}
      />

      {/* Gemini AI Stylist Modal */}
      <AIStylistModal
        isOpen={stylistModalOpen}
        onClose={() => setStylistModalOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setStylistModalOpen(false);
          setSelectedProduct(p);
        }}
        initialQuery={stylistInitialQuery}
      />

      {/* Secure Admin Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onToggleProduct={handleToggleProduct}
        onDeleteProduct={handleDeleteProduct}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('تم حفظ التعديلات وإعدادات المتجر بنجاح');
        }}
        onOpenSecurity={() => {
          setAdminModalOpen(false);
          setSecurityInitialTab('issues');
          setSecurityModalOpen(true);
        }}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-300 border border-stone-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
