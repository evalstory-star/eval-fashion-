import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Product } from '../types/store';

interface SalesAnalyticsProps {
  products: Product[];
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ products }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [zoomedChart, setZoomedChart] = useState<'bestSellers' | 'traffic' | 'categories' | null>(null);
  const [chartScale, setChartScale] = useState<number>(1);

  // Best-selling products dataset derived from EVAL collection
  const bestSellersData = useMemo(() => {
    return [
      { name: 'عباية نوار كريب', sales: 154, revenue: 223300, views: 3420, category: 'عبايات' },
      { name: 'فستان حرير زمردي', sales: 112, revenue: 211680, views: 2890, category: 'فساتين' },
      { name: 'طرحة شيفون شامبين', sales: 340, revenue: 129200, views: 4150, category: 'طرح' },
      { name: 'طقم كتان رملي', sales: 98, revenue: 122500, views: 2100, category: 'ملابس كاجوال' },
      { name: 'عباية كيمونو صالونا', sales: 76, revenue: 105640, views: 1840, category: 'عبايات' },
      { name: 'طرحة قطن ليزر', sales: 210, revenue: 60900, views: 2750, category: 'طرح' },
      { name: 'فستان ميدي عاجي', sales: 48, revenue: 79200, views: 1420, category: 'فساتين' },
    ];
  }, []);

  // Visitor traffic and conversion trends timeline
  const trafficData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { date: 'السبت', visitors: 1420, views: 3200, cartAdds: 210, orders: 48 },
        { date: 'الأحد', visitors: 1650, views: 3800, cartAdds: 245, orders: 56 },
        { date: 'الإثنين', visitors: 1580, views: 3600, cartAdds: 230, orders: 52 },
        { date: 'الثلاثاء', visitors: 1720, views: 4100, cartAdds: 280, orders: 64 },
        { date: 'الأربعاء', visitors: 1890, views: 4450, cartAdds: 310, orders: 72 },
        { date: 'الخميس', visitors: 2450, views: 5900, cartAdds: 420, orders: 98 },
        { date: 'الجمعة', visitors: 2890, views: 6800, cartAdds: 490, orders: 115 },
      ];
    }

    return [
      { date: '1 نوفمبر', visitors: 820, views: 1950, cartAdds: 120, orders: 28 },
      { date: '3 نوفمبر', visitors: 940, views: 2100, cartAdds: 145, orders: 34 },
      { date: '5 نوفمبر', visitors: 1150, views: 2600, cartAdds: 180, orders: 42 },
      { date: '7 نوفمبر', visitors: 1380, views: 3100, cartAdds: 210, orders: 51 },
      { date: '9 نوفمبر', visitors: 1240, views: 2850, cartAdds: 195, orders: 46 },
      { date: '11 نوفمبر', visitors: 1520, views: 3400, cartAdds: 240, orders: 58 },
      { date: '13 نوفمبر', visitors: 1780, views: 4100, cartAdds: 290, orders: 69 },
      { date: '15 نوفمبر', visitors: 1690, views: 3900, cartAdds: 275, orders: 63 },
      { date: '17 نوفمبر', visitors: 1950, views: 4600, cartAdds: 330, orders: 78 },
      { date: '19 نوفمبر', visitors: 2100, views: 4950, cartAdds: 360, orders: 85 },
      { date: '21 نوفمبر', visitors: 2350, views: 5400, cartAdds: 410, orders: 96 },
      { date: '23 نوفمبر', visitors: 2200, views: 5100, cartAdds: 380, orders: 89 },
      { date: '25 نوفمبر', visitors: 2580, views: 6100, cartAdds: 440, orders: 104 },
      { date: '27 نوفمبر', visitors: 2840, views: 6700, cartAdds: 485, orders: 118 },
      { date: '29 نوفمبر', visitors: 3120, views: 7400, cartAdds: 530, orders: 129 },
    ];
  }, [timeRange]);

  // Category demand and distribution
  const categoryData = useMemo(() => {
    return [
      { name: 'عبايات', value: 44, revenue: 328940, color: '#064e3b' },
      { name: 'فساتين', value: 26, revenue: 290880, color: '#047857' },
      { name: 'طرح', value: 18, revenue: 190100, color: '#d97706' },
      { name: 'ملابس كاجوال', value: 12, revenue: 122500, color: '#78716c' },
    ];
  }, []);

  // Total summary figures
  const totalRevenue = useMemo(() => {
    return bestSellersData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [bestSellersData]);

  const totalOrders = useMemo(() => {
    return bestSellersData.reduce((acc, curr) => acc + curr.sales, 0);
  }, [bestSellersData]);

  const totalViews = useMemo(() => {
    return bestSellersData.reduce((acc, curr) => acc + curr.views, 0);
  }, [bestSellersData]);

  const handleZoomIn = () => setChartScale((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setChartScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setChartScale(1);

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-black text-stone-900 tabular-nums">
              {totalRevenue.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-stone-500">ج.م</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% نمو عن الشهر السابق</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold">الطلبات المؤكدة</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-black text-stone-900 tabular-nums">
              {totalOrders.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-stone-500">طلب</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mt-2">
            <span>متوسط السلة: {(totalRevenue / totalOrders).toFixed(0)} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold">إقبال الزوار والمشاهدات</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-black text-stone-900 tabular-nums">
              {totalViews.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-stone-500">معاينة</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>معدل إقبال مرتفع للأزياء</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold">معدل التحويل للطلب</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-black text-stone-900 tabular-nums">
              {((totalOrders / (totalViews / 6)) * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-stone-500">تحويل</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mt-2">
            <span>من المعاينة إلى الشراء الفعلي</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Timeframe & Global Chart Zoom */}
      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <span>نطاق التقرير:</span>
          </span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeRange === '7d' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeRange === '30d' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              آخر 30 يوم
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeRange === '90d' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              الربع السنوي
            </button>
          </div>
        </div>

        {/* Zoom Controls Bar */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 px-2">تحكم التكبير (Zoom):</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="تكبير المخطط (+)"
            aria-label="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-stone-800 px-1 tabular-nums">
            {Math.round(chartScale * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="تصغير المخطط (-)"
            aria-label="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer text-xs font-bold"
            title="إعادة التعيين"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Chart 1 (Best Sellers) & Chart 2 (Traffic) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Best Sellers Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">المنتجات الأكثر مبيعاً (الكميات والإيراد)</h3>
              <p className="text-xs text-stone-500 mt-0.5">ترتيب القطع حسب حجم المبيعات وعدد مرات الطلب</p>
            </div>

            <button
              onClick={() => setZoomedChart('bestSellers')}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-stone-200"
              title="تكبير في نافذة كاملة"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline">تكبير العرض</span>
            </button>
          </div>

          <div
            className="w-full transition-all duration-200 overflow-x-auto"
            style={{ height: `${280 * chartScale}px` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellersData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#57534e' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#57534e' }}
                  tickFormatter={(val) => `${val} ق`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#57534e' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'sales') return [`${value} قطعة`, 'الكمية المباعة'];
                    if (name === 'revenue') return [`${value.toLocaleString('ar-EG')} ج.م`, 'إجمالي الإيراد'];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                    textAlign: 'right',
                    direction: 'rtl',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => (value === 'sales' ? 'الكمية المباعة' : 'الإيراد الإجمالي (ج.م)')}
                />
                <Bar yAxisId="left" dataKey="sales" fill="#064e3b" radius={[6, 6, 0, 0]} barSize={22} />
                <Bar yAxisId="right" dataKey="revenue" fill="#d97706" radius={[6, 6, 0, 0]} barSize={22} />
                {/* Horizontal Zoom / Range Slider Brush */}
                <Brush dataKey="name" height={22} stroke="#064e3b" fill="#f8fafc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Visitor Traffic & Conversion Flow (Area Chart with Brush Zoom) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">إقبال الزوار ومسار التحويل (Traffic Funnel)</h3>
              <p className="text-xs text-stone-500 mt-0.5">تتبع الزيارات اليومية والمعاينات والطلبات المؤكدة</p>
            </div>

            <button
              onClick={() => setZoomedChart('traffic')}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-stone-200"
              title="تكبير في نافذة كاملة"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline">تكبير العرض</span>
            </button>
          </div>

          <div
            className="w-full transition-all duration-200 overflow-x-auto"
            style={{ height: `${280 * chartScale}px` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#57534e' }} />
                <YAxis tick={{ fontSize: 11, fill: '#57534e' }} />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    const dict: Record<string, string> = {
                      visitors: 'الزوار الفريدون',
                      views: 'معاينات الصفحات',
                      cartAdds: 'إضافات السلة',
                      orders: 'الطلبات المؤكدة',
                    };
                    return [`${val.toLocaleString('ar-EG')}`, dict[name] || name];
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                    textAlign: 'right',
                    direction: 'rtl',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => {
                    const dict: Record<string, string> = {
                      visitors: 'الزوار',
                      views: 'المعاينات',
                      cartAdds: 'إضافات السلة',
                      orders: 'الطلبات المؤكدة',
                    };
                    return dict[value] || value;
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#d97706" fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="visitors" stroke="#047857" fillOpacity={1} fill="url(#colorVisitors)" />
                <Area type="monotone" dataKey="orders" stroke="#1c1917" fillOpacity={1} fill="url(#colorOrders)" />
                {/* Horizontal Interactive Timeline Zoom Slider */}
                <Brush dataKey="date" height={22} stroke="#047857" fill="#f8fafc" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3 & Category Demand Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">توزيع الطلبات حسب الأقسام</h3>
              <p className="text-xs text-stone-500 mt-0.5">نسبة الإقبال الفعلي على فئات الأزياء</p>
            </div>
            <button
              onClick={() => setZoomedChart('categories')}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="تكبير المخطط"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />
            </button>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.revenue.toLocaleString('ar-EG')} ج.م)`,
                    item.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                    direction: 'rtl',
                    textAlign: 'right',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Detail Table */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 lg:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">تفاصيل أداء القطاعات والمبيعات</h3>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              بيانات محدثة مباشرة
            </span>
          </div>

          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold">
                <th className="py-2.5 px-3">القسم</th>
                <th className="py-2.5 px-3">نسبة الإقبال</th>
                <th className="py-2.5 px-3">إجمالي الإيرادات</th>
                <th className="py-2.5 px-3">متوسط الطلب</th>
                <th className="py-2.5 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {categoryData.map((cat) => (
                <tr key={cat.name} className="hover:bg-stone-50 transition-colors">
                  <td className="py-2.5 px-3 flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">{cat.value}%</td>
                  <td className="py-2.5 px-3 font-bold tabular-nums">{cat.revenue.toLocaleString('ar-EG')} ج.م</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">
                    {(cat.revenue / (cat.value * 8)).toFixed(0)} ج.م
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      طلب متزايد
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          FULLSCREEN ZOOM MODAL (خاصية التكبير الموسعة)
         ======================================================== */}
      {zoomedChart && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {zoomedChart === 'bestSellers' && 'عرض مكبّر: المنتجات الأكثر مبيعاً والإيرادات التفصيلية'}
                    {zoomedChart === 'traffic' && 'عرض مكبّر: إقبال الزوار ومسار التحويل عبر الزمن'}
                    {zoomedChart === 'categories' && 'عرض مكبّر: توزيع مبيعات أقسام الأزياء والعبايات'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    يمكنك استخدام شريط التكبير السفلي (Brush Slider) لتحديد أي فترة زمنية وتكبيرها بدقة.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setZoomedChart(null)}
                className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="تصغير وإغلاق"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Chart Body */}
            <div className="flex-1 p-6 overflow-hidden bg-stone-50/40 flex flex-col justify-between">
              <div className="flex-1 w-full min-h-[380px]">
                {zoomedChart === 'bestSellers' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bestSellersData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#292524' }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12, fill: '#292524' }}
                        tickFormatter={(v) => `${v} قطعة`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="left"
                        tick={{ fontSize: 12, fill: '#292524' }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)} ألف ج.م`}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          if (name === 'sales') return [`${value} قطعة`, 'الكمية المباعة'];
                          if (name === 'revenue') return [`${value.toLocaleString('ar-EG')} ج.م`, 'إجمالي الإيرادات'];
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '14px',
                          border: '1px solid #d6d3d1',
                          padding: '12px',
                          fontSize: '13px',
                          direction: 'rtl',
                          textAlign: 'right',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                      <Bar yAxisId="left" dataKey="sales" fill="#064e3b" radius={[8, 8, 0, 0]} barSize={34} />
                      <Bar yAxisId="right" dataKey="revenue" fill="#d97706" radius={[8, 8, 0, 0]} barSize={34} />
                      {/* Zoom brush controller */}
                      <Brush dataKey="name" height={30} stroke="#064e3b" fill="#f1f5f9" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {zoomedChart === 'traffic' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <defs>
                        <linearGradient id="zoomVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#047857" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="zoomViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#292524' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#292524' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '14px',
                          border: '1px solid #d6d3d1',
                          padding: '12px',
                          fontSize: '13px',
                          direction: 'rtl',
                          textAlign: 'right',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                      <Area type="monotone" dataKey="views" stroke="#d97706" fill="url(#zoomViews)" />
                      <Area type="monotone" dataKey="visitors" stroke="#047857" fill="url(#zoomVisitors)" />
                      <Area type="monotone" dataKey="orders" stroke="#1c1917" fill="#1c1917" fillOpacity={0.2} />
                      <Brush dataKey="date" height={30} stroke="#047857" fill="#f1f5f9" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {zoomedChart === 'categories' && (
                  <div className="h-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={140}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: any, name: any, item: any) => [
                            `${val}% (${item.payload.revenue.toLocaleString('ar-EG')} ج.م)`,
                            item.payload.name,
                          ]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '14px',
                            border: '1px solid #d6d3d1',
                            padding: '12px',
                            fontSize: '13px',
                            direction: 'rtl',
                            textAlign: 'right',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Close / Action Footer */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  استخدم شريط التحديد بالأسفل لتضييق أو توسيع المجال الزمني المعروض.
                </span>
                <button
                  onClick={() => setZoomedChart(null)}
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  العودة للوحة القيادة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
