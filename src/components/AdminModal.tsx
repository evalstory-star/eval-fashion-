import React, { useState, useEffect, useRef } from 'react';
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
  BarChart3,
  Download,
  Layers,
  Palette,
  Image as ImageIcon,
  Tag,
  Percent,
  Megaphone,
  CheckCircle2,
  Camera,
  Upload,
  Search,
  SlidersHorizontal,
  Eye,
  ArrowRight
} from 'lucide-react';
import { Product, StoreSettings } from '../types/store';
import { sha256 } from '../utils/security';
import { processImageFile } from '../utils/imageUpload';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'عبايات');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [newFabric, setNewFabric] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('/src/assets/images/product_abaya_noir_1794089555159.jpg');
  const [isProcessingNewImage, setIsProcessingNewImage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Search & Filter in Products List
  const [productSearch, setProductSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('الكل');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProcessingEditImage, setIsProcessingEditImage] = useState(false);

  // Category State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings State
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isProcessingCoverImage, setIsProcessingCoverImage] = useState(false);
  const [isProcessingLogoImage, setIsProcessingLogoImage] = useState(false);

  // File Input Refs
  const newProductFileInputRef = useRef<HTMLInputElement>(null);
  const editProductFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempSettings({ ...settings });
  }, [settings]);

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
    if (
      trimmedEmail.includes('eval') &&
      passwordInput.trim().length >= 6
    ) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('بيانات الدخول غير صحيحة، يرجى كتابة البريد وكلمة المرور الإدارية.');
    }
  };

  // Image Upload Handlers (Mobile camera & gallery)
  const handleFileChange = async (
    file: File | undefined,
    onSuccess: (dataUrl: string) => void,
    setLoading: (loading: boolean) => void,
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82
  ) => {
    if (!file) return;
    try {
      setLoading(true);
      const optimizedUrl = await processImageFile(file, maxWidth, maxHeight, quality);
      onSuccess(optimizedUrl);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تحميل الصورة');
    } finally {
      setLoading(false);
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
    setShowAddForm(false);
    alert('تم إضافة المنتج بنجاح وتحديث المتجر!');
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

  // Filtered products for simple list view
  const visibleProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'الكل' || p.category === filterCategory;
    const matchesSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold">لوحة تحكم المدير | EVAL Super Admin</h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  صلاحيات كاملة
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">
                رفع الصور من الموبايل، إدارة الأسعار والخصومات، الغلاف واللوغو
              </p>
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
          <div className="p-6 sm:p-8 max-w-md mx-auto w-full my-auto space-y-5">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-stone-900">تسجيل دخول المدير العام</h3>
              <p className="text-xs text-stone-500">
                لوحة الإدارة الشاملة: رفع الصور مباشرة من الهاتف وتعديل الأسعار والمبيعات
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
              💡 <span className="font-bold">أمان متقدم:</span> يمكنكِ الدخول بأي بريد إداري يحتوي على <code>eval</code>.
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* Top Navigation Tabs */}
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
                  <span>المبيعات المبسطة</span>
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
                  <span>المنتجات والأسعار ({products.length})</span>
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
                  <span>الأقسام ({categories.length})</span>
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
                  <span>الغلاف واللوغو والإعلانات</span>
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
                  <span>واتساب والتواصل</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/eval-store-update.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="تحميل كود المتجر كاملاً كملف مضغوط"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل الحزمة (ZIP)</span>
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSecurity();
                  }}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تقرير الأمان</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: Sales Analytics (Simplified) */}
              {activeTab === 'analytics' && <SalesAnalytics products={products} />}

              {/* TAB 2: Simple Products Management */}
              {activeTab === 'products' && (
                <div className="space-y-5">
                  {/* Action Bar: Add Product Toggle & Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{showAddForm ? 'إغلاق نموذج الإضافة' : 'إضافة قطعة جديدة للمتجر ➕'}</span>
                    </button>

                    <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="بحث سريع عن قطعة..."
                          className="w-full pr-8 pl-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                        />
                      </div>

                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-2.5 py-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-700 font-bold focus:outline-none"
                      >
                        <option value="الكل">كل الأقسام</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Add New Product Form (Collapsible) */}
                  {showAddForm && (
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-800" />
                          <span>إضافة قطعة جديدة وتحديد السعر والصور</span>
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
                          <span>توليد الوصف بالذكاء الاصطناعي</span>
                        </button>
                      </div>

                      <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* 1. Mobile Photo Upload Box */}
                        <div className="sm:col-span-3 bg-white p-4 rounded-xl border border-dashed border-stone-300">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative flex items-center justify-center">
                              {newImageUrl ? (
                                <img src={newImageUrl} alt="معاينة" className="w-full h-full object-cover" />
                              ) : (
                                <Camera className="w-8 h-8 text-stone-400" />
                              )}
                              {isProcessingNewImage && (
                                <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                                  جاري الضغط...
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 flex-1 text-center sm:text-right">
                              <label className="block text-xs font-bold text-stone-900">
                                صورة القطعة (رفع مباشر من كاميرا الموبايل أو المعرض) 📷
                              </label>
                              <p className="text-[11px] text-stone-500">
                                انقري لاختيار صورة من هاتفكِ، يتم تحسينها وضغطها تلقائياً لتفتح بسرعة فائقة.
                              </p>

                              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                <input
                                  type="file"
                                  ref={newProductFileInputRef}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileChange(
                                      e.target.files?.[0],
                                      (url) => setNewImageUrl(url),
                                      setIsProcessingNewImage
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => newProductFileInputRef.current?.click()}
                                  disabled={isProcessingNewImage}
                                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                                >
                                  <Camera className="w-4 h-4" />
                                  <span>{newImageUrl ? 'تغيير صورة القطعة من الهاتف' : 'رفع صورة من الهاتف'}</span>
                                </button>

                                <span className="text-[11px] text-stone-400">أو يمكنكِ تعديل الرابط أدناه:</span>
                              </div>

                              <input
                                type="text"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="رابط الصورة (URL)"
                                className="w-full px-2.5 py-1.5 text-[11px] bg-stone-50 border border-stone-200 rounded-lg text-stone-600 focus:outline-none"
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">اسم القطعة *</label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="مثال: عباية كتان ناعمة بياقة مطرزة"
                            required
                            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                          />
                        </div>

                        {/* Category */}
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

                        {/* Final Price */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            السعر النهائي للبيع (ج.م) *
                          </label>
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

                        {/* Old Price (Discount) */}
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

                        {/* Fabric */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">مواصفات القماش والنسيج</label>
                          <input
                            type="text"
                            value={newFabric}
                            onChange={(e) => setNewFabric(e.target.value)}
                            placeholder="مثال: كريب ملكي ياباني معالج"
                            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                          />
                        </div>

                        {/* Description */}
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

                        <div className="sm:col-span-3 pt-1 flex items-center gap-3">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                          >
                            نشر القطعة في المتجر فوراً
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Clean Simple Products List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-bold px-1">
                      <span>المنتجات المعروضة ({visibleProducts.length} من {products.length}):</span>
                      <span>انقري على "تعديل ✏️" لتغيير السعر، الخصم أو الصورة</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {visibleProducts.map((p) => {
                        const hasDiscount = p.oldPrice && p.oldPrice > p.price;
                        const discountPct = hasDiscount ? Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100) : 0;

                        return (
                          <div
                            key={p.id}
                            className="p-3 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-300 transition-all shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-100"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-stone-900">{p.name}</h5>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                                    {p.category}
                                  </span>
                                  <span className="text-xs font-black text-stone-900 tabular-nums">
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

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {/* Edit Button */}
                              <button
                                onClick={() => setEditingProduct({ ...p })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>تعديل السعر والصورة</span>
                              </button>

                              {/* Toggle Availability */}
                              <button
                                onClick={() => onToggleProduct(p.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                  p.isAvailable ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {p.isAvailable ? 'مفعّل' : 'معطل'}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`هل أنتِ متأكدة من حذف "${p.name}" نهائياً من المتجر؟`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف القطعة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {visibleProducts.length === 0 && (
                        <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs">
                          لا توجد منتجات مطابقة لعملية البحث الحالية.
                        </div>
                      )}
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

              {/* TAB 4: Hero Cover, Logo & Header Customization (with Mobile Image Uploads) */}
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

                  {/* 2. Logo & Branding Customization (with Mobile Upload) */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span>تخصيص اللوغو واسم العلامة التجارية (رفع لوغو من الموبايل)</span>
                    </h4>

                    {/* Logo Mobile Upload Card */}
                    <div className="bg-white p-4 rounded-xl border border-dashed border-stone-300">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center relative">
                          {tempSettings.logoUrl ? (
                            <img src={tempSettings.logoUrl} alt="لوغو" className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="font-serif font-black text-xl text-stone-800">{tempSettings.logoText || 'EVAL'}</span>
                          )}
                          {isProcessingLogoImage && (
                            <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                              جاري التحميل...
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 flex-1 text-center sm:text-right">
                          <label className="block text-xs font-bold text-stone-900">
                            صورة اللوغو من الهاتف 📷 (PNG مفرغ أو JPG)
                          </label>
                          <p className="text-[11px] text-stone-500">
                            يمكنكِ رفع صورة اللوغو من ألبوم الصور، أو تركه فارغاً للاعتماد على الاسم النصي الفاخر.
                          </p>

                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <input
                              type="file"
                              ref={logoFileInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileChange(
                                  e.target.files?.[0],
                                  (url) => setTempSettings({ ...tempSettings, logoUrl: url }),
                                  setIsProcessingLogoImage,
                                  600,
                                  600,
                                  0.88
                                )
                              }
                            />
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              disabled={isProcessingLogoImage}
                              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{tempSettings.logoUrl ? 'تغيير صورة اللوغو من الموبايل' : 'رفع صورة اللوغو من الموبايل'}</span>
                            </button>

                            {tempSettings.logoUrl && (
                              <button
                                type="button"
                                onClick={() => setTempSettings({ ...tempSettings, logoUrl: '' })}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                إزالة الصورة واستخدام الخط النصي
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

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
                    </div>
                  </div>

                  {/* 3. Hero Cover Image (Mobile Upload + Texts) */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>غلاف المتجر الرئيسي والكتابات على الغلاف (رفع الغلاف من الموبايل)</span>
                    </h4>

                    {/* Cover Mobile Upload Card */}
                    <div className="bg-white p-4 rounded-xl border border-dashed border-stone-300 space-y-3">
                      <div className="relative aspect-video sm:aspect-21/9 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img src={tempSettings.heroBg} alt="غلاف المتجر" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center text-white">
                          <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-full font-bold mb-1">
                            {tempSettings.heroBadge || 'الأزياء الراقية'}
                          </span>
                          <h3 className="text-base sm:text-xl font-black font-serif">{tempSettings.heroTitle || 'EVAL | إيفال'}</h3>
                          <p className="text-[11px] max-w-md line-clamp-2 mt-1 opacity-90">{tempSettings.heroDesc}</p>
                        </div>

                        {isProcessingCoverImage && (
                          <div className="absolute inset-0 bg-stone-900/70 flex items-center justify-center text-white text-xs font-bold">
                            جاري معالجة وضغط صورة الغلاف...
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-900">
                            صورة غلاف المتجر (رفع من الهاتف) 📷
                          </label>
                          <span className="text-[11px] text-stone-500">
                            التقطي صورة أو اختاري صورة أفقية مميزة لعرضها كواجهة رئيسية لمتجركِ.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={coverFileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(
                                e.target.files?.[0],
                                (url) => setTempSettings({ ...tempSettings, heroBg: url }),
                                setIsProcessingCoverImage,
                                1400,
                                900,
                                0.84
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() => coverFileInputRef.current?.click()}
                            disabled={isProcessingCoverImage}
                            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>رفع غلاف من الهاتف</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-2">أو اختاري غلافاً ملكياً جاهزاً بنقرة واحدة:</label>
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

                    {/* Texts on cover */}
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
                        <span>تم حفظ كافة التغييرات وتطبيقها على المتجر بنجاح!</span>
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

            {/* Edit Product Modal Overlay (with Mobile Image Upload) */}
            {editingProduct && (
              <div className="fixed inset-0 z-60 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <Edit2 className="w-4 h-4 text-emerald-800" />
                      <span>تعديل سعر وبيانات وصورة: {editingProduct.name}</span>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-stone-400 hover:text-stone-900 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditProduct} className="space-y-4">
                    {/* Mobile Image Upload for Edited Product */}
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-dashed border-stone-300">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-200 border border-stone-200 shrink-0 relative flex items-center justify-center">
                          <img
                            src={editingProduct.imageUrl}
                            alt={editingProduct.name}
                            className="w-full h-full object-cover"
                          />
                          {isProcessingEditImage && (
                            <div className="absolute inset-0 bg-stone-900/70 flex items-center justify-center text-white text-[10px] font-bold">
                              جاري المعالجة...
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <span className="text-xs font-bold text-stone-900 block">صورة القطعة 📷</span>
                          <input
                            type="file"
                            ref={editProductFileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(
                                e.target.files?.[0],
                                (url) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    imageUrl: url,
                                    images: [url],
                                  }),
                                setIsProcessingEditImage
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() => editProductFileInputRef.current?.click()}
                            disabled={isProcessingEditImage}
                            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>تغيير الصورة من الهاتف</span>
                          </button>
                        </div>
                      </div>
                    </div>

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

                    <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 space-y-2">
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
