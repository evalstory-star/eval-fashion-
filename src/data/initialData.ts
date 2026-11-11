import { Product, StoreSettings, Review } from '../types/store';

export const INITIAL_SETTINGS: StoreSettings = {
  announcement: '✨ لمنتظري الذوق الرفيع... تشكيلة الموسم الجديد من EVAL متوفرة الآن مع الشحن لجميع محافظات مصر',
  showAnnouncement: true,
  heroBg: '/src/assets/images/hero_eval_fashion_1794089555582.jpg',
  heroBadge: 'الأزياء الراقية والعبايات',
  heroTitle: 'EVAL | إيفال',
  heroDesc: 'كل حكاية جميلة تبدأ بتفاصيل صغيرة... نجمع لكِ بين الأناقة، الاحتشام والراحة، حيث لكل تفصيلة معنى ولكل قطعة حكاية فريدة تليق بذوقك الرفيع.',
  logoText: 'EVAL',
  logoSubtitle: 'راحة تليق بك',
  logoUrl: './assets/brand/eval_app_icon_dark.png',
  whatsapp: '201108396536',
  facebook: 'https://www.facebook.com/share/1GwJYnjzeE/',
  instagram: 'https://www.instagram.com/eval_store_fashion?psln=ejN5dTl4czhxdDE=',
  aboutText: 'نؤمن في EVAL بأن الأناقة الحقيقية هي انعكاس للشخصية والفرادة. وُلدت علامتنا لتلبي تطلعات أصحاب الذوق الرفيع في مصر والوطن العربي، حيث ندمج أصالة التصميم بحداثة الموضة المعاصرة لنقدم لكم قطعاً حصرية صُنعت بكل عناية وإتقان بأعلى خامات النسيج.',
  contactText: 'يسعدنا دائماً تواصلكم واستقبال استفساراتكم واقتراحاتكم. فريق خدمة العملاء في EVAL في خدمتكم على مدار الساعة عبر الواتساب ومواقع التواصل.',
  categories: ['عبايات', 'طرح', 'فساتين', 'ملابس كاجوال'],
  payments: {
    cod: true,
    instapay: true,
    visa: true,
    bank: true,
  },
};

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const STORE_CATEGORIES = ['الكل', 'عبايات', 'طرح', 'فساتين', 'ملابس كاجوال'];

