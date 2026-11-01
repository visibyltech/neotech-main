import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Upload,
  ArrowRight,
  ArrowLeft,
  Building,
  Truck,
  Store,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/ordersService';
import { settingsService } from '../services/settingsService';
import { formatNaira } from '../utils/formatters';
import { Order, PaymentMethod, BusinessSettings } from '../types';
import confetti from 'canvas-confetti';

interface CheckoutViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenReceipt: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate, onOpenReceipt }) => {
  const { items, subtotal, deliveryFee, totalPrice, fulfillmentType, selectedState, clearCart } = useCart();
  const { firebaseUser, profile, openAuthModal } = useAuth();

  // Form states
  const [customerName, setCustomerName] = useState(profile?.fullName || firebaseUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(profile?.email || firebaseUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [deliveryLga, setDeliveryLga] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay-now');
    const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState(false);

  // Settings
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Load business settings for bank transfer
  React.useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const handleCopyAccount = async () => {
    const accountNumber = settings?.bankDetails.accountNumber || '0040250513';
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    } catch {
      setErrorMessage('Unable to copy automatically. Please select and copy the account number.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firebaseUser) {
      openAuthModal('login');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add products before checking out.');
      return;
    }

    if (paymentMethod !== 'pay-now') {
      if (items.length !== 1) {
        setErrorMessage('Buy Now Pay Later and Save to Buy currently apply to one product at a time. Please keep only one product in your cart to continue.');
        return;
      }
      onNavigate(paymentMethod === 'save-to-buy' ? 'save-to-buy' : 'bnpl', { productId: items[0].productId });
      return;
    }

    if (!proofPreview) {
      setErrorMessage('Please upload your bank transfer receipt before placing the order.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your full name, email address, and phone number.');
      return;
    }

    if (fulfillmentType === 'delivery' && !fullAddress.trim()) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedProofUrl = '';
      if (proofPreview) {
        // Upload proof via server R2/media endpoint
        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: proofPreview,
              fileName: `proof-${Date.now()}.jpg`,
              mimeType: 'image/jpeg',
            }),
          });
          const uploadData = await uploadRes.json();
          uploadedProofUrl = uploadData.url || proofPreview;
        } catch {
          uploadedProofUrl = proofPreview;
        }
      }

      const orderItems = items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0] || '',
        price: item.product.price,
        quantity: item.quantity,
        color: item.selectedColor,
        storage: item.selectedStorage,
        condition: item.product.condition,
      }));

      const newOrder = await ordersService.createOrder({
        userId: firebaseUser.uid,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        items: orderItems,
        subtotal,
        deliveryFee,
        total: totalPrice,
        fulfillmentType,
        deliveryAddress: fulfillmentType === 'delivery' ? {
          state: selectedState,
          lga: deliveryLga.trim(),
          fullAddress: fullAddress.trim(),
          instructions: deliveryInstructions.trim(),
        } : undefined,
        pickupLocationId: fulfillmentType === 'pickup' ? 'warri-store' : undefined,
        paymentMethod,
        proofOfPaymentUrl: uploadedProofUrl,
        paymentReference: `NTG-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: `Order placed via website (${paymentMethod}).`,
      });

      // Clear shopping cart
      clearCart();
      setCompletedOrder(newOrder);

      // Trigger celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Unable to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checkout is only available to authenticated customers.
  if (!firebaseUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-red-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Sign in to continue to checkout</h1>
        <p className="text-sm text-slate-400">Please sign in or create an account before placing an order. Your cart will remain saved.</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => openAuthModal('login')} className="px-5 py-3 rounded-xl bg-red-600 text-white font-bold text-sm">Sign In</button>
          <button type="button" onClick={() => openAuthModal('signup')} className="px-5 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm">Create Account</button>
        </div>
        <button type="button" onClick={() => onNavigate('cart')} className="text-xs text-slate-400 hover:text-white">Return to cart</button>
      </div>
    );
  }

  // Order Confirmed View
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            Order Successfully Placed
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Thank you, {completedOrder.customerName}!
          </h1>
          <p className="text-sm text-slate-300">
            Order Reference:{' '}
            <span className="font-mono font-bold text-red-400">{completedOrder.orderNumber}</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Order Status:</span>
            <span className="font-bold text-amber-400">{completedOrder.orderStatus}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Payment Status:</span>
            <span className="font-bold capitalize text-white">{completedOrder.paymentStatus}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Total Amount:</span>
            <span className="font-extrabold text-white text-sm">{formatNaira(completedOrder.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Fulfillment:</span>
            <span className="font-medium text-white capitalize">
              {completedOrder.fulfillmentType === 'delivery'
                ? `Delivery to ${completedOrder.deliveryAddress?.state}`
                : 'Store Pickup in Warri, Delta State'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
          {completedOrder.paymentStatus === 'verifying'
            ? 'Your payment proof has been submitted to the Neo Tech Gadget administrative desk. Once verified, your order status will automatically update to Confirmed and be queued for dispatch.'
            : 'Your order is confirmed and currently being prepared for dispatch.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onOpenReceipt(completedOrder)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>View & Print Official Receipt</span>
          </button>

          <button
            onClick={() => onNavigate('track-order', { orderNumber: completedOrder.orderNumber })}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 transition"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Progress</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs transition"
          >
            Customer Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => onNavigate('cart')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-400 mt-1">Complete your order with verified payment</p>
        </div>
        {!firebaseUser && (
          <button
            onClick={() => openAuthModal('login')}
            className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
          >
            Already have an account? Sign in
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              Customer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Damilola Ojo"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 0814 902 4432"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Fulfillment Details Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              {fulfillmentType === 'delivery' ? 'Delivery Address in Nigeria' : 'Store Pickup Location'}
            </h3>

            {fulfillmentType === 'delivery' ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">State</label>
                    <input
                      type="text"
                      disabled
                      value={selectedState}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-400 cursor-not-allowed font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">LGA (Local Government Area)</label>
                    <input
                      type="text"
                      value={deliveryLga}
                      onChange={(e) => setDeliveryLga(e.target.value)}
                      placeholder="e.g. Ikeja, Eti-Osa, Abuja Municipal"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Street Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="House / Apartment number, street name, landmark"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Additional Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Call upon arrival at estate gate"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Neo Tech Gadget — Robinson Plaza Store</span>
                </div>
                <p className="text-slate-400">
                  SHOP C38, ROBINSON PLAZA, DECO ROAD, WARRI, DELTA STATE, NIGERIA
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Ready for collection 2 hours after payment verification.
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              Payment Method
            </h3>

            {/* Select how you want to pay for this order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { value: 'pay-now', title: 'Buy and Pay Now', detail: 'Transfer and upload receipt', icon: Building },
                { value: 'credably-bnpl', title: 'Buy Now Pay Later', detail: 'Apply through Credably', icon: ShieldCheck },
                { value: 'save-to-buy', title: 'Save to Buy', detail: 'Choose a savings schedule', icon: Store },
              ] as const).map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentMethod(option.value)}
                    className={`p-3 rounded-xl border text-left transition ${
                      paymentMethod === option.value
                        ? 'bg-red-600/10 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-2" />
                    <span className="block text-xs font-bold">{option.title}</span>
                    <span className="block text-[10px] mt-1 opacity-80">{option.detail}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'pay-now' ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Official Company Account
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Bank:</span>
                      <span className="font-bold text-white">
                        {settings?.bankDetails.bankName || 'Premium Trust'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Account Name:</span>
                      <span className="font-bold text-white">
                        {settings?.bankDetails.accountName || 'NEOTECHGADGET'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-red-400">
                          {settings?.bankDetails.accountNumber || '0040250513'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedBank ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proof of Payment Upload */}
                <div className="space-y-2 pt-2">
                  <label className="block text-slate-300 font-semibold">
                    Upload Transfer Receipt / Screenshot:
                  </label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="proof-upload-input"
                    />
                    <label htmlFor="proof-upload-input" className="cursor-pointer block">
                      {proofPreview ? (
                        <div className="space-y-2">
                          <img
                            src={proofPreview}
                            alt="Receipt preview"
                            className="w-28 h-28 object-cover rounded-xl mx-auto border border-emerald-500/50"
                          />
                          <p className="text-[11px] text-emerald-400 font-semibold">
                            ✓ Proof attached ({proofFile?.name})
                          </p>
                          <span className="text-[10px] text-slate-500 underline">Click to change</span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-2">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="text-slate-300 font-medium">Click to select receipt image</p>
                          <p className="text-[10px] text-slate-500">JPG, PNG or Screenshot</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-[10px] text-amber-400/90 leading-tight">
                    * Orders are verified by our finance team before packaging and delivery.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                {paymentMethod === 'credably-bnpl'
                  ? 'Continue to the Credably application to review the financing terms and submit your application.'
                  : 'Continue to Save to Buy to choose your savings duration and payment frequency.'}
                {items.length > 1 && (
                  <p className="mt-2 text-amber-400">Financing applies to one product at a time. Remove other items from your cart before continuing.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl sticky top-28">
            <h3 className="text-base font-extrabold text-white tracking-tight border-b border-slate-800 pb-3">
              Order Items ({items.length})
            </h3>

            {/* Compact items list */}
            <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={`${item.productId}-${item.selectedColor}`} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-12 h-12 object-contain rounded-lg bg-slate-950 p-1"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-white line-clamp-1">{item.product.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} • {item.selectedStorage}
                    </p>
                  </div>
                  <div className="text-right text-xs font-bold text-white">
                    {formatNaira(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-bold text-white">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fulfillment Fee:</span>
                <span className="font-bold text-white">
                  {fulfillmentType === 'pickup' ? (
                    <span className="text-emerald-400">FREE (Pickup)</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total Payable:</span>
                <span className="text-2xl text-red-500 tracking-tight">{formatNaira(totalPrice)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{paymentMethod === 'pay-now' ? 'Submit Receipt & Place Order' : paymentMethod === 'credably-bnpl' ? 'Continue to Credably' : 'Continue to Save to Buy'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 leading-tight">
              By placing your order, you agree to Neo Tech Gadget's sales & inspection terms.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
