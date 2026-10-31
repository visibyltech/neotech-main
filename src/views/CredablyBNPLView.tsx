import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Info,
  Calendar,
  Briefcase,
  User,
  Phone,
  Mail,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Product, BNPLApplication } from '../types';
import { bnplService } from '../services/bnplService';
import { formatNaira } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface CredablyBNPLViewProps {
  products: Product[];
  initialProductId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const CredablyBNPLView: React.FC<CredablyBNPLViewProps> = ({
  products,
  initialProductId,
  onNavigate,
}) => {
  const { firebaseUser, profile, openAuthModal } = useAuth();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || products[0]?.id || ''
  );
  const [tenureMonths, setTenureMonths] = useState<number>(6);

  // Application fields
  const [fullName, setFullName] = useState(profile?.fullName || firebaseUser?.displayName || '');
  const [email, setEmail] = useState(profile?.email || firebaseUser?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [employmentStatus, setEmploymentStatus] = useState('Salaried Professional');
  const [monthlyIncome, setMonthlyIncome] = useState('450000');
  const [bvnOrNin, setBvnOrNin] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<BNPLApplication | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const financing = bnplService.calculateFinancing(
    selectedProduct ? selectedProduct.price : 0,
    tenureMonths
  );

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firebaseUser) {
      openAuthModal('login');
      return;
    }

    if (!selectedProduct) return;

    if (!fullName.trim() || !email.trim() || !phone.trim() || !bvnOrNin.trim()) {
      setErrorMessage('Please fill in all mandatory application fields including BVN/NIN for identity verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const app = await bnplService.submitApplication({
        userId: firebaseUser.uid,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productPrice: selectedProduct.price,
        tenureMonths,
        employmentStatus,
        monthlyIncome: Number(monthlyIncome) || 300000,
        bvnOrNin: bvnOrNin.trim(),
      });

      setSubmittedApp(app);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {}
    } catch (err: any) {
      console.error('BNPL apply error:', err);
      setErrorMessage(err.message || 'Financing application failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-400 mx-auto">
          <FileCheck className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
            Application Received by Credably
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Financing Request Lodged
          </h1>
          <p className="text-sm text-slate-300">
            Credably Application Reference:{' '}
            <span className="font-mono font-bold text-blue-400">{submittedApp.credablyReference}</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Target Device:</span>
            <span className="font-bold text-white">{submittedApp.productName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Financed Amount:</span>
            <span className="font-bold text-white">{formatNaira(submittedApp.requestedAmount)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Monthly Installment:</span>
            <span className="font-bold text-blue-400">
              {formatNaira(submittedApp.monthlyInstallment)} / month ({submittedApp.tenureMonths} mos)
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Initial Down Payment (20%):</span>
            <span className="font-bold text-white">{formatNaira(submittedApp.downPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Underwriting Status:</span>
            <span className="font-bold uppercase text-amber-400">{submittedApp.status}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Credably's credit engine is reviewing your application against bank criteria. You will receive an SMS and email update once your loan agreement is ready for digital signature and phone dispatch.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('dashboard', { tab: 'bnpl' })}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition"
          >
            <span>Track Application in Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <CreditCard className="w-3.5 h-3.5" />
          Credably Financing Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Buy Now. Pay Later with Credably.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Get the latest iPhone or flagship Android smartphone immediately and comfortably split the cost over 3, 6, 9, or 12 months.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-300 text-xs flex items-center gap-3 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleApply} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Device & Application Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Device Selection */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              Select Device to Finance
            </h3>

            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatNaira(p.price)}
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
                    Retail Price: <span className="text-white font-bold">{formatNaira(selectedProduct.price)}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Repayment Tenure */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              Choose Repayment Tenure
            </h3>

            <div className="grid grid-cols-4 gap-3">
              {[3, 6, 9, 12].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTenureMonths(m)}
                  className={`p-3 rounded-2xl border text-center transition ${
                    tenureMonths === m
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-base font-extrabold text-white">{m} Mos</div>
                  <div className="text-[10px] text-slate-400">Repayment</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Applicant Identity & Employment */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              Applicant Information (Credably Underwriting)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As registered with your bank"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0814 902 4432"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">BVN or NIN (For credit score check) *</label>
                <input
                  type="password"
                  required
                  maxLength={11}
                  value={bvnOrNin}
                  onChange={(e) => setBvnOrNin(e.target.value)}
                  placeholder="11 digits (encrypted)"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Salaried Professional">Salaried Professional</option>
                  <option value="Registered Business Owner">Registered Business Owner</option>
                  <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                  <option value="Tech / Creative Professional">Tech / Creative Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Monthly Net Income (₦)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 450000"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Financing Breakdown & Submission */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-blue-800/40 space-y-5 sticky top-28 shadow-2xl">
            <h3 className="text-base font-extrabold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Financing Breakdown</span>
              <span className="text-xs text-blue-400 font-semibold bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800">
                Credably Engine
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Product Retail Value:</span>
                <span className="font-bold text-white">{formatNaira(selectedProduct.price)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Initial Down Payment (20%):</span>
                <span className="font-bold text-emerald-400">{formatNaira(financing.downPayment)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Financed Principal:</span>
                <span className="font-semibold text-white">{formatNaira(financing.financedAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Repayment Tenure:</span>
                <span className="font-semibold text-white">{tenureMonths} Months</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-300">Monthly Repayment:</span>
                <span className="text-2xl font-black text-blue-400 tracking-tight">
                  {formatNaira(financing.monthlyInstallment)}
                  <span className="text-xs font-normal text-slate-400"> / mo</span>
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Submit Credably Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 leading-tight">
              Applications are securely validated with Credably's underwriting system. Device release occurs upon loan approval.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
