import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Award,
  Calendar,
} from 'lucide-react';
import { Product } from '../types/store';

interface SalesAnalyticsProps {
  products: Product[];
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ products }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // Simple daily sales data
  const salesData7d = [
    { day: 'السبت', sales: 12400, orders: 8 },
    { day: 'الأحد', sales: 18900, orders: 12 },
    { day: 'الإثنين', sales: 15200, orders: 10 },
    { day: 'الثلاثاء', sales: 22800, orders: 15 },
    { day: 'الأربعاء', sales: 26400, orders: 18 },
    { day: 'الخميس', sales: 34500, orders: 24 },
    { day: 'الجمعة', sales: 42100, orders: 29 },
  ];

  const salesData30d = [
    { day: 'الأسبوع 1', sales: 86000, orders: 58 },
    { day: 'الأسبوع 2', sales: 104000, orders: 72 },
    { day: 'الأسبوع 3', sales: 128000, orders: 89 },
    { day: 'الأسبوع 4', sales: 146000, orders: 104 },
  ];

  const activeData = timeRange === '7d' ? salesData7d : salesData30d;

  // Best selling products
  const topProducts = [
    { name: 'عباية نوار كريب فاخرة', sold: 48, revenue: 69600, category: 'عبايات' },
    { name: 'فستان حرير زمردي ملوكي', sold: 34, revenue: 64260, category: 'فساتين' },
    { name: 'طرحة شيفون حرير باريسية', sold: 82, revenue: 31160, category: 'طرح' },
    { name: 'طقم كاجوال كتان راقٍ', sold: 29, revenue: 36250, category: 'ملابس كاجوال' },
  ];

  // Category sales distribution
  const categoryStats = [
    { name: 'عبايات', percent: 45, color: '#064e3b' },
    { name: 'فساتين', percent: 30, color: '#047857' },
    { name: 'طرح', percent: 15, color: '#d97706' },
    { name: 'كاجوال', percent: 10, color: '#78716c' },
  ];

  const totalRevenue = useMemo(() => {
    return activeData.reduce((sum, item) => sum + item.sales, 0);
  }, [activeData]);

  const totalOrders = useMemo(() => {
    return activeData.reduce((sum, item) => sum + item.orders, 0);
  }, [activeData]);

  const avgOrderValue = Math.round(totalRevenue / (totalOrders || 1));

  return (
    <div className="space-y-6 text-stone-900">
      {/* 4 Clean Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">إجمالي المبيعات</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900 tabular-nums">
            {totalRevenue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-stone-500">ج.م</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% عن الفترة السابقة</span>
          </span>
        </div>

        {/* Card 2: Orders */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">عدد الطلبات</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900 tabular-nums">
            {totalOrders} <span className="text-xs font-bold text-stone-500">طلب</span>
          </div>
          <span className="text-[10px] font-semibold text-stone-500">مكتمل ومؤكد عبر واتساب</span>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">متوسط قيمة الطلب</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900 tabular-nums">
            {avgOrderValue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-stone-500">ج.م</span>
          </div>
          <span className="text-[10px] font-semibold text-stone-500">لكل عملية شراء</span>
        </div>

        {/* Card 4: Top Seller */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">القطعة الأكثر طلباً</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-black text-stone-900 line-clamp-1">
            عباية نوار كريب
          </div>
          <span className="text-[10px] font-bold text-purple-700">48 قطعة مباعة</span>
        </div>
      </div>

      {/* Main Chart: Sales Performance */}
      <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              <span>مخطط نمو المبيعات (ج.م)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">متابعة إيرادات المتجر بحسب الأيام</p>
          </div>

          {/* Time range toggle */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === '7d' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === '30d' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              آخر 30 يوم
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#78716c' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value: any) => [`${Number(value).toLocaleString('ar-EG')} ج.م`, 'المبيعات']}
                labelStyle={{ fontWeight: 'bold', color: '#1c1917' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
              />
              <Bar dataKey="sales" fill="#064e3b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Top Sellers & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Sellers Table */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-800" />
            <span>المنتجات الأكثر مبيعاً في إيفال:</span>
          </h4>

          <div className="space-y-2.5">
            {topProducts.map((prod, idx) => (
              <div
                key={prod.name}
                className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs border border-stone-100"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-stone-900">{prod.name}</h5>
                    <span className="text-[11px] text-stone-500">{prod.category}</span>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="font-extrabold text-stone-900 block">{prod.revenue.toLocaleString('ar-EG')} ج.م</span>
                  <span className="text-[10px] text-stone-500">{prod.sold} طلب</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-800" />
            <span>نسبة مبيعات الأقسام:</span>
          </h4>

          <div className="space-y-3 pt-1">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-stone-700">
                  <span>{cat.name}</span>
                  <span>{cat.percent}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 font-medium leading-relaxed">
            ✨ قسم <strong>العبايات</strong> يمثل 45% من مجمل طلبات المتجر، يليه قسم <strong>الفساتين</strong> بنسبة 30%.
          </div>
        </div>
      </div>
    </div>
  );
};
