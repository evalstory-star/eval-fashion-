import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { Product } from '../types/store';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onConsultStylist: (productName: string) => void;
  whatsappNumber: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onConsultStylist,
  whatsappNumber,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Free Size');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'افتراضي');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 900);
  };

  const handleDirectWhatsApp = () => {
    const msg = `مرحباً EVAL، أود الاستفسار عن القطعة: ${product.name}\nالمقاس: ${selectedSize}\nاللون: ${selectedColor}\nالسعر: ${product.price} ج.م`;
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Action Buttons (Close and Wishlist) */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          {onToggleWishlist && (
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2.5 rounded-full transition-all shadow-sm cursor-pointer ${
                isWishlisted
                  ? 'bg-white text-rose-600 shadow-md scale-105'
                  : 'bg-white/80 hover:bg-white text-stone-700 hover:text-rose-600'
              }`}
              title={isWishlisted ? 'إزالة من قائمة الأمنيات' : 'حفظ في قائمة الأمنيات'}
              aria-label="قائمة الأمنيات"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/80 hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors shadow-sm cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery / Image Column */}
          <div className="relative bg-stone-100 aspect-[4/3] md:aspect-auto md:h-full overflow-hidden flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Product Info & Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>متوفر للطلب الفوري</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug font-serif">
                {product.name}
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-stone-900 tabular-nums">
                  {product.price.toLocaleString('ar-EG')} <span className="text-sm font-bold text-stone-600">ج.م</span>
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <>
                    <span className="text-sm text-rose-600/75 line-through tabular-nums font-semibold">
                      {product.oldPrice.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="bg-rose-100 text-rose-700 text-xs font-black px-2 py-0.5 rounded-md">
                      خصم {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Fabric Specs */}
              {product.fabric && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-stone-700">
                  <span className="font-bold text-stone-900 block mb-0.5">تفاصيل القماش والنسيج:</span>
                  <p>{product.fabric}</p>
                </div>
              )}

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                    <span>اختر المقاس:</span>
                    <span className="text-stone-500 font-normal">المختار: {selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                    <span>اختر اللون:</span>
                    <span className="text-stone-500 font-normal">المختار: {selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          selectedColor === color
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-stone-700">الكمية:</span>
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-stone-100 text-sm font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-stone-100 text-sm font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Module */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <button
                onClick={handleAdd}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addedAnimation
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-md'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>تمت الإضافة للحقيبة!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>إضافة إلى حقيبة التسوق ({(product.price * quantity).toLocaleString('ar-EG')} ج.م)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onConsultStylist(product.name)}
                  className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>تنسيق بالذكاء الاصطناعي</span>
                </button>

                <button
                  onClick={handleDirectWhatsApp}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>استفسار واتساب مباشر</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>دفع آمن عند الاستلام أو عبر إنستاباي - شحن لجميع المحافظات</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
