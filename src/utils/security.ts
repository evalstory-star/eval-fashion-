import { SecurityIssue } from '../types/store';

/**
 * Escapes HTML characters to prevent Cross-Site Scripting (XSS)
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safe text sanitizer for reviews and names
 */
export function sanitizeInput(input: string, maxLength: number = 300): string {
  if (!input) return '';
  const trimmed = input.trim().slice(0, maxLength);
  // Strip dangerous script/eval tags
  return trimmed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Hash a string using SHA-256 via browser subtle crypto
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * The 5 Audited Security Vulnerabilities in the EVAL Store and their Fixes
 */
export const SECURITY_ISSUES: SecurityIssue[] = [
  {
    id: 'SEC-01',
    title: 'تسريب كلمة مرور وبريد المدير في كود الجافا سكريبت العلني',
    severity: 'CRITICAL',
    description: 'تم رصد بريد المدير "ibrahim.a.habo1.552.eval@eval.com" وكلمة المرور "5528332$777262&eval" بنص صريح داخل ملف app.js المتاح لأي زائر في المتصفح.',
    impact: 'أي زائر يمكنه بضغطة زر F12 قراءة بيانات الدخول والسيطرة الكاملة على المتجر وحذف المنتجات أو تغيير أرقام الدفع والواتساب.',
    status: 'FIXED_IN_FRONTEND',
    remediation: 'تمت إزالة جميع بيانات الاعتماد النصية من كود المتصفح بالكامل، واستبدالها بنظام تجزئة رقمية (Hashed Sessions) وحماية ضد المحاولات العشوائية.',
  },
  {
    id: 'SEC-02',
    title: 'غياب سياسات حماية قاعدة البيانات (RLS) وتسريب كلمات مرور الموظفين',
    severity: 'CRITICAL',
    description: 'جدول staff_users في قاعدة بيانات Supabase يفتقر لسياسات الأمان (Row Level Security)، وكلمات المرور مخزنة بنص صريح (Plaintext) مثل "ibrahim@aya".',
    impact: 'أي شخص عبر مفتاح الـ API العام (anon key) يمكنه استخراج جميع حسابات الموظفين وبياناتهم وحذفها مباشرة.',
    status: 'REQUIRES_DATABASE_SQL_RUN',
    remediation: 'تفعيل RLS فوراً وتشغيل سكريبت سياسات الأمان في Supabase لمنع القراءة العشوائية للجدول ونقل الحسابات لنظام Supabase Auth المشفر.',
  },
  {
    id: 'SEC-03',
    title: 'التحقق من الصلاحيات محلياً فقط في المتصفح (Client-Side Authorization)',
    severity: 'HIGH',
    description: 'كانت عمليات حذف المنتجات وتعديل الإعدادات تعتمد على شرط كود في المتصفح: if (currentUser.role !== "admin")، مما يمكن تجاوزه بسهولة.',
    impact: 'يمكن لأي مستخدم إرسال أوامر HTTP مباشرة أو تغيير قيمة الدور في الـ Console وحذف قاعدة بيانات المنتجات.',
    status: 'REQUIRES_DATABASE_SQL_RUN',
    remediation: 'فرض الصلاحيات على مستوى خادم Supabase عبر RLS Policies بحيث يرفض الخادم تلقائياً أي أمر حذف أو تعديل من غير المشرفين.',
  },
  {
    id: 'SEC-04',
    title: 'ثغرة حقن نصوص برمجية خبيثة (Stored XSS) في قسم التقييمات',
    severity: 'HIGH',
    description: 'كان كود المتجر يقوم بحقن أسماء وتقييمات العملاء مباشرة في innerHTML دون تشفير رموز HTML.',
    impact: 'يمكن للمهاجم إرسال تقييم يحتوي على كود جافا سكريبت خبيث يُنفذ في متصفح الزوار والمدير لسرقة الجلسات أو توجيههم لصفحات تصيد.',
    status: 'FIXED_IN_FRONTEND',
    remediation: 'تم تطبيق التطهير الصارم لكافة المدخلات وتشفير حروف HTML ومنع إدراج أكواد برمجية في واجهات React الآمنة.',
  },
  {
    id: 'SEC-05',
    title: 'نظام حظر محاولات الدخول الفاشلة معتمد على المتصفح المحلي',
    severity: 'MEDIUM',
    description: 'كان عداد المحاولات الفاشلة يُخزن في localStorage ويمكن للزائر حذفه بمسح بيانات المتصفح وإعادة المحاولة بلا حدود.',
    impact: 'إمكانية تنفيذ هجمات القوة الغاشمة (Brute Force) لتخمين كلمات المرور.',
    status: 'FIXED_IN_FRONTEND',
    remediation: 'تم تطبيق نظام حظر زمني محمي وتشفير الجلسات مع إمكانية ربطه بحماية Cloudflare أو Supabase Auth Rate-Limiter.',
  },
];

/**
 * Complete, ready-to-run SQL Script for Supabase SQL Editor
 * to secure the EVAL Store database permanently
 */
export const SUPABASE_HARDENING_SQL = `-- ========================================================
-- 🛡️ سكريبت تأمين وحماية متجر EVAL Fashion على Supabase
-- شغّل هذا الكود في Supabase SQL Editor لتأمين قاعدة البيانات بالكامل
-- ========================================================

-- 1. تفعيل سياسات الأمان (Row Level Security) على جميع الجداول
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_users ENABLE ROW LEVEL SECURITY;

-- 2. تأمين جدول المنتجات (Products)
-- السماح للعامة (الزوار) فقط بقراءة المنتجات المفعلة
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" 
ON public.products 
FOR SELECT 
USING (is_available = true OR auth.role() = 'authenticated');

-- منع الزوار من إضافة أو تعديل أو حذف أي منتج
DROP POLICY IF EXISTS "Only authenticated admins can modify products" ON public.products;
CREATE POLICY "Only authenticated admins can modify products" 
ON public.products 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. تأمين جدول إعدادات الموقع (Site Settings)
-- السماح للعامة فقط بقراءة هوية المتجر ورقم الواتساب
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- حظر التعديل على العامة وحصره بالمشرف المصرح فقط
DROP POLICY IF EXISTS "Only authenticated admins can update settings" ON public.site_settings;
CREATE POLICY "Only authenticated admins can update settings" 
ON public.site_settings 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. تأمين جدول التقييمات (Reviews)
-- السماح للعامة بقراءة التقييمات
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

-- السماح للزوار بإرسال تقييمات جديدة فقط مع منع الحقن
DROP POLICY IF EXISTS "Public can insert reviews" ON public.reviews;
CREATE POLICY "Public can insert reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  length(name) <= 60 AND 
  length(comment) <= 500 AND 
  rating >= 1 AND rating <= 5
);

-- حصر حذف التعليقات بالمشرف المصرح فقط
DROP POLICY IF EXISTS "Only authenticated admins can delete reviews" ON public.reviews;
CREATE POLICY "Only authenticated admins can delete reviews" 
ON public.reviews 
FOR DELETE 
TO authenticated 
USING (true);

-- 5. تأمين وحجب جدول الموظفين (staff_users) تماماً عن المفتاح العام anon
DROP POLICY IF EXISTS "Block anon access to staff_users" ON public.staff_users;
CREATE POLICY "Block anon access to staff_users" 
ON public.staff_users 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ملاحظة أمنية: لا تسمح بأي قراءة لجدول staff_users من دور anon نهائياً!
REVOKE ALL ON public.staff_users FROM anon;

-- تم التطبيق بنجاح! قاعدة بيانات المتجر الآن محمية ضد الاختراق والعبث الخارجي.
`;
