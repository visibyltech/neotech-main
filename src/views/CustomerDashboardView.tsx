import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  PiggyBank,
  CreditCard,
  Heart,
  MapPin,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Plus,
  Upload,
  Copy,
  FileText,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ordersService } from '../services/ordersService';
import { savingsService } from '../services/savingsService';
import { bnplService } from '../services/bnplService';
import { productsService } from '../services/productsService';
import { settingsService } from '../services/settingsService';
import { Order, SavingsPlan, SavingsTransaction, BNPLApplication, Product, BusinessSettings } from '../types';
import { formatNaira, formatDate, getStatusColor } from '../utils/formatters';
import { ProductCard } from '../components/ProductCard';

interface CustomerDashboardViewProps {
  initialTab?: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenProduct: (product: Product) => void;
  onOpenReceipt: (order: Order) => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  initialTab = 'overview',
  onNavigate,
  onOpenProduct,
  onOpenReceipt,
}) => {
  const { firebaseUser, profile, openAuthModal, logout, isAdmin } = useAuth();
  const { wishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [bnplApps, setBnplApps] = useState<BNPLApplication[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  // Deposit modal state for Save to Buy
  const [activeDepositPlan, setActiveDepositPlan] = useState<SavingsPlan | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositMethod, setDepositMethod] = useState<'bank_transfer' | 'online_gateway'>('bank_transfer');
  const [depositProofPreview, setDepositProofPreview] = useState<string>('');
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState('');

  // Selected plan transaction history
  const [viewingPlanTx, setViewingPlanTx] = useState<SavingsTransaction[]>([]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (firebaseUser) {
      ordersService.getUserOrders(firebaseUser.uid).then(setOrders);
      savingsService.getUserPlans(firebaseUser.uid).then(setSavingsPlans);
      bnplService.getUserApplications(firebaseUser.uid).then(setBnplApps);
    }
    productsService.getAllProducts().then(setAllProducts);
    settingsService.getSettings().then(setSettings);
  }, [firebaseUser]);

  if (!firebaseUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Sign in to your Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your orders, track savings progress, and monitor Credably financing applications.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  // Handle new savings deposit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositPlan || !firebaseUser || depositAmount <= 0) return;
    setDepositSubmitting(true);
    setDepositSuccessMsg('');

    try {
      await savingsService.recordDeposit({
        planId: activeDepositPlan.id,
        userId: firebaseUser.uid,
        amount: Number(depositAmount),
        paymentMethod: depositMethod,
        reference: `DEP-${Date.now().toString(36).toUpperCase()}`,
        proofOfPaymentUrl: depositProofPreview,
        autoVerify: depositMethod === 'online_gateway',
      });

      // Refresh plans
      const updated = await savingsService.getUserPlans(firebaseUser.uid);
      setSavingsPlans(updated);
      setDepositSuccessMsg('Deposit submitted! Bank transfers are confirmed by our audit team.');
      setTimeout(() => {
        setActiveDepositPlan(null);
        setDepositSuccessMsg('');
        setDepositProofPreview('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting deposit:', err);
    } finally {
      setDepositSubmitting(false);
    }
  };

  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-red-600/30">
            {(profile?.fullName || firebaseUser.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {profile?.fullName || 'Valued Customer'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-red-400 border border-red-500/30 capitalize">
                {profile?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{firebaseUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 font-semibold text-xs border border-red-500/40 flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Center</span>
            </button>
          )}

          <button
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'savings'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Save to Buy Plans ({savingsPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bnpl')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'bnpl'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-blue-400 hover:text-blue-300 hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Credably BNPL ({bnplApps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Total Orders</span>
              <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/40">
              <span className="text-xs text-emerald-400">Save to Buy Plans</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{savingsPlans.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-blue-900/40">
              <span className="text-xs text-blue-400">BNPL Applications</span>
              <div className="text-2xl font-black text-blue-400 mt-1">{bnplApps.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Saved in Wishlist</span>
              <div className="text-2xl font-black text-white mt-1">{wishlist.length}</div>
            </div>
          </div>

          {/* Recent Orders Sneak Peek */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Recent Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                View all orders
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                You haven't placed any orders yet. Discover our latest smartphones.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 2).map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-white text-sm block">
                        {order.orderNumber}
                      </span>
                      <span className="text-slate-400">
                        {order.items.length} item(s) • {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(order.orderStatus).bg} ${getStatusColor(order.orderStatus).text} ${getStatusColor(order.orderStatus).border}`}>
                        {order.orderStatus}
                      </span>
                      <span className="font-extrabold text-white text-sm">
                        {formatNaira(order.total)}
                      </span>
                      <button
                        onClick={() => onOpenReceipt(order)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Orders History</h2>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-red-400 font-semibold hover:underline"
            >
              + Place new order
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 text-xs text-slate-400">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <p>No orders recorded under this account.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const colors = getStatusColor(order.orderStatus);
                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold text-white">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenReceipt(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-400" />
                          <span>View Receipt</span>
                        </button>
                        <button
                          onClick={() => onNavigate('track-order', { orderNumber: order.orderNumber })}
                          className="px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-semibold text-xs border border-red-500/30 transition"
                        >
                          Live Tracking
                        </button>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="divide-y divide-slate-800">
                      {order.items.map(item => (
                        <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-12 h-12 object-contain rounded-lg bg-slate-950 p-1"
                            />
                            <div>
                              <p className="font-bold text-white">{item.productName}</p>
                              <p className="text-slate-400 text-[11px]">
                                {item.color} • {item.storage} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="font-bold text-white">
                            {formatNaira(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total & Fulfillment summary */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400">
                        Fulfillment:{' '}
                        <span className="text-white capitalize">
                          {order.fulfillmentType === 'delivery'
                            ? `Delivery to ${order.deliveryAddress?.state}`
                            : 'Pickup in Computer Village Ikeja'}
                        </span>
                      </span>
                      <div className="text-right">
                        <span className="text-slate-400 mr-2">Total Paid:</span>
                        <span className="text-lg font-black text-white">{formatNaira(order.total)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Save to Buy Hub */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Save to Buy Savings Plans</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Lock phone prices, deposit gradually, and collect on 100% target completion
              </p>
            </div>
            <button
              onClick={() => onNavigate('save-to-buy')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Savings Plan</span>
            </button>
          </div>

          {savingsPlans.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 text-xs text-slate-400">
              <PiggyBank className="w-10 h-10 text-emerald-500 mx-auto" />
              <p>You do not have any active Save to Buy plans yet.</p>
              <button
                onClick={() => onNavigate('save-to-buy')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Start Saving for a Smartphone
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {savingsPlans.map(plan => {
                const percent = Math.min(100, Math.round((plan.savedAmount / plan.targetAmount) * 100));
                const remaining = Math.max(0, plan.targetAmount - plan.savedAmount);
                const isComplete = percent >= 100;

                return (
                  <div
                    key={plan.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={plan.productImage}
                          alt=""
                          className="w-14 h-14 object-contain rounded-xl bg-slate-950 p-1"
                        />
                        <div>
                          <h3 className="font-bold text-white text-base">{plan.productName}</h3>
                          <p className="text-xs text-slate-400">
                            Installment: <span className="font-semibold text-white">{formatNaira(plan.depositAmount)} / {plan.frequency}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isComplete ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500' : 'bg-amber-500/20 text-amber-300 border border-amber-500'
                        }`}>
                          {isComplete ? 'Target Reached (100%)' : `Active • ${percent}% Saved`}
                        </span>

                        {!isComplete && (
                          <button
                            onClick={() => {
                              setActiveDepositPlan(plan);
                              setDepositAmount(plan.depositAmount);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                          >
                            + Make Deposit
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Saved: <strong className="text-emerald-400">{formatNaira(plan.savedAmount)}</strong></span>
                        <span className="text-slate-400">Target: <strong className="text-white">{formatNaira(plan.targetAmount)}</strong></span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Remaining: {formatNaira(remaining)}</span>
                        <span>Target Date: {formatDate(plan.targetDate)}</span>
                      </div>
                    </div>

                    {/* Completion order conversion */}
                    {isComplete && plan.status !== 'converted_to_order' && (
                      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-emerald-300 text-xs">
                            🎉 100% Target Completed! You own this phone!
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Claim your device now for store pickup in Ikeja or doorstep delivery.
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            // Convert to completed order
                            const newOrder = await ordersService.createOrder({
                              userId: firebaseUser.uid,
                              customerName: plan.userName,
                              customerEmail: plan.userEmail,
                              customerPhone: profile?.phone || '08149024432',
                              items: [{
                                productId: plan.productId,
                                productName: plan.productName,
                                productImage: plan.productImage,
                                price: plan.targetAmount,
                                quantity: 1,
                                color: plan.selectedColor || 'Default',
                                storage: plan.selectedStorage || 'Standard',
                                condition: 'brand-new',
                              }],
                              subtotal: plan.targetAmount,
                              deliveryFee: 0,
                              total: plan.targetAmount,
                              fulfillmentType: 'pickup',
                              paymentMethod: 'save-to-buy',
                              notes: `Fulfilled via completed Save to Buy plan (${plan.id}).`,
                            });
                            await savingsService.markPlanConvertedToOrder(plan.id, newOrder.id);
                            onOpenReceipt(newOrder);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0"
                        >
                          Claim Device & Generate Order
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Credably BNPL Applications */}
      {activeTab === 'bnpl' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Credably BNPL Financing</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track status of your Buy Now Pay Later requests
              </p>
            </div>
            <button
              onClick={() => onNavigate('bnpl')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Financing Request</span>
            </button>
          </div>

          {bnplApps.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 text-xs text-slate-400">
              <CreditCard className="w-10 h-10 text-blue-500 mx-auto" />
              <p>No active Credably financing applications found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bnplApps.map(app => (
                <div
                  key={app.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-bold text-white text-sm">{app.productName}</span>
                      <p className="text-slate-400 text-[11px]">
                        Ref: <span className="font-mono text-blue-400">{app.credablyReference}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full font-bold uppercase text-[11px] bg-blue-950 text-blue-300 border border-blue-800">
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-500 block">Total Financed</span>
                      <span className="font-bold text-white">{formatNaira(app.requestedAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Monthly Repayment</span>
                      <span className="font-bold text-blue-400">
                        {formatNaira(app.monthlyInstallment)} / mo
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tenure</span>
                      <span className="font-bold text-white">{app.tenureMonths} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Down Payment</span>
                      <span className="font-bold text-emerald-400">{formatNaira(app.downPayment)}</span>
                    </div>
                  </div>

                  {app.credablyDecisionNotes && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px]">
                      {app.credablyDecisionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Your Saved Wishlist ({wishlistProducts.length})</h2>
          {wishlistProducts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
              <Heart className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Your wishlist is empty. Tap the heart icon on any smartphone to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenProduct={onOpenProduct}
                  onSelectSaveToBuy={(p) => onNavigate('save-to-buy', { productId: p.id })}
                  onSelectBNPL={(p) => onNavigate('bnpl', { productId: p.id })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAKE DEPOSIT MODAL */}
      {activeDepositPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              Make Deposit for {activeDepositPlan.productName}
            </h3>

            {depositSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500 text-emerald-300 text-xs">
                {depositSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deposit Amount (₦)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scheduled installment: {formatNaira(activeDepositPlan.depositAmount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDepositMethod('bank_transfer')}
                      className={`p-2 rounded-xl border text-center ${
                        depositMethod === 'bank_transfer'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Bank Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod('online_gateway')}
                      className={`p-2 rounded-xl border text-center ${
                        depositMethod === 'online_gateway'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Online Card
                    </button>
                  </div>
                </div>

                {depositMethod === 'bank_transfer' && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account:</span>
                      <span className="font-bold text-white">{settings?.bankDetails.accountNumber || '1849302194'} ({settings?.bankDetails.bankName || 'Access Bank'})</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <label className="text-slate-300 block">Attach Bank Proof:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setDepositProofPreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[10px] text-slate-400"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveDepositPlan(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={depositSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                  >
                    {depositSubmitting ? 'Submitting...' : 'Confirm Deposit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
