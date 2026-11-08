import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Send, ShieldCheck, ArrowRight } from 'lucide-react';
import { CartItem, StoreSettings } from '../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('الدفع عند الاستلام');
  const [orderNotes, setOrderNotes] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    let msg = `✨ *طلب جديد من متجر EVAL للأزياء* ✨\n\n`;
    msg += `👤 *اسم العميل:* ${customerName.trim() || 'غير محدد'}\n`;
    msg += `📱 *رقم الهاتف:* ${customerPhone.trim() || 'غير محدد'}\n`;
    msg += `📍 *عنوان التوصيل:* ${customerAddress.trim() || 'يرجى التنسيق'}\n`;
    msg += `💳 *طريقة الدفع:* ${paymentMethod}\n`;
    if (orderNotes.trim()) {
      msg += `📝 *ملاحظات:* ${orderNotes.trim()}\n`;
    }
    msg += `\n🛍️ *تفاصيل الطلب:*\n`;

    cart.forEach((item, index) => {
      msg += `\n*(${index + 1}) ${item.name}*\n`;
      msg += `  - المقاس: ${item.size}\n`;
      msg += `  - اللون: ${item.color}\n`;
      msg += `  - الكمية: ${item.quantity}\n`;
      msg += `  - السعر: ${item.price * item.quantity} ج.م\n`;
    });

    msg += `\n💰 *الإجمالي النهائي:* ${totalAmount.toLocaleString('ar-EG')} ج.م\n`;
    msg += `\n_تم إرسال هذا الطلب عبر موقع متجر إيفال_`;

    const cleanNumber = settings.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-900" />
            <h2 className="text-base font-bold text-stone-900">حقيبة التسوق</h2>
            <span className="text-xs text-stone-500 tabular-nums font-semibold">({cart.length} منتجات)</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 cursor-pointer"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-sm">حقيبة التسوق فارغة</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                تصفحي تشكيلة أزياء وعبايات إيفال الحصرية وأضيفي قطعك المفضلة لبدء الطلب.
              </p>
              <button
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <span>تصفح المنتجات</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/70"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-200"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>المقاس: {item.size}</span>
                      <span>·</span>
                      <span>اللون: {item.color}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-stone-900 tabular-nums">
                        {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
                      </span>

                      <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="حذف القطعة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  إفراغ الحقيبة
                </button>
              </div>

              {/* Customer Information Form */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-900">بيانات التوصيل وتأكيد الطلب</h4>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: ياسمين أحمد"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">رقم الهاتف (واتساب)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">المحافظة والعنوان بالتفصيل</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="مثال: القاهرة، المعادي، شارع النصر..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">طريقة الدفع المفضلة</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                  >
                    <option value="الدفع عند الاستلام">الدفع عند الاستلام (COD)</option>
                    <option value="إنستاباي (InstaPay)">إنستاباي (InstaPay)</option>
                    <option value="فيزا / ماستركارد">بطاقة بنكية (فيزا / ماستركارد)</option>
                    <option value="تحويل بنكي">تحويل بنكي مباشر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">ملاحظات إضافية (اختياري)</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="أي تعديل في الطول أو ميعاد التوصيل..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-stone-600">المجموع الكلي:</span>
              <span className="text-xl font-black text-stone-900 tabular-nums">
                {totalAmount.toLocaleString('ar-EG')} <span className="text-xs font-bold">ج.م</span>
              </span>
            </div>

            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال وتأكيد الطلب عبر واتساب</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>سيتم تجهيز طلبك والتواصل معك لتأكيد موعد الشحن</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
