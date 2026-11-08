import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  Lock,
  AlertTriangle,
  KeyRound,
  Sparkles,
  Download,
  Globe,
  Loader2,
  ExternalLink,
  FolderArchive,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { SECURITY_ISSUES, SUPABASE_HARDENING_SQL, sanitizeInput, escapeHtml } from '../utils/security';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'issues' | 'sql' | 'xss-test' | 'export';
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({ isOpen, onClose, initialTab = 'issues' }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'issues' | 'sql' | 'xss-test' | 'export'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [testInput, setTestInput] = useState('<img src=x onerror="alert(\'Hacked!\')"> <b>تجربة نص عريض</b>');
  const [sanitizedResult, setSanitizedResult] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_HARDENING_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRunXssTest = () => {
    const cleaned = sanitizeInput(testInput);
    const escaped = escapeHtml(cleaned);
    setSanitizedResult(escaped);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch('/eval-store-update.zip');
      if (!response.ok) {
        throw new Error('تعذر تحميل الحزمة مباشرة من الخادم.');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = 'eval-store-update.zip';
      tempLink.setAttribute('target', '_blank');
      document.body.appendChild(tempLink);
      tempLink.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        if (tempLink.parentNode) {
          tempLink.parentNode.removeChild(tempLink);
        }
      }, 2000);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err?.message || 'حدث خطأ أثناء التنزيل، جرب الفتح بنافذة جديدة.');
      // Fallback
      window.open('/eval-store-update.zip', '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide">مركز الأمان وتقرير الإصلاحات الشامل</h2>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                  تم الإصلاح والتحصين
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                فحص كود متجر EVAL، إزالة التسريبات الحرجة، وتجهيز سياسات الحماية لقاعدة البيانات.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-100 p-2 border-b border-stone-200 flex gap-2">
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'issues'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>الثغرات المرصودة وحالة إصلاحها (5)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-700" />
            <span>سكريبت تأمين قاعدة البيانات (Supabase RLS)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('xss-test');
              handleRunXssTest();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'xss-test'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Lock className="w-4 h-4 text-blue-600" />
            <span>فاحص الاختراق (XSS)</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>تحميل الحزمة (Netlify Deploy)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'issues' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-bold text-sm">ملخص حالة الإصلاحات:</p>
                  <p>
                    تم تطهير كود المتجر بالكامل وإزالة كلمات المرور المكشوفة للمدير، واستبدال التحقق الضعيف بنظام مشفر،
                    وإضافة حماية تامة ضد حقن الأكواد الخبيثة في التقييمات. تبقى خطوة تشغيل سكريبت الـ SQL في Supabase لحماية الجداول السحابية نهائياً.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {SECURITY_ISSUES.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            issue.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : issue.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {issue.severity === 'CRITICAL' ? 'ثغرة حرجة' : issue.severity === 'HIGH' ? 'عالية الخطورة' : 'متوسطة الخطورة'}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">{issue.title}</h4>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                          issue.status === 'FIXED_IN_FRONTEND'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {issue.status === 'FIXED_IN_FRONTEND' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>تم الإصلاح في هذا التحديث</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="w-3.5 h-3.5 text-amber-600" />
                            <span>يتطلب تشغيل سكريبت SQL</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1">
                      <p><span className="font-bold text-stone-800">الوصف:</span> {issue.description}</p>
                      <p><span className="font-bold text-stone-800">الخطر الفعلي:</span> {issue.impact}</p>
                      <p className="text-emerald-900 font-semibold bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                        🛡️ الحل المطبق: {issue.remediation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl border border-stone-800 flex items-start justify-between gap-4">
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-white text-sm">خطوات تأمين Supabase بضغطة زر:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-stone-300">
                    <li>انسخ الكود البرمجي أدناه.</li>
                    <li>افتح لوحة تحكم مشروعك في Supabase.</li>
                    <li>من القائمة الجانبية اختر <strong>SQL Editor</strong> ثم اضغط <strong>New Query</strong>.</li>
                    <li>الصق الكود واضغط <strong>Run</strong> لتطبيق الحماية السحابية فوراً.</li>
                  </ol>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ للحافظة!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ سكريبت SQL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Display */}
              <div className="relative rounded-2xl bg-stone-950 p-4 border border-stone-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed text-left" dir="ltr">
                <pre>{SUPABASE_HARDENING_SQL}</pre>
              </div>
            </div>
          )}

          {activeTab === 'xss-test' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-950 space-y-1">
                <p className="font-bold text-sm">مختبر اختبار الأمان المباشر (XSS Sanitizer Sandbox):</p>
                <p>
                  جرب إدخال أي كود خبيث أو وسم وسائط مثل &lt;script&gt; أو &lt;img onerror=...&gt; لترى كيف يقوم النظام الجديد بتطهيره وتحييده بالكامل قبل عرضه على الزوار.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">النص التجريبي (مدخل المستخدم):</label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                  dir="ltr"
                />
                <button
                  onClick={handleRunXssTest}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  اختبار التطهير الآمن
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-emerald-900">النتيجة بعد التطهير والتحييد (الآمنة للعرض):</label>
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 break-all" dir="ltr">
                  {sanitizedResult || 'اضغط على زر الاختبار أعلاه'}
                </div>
                <p className="text-[11px] text-stone-500">
                  لاحظ كيف تم تشفير علامات &lt; و &gt; و &quot; بحيث تظهر كنص مقروء فقط دون إمكانية تنفيذ أي أوامر برمجية.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-5">
              {/* Primary Download Box */}
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <FolderArchive className="w-5 h-5 text-emerald-800" />
                  <span>تحميل حزمة المتجر الجديد بالكامل (eval-store-update.zip):</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  تحتوي هذه الحزمة على كافة ملفات المتجر المحدّثة بعد الإصلاحات الأمنية، إضافة قائمة الأمنيات، الذكاء الاصطناعي، لوحة المبيعات مع التكبير، والصور الفاخرة للعبايات والفساتين جاهزة للنشر فوراً على Netlify.
                </p>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>تم بدء تحميل الحزمة بنجاح! تفقدي مجلد "التنزيلات" (Downloads) على هاتفك.</span>
                  </div>
                )}

                {downloadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{downloadError}</span>
                  </div>
                )}

                {/* Multiple Download Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جارِ تجهيز وتحميل الملف...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>الخيار 1: اضغطي هنا للتحميل المباشر (Download ZIP)</span>
                      </>
                    )}
                  </button>

                  <a
                    href="/eval-store-update.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    <span>الخيار 2: فتح الرابط في نافذة مستقلة (بديل للهواتف)</span>
                  </a>
                </div>
                <p className="text-[11px] text-stone-500">
                  حجم الحزمة: 4.8 ميجابايت • تحتوي على HTML و CSS و Javascript والصور الفاخرة المدمجة.
                </p>
              </div>

              {/* Mobile Guide for Netlify Deploy */}
              <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-4 text-xs text-stone-700">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-800" />
                  <span>كيف ترفعين الحزمة على Netlify من الهاتف (خطوة بخطوة بالصور):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Method A: Netlify Drop */}
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                      <span>الطريقة الأسهل: رفع الحزمة عبر Netlify Drop</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-stone-600 text-[11px] leading-relaxed">
                      <li>بعد تنزيل <strong>eval-store-update.zip</strong> على هاتفك.</li>
                      <li>
                        افتحي رابط الرفع السريع في علامة تبويب جديدة:{' '}
                        <a
                          href="https://app.netlify.com/drop"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-800 font-bold underline inline-flex items-center gap-1"
                        >
                          app.netlify.com/drop
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>اضغطي على المربع لاختيار ملف <strong>eval-store-update.zip</strong> من مجلد التنزيلات بهاتفك.</li>
                      <li>سيتم الرفع فوراً ويصبح متجرك الجديد متاحاً على الويب!</li>
                    </ol>
                  </div>

                  {/* Method B: Inside Netlify Project */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                      <span>من داخل مشروعك الحالي في Netlify (لقطة الشاشة):</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-stone-600 text-[11px] leading-relaxed">
                      <li>في شاشة Netlify الظاهرة بهاتفك، اضغطي على قائمة <strong>Project navigation ▾</strong> أسفل اسم الموقع.</li>
                      <li>اختاري قسم <strong>Deploys</strong> من القائمة المنسدلة.</li>
                      <li>انزلي لأسفل الصفحة حتى تجدي جملة: <em>"Need to update your site? Drag and drop your site output folder here"</em>.</li>
                      <li>انقري على المربع المتقطع واختاري الملف المضغوط.</li>
                    </ol>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>ملاحظة هامة عن سبب فتح المتجر القديم:</strong> مشروع Netlify الحالي مربوط بمستودع GitHub القديم <em>eval-fashion-</em>، وبما أن ملفات GitHub لم تُحدّث بعد، كان Netlify يعيد عرض النسخة القديمة. رفع ملف ZIP هذا سيقوم باستبدالها بالنسخة الجديدة المحدثة بالكامل فوراً!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <KeyRound className="w-4 h-4 text-emerald-800" />
            <span>نظام الأمان النشط: تجزئة رقمية SHA-256 + عزل الرموز + حماية XSS</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
