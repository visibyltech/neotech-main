import React, { useState } from 'react';
import {
  Heart,
  ShoppingCart,
  ShieldCheck,
  BatteryCharging,
  Cpu,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Truck,
  RotateCcw,
  Sparkles,
  PiggyBank,
  CreditCard,
  Zap,
  Info,
  Maximize2,
  X,
} from 'lucide-react';
import { Product, SavingsFrequency } from '../types';
import { formatNaira } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onNavigate: (view: string, params?: any) => void;
  onOpenSaveToBuyModal: (product: Product, options: { frequency: SavingsFrequency; durationWeeks: number; color: string; storage: string }) => void;
  onOpenBNPLModal: (product: Product, options: { tenureMonths: number; color: string; storage: string }) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onNavigate,
  onOpenSaveToBuyModal,
  onOpenBNPLModal,
}) => {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Default');
  const [selectedStorage, setSelectedStorage] = useState(product.storageOptions[0] || 'Standard');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [addedToast, setAddedToast] = useState(false);

  const isLiked = wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    const res = addToCart(product, 1, selectedColor, selectedStorage);
    if (res.success) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }
  };

  const handleInstantBuyNow = () => {
    const result = addToCart(product, 1, selectedColor, selectedStorage);
    if (result.success) onNavigate('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to catalogue</span>
      </button>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Photo with Zoom Trigger */}
          <div className="relative aspect-square w-full rounded-3xl bg-slate-950 border border-slate-800 p-8 flex items-center justify-center overflow-hidden group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
              onClick={() => setZoomImage(product.images[selectedImageIndex] || product.images[0])}
            />

            <button
              onClick={() => setZoomImage(product.images[selectedImageIndex] || product.images[0])}
              className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition"
              title="Click to Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Wishlist control */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 z-10 p-3 rounded-xl border backdrop-blur-md transition ${
                isLiked
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
              }`}
              aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Condition pill */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {product.condition === 'brand-new' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                  Brand New Sealed
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                  UK-Used ({product.batteryHealth || 90}% Battery)
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl bg-slate-950 border p-2 shrink-0 transition-all ${
                    idx === selectedImageIndex
                      ? 'border-red-500 ring-2 ring-red-500/30'
                      : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & 3 Purchasing Modes */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Title */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span className="text-red-500 uppercase tracking-widest text-[11px] font-bold">
                {product.brand}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock ({product.stock} available)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatNaira(product.price)}
              </span>
              {product.previousPrice && product.previousPrice > product.price && (
                <span className="text-base text-slate-500 line-through">
                  {formatNaira(product.previousPrice)}
                </span>
              )}
              {product.previousPrice && product.previousPrice > product.price && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                  Save {formatNaira(product.previousPrice - product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Primary purchase actions: immediately below product name and price */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="min-w-0 py-3 px-2 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleInstantBuyNow}
                className="min-w-0 py-3 px-2 sm:px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition"
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span>Checkout Now</span>
              </button>
            </div>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onOpenSaveToBuyModal(product, {
                frequency: 'weekly',
                durationWeeks: 12,
                color: selectedColor,
                storage: selectedStorage,
              })}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <PiggyBank className="w-3.5 h-3.5" />
              Save to Buy
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onOpenBNPLModal(product, {
                tenureMonths: 6,
                color: selectedColor,
                storage: selectedStorage,
              })}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Buy Now Pay Later with Credably
            </button>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* iPhone / Device Inspection Checklist */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hardware & Condition Inspection Report
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Condition Grade</span>
                <span className="font-semibold text-white">
                  {product.physicalCondition || (product.condition === 'brand-new' ? 'Sealed Brand New' : 'Flawless Grade A+')}
                </span>
              </div>

              {product.batteryHealth && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Battery Health</span>
                  <span className="font-bold text-cyan-400 flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    {product.batteryHealth}% Tested
                  </span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Biometrics / Face ID</span>
                <span className="font-semibold text-emerald-400">
                  {product.faceId || 'Tested 100%'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SIM Configuration</span>
                <span className="font-semibold text-white truncate">
                  {product.simConfig || 'Physical + eSIM'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Network Status</span>
                <span className="font-semibold text-white">
                  {product.networkStatus || 'Factory Unlocked'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Warranty Period</span>
                <span className="font-semibold text-amber-400 truncate">
                  {product.warranty}
                </span>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Color: <span className="text-white font-bold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      selectedColor === color
                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage Selection */}
          {product.storageOptions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Storage: <span className="text-white font-bold">{selectedStorage}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.storageOptions.map(storage => (
                  <button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      selectedStorage === storage
                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* Specifications Table & Policies */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 border-t border-slate-800">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">Technical Specifications</h3>
          <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden text-xs">
            {Object.entries(product.specifications || {}).map(([key, val]) => (
              <div key={key} className="grid grid-cols-3 p-3.5">
                <span className="font-semibold text-slate-400">{key}</span>
                <span className="col-span-2 text-slate-200">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">Peace of Mind Guarantee</h3>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <h5 className="font-bold text-white mb-0.5">Fast Nationwide Delivery</h5>
                <p className="text-slate-400">Tracked delivery across all 36 states or 2-hour pickup in Computer Village Ikeja.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h5 className="font-bold text-white mb-0.5">{product.warranty}</h5>
                <p className="text-slate-400">Comprehensive warranty covers screen diagnostics, camera testing, and logic board safety.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <h5 className="font-bold text-white mb-0.5">7-Day Exchange Policy</h5>
                <p className="text-slate-400">If any factory defect is discovered within 7 days, receive an immediate unit replacement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Added to Cart notification toast */}
      {addedToast && (
        <div className="fixed bottom-24 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-red-500/50 text-white text-xs shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="font-bold">{product.name} added to cart!</p>
            <p className="text-slate-400 text-[11px]">{selectedColor} • {selectedStorage}</p>
          </div>
          <button
            onClick={() => onNavigate('cart')}
            className="ml-3 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={zoomImage} alt="" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
