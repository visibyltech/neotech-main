import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  CreditCard,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const logoPath = '/assets/aistudio/IMG-20260722-WA0013_22ef81f2.jpg';

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* 3 Core Value Pillars */}
      <div className="border-b border-slate-900 bg-slate-900/40 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">100% Genuine & Inspected</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Brand-new sealed devices with official warranties. UK-used iPhones rigorously tested for battery health, Face ID, and factory unlock.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => onNavigate('save-to-buy')}
            className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Save to Buy Program</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Save daily, weekly, or monthly at your own pace. Lock in phone prices, prevent inflation impact, and collect upon target completion.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => onNavigate('bnpl')}
            className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Credably BNPL Financing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Own the smartphone of your dreams today and spread payments comfortably over 3 to 12 months with Credably instant approvals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-red-500/50 p-0.5">
                <img
                  src={logoPath}
                  alt="Neo Tech Gadget"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Neo<span className="text-red-500">Tech</span> Gadget
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Smarter Tech. Better Life.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              Neo Tech Gadget is Nigeria's trusted destination for brand-new and pristine UK-used iPhones, Samsung flagships, Google Pixel phones, and premium accessories. Experience true flexibility with Buy Now, Credably BNPL, and Save to Buy savings plans.
            </p>

            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>Suite B4, Tech Plaza, Otigba St, Computer Village, Ikeja, Lagos</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+234 814 902 4432 / +234 814 902 4433</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>support@neotechgadget.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Monday - Saturday: 8:30 AM - 6:30 PM (WAT)</span>
              </div>
            </div>
          </div>

          {/* Category Links */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Smartphones</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'apple-iphone', condition: 'brand-new' })}
                  className="hover:text-white transition"
                >
                  Brand-New iPhones
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'apple-iphone', condition: 'uk-used' })}
                  className="hover:text-white transition"
                >
                  UK-Used iPhones (Inspected)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'samsung' })}
                  className="hover:text-white transition"
                >
                  Samsung Galaxy Series
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'google-pixel' })}
                  className="hover:text-white transition"
                >
                  Google Pixel AI Phones
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'phone-accessories' })}
                  className="hover:text-white transition"
                >
                  Fast Chargers & MagSafe
                </button>
              </li>
            </ul>
          </div>

          {/* Purchasing Options */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Ways to Buy</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-white transition">
                  Buy Now / Pay Now
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('save-to-buy')} className="text-emerald-400 hover:text-emerald-300 font-medium transition">
                  Save to Buy Savings Plan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bnpl')} className="text-blue-400 hover:text-blue-300 font-medium transition">
                  Credably BNPL (3-12 Mos)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-white transition">
                  Track Delivery Status
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition">
                  My Orders & Receipts
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Protection */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Security & Quality</h5>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Physical & Online Verification
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Store Pickup or Insured Transit
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                6-12 Months Phone Warranty
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Admin-Verified Payments
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Neo Tech Gadget Retail Nig. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Verified Merchant</span>
            <span>•</span>
            <span>Credably Financing Partner</span>
            <span>•</span>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
