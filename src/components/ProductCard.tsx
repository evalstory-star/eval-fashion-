import React from 'react';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '../types/store';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative">
      {/* Product Image Container */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product);
          }}
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer z-10 ${
            isWishlisted
              ? 'bg-white text-rose-600 hover:scale-110 shadow-md'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white hover:scale-105'
          }`}
          title={isWishlisted ? 'إزالة من قائمة الأمنيات' : 'حفظ في قائمة الأمنيات'}
          aria-label="قائمة الأمنيات"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Status / Tag */}
        {product.oldPrice && (
          <div className="absolute top-3 right-3 bg-stone-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
            عرض خاص
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2.5 bg-white text-stone-900 rounded-xl shadow-lg hover:bg-stone-50 transition-transform scale-90 group-hover:scale-100 cursor-pointer"
            title="معاينة التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Metadata line without pills */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-medium">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.fabric ? product.fabric.split(' ')[0] + ' ' + (product.fabric.split(' ')[1] || '') : 'قماش فاخر'}</span>
          </div>

          <h3
            onClick={() => onSelect(product)}
            className="font-bold text-sm sm:text-base text-stone-900 line-clamp-1 hover:text-emerald-900 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-stone-900 tabular-nums">
              {product.price.toLocaleString('ar-EG')} <span className="text-xs font-bold text-stone-600">ج.م</span>
            </span>
            {product.oldPrice && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                {product.oldPrice.toLocaleString('ar-EG')} ج.م
              </span>
            )}
          </div>

          <button
            onClick={() => onQuickAdd(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-900 text-stone-800 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>أضف</span>
          </button>
        </div>
      </div>
    </div>
  );
};
