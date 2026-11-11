import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Sparkles, MessageCircle, Heart, ChevronRight, ChevronLeft } from 'lucide-react';
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

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'Free Size');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || 'افتراضي');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(product.imageUrl);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || 'Free Size');
      setSelectedColor(product.colors?.[0] || 'افتراضي');
      setQuantity(1);
      setActiveImage(product.imageUrl);
      setAddedAnimation(false);
    }
  }, [product?.id]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 700);
  };

  const handleDirectWhatsApp = () => {
    const msg = `مرحباً EVAL، أود الاستفسار عن القطعة: ${product.name}\nالمقاس: ${selectedSize}\nاللون: ${selectedColor}\nالسعر: ${product.price} ج.م`;
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col md:grid md:grid-cols-2 overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
        {/* Floating Action Buttons (Close and Wishlist) */}
        <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-2">
          {onToggleWishlist && (
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2.5 rounded-full transition-all shadow-md cursor-pointer ${
                isWishlisted
                  ? 'bg-white text-rose-600 scale-105'
                  : 'bg-white/90 hover:bg-white text-stone-700 hover:text-rose-600'
              }`}
              title={isWishlisted ? 'إزالة من قائمة الأمنيات' : 'حفظ في قائمة الأمنيات'}
              aria-label="قائمة الأمنيات"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 transition-all shadow-md cursor-pointer"
            aria-label="إغلاق"
            title="إغلاق النافذة (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery / Image Column */}
        <div className="relative bg-stone-100 flex flex-col justify-between overflow-hidden h-72 sm:h-96 md:h-full min-h-[280px]">
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={activeImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Multiple Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2 bg-stone-950/40 backdrop-blur-md p-1.5 rounded-xl z-20">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-[#C6A15B] scale-105 shadow-md'
                      : 'border-white/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Purchase Module */}
        <div className="p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-[90vh] space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#34452D]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#34452D]/10 border border-[#34452D]/20">
                {product.category}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                متوفر للطلب الفوري
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug font-serif">
              {product.name}
            </h2>

            {/* Price & Discount */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-[#34452D] tabular-nums">
                {product.price.toLocaleString('ar-EG')} <span className="text-sm font-bold text-stone-600">ج.م</span>
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <>
                  <span className="text-sm text-stone-400 line-through tabular-nums font-semibold">
                    {product.oldPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                  <span className="bg-rose-100 text-rose-700 text-xs font-black px-2 py-0.5 rounded-md">
                    وفر {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Fabric Specs */}
            {product.fabric && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs text-stone-700">
                <span className="font-bold text-stone-900 block mb-0.5">تفاصيل القماش والنسيج:</span>
                <p className="leading-relaxed">{product.fabric}</p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                  <span>المقاس:</span>
                  <span className="text-[#34452D] font-bold">المحدد: {selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-[#34452D] text-white shadow-sm ring-1 ring-[#34452D]'
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
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                  <span>اللون:</span>
                  <span className="text-[#34452D] font-bold">المحدد: {selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedColor === color
                          ? 'bg-[#34452D] text-white border-[#34452D] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-stone-700">الكمية:</span>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 hover:bg-stone-100 text-stone-700 text-sm font-bold cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold tabular-nums min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 hover:bg-stone-100 text-stone-700 text-sm font-bold cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Actions Module */}
          <div className="space-y-2.5 pt-3 border-t border-stone-100">
            <button
              onClick={handleAdd}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                addedAnimation
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#34452D] hover:bg-[#253220] text-white active:scale-[0.99]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>تمت الإضافة للحقيبة بنجاح!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    إضافة إلى حقيبة التسوق ({(product.price * quantity).toLocaleString('ar-EG')} ج.م)
                  </span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onConsultStylist(product.name)}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>تنسيق بالذكاء الاصطناعي</span>
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="py-2.5 px-3 bg-[#34452D]/10 hover:bg-[#34452D]/15 text-[#34452D] border border-[#34452D]/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#34452D]" />
                <span>استفسار واتساب</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34452D]" />
              <span>دفع عند الاستلام أو إنستاباي · توصيل لجميع المحافظات</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
