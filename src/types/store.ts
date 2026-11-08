export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  fabric: string;
  description: string;
  sizes: string[];
  colors: string[];
  imageUrl: string;
  images: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  imageUrl: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
}

export interface StoreSettings {
  announcement: string;
  showAnnouncement?: boolean;
  heroBg: string;
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  logoText?: string;
  logoSubtitle?: string;
  logoUrl?: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  aboutText: string;
  contactText: string;
  categories?: string[];
  payments: {
    cod: boolean;
    instapay: boolean;
    visa: boolean;
    bank: boolean;
  };
}

export interface SecurityIssue {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  impact: string;
  status: 'FIXED_IN_FRONTEND' | 'REQUIRES_DATABASE_SQL_RUN';
  remediation: string;
  codeSnippet?: string;
}

export interface StaffPermissions {
  canViewSales: boolean;
  canManageProducts: boolean;
  canManageCategories: boolean;
  canEditSettings: boolean;
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  permissions: StaffPermissions;
  createdAt: string;
}

