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
  KeyRound,
  ShieldAlert,
  LogOut,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  Star,
  MessageSquare
} from 'lucide-react';
import { Product, StoreSettings, StaffAccount, StaffPermissions, Review } from '../types/store';
import { sha256 } from '../utils/security';
import { processImageFile } from '../utils/imageUpload';
import { SalesAnalytics } from './SalesAnalytics';
import { fetchCloudStaffAccounts, syncStaffAccountsToCloud } from '../services/supabaseSync';

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
  reviews: Review[];
  onDeleteReview: (id: string) => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
}

interface CurrentUserSession {
  role: 'admin' | 'staff';
  name: string;
  email: string;
  permissions: StaffPermissions;
}

const DEFAULT_STAFF: StaffAccount[] = [
  {
    id: 'staff-1',
    name: 'مسؤولة المنتجات والمبيعات',
    email: 'staff@eval.com',
    passwordHash: 'ba9bf82619eb5444de78f7fb78410141f5efca112e92cf51a2e013f4e6fb46c3', // eval@2026
    role: 'staff',
    isActive: true,
    permissions: {
      canViewSales: true,
      canManageProducts: true,
      canManageCategories: true,
      canEditSettings: false,
      canManageReviews: true,
    },
    createdAt: '2026-11-08',
  },
];

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
  reviews,
  onDeleteReview,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'categories' | 'reviews' | 'branding' | 'staff' | 'security' | 'settings'
  >('analytics');

  // Reviews Tab Filter & Search
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<'all' | number>('all');

  // Staff Accounts State (Stored in localStorage)
  const [staffList, setStaffList] = useState<StaffAccount[]>(() => {
    try {
      const saved = localStorage.getItem('eval_staff_accounts');
      return saved ? JSON.parse(saved) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  });

  // Sync with Supabase cloud on open so any phone gets updated accounts instantly
  useEffect(() => {
    if (isOpen) {
      fetchCloudStaffAccounts().then((cloudAccounts) => {
        if (cloudAccounts && cloudAccounts.length > 0) {
          setStaffList(cloudAccounts);
        }
      });
    }
  }, [isOpen]);

  // Save staff list to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('eval_staff_accounts', JSON.stringify(staffList));
    } catch (e) {
      console.error(e);
    }
  }, [staffList]);

  // New Staff Form State
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffPerms, setNewStaffPerms] = useState<StaffPermissions>({
    canViewSales: false,
    canManageProducts: true,
    canManageCategories: false,
    canEditSettings: false,
    canManageReviews: false,
  });
  const [staffCreateSuccess, setStaffCreateSuccess] = useState(false);
  const [staffCreateError, setStaffCreateError] = useState('');

  // Editing Staff Modal
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);

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

  // Change Password State for Admin
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

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

  // Master Manager Emails (Super Admin)
  const getMasterAdminEmails = (): string[] => {
    const defaultEmails = [
      'eval.story.iah55@gmail.com',
      'ibrahim.a.habo1@gmail.com',
      'ibrahim.a.habo1.552.eval@eval.com',
      'admin@eval-fashion.com',
    ];
    try {
      const customEmail = localStorage.getItem('eval_admin_custom_email');
      if (customEmail) {
        defaultEmails.push(customEmail.trim().toLowerCase());
      }
    } catch {}
    return defaultEmails;
  };

  // Master Manager Password Hashes (SHA-256)
  const getMasterAdminPasswordHashes = (): string[] => {
    const hashes = [
      '70b469bec6576d9863b8dcddde977b3637ac3dd78257908e3c279e81b7048fd9', // 5528332$777262&eval
      '22e8829a299917d9a6ef6c1385af0d17a011912472d1a43e986fc49e9246285d', // ibrahim@aya
    ];
    try {
      const customHash = localStorage.getItem('eval_admin_custom_pwd_hash');
      if (customHash) {
        hashes.push(customHash);
      }
    } catch {}
    return hashes;
  };

  // ROLE-BASED AUTHENTICATION: Manager OR Authorized Employee
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check brute-force lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setLoginError(`تم قفل لوحة التحكم مؤقتاً لأسباب أمنية. يرجى الانتظار ${remainingSecs} ثانية.`);
      return;
    }

    const trimmedEmail = emailInput.trim().toLowerCase();
    const trimmedPassword = passwordInput.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setLoginError('يرجى كتابة البريد الإلكتروني وكلمة المرور.');
      return;
    }

    const inputHash = await sha256(trimmedPassword);

    // 1. Check if Manager (Super Admin)
    const masterEmails = getMasterAdminEmails();
    const masterHashes = getMasterAdminPasswordHashes();

    const isMasterAdminEmail = masterEmails.includes(trimmedEmail);
    const isMasterAdminPassword = masterHashes.includes(inputHash);

    if (isMasterAdminEmail && isMasterAdminPassword) {
      setCurrentUser({
        role: 'admin',
        name: 'المدير العام (Super Admin)',
        email: trimmedEmail,
        permissions: {
          canViewSales: true,
          canManageProducts: true,
          canManageCategories: true,
          canEditSettings: true,
          canManageReviews: true,
        },
      });
      setIsAuthenticated(true);
      setLoginError('');
      setFailedAttempts(0);
      setLockoutUntil(null);
      setActiveTab('analytics');
      return;
    }

    // 2. Check if Authorized Staff / Employee (Real-time Cloud Check)
    let currentStaffList = staffList;
    try {
      const cloudAccounts = await fetchCloudStaffAccounts();
      if (cloudAccounts && cloudAccounts.length > 0) {
        currentStaffList = cloudAccounts;
        setStaffList(cloudAccounts);
      }
    } catch {
      // fallback to current in-memory staffList
    }

    const foundStaff = currentStaffList.find(
      (s) => s.email.trim().toLowerCase() === trimmedEmail
    );

    if (foundStaff) {
      // Check if account is active or disabled by manager
      if (!foundStaff.isActive) {
        setLoginError('⚠️ تم تعطيل هذا الحساب من قِبل المدير العام. يرجى مراجعة إدارة المتجر.');
        return;
      }

      // Check password hash
      if (foundStaff.passwordHash === inputHash) {
        setCurrentUser({
          role: 'staff',
          name: foundStaff.name,
          email: foundStaff.email,
          permissions: foundStaff.permissions,
        });
        setIsAuthenticated(true);
        setLoginError('');
        setFailedAttempts(0);
        setLockoutUntil(null);

        // Direct staff to allowed tab
        if (foundStaff.permissions.canViewSales) {
          setActiveTab('analytics');
        } else if (foundStaff.permissions.canManageProducts) {
          setActiveTab('products');
        } else if (foundStaff.permissions.canManageCategories) {
          setActiveTab('categories');
        } else {
          setActiveTab('products');
        }
        return;
      }
    }

    // Authentication Failed
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= 5) {
      setLockoutUntil(Date.now() + 5 * 60 * 1000); // 5 minutes lockout
      setLoginError('⚠️ تم استنفاد 5 محاولات خاطئة. تم قفل لوحة التحكم مؤقتاً لمدة 5 دقائق لحماية المتجر.');
    } else {
      setLoginError(
        `بيانات الدخول غير صحيحة! الدخول مسموح فقط للمدير والموظفين المصرح لهم (المحاولات المتبقية: ${5 - newAttempts}).`
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmailInput('');
    setPasswordInput('');
  };

  // Staff Management Handlers (Manager Only)
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffCreateError('');
    setStaffCreateSuccess(false);

    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
      setStaffCreateError('يرجى ملء جميع الحقول المطلوبة للموظف.');
      return;
    }

    const cleanEmail = newStaffEmail.trim().toLowerCase();
    if (staffList.some((s) => s.email.toLowerCase() === cleanEmail)) {
      setStaffCreateError('يوجد حساب موظف مسجل بهذا البريد مسبقاً.');
      return;
    }

    if (newStaffPassword.trim().length < 6) {
      setStaffCreateError('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل.');
      return;
    }

    try {
      const pwdHash = await sha256(newStaffPassword.trim());
      const newStaff: StaffAccount = {
        id: `staff-${Date.now()}`,
        name: newStaffName.trim(),
        email: cleanEmail,
        passwordHash: pwdHash,
        role: 'staff',
        isActive: true,
        permissions: { ...newStaffPerms },
        createdAt: new Date().toISOString().split('T')[0],
      };

      const updatedStaff = [newStaff, ...staffList];
      setStaffList(updatedStaff);
      syncStaffAccountsToCloud(updatedStaff);
      setStaffCreateSuccess(true);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setShowAddStaffForm(false);
      setTimeout(() => setStaffCreateSuccess(false), 3500);
    } catch {
      setStaffCreateError('حدث خطأ أثناء تشفير وحفظ حساب الموظف.');
    }
  };

  const handleToggleStaffStatus = (staffId: string) => {
    const updated = staffList.map((s) => (s.id === staffId ? { ...s, isActive: !s.isActive } : s));
    setStaffList(updated);
    syncStaffAccountsToCloud(updated);
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    if (window.confirm(`هل أنتِ متأكدة من حذف حساب الموظف "${staffName}" نهائياً؟`)) {
      const updated = staffList.filter((s) => s.id !== staffId);
      setStaffList(updated);
      syncStaffAccountsToCloud(updated);
    }
  };

  const handleSaveStaffPermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    const updated = staffList.map((s) => (s.id === editingStaff.id ? editingStaff : s));
    setStaffList(updated);
    syncStaffAccountsToCloud(updated);
    setEditingStaff(null);
  };

  // Change Credentials Handler for Manager
  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess(false);

    if (newAdminPassword.length < 8) {
      setPasswordChangeError('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف وأرقام.');
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeError('كلمة المرور وتأكيدها غير متطابقين.');
      return;
    }

    try {
      const newHash = await sha256(newAdminPassword.trim());
      localStorage.setItem('eval_admin_custom_pwd_hash', newHash);

      if (newAdminEmail.trim()) {
        localStorage.setItem('eval_admin_custom_email', newAdminEmail.trim().toLowerCase());
      }

      setPasswordChangeSuccess(true);
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setTimeout(() => setPasswordChangeSuccess(false), 4000);
    } catch {
      setPasswordChangeError('حدث خطأ أثناء تشفير وحفظ كلمة المرور.');
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
    } catch {
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

  const isSuperAdmin = currentUser?.role === 'admin';
  const perms = currentUser?.permissions || {
    canViewSales: false,
    canManageProducts: false,
    canManageCategories: false,
    canEditSettings: false,
  };

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
                <h2 className="text-sm sm:text-base font-bold">لوحة معلومات المتجر | EVAL Portal</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSuperAdmin
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {isSuperAdmin ? 'حساب المدير العام (صلاحيات كاملة)' : `حساب موظف: ${currentUser?.name}`}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">
                إدارة متجر إيفال وفريق العمل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Login Form */
          <div className="p-6 sm:p-8 max-w-md mx-auto w-full my-auto space-y-5">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-stone-900">تسجيل الدخول الإداري</h3>
              <p className="text-xs text-stone-500">
                لوحة معلومات المتجر للمدير والموظفين المصرح لهم فقط.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>تنبيه:</span>
                </div>
                <div>{loginError}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني المعتمد</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@eval.com"
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
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>دخول إلى لوحة التحكم</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* Top Navigation Tabs (Role & Permission Filtered) */}
            <div className="bg-stone-100 p-2 border-b border-stone-200 flex items-center justify-between overflow-x-auto gap-2">
              <div className="flex gap-1.5 shrink-0">
                {(isSuperAdmin || perms.canViewSales) && (
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'analytics'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 bg-white/70'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>المبيعات والتقارير</span>
                  </button>
                )}

                {(isSuperAdmin || perms.canManageProducts) && (
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
                )}

                {(isSuperAdmin || perms.canManageCategories) && (
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
                )}

                {(isSuperAdmin || perms.canManageReviews) && (
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'reviews'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 bg-white/70'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>الآراء والتعليقات ({reviews.length}) ⭐</span>
                  </button>
                )}

                {(isSuperAdmin || perms.canEditSettings) && (
                  <button
                    onClick={() => setActiveTab('branding')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'branding'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 bg-white/70'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-500" />
                    <span>الغلاف واللوغو</span>
                  </button>
                )}

                {/* MANAGER EXCLUSIVE TAB: Employees & Permissions Management */}
                {isSuperAdmin && (
                  <button
                    onClick={() => setActiveTab('staff')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'staff'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 bg-white/70'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>إدارة الموظفين والصلاحيات ({staffList.length}) 👥</span>
                  </button>
                )}

                {/* MANAGER EXCLUSIVE TAB: Security & Credentials */}
                {isSuperAdmin && (
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'security'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 bg-white/70'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-stone-600" />
                    <span>بيانات حساب المدير</span>
                  </button>
                )}

                {(isSuperAdmin || perms.canEditSettings) && (
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
                )}
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
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: Sales Analytics */}
              {activeTab === 'analytics' && (isSuperAdmin || perms.canViewSales) && (
                <SalesAnalytics products={products} />
              )}

              {/* TAB 2: Products Management */}
              {activeTab === 'products' && (isSuperAdmin || perms.canManageProducts) && (
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
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Categories Management */}
              {activeTab === 'categories' && (isSuperAdmin || perms.canManageCategories) && (
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

              {/* TAB 4: REVIEWS & COMMENTS MANAGEMENT (Manager & Authorized Staff) */}
              {activeTab === 'reviews' && (isSuperAdmin || perms.canManageReviews) && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Top Bar: Stats & Search */}
                  <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-amber-500" />
                        <h4 className="text-sm sm:text-base font-bold text-stone-900">
                          إدارة آراء وتقييمات العملاء
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {reviews.length} تقييم
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        تحكم كامل للمدير: مراجعة كافة تعليقات المتجر، متابعة تجارب العميلات، وحذف أي تعليق بنقرة واحدة.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {/* Search Input */}
                      <div className="relative flex-1 md:w-64">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={reviewSearchQuery}
                          onChange={(e) => setReviewSearchQuery(e.target.value)}
                          placeholder="بحث باسم العميل أو نص التعليق..."
                          className="w-full pr-8 pl-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating Filters */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-stone-600 shrink-0">تصفية التقييم:</span>
                    <button
                      onClick={() => setReviewRatingFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        reviewRatingFilter === 'all'
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      جميع التقييمات ({reviews.length})
                    </button>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter((r) => r.rating === stars).length;
                      return (
                        <button
                          key={stars}
                          onClick={() => setReviewRatingFilter(stars)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            reviewRatingFilter === stars
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          <span>{stars}</span>
                          <Star className={`w-3 h-3 ${reviewRatingFilter === stars ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                          <span className="text-[10px] opacity-80">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Reviews Cards List */}
                  {(() => {
                    const filteredReviews = reviews.filter((rev) => {
                      const matchesSearch =
                        !reviewSearchQuery.trim() ||
                        rev.name.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                        rev.comment.toLowerCase().includes(reviewSearchQuery.toLowerCase());
                      const matchesRating =
                        reviewRatingFilter === 'all' || rev.rating === reviewRatingFilter;
                      return matchesSearch && matchesRating;
                    });

                    if (filteredReviews.length === 0) {
                      return (
                        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-2">
                          <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
                          <p className="text-xs font-bold text-stone-700">لا توجد تعليقات مطابقة</p>
                          <p className="text-[11px] text-stone-400">
                            {reviewSearchQuery ? 'جربي البحث بكلمة أخرى أو تعديل التصفية' : 'لم يتم نشر أي تقييمات في هذا التصنيف بعد'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredReviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-2.5">
                              {/* Header: User & Rating */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">
                                    {rev.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-stone-900">{rev.name}</span>
                                      {rev.verifiedPurchase && (
                                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                                          شراء مؤكد ✓
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-stone-400">{rev.createdAt}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < rev.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-stone-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Comment Body */}
                              <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                                "{rev.comment}"
                              </p>
                            </div>

                            {/* Footer: Delete Action (Manager Control) */}
                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                              <span className="text-[10px] text-stone-400">معرف التعليق: {rev.id}</span>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `هل أنتِ متأكدة من حذف تعليق العميل "${rev.name}" نهائياً من المتجر؟`
                                    )
                                  ) {
                                    onDeleteReview(rev.id);
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="حذف التعليق"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>حذف التعليق</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: Hero Cover, Logo & Branding */}
              {activeTab === 'branding' && (isSuperAdmin || perms.canEditSettings) && (
                <div className="space-y-6">
                  {/* Announcement Bar */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-emerald-700" />
                        <span>شريط الإعلانات في رأس الصفحة</span>
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
                        placeholder="مثال: ✨ تشكيلة الموسم الجديد متوفرة الآن"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Logo Customization */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span>تخصيص اللوغو واسم المتجر</span>
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
                    </div>
                  </div>

                  {/* Hero Cover */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>غلاف المتجر الرئيسي والكتابات على الغلاف</span>
                    </h4>

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
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-900">
                            صورة غلاف المتجر (رفع من الهاتف) 📷
                          </label>
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

                    {/* Presets */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-2">أغلفة مقترحة:</label>
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
                  </div>

                  {/* Save Settings Action */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>حفظ التعديلات</span>
                    </button>

                    {settingsSaved && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم حفظ التعديلات بنجاح!</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: MANAGER EXCLUSIVE - STAFF ACCOUNTS & PERMISSIONS (RBAC) 👥 */}
              {activeTab === 'staff' && isSuperAdmin && (
                <div className="space-y-6">
                  {/* Top Bar: Add Employee */}
                  <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-800" />
                        <span>إدارة حسابات الموظفين وصلاحيات الوصول</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          مزامنة سحابية نشطة ☁️
                        </span>
                      </h4>
                      <p className="text-xs text-stone-500">
                        تحكم كامل للمدير العام: إضافة موظفين جدد، تحديد الصلاحيات، أو تعطيل/حذف أي حساب فوراً. الحسابات تعمل على جميع أجهزة الموظفين لحظياً.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                      className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      {showAddStaffForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>{showAddStaffForm ? 'إلغاء' : 'إضافة موظف جديد ➕'}</span>
                    </button>
                  </div>

                  {/* Feedback Messages */}
                  {staffCreateSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم إنشاء حساب الموظف وتشفير كلمة المرور بنجاح! يمكن للموظف الدخول الآن.</span>
                    </div>
                  )}

                  {staffCreateError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
                      {staffCreateError}
                    </div>
                  )}

                  {/* Create Staff Form (Collapsible) */}
                  {showAddStaffForm && (
                    <form onSubmit={handleCreateStaff} className="p-5 bg-white rounded-2xl border border-emerald-200 shadow-md space-y-4 animate-in fade-in">
                      <h5 className="text-xs font-black text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-emerald-700" />
                        <span>بيانات الموظف الجديد وتحديد الصلاحيات:</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">اسم الموظف *</label>
                          <input
                            type="text"
                            value={newStaffName}
                            onChange={(e) => setNewStaffName(e.target.value)}
                            placeholder="مثال: سارة أحمد"
                            required
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني للدخول *</label>
                          <input
                            type="email"
                            value={newStaffEmail}
                            onChange={(e) => setNewStaffEmail(e.target.value)}
                            placeholder="sara@eval.com"
                            required
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور *</label>
                          <input
                            type="password"
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Permissions Matrix */}
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                        <span className="text-xs font-bold text-stone-900 block">
                          تحديد صلاحيات الموظف (حددي ما يحق للموظف الوصول إليه):
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-stone-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newStaffPerms.canViewSales}
                              onChange={(e) =>
                                setNewStaffPerms({ ...newStaffPerms, canViewSales: e.target.checked })
                              }
                              className="rounded text-emerald-800 focus:ring-0"
                            />
                            <div>
                              <span className="font-bold text-stone-800 block">عرض المبيعات والتقارير المالية 📊</span>
                              <span className="text-[10px] text-stone-500">رؤية الإيرادات وعدد الطلبات والمنتجات الأكثر طلباً</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-stone-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newStaffPerms.canManageProducts}
                              onChange={(e) =>
                                setNewStaffPerms({ ...newStaffPerms, canManageProducts: e.target.checked })
                              }
                              className="rounded text-emerald-800 focus:ring-0"
                            />
                            <div>
                              <span className="font-bold text-stone-800 block">إدارة المنتجات والأسعار والخصومات 🏷️</span>
                              <span className="text-[10px] text-stone-500">إضافة وتعديل وحذف المنتجات وتغيير الصور</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-stone-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newStaffPerms.canManageCategories}
                              onChange={(e) =>
                                setNewStaffPerms({ ...newStaffPerms, canManageCategories: e.target.checked })
                              }
                              className="rounded text-emerald-800 focus:ring-0"
                            />
                            <div>
                              <span className="font-bold text-stone-800 block">إدارة وحذف أقسام المتجر 📁</span>
                              <span className="text-[10px] text-stone-500">إضافة أقسام جديدة كعبايات وفساتين أو حذفها</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-stone-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newStaffPerms.canEditSettings}
                              onChange={(e) =>
                                setNewStaffPerms({ ...newStaffPerms, canEditSettings: e.target.checked })
                              }
                              className="rounded text-emerald-800 focus:ring-0"
                            />
                            <div>
                              <span className="font-bold text-stone-800 block">تعديل الغلاف والإعلانات وواتساب ⚙️</span>
                              <span className="text-[10px] text-stone-500">تعديل نصوص واجهة المتجر ورقم استقبال الطلبات</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-stone-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newStaffPerms.canManageReviews ?? false}
                              onChange={(e) =>
                                setNewStaffPerms({ ...newStaffPerms, canManageReviews: e.target.checked })
                              }
                              className="rounded text-emerald-800 focus:ring-0"
                            />
                            <div>
                              <span className="font-bold text-stone-800 block">إدارة وحذف تقييمات العملاء ⭐</span>
                              <span className="text-[10px] text-stone-500">صلاحية حذف التعليقات وإدارتها</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddStaffForm(false)}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          تأكيد وإنشاء حساب الموظف
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Staff Accounts List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>قائمة حسابات الموظفين المسجلين ({staffList.length}):</span>
                      <span className="text-stone-400">يمكنكِ تعديل صلاحيات أو تعطيل أي موظف فوراً</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {staffList.map((staff) => (
                        <div
                          key={staff.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            staff.isActive
                              ? 'bg-white border-stone-200 hover:border-stone-300'
                              : 'bg-stone-50 border-stone-200 opacity-75'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-stone-900">{staff.name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  staff.isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {staff.isActive ? 'حساب نشط (مفعل)' : 'معطل عن الدخول'}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                مسجل في: {staff.createdAt}
                              </span>
                            </div>

                            <div className="text-xs text-stone-600 font-mono">{staff.email}</div>

                            {/* Granted Permissions Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {staff.permissions.canViewSales && (
                                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                                  مبيعات 📊
                                </span>
                              )}
                              {staff.permissions.canManageProducts && (
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                                  منتجات وأسعار 🏷️
                                </span>
                              )}
                              {staff.permissions.canManageCategories && (
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                  أقسام 📁
                                </span>
                              )}
                              {staff.permissions.canEditSettings && (
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                  إعدادات وغلاف ⚙️
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Edit Permissions */}
                            <button
                              onClick={() => setEditingStaff({ ...staff })}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="تعديل صلاحيات هذا الموظف"
                            >
                              <UserCog className="w-3.5 h-3.5" />
                              <span>الصلاحيات</span>
                            </button>

                            {/* Toggle Active / Disabled */}
                            <button
                              onClick={() => handleToggleStaffStatus(staff.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                staff.isActive
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {staff.isActive ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>تعطيل الحساب</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>تفعيل الحساب</span>
                                </>
                              )}
                            </button>

                            {/* Delete Employee */}
                            <button
                              onClick={() => handleDeleteStaff(staff.id, staff.name)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف الموظف نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {staffList.length === 0 && (
                        <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
                          لم يتم تسجيل أي موظفين حتى الآن. انقري على "إضافة موظف جديد ➕" لإنشاء أول حساب موظف وتحديد صلاحياته.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MANAGER EXCLUSIVE - ACCOUNT SETTINGS */}
              {activeTab === 'security' && isSuperAdmin && (
                <div className="space-y-6">

                  {/* Change Password & Email Box */}
                  <div className="p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 max-w-xl">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-rose-600" />
                        <span>تغيير كلمة المرور والبريد الإداري للمدير العام</span>
                      </h4>
                      <p className="text-xs text-stone-500">
                        يمكنكِ تعيين كلمة مرور قوية وسرية خاصة بكِ.
                      </p>
                    </div>

                    {passwordChangeError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
                        {passwordChangeError}
                      </div>
                    )}

                    {passwordChangeSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم تحديث وتشفير كلمة المرور بنجاح! احفظيها جيداً لدخولك القادم.</span>
                      </div>
                    )}

                    <form onSubmit={handleChangeCredentials} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          البريد الإداري الجديد للمدير (اختياري)
                        </label>
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="eval.story.iah55@gmail.com"
                          className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          كلمة المرور الجديدة (8 خانات أو أكثر) *
                        </label>
                        <input
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          تأكيد كلمة المرور الجديدة *
                        </label>
                        <input
                          type="password"
                          value={confirmAdminPassword}
                          onChange={(e) => setConfirmAdminPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>تشفير وحفظ كلمة المرور الجديدة (SHA-256)</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 7: Contact & WhatsApp Settings */}
              {activeTab === 'settings' && (isSuperAdmin || perms.canEditSettings) && (
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

            {/* Edit Staff Permissions Modal Overlay */}
            {editingStaff && (
              <div className="fixed inset-0 z-60 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <UserCog className="w-4 h-4 text-emerald-800" />
                      <span>تعديل صلاحيات الموظف: {editingStaff.name}</span>
                    </div>
                    <button
                      onClick={() => setEditingStaff(null)}
                      className="text-stone-400 hover:text-stone-900 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveStaffPermissions} className="space-y-4">
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingStaff.permissions.canViewSales}
                          onChange={(e) =>
                            setEditingStaff({
                              ...editingStaff,
                              permissions: { ...editingStaff.permissions, canViewSales: e.target.checked },
                            })
                          }
                          className="rounded text-emerald-800 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">عرض تقارير ومخطط المبيعات 📊</span>
                          <span className="text-[11px] text-stone-500">رؤية الإيرادات ومتابعة عدد الطلبات</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingStaff.permissions.canManageProducts}
                          onChange={(e) =>
                            setEditingStaff({
                              ...editingStaff,
                              permissions: { ...editingStaff.permissions, canManageProducts: e.target.checked },
                            })
                          }
                          className="rounded text-emerald-800 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">إدارة المنتجات والأسعار والخصومات 🏷️</span>
                          <span className="text-[11px] text-stone-500">إضافة وتعديل وحذف المنتجات وتغيير الصور</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingStaff.permissions.canManageCategories}
                          onChange={(e) =>
                            setEditingStaff({
                              ...editingStaff,
                              permissions: { ...editingStaff.permissions, canManageCategories: e.target.checked },
                            })
                          }
                          className="rounded text-emerald-800 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">إدارة أقسام وتصنيفات المتجر 📁</span>
                          <span className="text-[11px] text-stone-500">إضافة أو حذف الأقسام</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingStaff.permissions.canEditSettings}
                          onChange={(e) =>
                            setEditingStaff({
                              ...editingStaff,
                              permissions: { ...editingStaff.permissions, canEditSettings: e.target.checked },
                            })
                          }
                          className="rounded text-emerald-800 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">تعديل الغلاف والإعلانات وواتساب ⚙️</span>
                          <span className="text-[11px] text-stone-500">تعديل نصوص واجهة المتجر</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingStaff.permissions.canManageReviews ?? false}
                          onChange={(e) =>
                            setEditingStaff({
                              ...editingStaff,
                              permissions: { ...editingStaff.permissions, canManageReviews: e.target.checked },
                            })
                          }
                          className="rounded text-emerald-800 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">إدارة وحذف تقييمات العملاء ⭐</span>
                          <span className="text-[11px] text-stone-500">صلاحية حذف التعليقات وإدارتها</span>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setEditingStaff(null)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        حفظ الصلاحيات الجديدة
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
