import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft, Truck, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/formatters';

interface CartViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenProduct: (product: any) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate, onOpenProduct }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    fulfillmentType,
    setFulfillmentType,
    selectedState,
    setSelectedState,
    deliveryFee,
    totalPrice,
  } = useCart();

  const nigerianStates = [
    'Lagos Mainland',
    'Lagos Island',
    'Abuja (FCT)',
    'Rivers (Port Harcourt)',
    'Oyo (Ibadan)',
    'Ogun',
    'Delta',
    'Enugu',
    'Kano',
    'Interstate Other',
  ];

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Discover our collection of brand-new iPhones, verified UK-used devices, and flagship smartphones.
          </p>
        </div>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 transition"
        >
          Explore Smartphone Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">Review your selected devices and choose fulfillment</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(item => (
            <div
              key={`${item.productId}-${item.selectedColor}-${item.selectedStorage}`}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-4 transition hover:border-slate-700"
            >
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-20 h-20 object-contain rounded-xl bg-slate-950 p-2 cursor-pointer shrink-0"
                onClick={() => onOpenProduct(item.product)}
              />

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  {item.product.brand}
                </span>
                <h3
                  onClick={() => onOpenProduct(item.product)}
                  className="font-bold text-sm text-white hover:text-red-400 cursor-pointer transition line-clamp-1"
                >
                  {item.product.name}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {item.selectedColor}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {item.selectedStorage}
                  </span>
                  <span className="text-slate-400">
                    Condition: {item.product.condition === 'brand-new' ? 'Brand New' : 'UK-Used'}
                  </span>
                </div>
              </div>

              {/* Price & Quantity Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-800">
                <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor, item.selectedStorage)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-white">{item.quantity}</span>
                  <button
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor, item.selectedStorage)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm sm:text-base text-white">
                    {formatNaira(item.product.price * item.quantity)}
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-[10px] text-slate-500">
                      {formatNaira(item.product.price)} each
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedStorage)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Order Summary & Fulfillment */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
            <h3 className="text-base font-extrabold text-white tracking-tight border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            {/* Fulfillment choice */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Fulfillment Method:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    fulfillmentType === 'delivery'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Doorstep Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    fulfillmentType === 'pickup'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Store Pickup (Free)</span>
                </button>
              </div>
            </div>

            {/* Nigerian State selector if delivery */}
            {fulfillmentType === 'delivery' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Delivery State:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  Computer Village Ikeja Experience Center
                </span>
                <p className="text-[11px] text-slate-400">
                  Suite B4, Tech Plaza, Otigba St, Ikeja. Ready for collection within 2 hours.
                </p>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-bold text-white">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge:</span>
                <span className="font-bold text-white">
                  {fulfillmentType === 'pickup' ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-xl text-red-400">{formatNaira(totalPrice)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
