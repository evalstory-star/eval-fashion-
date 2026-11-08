import { StaffAccount } from '../types/store';

export const SUPABASE_CONFIG = {
  url: 'https://nrrujezwgyuivzxqvjxh.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnVqZXp3Z3l1aXZ6eHF2anhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTExMDEsImV4cCI6MjEwOTM2NzEwMX0.h2YArv0ru7kWK5wU60fO-VjtHIuYUQLBk9SkRJ6gBRw',
  syncFileName: 'eval_staff_sync.json',
};

// Default fallback staff account available on any device
export const DEFAULT_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'staff-default-01',
    name: 'فريق العمل المعتمد',
    email: 'staff@eval-fashion.com',
    passwordHash: '8681283a0058b87192a2a07c1b527582b2cb8211db4cfb87b749ee586738914b', // SHA-256 for 'eval@staff2026'
    role: 'staff',
    createdAt: new Date().toISOString(),
    isActive: true,
    permissions: {
      canViewSales: true,
      canManageProducts: true,
      canManageCategories: true,
      canEditSettings: false,
    },
  },
];

/**
 * Fetch staff accounts from Supabase cloud storage (real-time cross-device sync)
 */
export async function fetchCloudStaffAccounts(): Promise<StaffAccount[]> {
  try {
    const publicUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/product-images/${SUPABASE_CONFIG.syncFileName}?t=${Date.now()}`;
    const response = await fetch(publicUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as StaffAccount[];
      }
    }
  } catch (err) {
    console.warn('Could not fetch staff accounts from Supabase cloud:', err);
  }

  // Fallback to local storage if available
  try {
    const saved = localStorage.getItem('eval_staff_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  return DEFAULT_STAFF_ACCOUNTS;
}

/**
 * Save staff accounts to Supabase cloud storage so all phones see updates instantly
 */
export async function syncStaffAccountsToCloud(accounts: StaffAccount[]): Promise<boolean> {
  // Always update localStorage first for instant local response
  try {
    localStorage.setItem('eval_staff_accounts', JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }

  try {
    const uploadUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/product-images/${SUPABASE_CONFIG.syncFileName}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: JSON.stringify(accounts),
    });

    return response.ok;
  } catch (err) {
    console.warn('Failed to sync staff accounts to Supabase cloud:', err);
    return false;
  }
}
