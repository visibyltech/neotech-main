import React, { useState } from 'react';
import {
  PiggyBank,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Lock,
  ChevronDown,
  Sparkles,
  Building,
  Upload,
  Copy,
} from 'lucide-react';
import { Product, SavingsFrequency, SavingsPlan } from '../types';
import { savingsService } from '../services/savingsService';
import { formatNaira, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface SaveToBuyPlannerViewProps {
  products: Product[];
  initialProductId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const SaveToBuyPlannerView: React.FC<SaveToBuyPlannerViewProps> = ({
  products,
  initialProductId,
  onNavigate,
}) => {
  const { firebaseUser, profile, openAuthModal } = useAuth();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || products[0]?.id || ''
  );
  const [durationWeeks, setDurationWeeks] = useState<number>(12);
  const [frequency, setFrequency] = useState<SavingsFrequency>('weekly');
  const [customName, setCustomName] = useState(profile?.fullName || firebaseUser?.displayName || '');
  const [customEmail, setCustomEmail] = useState(profile?.email || firebaseUser?.email || '');

  // First deposit flow
  const [makeInitialDeposit, setMakeInitialDeposit] = useState(false);
  const [proofPreview, setProofPreview] = useState<string>('');

  const [createdPlan, setCreatedPlan] = useState<SavingsPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const schedule = savingsService.calculateDepositSchedule(
    selectedProduct ? selectedProduct.price : 0,
    durationWeeks,
    frequency
  );

  const handleStartPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      openAuthModal('login');
      return;
    }

    if (!selectedProduct) return;
    setIsSubmitting(true);

    try {
      const plan = await savingsService.createSavingsPlan({
        userId: firebaseUser.uid,
        userEmail: customEmail || firebaseUser.email || '',
        userName: customName || profile?.fullName || 'Valued Customer',
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.images[0] || '',
        targetAmount: selectedProduct.price,
        durationWeeks,
        frequency,
        selectedColor: selectedProduct.colors[0],
        selectedStorage: selectedProduct.storageOptions[0],
      });

      // If user provided initial deposit proof
      if (makeInitialDeposit && proofPreview) {
        await savingsService.recordDeposit({
          planId: plan.id,
          userId: firebaseUser.uid,
          amount: schedule.depositAmount,
          paymentMethod: 'bank_transfer',
          reference: `DEP-${Date.now().toString(36).toUpperCase()}`,
          proofOfPaymentUrl: proofPreview,
          autoVerify: false,
        });
      }

      setCreatedPlan(plan);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {}
    } catch (err) {
      console.error('Error starting savings plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdPlan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
          <PiggyBank className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            Savings Plan Active
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Congratulations! Your Plan is Live.
          </h1>
          <p className="text-sm text-slate-300">
            Target Device: <span className="font-bold text-white">{createdPlan.productName}</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Target Amount:</span>
            <span className="font-bold text-white">{formatNaira(createdPlan.targetAmount)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Scheduled Installment:</span>
            <span className="font-bold text-emerald-400">
              {formatNaira(createdPlan.depositAmount)} / {createdPlan.frequency}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Duration:</span>
            <span className="font-medium text-white">{createdPlan.durationWeeks} Weeks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Target Completion Date:</span>
            <span className="font-bold text-white">{formatDate(createdPlan.targetDate)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          You can make deposits anytime from your customer dashboard via bank transfer or online payment. Once your target hits 100%, your order is generated and ready for immediate pickup or delivery.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('dashboard', { tab: 'savings' })}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition"
          >
            <span>Open Savings Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <PiggyBank className="w-3.5 h-3.5" />
          Structured Savings Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Save to Buy Calculator & Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize your smartphone savings duration and frequency. Lock in the price today with 0% interest and zero maintenance fees.
        </p>
      </div>

      <form onSubmit={handleStartPlan} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Smartphone */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
              Select Target Smartphone
            </h3>

            <div className="space-y-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatNaira(p.price)} ({p.condition === 'brand-new' ? 'New' : 'UK-Used'})
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                  <img
                    src={selectedProduct.images[0]}
                    alt=""
                    className="w-16 h-16 object-contain rounded-xl bg-slate-900 p-1"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{selectedProduct.name}</h4>
                    <p className="text-xs text-slate-400">
                      {selectedProduct.brand} • {selectedProduct.storageOptions[0]} •{' '}
                      <span className="text-emerald-400 font-bold">{formatNaira(selectedProduct.price)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Duration */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
              Choose Savings Duration
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[4, 8, 12, 24].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setDurationWeeks(w)}
                  className={`p-3 rounded-2xl border text-center transition ${
                    durationWeeks === w
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-base font-extrabold text-white">{w} Weeks</div>
                  <div className="text-[10px] text-slate-400">
                    {w === 4 ? '1 Month' : w === 8 ? '2 Months' : w === 12 ? '3 Months' : '6 Months'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Frequency */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-slate-950 text-xs font-black flex items-center justify-center">3</span>
              Deposit Frequency
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {(['daily', 'weekly', 'monthly'] as SavingsFrequency[]).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`p-3 rounded-2xl border text-center capitalize transition ${
                    frequency === freq
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Transparent Plan Summary & Start */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-800/40 space-y-5 sticky top-28 shadow-2xl">
            <h3 className="text-base font-extrabold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Your Savings Blueprint</span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                Guaranteed Price Lock
              </span>
            </h3>

            {/* Computation details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Product Target Price:</span>
                <span className="font-bold text-white">{formatNaira(selectedProduct.price)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Savings Timeline:</span>
                <span className="font-semibold text-white">{durationWeeks} Weeks</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Installment Frequency:</span>
                <span className="font-semibold text-white capitalize">{frequency}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Number of Deposits:</span>
                <span className="font-semibold text-white">{schedule.installmentsCount} installments</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-300">
                  Required {frequency === 'daily' ? 'Daily' : frequency === 'weekly' ? 'Weekly' : 'Monthly'} Deposit:
                </span>
                <span className="text-2xl font-black text-emerald-400 tracking-tight">
                  {formatNaira(schedule.depositAmount)}
                </span>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <PiggyBank className="w-4 h-4" />
                  <span>Start My Savings Plan Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 leading-tight">
              Funds are held strictly towards your device purchase. Instant store pickup or courier delivery upon completing your savings target.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
