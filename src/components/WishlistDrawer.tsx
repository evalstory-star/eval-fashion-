import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types/store';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
  onAddAllToCart: () => void;
  onClearWishlist: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart,
  onAddAllToCart,
  onClearWishlist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="text-base font-bold text-stone-900">قائمة الأمنيات والقطع المفضلة</h2>
            <span className="text-xs text-stone-500 tabular-nums font-semibold">({wishlist.length})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 cursor-pointer"
            aria-label="إغلاق قائمة الأمنيات"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-sm">قائمة أمنياتكِ فارغة</h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                اضغطي على أيقونة القلب في أي قطعة تعجبكِ لحفظها هنا والعودة إليها بسهولة في أي وقت.
              </p>
              <button
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <span>تصفح التشكيلة</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/70 hover:border-stone-300 transition-all"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-18 h-18 rounded-xl object-cover shrink-0 bg-stone-200"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] text-stone-500 font-semibold block">{item.category}</span>
                    <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-stone-900 tabular-nums">
                        {item.price.toLocaleString('ar-EG')} ج.م
                      </span>
                      {item.oldPrice && (
                        <span className="text-[10px] text-stone-400 line-through tabular-nums">
                          {item.oldPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      )}
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => onMoveToCart(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>إضافة للحقيبة</span>
                      </button>

                      <button
                        onClick={() => onRemoveFromWishlist(item.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="حذف من الأمنيات"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClearWishlist}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  مسح جميع المحفوظات
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {wishlist.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-2.5">
            <button
              onClick={onAddAllToCart}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>إضافة جميع القطع إلى حقيبة التسوق ({wishlist.length})</span>
            </button>
            <p className="text-[11px] text-stone-500 text-center">
              يمكنكِ تعديل المقاسات والألوان المفضلة داخل حقيبة التسوق قبل إتمام الطلب.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
