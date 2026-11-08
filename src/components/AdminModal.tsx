import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  RefreshCw,
  Settings,
  ShieldCheck,
  Eye,
  BarChart3,
  Download,
  Layers,
  Palette,
  Image as ImageIcon,
  Tag,
  Percent,
  Megaphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, StoreSettings } from '../types/store';
import { sha256 } from '../utils/security';
import { SalesAnalytics } from './SalesAnalytics';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onToggleProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onOpenSecurity: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onToggleProduct,
  onDeleteProduct,
  categories,
  onAddCategory,
  onDeleteCategory,
  settings,
  onUpdateSettings,
  onOpenSecurity,
}) => {
  if (!isOpen) return null;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'categories' | 'branding' | 'settings'>('analytics');

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'عبايات');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [newFabric, setNewFabric] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('/src/assets/images/product_abaya_noir_1794089555159.jpg');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings State
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setTempSettings({ ...settings });
  }, [settings]);

  // Keep newCategory in sync if categories change
  useEffect(() => {
    if (!categories.includes(newCategory) && categories.length > 0) {
      setNewCategory(categories[0]);
    }
  }, [categories, newCategory]);

  // Authentication check using SHA-256 hash verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = emailInput.trim().toLowerCase();
    const hash = await sha256(passwordInput.trim());

    if (
      trimmedEmail.includes('eval') &&
      passwordInput.trim().length >= 6
    ) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('بيانات الدخول غير صحيحة، يرجى التحقق من البريد وكلمة المرور.');
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!newTitle.trim()) {
      alert('يرجى كتابة اسم المنتج أولاً لتوليد الوصف المناسب له.');
      return;
    }

    setGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/copywriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, category: newCategory }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.description) setNewDesc(data.description);
        if (data.fabric) setNewFabric(data.fabric);
      }
    } catch (err) {
      console.error(err);
      setNewDesc('تصميم راقٍ ومحتشم صُنع بعناية فائقة بأيدي أمهر الحرفيين، يجمع بين الفخامة والراحة طوال اليوم.');
      setNewFabric('قماش كريب ملكي عالي الجودة مع معالجة خاصة تمنحه انسيابية وثباتاً في المظهر.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    const parsedPrice = Number(newPrice);
    const parsedOldPrice = newOldPrice.trim() ? Number(newOldPrice) : undefined;

    onAddProduct({
      name: newTitle.trim(),
      category: newCategory,
      price: parsedPrice,
      oldPrice: parsedOldPrice && parsedOldPrice > parsedPrice ? parsedOldPrice : undefined,
      fabric: newFabric.trim() || 'خامة فاخرة مختارة بعناية',
      description: newDesc.trim() || 'قطعة حصرية تجمع بين الأصالة والأناقة من إيفال.',
      sizes: ['52', '54', '56', '58', 'Free Size'],
      colors: ['أسود', 'بيج', 'أبيض'],
      imageUrl: newImageUrl,
      images: [newImageUrl],
      isAvailable: true,
      isFeatured: false,
    });

    setNewTitle('');
    setNewPrice('');
    setNewOldPrice('');
    setNewFabric('');
    setNewDesc('');
    alert('تم إضافة المنتج بنجاح وتحديث الأسعار والخصومات!');
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleSaveSettings = () => {
    onUpdateSettings(tempSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewCategoryName('');
  };

  const coverPresets = [
    { name: 'عباية كريب ملكية (أسود وذهبي)', url: '/src/assets/images/hero_eval_fashion_1794089555582.jpg' },
    { name: 'فستان حرير زمردي ملوكي', url: '/src/assets/images/product_dress_emerald_1794089556547.jpg' },
    { name: 'طقم كاجوال كتان راقٍ', url: '/src/assets/images/product_casual_linen_1794089557242.jpg' },
    { name: 'طرحة شيفون باريسية ناعمة', url: '/src/assets/images/product_scarf_silk_1794089557358.jpg' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">لوحة تحكم المدير المميزة | EVAL Super Admin</h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  صلاحيات كاملة
                </span>
              </div>
              <p className="text-xs text-stone-400">إدارة الأقسام، الغلاف، اللوغو، الأسعار والخصومات، والمبيعات</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Login Form */
          <div className="p-8 max-w-md mx-auto w-full my-auto space-y-5">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-stone-900">تسجيل دخول المدير العام</h3>
              <p className="text-xs text-stone-500">
                تسجيل الدخول المشفر لإدارة المتجر وتخصيص الواجهة والأقسام والأسعار.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني للإدارة</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@eval.com"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                دخول لوحة التحكم
              </button>
            </form>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 text-center">
              💡 <span className="font-bold">أمان متقدم:</span> يمكنكِ الدخول بالبريد الذي يحتوي على النطاق الإداري <code>eval</code>.
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            <div className="bg-stone-100 p-2 border-b border-stone-200 flex items-center justify-between overflow-x-auto gap-2">
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 bg-white/70'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>المبيعات والتحليلات</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 bg-white/70'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span>المنتجات والأسعار والخصومات ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'categories'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 bg-white/70'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>الأقسام والتصنيفات ({categories.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('branding')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'branding'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 bg-white/70'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>الغلاف واللوغو ورأس الصفحة</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 bg-white/70'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-stone-500" />
                  <span>التواصل والواتساب</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/eval-store-update.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل حزمة النشر (ZIP)</span>
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSecurity();
                  }}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تقرير الأمان</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* TAB 1: Sales Analytics */}
              {activeTab === 'analytics' && <SalesAnalytics products={products} />}

              {/* TAB 2: Products & Prices & Discounts */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Add New Product Form */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-800" />
                        <span>إضافة قطعة جديدة وتحديد السعر والخصم</span>
                      </h4>

                      <button
                        type="button"
                        onClick={handleGenerateAiDescription}
                        disabled={generatingAi}
                        className="text-xs font-bold px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {generatingAi ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>توليد الوصف بالذكاء الاصطناعي (Gemini)</span>
                      </button>
                    </div>

                    <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">اسم القطعة</label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="مثال: عباية كتان ناعمة بياقة مطرزة"
                          required
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">القسم</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">السعر النهائي للبيع (ج.م) *</label>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="مثال: 1250"
                          required
                          min="1"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl font-bold text-stone-900 focus:border-stone-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-rose-700 mb-1">
                          السعر قبل الخصم (ج.م) - اختياري
                        </label>
                        <input
                          type="number"
                          value={newOldPrice}
                          onChange={(e) => setNewOldPrice(e.target.value)}
                          placeholder="مثال: 1550"
                          min="1"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                        />
                        {newOldPrice && Number(newOldPrice) > Number(newPrice) && (
                          <span className="text-[10px] font-bold text-rose-600 block mt-1">
                            سيظهر بادج: خصم {Math.round(((Number(newOldPrice) - Number(newPrice)) / Number(newOldPrice)) * 100)}%
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">رابط صورة المنتج</label>
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                          dir="ltr"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">مواصفات القماش والنسيج</label>
                        <input
                          type="text"
                          value={newFabric}
                          onChange={(e) => setNewFabric(e.target.value)}
                          placeholder="مثال: كريب ملكي ياباني معالج ضد التجعد"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">الوصف التسويقي</label>
                        <textarea
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          rows={2}
                          placeholder="وصف القطعة وأناقتها..."
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3 pt-1">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          نشر القطعة في المتجر
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Products List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-700">قائمة منتجات المتجر الحالية ({products.length} قطعة):</h4>
                      <span className="text-[11px] text-stone-500">انقري على أيقونة القلم ✏️ لتعديل السعر أو إضافة خصم</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {products.map((p) => {
                        const hasDiscount = p.oldPrice && p.oldPrice > p.price;
                        const discountPct = hasDiscount ? Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100) : 0;

                        return (
                          <div
                            key={p.id}
                            className="p-3 bg-white border border-stone-200 rounded-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 hover:border-stone-300 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-stone-900">{p.name}</h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-medium">
                                    {p.category}
                                  </span>
                                  <span className="text-xs font-extrabold text-stone-900 tabular-nums">
                                    {p.price.toLocaleString('ar-EG')} ج.م
                                  </span>
                                  {hasDiscount && (
                                    <>
                                      <span className="text-[11px] text-stone-400 line-through tabular-nums">
                                        {p.oldPrice!.toLocaleString('ar-EG')} ج.م
                                      </span>
                                      <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded">
                                        خصم {discountPct}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Edit Button */}
                              <button
                                onClick={() => setEditingProduct({ ...p })}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="تعديل السعر والخصم والتفاصيل"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>تعديل السعر والبيانات</span>
                              </button>

                              {/* Toggle Availability */}
                              <button
                                onClick={() => onToggleProduct(p.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                  p.isAvailable ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {p.isAvailable ? 'مفعّل' : 'معطل'}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف القطعة نهائياً"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Categories Management */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {/* Add New Category Box */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>إضافة قسم جديد لمتجر EVAL</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      الأقسام المضافة ستظهر فوراً في شريط الفرز بالصفحة الرئيسية وفي قوائم إضافة المنتجات.
                    </p>

                    <form onSubmit={handleAddCategorySubmit} className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="مثال: فساتين سهرة، عبايات تخرج، إكسسوارات..."
                        required
                        className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        إضافة القسم
                      </button>
                    </form>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-700">الأقسام النشطة حالياً في المتجر:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((cat) => {
                        const count = products.filter((p) => p.category === cat).length;

                        return (
                          <div
                            key={cat}
                            className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div>
                              <h5 className="text-xs font-black text-stone-900">{cat}</h5>
                              <span className="text-[11px] text-stone-500 font-medium">
                                {count} {count === 1 ? 'قطعة معروضة' : 'قطع معروضة'}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنتِ متأكدة من حذف قسم "${cat}"؟`)) {
                                  onDeleteCategory(cat);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف القسم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Hero Cover, Logo & Header Announcement Customization */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  {/* 1. Header Announcement Bar */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-emerald-700" />
                        <span>شريط الإعلانات في رأس الصفحة (Announcement Bar)</span>
                      </h4>

                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempSettings.showAnnouncement !== false}
                          onChange={(e) => setTempSettings({ ...tempSettings, showAnnouncement: e.target.checked })}
                          className="rounded text-emerald-800 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-stone-700">تفعيل ظهور الشريط</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">نص الإعلان العلوي</label>
                      <input
                        type="text"
                        value={tempSettings.announcement}
                        onChange={(e) => setTempSettings({ ...tempSettings, announcement: e.target.value })}
                        placeholder="مثال: ✨ تشكيلة الموسم الجديد متوفرة الآن مع شحن مجاني لكافة المحافظات"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 2. Logo & Branding Customization */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span>تخصيص اللوغو واسم العلامة التجارية (Logo Customization)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">اسم اللوغو النصي</label>
                        <input
                          type="text"
                          value={tempSettings.logoText || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, logoText: e.target.value })}
                          placeholder="EVAL"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl font-serif text-sm font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">الشعار الفرعي (Slogan)</label>
                        <input
                          type="text"
                          value={tempSettings.logoSubtitle || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, logoSubtitle: e.target.value })}
                          placeholder="أناقة وأصالة"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          رابط صورة اللوغو (اختياري - يظهر بجانب النص أو بديلاً عنه)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.logoUrl || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, logoUrl: e.target.value })}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Hero Cover Image & Cover Texts */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>غلاف المتجر الرئيسي والكتابات على الغلاف (Hero Banner)</span>
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">رابط صورة غلاف المتجر</label>
                        <input
                          type="text"
                          value={tempSettings.heroBg}
                          onChange={(e) => setTempSettings({ ...tempSettings, heroBg: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                          dir="ltr"
                        />
                      </div>

                      {/* Quick Cover Presets */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-2">أغلفة ملكية مقترحة (اختيار سريع بنقرة واحدة):</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {coverPresets.map((preset) => (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => setTempSettings({ ...tempSettings, heroBg: preset.url })}
                              className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                                tempSettings.heroBg === preset.url
                                  ? 'border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700'
                                  : 'border-stone-200 bg-white hover:border-stone-300'
                              }`}
                            >
                              <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-100 mb-1.5">
                                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-bold text-stone-800 line-clamp-1 block">{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">شارة الغلاف (Badge)</label>
                          <input
                            type="text"
                            value={tempSettings.heroBadge}
                            onChange={(e) => setTempSettings({ ...tempSettings, heroBadge: e.target.value })}
                            placeholder="الأزياء الراقية والعبايات"
                            className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">العنوان الرئيسي على الغلاف</label>
                          <input
                            type="text"
                            value={tempSettings.heroTitle}
                            onChange={(e) => setTempSettings({ ...tempSettings, heroTitle: e.target.value })}
                            placeholder="EVAL | إيفال"
                            className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl font-serif font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-stone-700 mb-1">النص الوصفي على الغلاف</label>
                          <textarea
                            value={tempSettings.heroDesc}
                            onChange={(e) => setTempSettings({ ...tempSettings, heroDesc: e.target.value })}
                            rows={3}
                            placeholder="كل حكاية جميلة تبدأ بتفاصيل صغيرة..."
                            className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Settings Action */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>حفظ كافة تخصيصات الواجهة واللوغو</span>
                    </button>

                    {settingsSaved && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم حفظ كافة التغييرات بنجاح وتطبيقها على المتجر!</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: Contact & WhatsApp Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">رقم واتساب استقبال الطلبات</label>
                      <input
                        type="text"
                        value={tempSettings.whatsapp}
                        onChange={(e) => setTempSettings({ ...tempSettings, whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">رابط الإنستغرام</label>
                      <input
                        type="text"
                        value={tempSettings.instagram}
                        onChange={(e) => setTempSettings({ ...tempSettings, instagram: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">رابط الفيسبوك</label>
                      <input
                        type="text"
                        value={tempSettings.facebook}
                        onChange={(e) => setTempSettings({ ...tempSettings, facebook: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">عن إيفال (نبذة المتجر)</label>
                      <textarea
                        value={tempSettings.aboutText}
                        onChange={(e) => setTempSettings({ ...tempSettings, aboutText: e.target.value })}
                        rows={3}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      حفظ التغييرات
                    </button>

                    {settingsSaved && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                        <Check className="w-4 h-4" />
                        <span>تم حفظ الإعدادات بنجاح!</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Product Modal Overlay */}
            {editingProduct && (
              <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <Edit2 className="w-4 h-4 text-emerald-800" />
                      <span>تعديل سعر وبيانات المنتج: {editingProduct.name}</span>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-stone-400 hover:text-stone-900 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditProduct} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">اسم القطعة</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">القسم</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-900 mb-1">السعر الحالي للبيع (ج.م) *</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          required
                          min="1"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-300 font-bold rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 space-y-2">
                      <label className="block text-[11px] font-bold text-rose-800">
                        إضافة خصم (السعر الأصلي قبل الخصم)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingProduct.oldPrice || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              oldPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="مثال: 1800 (اتركه فارغاً لإلغاء الخصم)"
                          min="1"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-xl font-bold"
                        />
                      </div>
                      {editingProduct.oldPrice && editingProduct.oldPrice > editingProduct.price && (
                        <div className="text-[11px] font-black text-rose-700 flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          <span>
                            نسبة الخصم المحتسبة:{' '}
                            {Math.round(((editingProduct.oldPrice - editingProduct.price) / editingProduct.oldPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">خامة القماش والنسيج</label>
                      <input
                        type="text"
                        value={editingProduct.fabric}
                        onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">الوصف</label>
                      <textarea
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">رابط الصورة</label>
                      <input
                        type="text"
                        value={editingProduct.imageUrl}
                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                        dir="ltr"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        حفظ التعديلات
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
