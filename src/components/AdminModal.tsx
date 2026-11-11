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
  MessageSquare,
  Copy
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

// Preset Constants for Product Customization
const PRESET_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const PRESET_ABAYA_SIZES = ['50', '52', '54', '56', '58', '60'];
const PRESET_COLORS = [
  'أسود',
  'أبيض',
  'بيج',
  'كحلي',
  'زيتي',
  'كشمير',
  'رمادي',
  'نبيتي',
  'عاجي',
  'موكا',
  'بني',
  'سماوي',
  'زيتوني',
];

  // New Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'عبايات');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [newFabric, setNewFabric] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImages, setNewImages] = useState<string[]>([
    '/src/assets/images/product_abaya_noir_1794089555159.jpg',
  ]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [newSizes, setNewSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [newColors, setNewColors] = useState<string[]>(['أسود', 'بيج']);
  const [customColorInput, setCustomColorInput] = useState('');
  const [isProcessingNewImage, setIsProcessingNewImage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [productActionStatus, setProductActionStatus] = useState<string | null>(null);

  // Edit Product Custom inputs
  const [editCustomSizeInput, setEditCustomSizeInput] = useState('');
  const [editCustomColorInput, setEditCustomColorInput] = useState('');
  const [editImageUrlInput, setEditImageUrlInput] = useState('');

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
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    try {
      navigator.clipboard?.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    } catch {
      // fallback
    }
  };

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
      console.warn('Error processing image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleFilesChange = async (
    files: FileList | null,
    onSuccess: (dataUrls: string[]) => void,
    setLoading: (loading: boolean) => void,
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82
  ) => {
    if (!files || files.length === 0) return;
    try {
      setLoading(true);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const opt = await processImageFile(file, maxWidth, maxHeight, quality);
          urls.push(opt);
        } catch (e) {
          console.warn('Error processing image file:', e);
        }
      }
      if (urls.length > 0) {
        onSuccess(urls);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!newTitle.trim()) {
      setProductActionStatus('يرجى كتابة اسم المنتج أولاً لتوليد الوصف المناسب له.');
      setTimeout(() => setProductActionStatus(null), 3000);
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

    const finalSizes = newSizes.length > 0 ? newSizes : ['Free Size'];
    const finalColors = newColors.length > 0 ? newColors : ['أسود'];
    const finalImages =
      newImages.length > 0
        ? newImages
        : ['/src/assets/images/product_abaya_noir_1794089555159.jpg'];
    const primaryImage = finalImages[0];

    onAddProduct({
      name: newTitle.trim(),
      category: newCategory,
      price: parsedPrice,
      oldPrice: parsedOldPrice && parsedOldPrice > parsedPrice ? parsedOldPrice : undefined,
      fabric: newFabric.trim() || 'خامة فاخرة مختارة بعناية',
      description: newDesc.trim() || 'قطعة حصرية تجمع بين الأصالة والأناقة من إيفال.',
      sizes: finalSizes,
      colors: finalColors,
      imageUrl: primaryImage,
      images: finalImages,
      isAvailable: true,
      isFeatured: false,
    });

    setNewTitle('');
    setNewPrice('');
    setNewOldPrice('');
    setNewFabric('');
    setNewDesc('');
    setShowAddForm(false);
    setProductActionStatus('تمت إضافة القطعة بنجاح وحفظها سحابياً في المتجر! ✨');
    setTimeout(() => setProductActionStatus(null), 4000);
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
                    <span>الهوية والشعار 🎨</span>
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

                      {/* Action status notification banner */}
                      {productActionStatus && (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{productActionStatus}</span>
                        </div>
                      )}

                      <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* 1. Multi-Image Upload & Gallery */}
                        <div className="sm:col-span-3 bg-white p-4 rounded-xl border border-dashed border-stone-300 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                            <div>
                              <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                <Camera className="w-4 h-4 text-emerald-800" />
                                <span>صور القطعة (رفع أكثر من صورة من الهاتف أو الكاميرا) 📷</span>
                              </label>
                              <p className="text-[11px] text-stone-500">
                                يمكنكِ اختيار عدة صور معاً من المعرض. الصورة الأولى ستكون الغلاف الرئيسي للقطعة.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                ref={newProductFileInputRef}
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) =>
                                  handleMultipleFilesChange(
                                    e.target.files,
                                    (urls) => setNewImages((prev) => [...prev, ...urls]),
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
                                <span>{isProcessingNewImage ? 'جاري المعالجة...' : 'رفع صور من الهاتف ➕'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Image Gallery Preview Grid */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-stone-600 block">
                              الصور المرفوعة للقطعة ({newImages.length}):
                            </span>
                            <div className="flex flex-wrap gap-2.5">
                              {newImages.map((imgUrl, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 border-2 border-stone-200 group"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`صورة ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />

                                  {/* Primary Badge */}
                                  {idx === 0 ? (
                                    <span className="absolute top-1 right-1 bg-emerald-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs z-10">
                                      الرئيسية
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const reordered = [imgUrl, ...newImages.filter((_, i) => i !== idx)];
                                        setNewImages(reordered);
                                      }}
                                      className="absolute bottom-1 right-1 left-1 bg-stone-900/80 hover:bg-stone-900 text-white text-[9px] font-bold py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center cursor-pointer"
                                    >
                                      اجعلها رئيسية
                                    </button>
                                  )}

                                  {/* Delete Button */}
                                  {newImages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                                      className="absolute top-1 left-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                                      title="حذف هذه الصورة"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Add URL fallback */}
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                value={newImageUrlInput}
                                onChange={(e) => setNewImageUrlInput(e.target.value)}
                                placeholder="أو الصقي رابط صورة خارجي (URL)..."
                                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none"
                                dir="ltr"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newImageUrlInput.trim()) {
                                    setNewImages((prev) => [...prev, newImageUrlInput.trim()]);
                                    setNewImageUrlInput('');
                                  }
                                }}
                                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                إضافة الرابط
                              </button>
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

                        {/* 2. Color Selection (Chips + Custom Input) */}
                        <div className="sm:col-span-3 bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <Palette className="w-4 h-4 text-amber-600" />
                              <span>اختيار ألوان القطعة المتاحة 🎨</span>
                            </label>
                            <span className="text-[11px] font-semibold text-stone-500">
                              المحدد: {newColors.length} لون
                            </span>
                          </div>

                          {/* Selected Colors Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-stone-50 rounded-lg border border-stone-100">
                            {newColors.length === 0 ? (
                              <span className="text-xs text-stone-400">لم يتم اختيار أي لون بعد، يرجى النقر على الألوان أدناه</span>
                            ) : (
                              newColors.map((color) => (
                                <span
                                  key={color}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 text-white rounded-lg text-xs font-bold shadow-2xs"
                                >
                                  <span>{color}</span>
                                  <button
                                    type="button"
                                    onClick={() => setNewColors(newColors.filter((c) => c !== color))}
                                    className="p-0.5 hover:text-rose-300 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>

                          {/* Preset Color Buttons */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-stone-500 block">ألوان شائعة سريعة (اضغطي للإضافة/الحذف):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_COLORS.map((color) => {
                                const isSelected = newColors.includes(color);
                                return (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setNewColors(newColors.filter((c) => c !== color));
                                      } else {
                                        setNewColors([...newColors, color]);
                                      }
                                    }}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#34452D] text-white border-[#34452D]'
                                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                    }`}
                                  >
                                    {isSelected ? `✓ ${color}` : `+ ${color}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Color Input */}
                          <div className="flex gap-2 pt-1 max-w-sm">
                            <input
                              type="text"
                              value={customColorInput}
                              onChange={(e) => setCustomColorInput(e.target.value)}
                              placeholder="أو اكتبي لون مخصص (مثال: بترولي)..."
                              className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (customColorInput.trim() && !newColors.includes(customColorInput.trim())) {
                                    setNewColors([...newColors, customColorInput.trim()]);
                                    setCustomColorInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customColorInput.trim() && !newColors.includes(customColorInput.trim())) {
                                  setNewColors([...newColors, customColorInput.trim()]);
                                  setCustomColorInput('');
                                }
                              }}
                              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              إضافة اللون
                            </button>
                          </div>
                        </div>

                        {/* 3. Size Selection (Clothing & Abayas + Custom Input) */}
                        <div className="sm:col-span-3 bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <Tag className="w-4 h-4 text-blue-600" />
                              <span>اختيار مقاسات القطعة المتاحة (S, M, L, XL, XXL ...) 📏</span>
                            </label>
                            <span className="text-[11px] font-semibold text-stone-500">
                              المحدد: {newSizes.length} مقاس
                            </span>
                          </div>

                          {/* Selected Sizes Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-stone-50 rounded-lg border border-stone-100">
                            {newSizes.length === 0 ? (
                              <span className="text-xs text-stone-400">لم يتم اختيار أي مقاس، انقري على المقاسات بالأسفل لتفعيلها</span>
                            ) : (
                              newSizes.map((size) => (
                                <span
                                  key={size}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#34452D] text-white rounded-lg text-xs font-bold shadow-2xs"
                                >
                                  <span>{size}</span>
                                  <button
                                    type="button"
                                    onClick={() => setNewSizes(newSizes.filter((s) => s !== size))}
                                    className="p-0.5 hover:text-rose-300 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>

                          {/* Clothing Sizes Presets */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-stone-500 block">مقاسات الملابس القياسية:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_CLOTHING_SIZES.map((size) => {
                                const isSelected = newSizes.includes(size);
                                return (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setNewSizes(newSizes.filter((s) => s !== size));
                                      } else {
                                        setNewSizes([...newSizes, size]);
                                      }
                                    }}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#34452D] text-white border-[#34452D]'
                                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                    }`}
                                  >
                                    {isSelected ? `✓ ${size}` : `+ ${size}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Abaya Numeric Sizes Presets */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-stone-500 block">مقاسات العبايات الرقمية (طول العباية):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_ABAYA_SIZES.map((size) => {
                                const isSelected = newSizes.includes(size);
                                return (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setNewSizes(newSizes.filter((s) => s !== size));
                                      } else {
                                        setNewSizes([...newSizes, size]);
                                      }
                                    }}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#34452D] text-white border-[#34452D]'
                                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                    }`}
                                  >
                                    {isSelected ? `✓ ${size}` : `+ ${size}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Size Input */}
                          <div className="flex gap-2 pt-1 max-w-sm">
                            <input
                              type="text"
                              value={customSizeInput}
                              onChange={(e) => setCustomSizeInput(e.target.value)}
                              placeholder="أو اكتبي مقاس مخصص (مثال: 4XL أو تفصيل)..."
                              className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (customSizeInput.trim() && !newSizes.includes(customSizeInput.trim())) {
                                    setNewSizes([...newSizes, customSizeInput.trim()]);
                                    setCustomSizeInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customSizeInput.trim() && !newSizes.includes(customSizeInput.trim())) {
                                  setNewSizes([...newSizes, customSizeInput.trim()]);
                                  setCustomSizeInput('');
                                }
                              }}
                              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              إضافة المقاس
                            </button>
                          </div>
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
                            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>نشر القطعة في المتجر وحفظها سحابياً</span>
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
                  {/* Brand Overview Header */}
                  <div className="p-5 bg-linear-to-r from-[#24301F] to-[#34452D] rounded-2xl sm:rounded-3xl text-white border border-[#C6A15B]/30 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-radial from-[#C6A15B]/20 to-transparent rounded-full -translate-x-20 -translate-y-20 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B]/40 text-[#E8DDC8] text-[11px] font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                          <span>الهوية البصرية الرسمية المعتمدة لعلامة EVAL ✦</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-serif text-[#F5F0E5]">
                          مركز الهوية، الشعار، والخطوط الرسمية
                        </h3>
                        <p className="text-xs text-[#E8DDC8]/80 max-w-2xl leading-relaxed">
                          تم اعتماد الهوية الرسمية: الألوان الملكية (الزيتي والذهبي والعاجي)، الخطوط التيبوغرافية، ونماذج الشعار المعتمدة لعلامة EVAL.
                        </p>
                      </div>

                      <a
                        href="/assets/brand/eval_brand_identity_full.png"
                        download="EVAL_Brand_Identity_Full_Board.png"
                        className="px-4 py-2.5 bg-[#C6A15B] hover:bg-[#d8b56f] text-[#1E281A] rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل لوحة الهوية (HD)</span>
                      </a>
                    </div>
                  </div>

                  {/* Master Identity Board Preview Card */}
                  <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#34452D]" />
                        <span>لوحة الهوية البصرية الشاملة المعتمدة (Master Brand Board)</span>
                      </h4>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#34452D]/10 text-[#34452D] border border-[#34452D]/20">
                        معتمدة رسميًا ✓
                      </span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 group">
                      <img
                        src="/assets/brand/eval_brand_identity_full.png"
                        alt="لوحة الهوية البصرية المعتمدة لعلامة EVAL"
                        className="w-full h-auto object-contain max-h-[460px] mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-stone-950/80 via-stone-950/40 to-transparent flex items-center justify-between text-white text-xs">
                        <span className="font-serif">EVAL · FASHION FOR YOU · راحة تليق بك</span>
                        <a
                          href="/assets/brand/eval_brand_identity_full.png"
                          download="EVAL_Brand_Identity_Master.png"
                          className="px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل بدقة الطباعة</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Official Brand Colors */}
                  <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                        <span>الألوان الرسمية المعتمدة للهوية (Brand Color Palette)</span>
                      </h4>
                      {copiedHex && (
                        <span className="text-xs font-bold text-[#34452D] bg-[#34452D]/10 px-2.5 py-0.5 rounded-full animate-in fade-in">
                          تم نسخ الرمز {copiedHex} بنجاح! ✓
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          name: 'Royal Olive',
                          arabic: 'الزيتي الملكي',
                          hex: '#34452D',
                          bg: '#34452D',
                          textDark: false,
                          desc: 'اللون الأساسي للأكياس والعلب والواجهات',
                        },
                        {
                          name: 'Soft Gold',
                          arabic: 'الذهبي الهادئ',
                          hex: '#C6A15B',
                          bg: '#C6A15B',
                          textDark: true,
                          desc: 'لون الشعار والأختام والحفر الساخن',
                        },
                        {
                          name: 'Warm Ivory',
                          arabic: 'العاجي الدافئ',
                          hex: '#F5F0E5',
                          bg: '#F5F0E5',
                          textDark: true,
                          desc: 'لون الخلفيات والكروت والتاغات القطنية',
                        },
                        {
                          name: 'Vanilla',
                          arabic: 'الفانيليا',
                          hex: '#E8DDC8',
                          bg: '#E8DDC8',
                          textDark: true,
                          desc: 'لون البطانات الثانوية وورق السولفان',
                        },
                      ].map((col) => (
                        <div
                          key={col.hex}
                          className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-xs flex flex-col justify-between"
                        >
                          <div
                            style={{ backgroundColor: col.bg }}
                            className="h-20 w-full p-2.5 flex items-start justify-end"
                          >
                            <button
                              type="button"
                              onClick={() => handleCopyHex(col.hex)}
                              title="نسخ كود اللون"
                              className={`p-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-transform active:scale-95 ${
                                col.textDark
                                  ? 'bg-black/10 hover:bg-black/20 text-stone-900'
                                  : 'bg-white/20 hover:bg-white/30 text-white'
                              }`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-stone-900">{col.arabic}</span>
                              <span className="text-[11px] font-mono font-bold text-stone-600">{col.hex}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-serif block">{col.name}</span>
                            <p className="text-[10px] text-stone-500 line-clamp-2 pt-0.5">{col.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logo Selector & Presets */}
                  <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[#34452D]" />
                          <span>نماذج الشعار المعتمدة واختيار لوغو المتجر</span>
                        </h4>
                        <p className="text-xs text-stone-500">
                          اختر النموذج المفضل ليظهر في رأس وتذييل المتجر، أو حمّل أي نموذج بصيغة PNG عالية الدقة للطباعة.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {[
                        {
                          name: 'أيقونة التطبيق الملكية (المعتمدة حالياً)',
                          specs: 'الرمز المونوغرام بالذهب على خلفية زيتي ملكي',
                          url: '/assets/brand/eval_app_icon_dark.png',
                          darkBg: true,
                        },
                        {
                          name: 'الشعار الرئيسي المعتمد (Main Logo)',
                          specs: 'الشعار الكامل مع الاسم العربي والفرنسي والسلوغان',
                          url: '/assets/brand/eval_logo_main.png',
                          darkBg: false,
                        },
                        {
                          name: 'الشعار الأفقي (Horizontal Logo)',
                          specs: 'تنسيق عرضي مع خط فاصل للفواتير والمطبوعات العريضة',
                          url: '/assets/brand/eval_logo_horizontal.png',
                          darkBg: false,
                        },
                        {
                          name: 'النسخة الذهبية على الزيتي (Gold on Olive)',
                          specs: 'الذهب اللامع على خلفية الزيتي الملكي للعلب الفاخرة',
                          url: '/assets/brand/eval_logo_gold_dark.png',
                          darkBg: true,
                        },
                        {
                          name: 'المونوغرام الذهبي المختصر (Monogram Dark)',
                          specs: 'حرف E مع أوراق الغار الذهبية للتطريز والختم',
                          url: '/assets/brand/eval_monogram_dark.png',
                          darkBg: true,
                        },
                        {
                          name: 'النسخة الأحادية (Monochrome Version)',
                          specs: 'للطباعة أحادية اللون والمستندات والفاكسات',
                          url: '/assets/brand/eval_logo_monochrome.png',
                          darkBg: false,
                        },
                      ].map((item) => {
                        const isCurrent = tempSettings.logoUrl === item.url;
                        return (
                          <div
                            key={item.url}
                            className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                              isCurrent
                                ? 'border-[#34452D] bg-[#34452D]/5 ring-2 ring-[#34452D]/30 shadow-xs'
                                : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                            }`}
                          >
                            <div
                              className={`h-28 rounded-xl flex items-center justify-center p-3 mb-2.5 overflow-hidden border ${
                                item.darkBg
                                  ? 'bg-[#34452D] border-[#C6A15B]/30'
                                  : 'bg-[#F5F0E5] border-stone-200'
                              }`}
                            >
                              <img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain" />
                            </div>

                            <div className="space-y-1 mb-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-900">{item.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-[#34452D] bg-[#34452D]/15 px-2 py-0.5 rounded-full">
                                    المحدد حالياً ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-500 leading-tight">{item.specs}</p>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
                              <button
                                type="button"
                                onClick={() => setTempSettings({ ...tempSettings, logoUrl: item.url })}
                                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${
                                  isCurrent
                                    ? 'bg-[#34452D] text-white'
                                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                                }`}
                              >
                                {isCurrent ? 'اللوغو النشط للمتجر' : 'تعيين كلوغو للمتجر'}
                              </button>

                              <a
                                href={item.url}
                                download={`${item.name.replace(/\s+/g, '_')}.png`}
                                title="تحميل ملف الصورة"
                                className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

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

                  {/* Logo Customization Text */}
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span>النصوص والشعار المكتوب</span>
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
                        <label className="block text-xs font-bold text-stone-700 mb-1">الشعار الفرعي (Slogan المعتمد)</label>
                        <input
                          type="text"
                          value={tempSettings.logoSubtitle || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, logoSubtitle: e.target.value })}
                          placeholder="راحة تليق بك"
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
                            className="px-4 py-2 bg-[#34452D] hover:bg-[#253220] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
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
                                ? 'border-[#34452D] bg-[#34452D]/10 shadow-xs ring-1 ring-[#34452D]'
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
                      className="px-6 py-2.5 bg-[#34452D] hover:bg-[#253220] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>حفظ التعديلات</span>
                    </button>

                    {settingsSaved && (
                      <span className="text-xs font-bold text-[#34452D] flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم حفظ التعديلات وتطبيق الهوية بنجاح!</span>
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
                    {/* Multi-Image Gallery for Edited Product */}
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-dashed border-stone-300 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
                        <div>
                          <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-emerald-800" />
                            <span>صور القطعة ({editingProduct.images?.length || 1}) 📷</span>
                          </span>
                          <span className="text-[11px] text-stone-500">
                            يمكنكِ رفع صور إضافية من الهاتف وحذف أو تبديل الصورة الرئيسية.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={editProductFileInputRef}
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                              handleMultipleFilesChange(
                                e.target.files,
                                (urls) => {
                                  const currentImages = editingProduct.images && editingProduct.images.length > 0
                                    ? editingProduct.images
                                    : [editingProduct.imageUrl];
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: [...currentImages, ...urls],
                                    imageUrl: currentImages[0] || urls[0],
                                  });
                                },
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
                            <span>{isProcessingEditImage ? 'جاري المعالجة...' : 'إضافة صور من الهاتف ➕'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Thumbnails list */}
                      <div className="flex flex-wrap gap-2">
                        {(editingProduct.images && editingProduct.images.length > 0
                          ? editingProduct.images
                          : [editingProduct.imageUrl]
                        ).map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-200 border-2 border-stone-200 group"
                          >
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />

                            {idx === 0 ? (
                              <span className="absolute top-1 right-1 bg-emerald-800 text-white text-[8px] font-black px-1 py-0.5 rounded shadow-xs z-10">
                                الرئيسية
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const all = editingProduct.images && editingProduct.images.length > 0
                                    ? editingProduct.images
                                    : [editingProduct.imageUrl];
                                  const reordered = [imgUrl, ...all.filter((_, i) => i !== idx)];
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: reordered,
                                    imageUrl: imgUrl,
                                  });
                                }}
                                className="absolute bottom-1 right-1 left-1 bg-stone-900/80 hover:bg-stone-900 text-white text-[8px] font-bold py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center cursor-pointer"
                              >
                                اجعلها رئيسية
                              </button>
                            )}

                            {(editingProduct.images?.length || 1) > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const all = editingProduct.images || [editingProduct.imageUrl];
                                  const filtered = all.filter((_, i) => i !== idx);
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: filtered,
                                    imageUrl: filtered[0] || '',
                                  });
                                }}
                                className="absolute top-1 left-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                                title="حذف هذه الصورة"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Image by URL */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={editImageUrlInput}
                          onChange={(e) => setEditImageUrlInput(e.target.value)}
                          placeholder="أو الصقي رابط صورة خارجي..."
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editImageUrlInput.trim()) {
                              const cur = editingProduct.images && editingProduct.images.length > 0
                                ? editingProduct.images
                                : [editingProduct.imageUrl];
                              setEditingProduct({
                                ...editingProduct,
                                images: [...cur, editImageUrlInput.trim()],
                              });
                              setEditImageUrlInput('');
                            }
                          }}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          إضافة
                        </button>
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

                    {/* Colors Management for Edited Product */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-amber-600" />
                          <span>ألوان القطعة 🎨</span>
                        </label>
                        <span className="text-[10px] text-stone-500 font-bold">
                          المحدد: {editingProduct.colors?.length || 0}
                        </span>
                      </div>

                      {/* Active Colors Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[30px] p-1.5 bg-white rounded-lg border border-stone-200">
                        {editingProduct.colors && editingProduct.colors.length > 0 ? (
                          editingProduct.colors.map((color) => (
                            <span
                              key={color}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-900 text-white rounded-md text-[11px] font-bold"
                            >
                              <span>{color}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    colors: (editingProduct.colors || []).filter((c) => c !== color),
                                  })
                                }
                                className="p-0.5 hover:text-rose-300 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-stone-400">لا توجد ألوان محددة</span>
                        )}
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap gap-1">
                        {PRESET_COLORS.map((c) => {
                          const isSel = (editingProduct.colors || []).includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                const current = editingProduct.colors || [];
                                const updated = isSel ? current.filter((x) => x !== c) : [...current, c];
                                setEditingProduct({ ...editingProduct, colors: updated });
                              }}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded border cursor-pointer ${
                                isSel
                                  ? 'bg-[#34452D] text-white border-[#34452D]'
                                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                              }`}
                            >
                              {isSel ? `✓ ${c}` : `+ ${c}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Color Input */}
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={editCustomColorInput}
                          onChange={(e) => setEditCustomColorInput(e.target.value)}
                          placeholder="لون مخصص..."
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (editCustomColorInput.trim()) {
                                const current = editingProduct.colors || [];
                                if (!current.includes(editCustomColorInput.trim())) {
                                  setEditingProduct({
                                    ...editingProduct,
                                    colors: [...current, editCustomColorInput.trim()],
                                  });
                                  setEditCustomColorInput('');
                                }
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editCustomColorInput.trim()) {
                              const current = editingProduct.colors || [];
                              if (!current.includes(editCustomColorInput.trim())) {
                                setEditingProduct({
                                  ...editingProduct,
                                  colors: [...current, editCustomColorInput.trim()],
                                });
                                setEditCustomColorInput('');
                              }
                            }
                          }}
                          className="px-2.5 py-1 bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Sizes Management for Edited Product */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <span>مقاسات القطعة (S, M, L, XL, XXL ...) 📏</span>
                        </label>
                        <span className="text-[10px] text-stone-500 font-bold">
                          المحدد: {editingProduct.sizes?.length || 0}
                        </span>
                      </div>

                      {/* Active Sizes Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[30px] p-1.5 bg-white rounded-lg border border-stone-200">
                        {editingProduct.sizes && editingProduct.sizes.length > 0 ? (
                          editingProduct.sizes.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#34452D] text-white rounded-md text-[11px] font-bold"
                            >
                              <span>{size}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    sizes: (editingProduct.sizes || []).filter((s) => s !== size),
                                  })
                                }
                                className="p-0.5 hover:text-rose-300 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-stone-400">لا توجد مقاسات محددة</span>
                        )}
                      </div>

                      {/* Clothing Size Presets */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold block">مقاسات الملابس:</span>
                        <div className="flex flex-wrap gap-1">
                          {PRESET_CLOTHING_SIZES.map((s) => {
                            const isSel = (editingProduct.sizes || []).includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  const current = editingProduct.sizes || [];
                                  const updated = isSel ? current.filter((x) => x !== s) : [...current, s];
                                  setEditingProduct({ ...editingProduct, sizes: updated });
                                }}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded border cursor-pointer ${
                                  isSel
                                    ? 'bg-[#34452D] text-white border-[#34452D]'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                                }`}
                              >
                                {isSel ? `✓ ${s}` : `+ ${s}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Abaya Size Presets */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold block">مقاسات العبايات:</span>
                        <div className="flex flex-wrap gap-1">
                          {PRESET_ABAYA_SIZES.map((s) => {
                            const isSel = (editingProduct.sizes || []).includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  const current = editingProduct.sizes || [];
                                  const updated = isSel ? current.filter((x) => x !== s) : [...current, s];
                                  setEditingProduct({ ...editingProduct, sizes: updated });
                                }}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded border cursor-pointer ${
                                  isSel
                                    ? 'bg-[#34452D] text-white border-[#34452D]'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                                }`}
                              >
                                {isSel ? `✓ ${s}` : `+ ${s}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Size Input */}
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={editCustomSizeInput}
                          onChange={(e) => setEditCustomSizeInput(e.target.value)}
                          placeholder="مقاس مخصص..."
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (editCustomSizeInput.trim()) {
                                const current = editingProduct.sizes || [];
                                if (!current.includes(editCustomSizeInput.trim())) {
                                  setEditingProduct({
                                    ...editingProduct,
                                    sizes: [...current, editCustomSizeInput.trim()],
                                  });
                                  setEditCustomSizeInput('');
                                }
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editCustomSizeInput.trim()) {
                              const current = editingProduct.sizes || [];
                              if (!current.includes(editCustomSizeInput.trim())) {
                                setEditingProduct({
                                  ...editingProduct,
                                  sizes: [...current, editCustomSizeInput.trim()],
                                });
                                setEditCustomSizeInput('');
                              }
                            }
                          }}
                          className="px-2.5 py-1 bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          إضافة
                        </button>
                      </div>
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
