import React from 'react';
import { Heart, ShoppingCart, BatteryCharging, PiggyBank } from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onSelectSaveToBuy?: (product: Product) => void;
  onSelectBNPL?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  onSelectSaveToBuy,
  onSelectBNPL,
}) => {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const isLiked = wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  const discountPercent = product.previousPrice && product.previousPrice > product.price
    ? Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onOpenProduct(product)}
      className="group relative flex flex-col rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-red-500/50 shadow-lg hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 overflow-hidden cursor-pointer select-none"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950 p-6 flex items-center justify-center">
        {/* Condition & Battery Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.condition === 'brand-new' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Brand New
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                UK-Used
              </span>
              {product.batteryHealth && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                  <BatteryCharging className="w-3 h-3" />
                  {product.batteryHealth}% Battery
                </span>
              )}
            </div>
          )}

          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-600 text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-xl border backdrop-blur-md transition-all ${
            isLiked
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border-slate-700/60 hover:bg-slate-800'
          }`}
          title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Product Photo */}
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Stock indicator overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-300 font-bold text-xs uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        ) : product.stock <= 3 ? (
          <span className="absolute bottom-2 left-3 text-[10px] font-semibold text-amber-400 bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30">
            Only {product.stock} units left
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Brand & Storage */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold text-red-400 uppercase tracking-wider text-[10px]">
            {product.brand}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {product.storageOptions[0]}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-red-400 line-clamp-2 transition mb-2">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {formatNaira(product.price)}
            </span>
            {product.previousPrice && product.previousPrice > product.price && (
              <span className="text-xs text-slate-500 line-through">
                {formatNaira(product.previousPrice)}
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-600 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectSaveToBuy) onSelectSaveToBuy(product);
                else onOpenProduct(product);
              }}
              className="p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-600 border border-emerald-700/60 hover:border-emerald-500 text-emerald-400 hover:text-white transition"
              title="Save towards this phone"
            >
              <PiggyBank className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
