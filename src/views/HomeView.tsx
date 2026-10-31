import React from 'react';
import {
  Sparkles,
  Smartphone,
  ShieldCheck,
  PiggyBank,
  CreditCard,
  Truck,
  ArrowRight,
  BatteryCharging,
  Layers,
  CheckCircle2,
  Lock,
  Flame,
} from 'lucide-react';
import { Product, Banner, Category } from '../types';
import { HeroSlider } from '../components/HeroSlider';
import { ProductCard } from '../components/ProductCard';
import { formatNaira } from '../utils/formatters';

interface HomeViewProps {
  products: Product[];
  banners: Banner[];
  categories: Category[];
  onOpenProduct: (product: Product) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  banners,
  categories,
  onOpenProduct,
  onNavigate,
}) => {
  const brandNewIPhones = products.filter(
    p => p.categoryId === 'apple-iphone' && p.condition === 'brand-new'
  );

  const ukUsedIPhones = products.filter(
    p => p.categoryId === 'apple-iphone' && p.condition === 'uk-used'
  );

  const androidSmartphones = products.filter(
    p => p.categoryId === 'samsung' || p.categoryId === 'google-pixel' || p.categoryId === 'other-android'
  );

  const featuredProducts = products.filter(p => p.featured);
  const bestSellers = products.filter(p => p.isBestSeller);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Promotional Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <HeroSlider banners={banners} onNavigate={onNavigate} />
      </section>

      {/* 2. Compact Three Purchasing Methods */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Option 1: Buy Now / Pay Now */}
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="group min-w-0 text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-red-500/50 transition shadow-md"
          >
            <span className="inline-flex text-[8px] sm:text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-600/10 px-1.5 py-1 rounded-md border border-red-500/30 mb-2">
              01 • Instant
            </span>
            <h3 className="text-[11px] sm:text-sm font-bold leading-tight text-white mb-1.5 group-hover:text-red-400 transition">
              Buy Now
            </h3>
            <p className="text-[9px] sm:text-xs text-slate-400 leading-snug min-h-[30px]">
              Pay in full. Get it fast.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-red-400">
              Shop <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Option 2: Save to Buy */}
          <button
            type="button"
            onClick={() => onNavigate('save-to-buy')}
            className="group min-w-0 text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 transition shadow-md"
          >
            <span className="inline-flex text-[8px] sm:text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-600/10 px-1.5 py-1 rounded-md border border-emerald-500/30 mb-2">
              02 • Savings
            </span>
            <h3 className="text-[11px] sm:text-sm font-bold leading-tight text-white mb-1.5 group-hover:text-emerald-400 transition">
              Save to Buy
            </h3>
            <p className="text-[9px] sm:text-xs text-slate-400 leading-snug min-h-[30px]">
              Save bit by bit.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-emerald-400">
              Plan <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Option 3: Credably BNPL */}
          <button
            type="button"
            onClick={() => onNavigate('bnpl')}
            className="group min-w-0 text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500/50 transition shadow-md"
          >
            <span className="inline-flex text-[8px] sm:text-[10px] font-bold uppercase tracking-wide text-blue-400 bg-blue-600/10 px-1.5 py-1 rounded-md border border-blue-500/30 mb-2">
              03 • Finance
            </span>
            <h3 className="text-[11px] sm:text-sm font-bold leading-tight text-white mb-1.5 group-hover:text-blue-400 transition">
              Credably BNPL
            </h3>
            <p className="text-[9px] sm:text-xs text-slate-400 leading-snug min-h-[30px]">
              Pay over 3–12 months.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-blue-400">
              Apply <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </section>

      {/* 3. Featured Smartphones Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              Top Recommendations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Devices
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenProduct={onOpenProduct}
              onSelectSaveToBuy={(p) => onNavigate('save-to-buy', { productId: p.id })}
              onSelectBNPL={(p) => onNavigate('bnpl', { productId: p.id })}
            />
          ))}
        </div>
      </section>

      {/* 4. Brand-New iPhones Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              100% Sealed & Authentic
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Brand-New Apple iPhones
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products', { category: 'apple-iphone', condition: 'brand-new' })}
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
          >
            <span>View All New</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {brandNewIPhones.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenProduct={onOpenProduct}
              onSelectSaveToBuy={(p) => onNavigate('save-to-buy', { productId: p.id })}
              onSelectBNPL={(p) => onNavigate('bnpl', { productId: p.id })}
            />
          ))}
        </div>
      </section>

      {/* 5. UK-Used iPhones Showcase (With Battery Health focus) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <BatteryCharging className="w-4 h-4" />
                Verified Battery Health & Face ID
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Pristine UK-Used iPhones
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1">
                Direct UK imports tested on 42 hardware inspection points. No refurbished parts, original screens, and guaranteed battery health 85%+.
              </p>
            </div>
            <button
              onClick={() => onNavigate('products', { category: 'apple-iphone', condition: 'uk-used' })}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 w-fit transition"
            >
              <span>Explore UK-Used Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {ukUsedIPhones.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProduct={onOpenProduct}
                onSelectSaveToBuy={(p) => onNavigate('save-to-buy', { productId: p.id })}
                onSelectBNPL={(p) => onNavigate('bnpl', { productId: p.id })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Android Flagships (Samsung & Google Pixel) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Smartphone className="w-4 h-4" />
              Pro Performance & AI Cameras
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Android Flagship Smartphones
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products', { category: 'samsung' })}
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-blue-400 flex items-center gap-1 transition"
          >
            <span>View Galaxy & Pixel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {androidSmartphones.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenProduct={onOpenProduct}
              onSelectSaveToBuy={(p) => onNavigate('save-to-buy', { productId: p.id })}
              onSelectBNPL={(p) => onNavigate('bnpl', { productId: p.id })}
            />
          ))}
        </div>
      </section>

      {/* 7. Save to Buy Interactive Explainer & Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-800/40 p-5 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <PiggyBank className="w-3.5 h-3.5" />
                Neo Tech Save to Buy Platform
              </div>
              <h2 className="text-lg sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Get your dream phone without financial stress.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Inflation shouldn't stop you from owning the latest iPhone or Samsung Galaxy. With Neo Tech's Save to Buy program, your target phone is reserved and protected against sudden market price spikes while you save gradually.
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4">
                <div className="min-w-0 p-2 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-900/80 border border-emerald-900/40">
                  <div className="text-emerald-400 font-extrabold text-[11px] sm:text-xl leading-tight mb-1">0% Interest</div>
                  <p className="text-[9px] sm:text-xs text-slate-400 leading-snug">Zero charges, zero hidden fees. Every Naira goes towards your phone.</p>
                </div>
                <div className="min-w-0 p-2 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-900/80 border border-emerald-900/40">
                  <div className="text-emerald-400 font-extrabold text-[11px] sm:text-xl leading-tight mb-1">Price Lock</div>
                  <p className="text-[9px] sm:text-xs text-slate-400 leading-snug">Your price is frozen the day you start your savings plan.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-900/40">
                  <div className="text-emerald-400 font-extrabold text-[11px] sm:text-xl leading-tight mb-1">Fast Pickup</div>
                  <p className="text-[9px] sm:text-xs text-slate-400 leading-snug">Immediate handover or nationwide delivery once target is reached.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('save-to-buy')}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2 transition"
                >
                  <span>Start a Savings Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Savings preview card */}
            <div className="lg:col-span-5 bg-slate-950/90 rounded-xl sm:rounded-2xl border border-emerald-500/30 p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400">Sample Savings Plan</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Target: 12 Weeks
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1695048133021-39cfa68b7596?auto=format&fit=crop&w=200&q=80"
                  alt="iPhone 15 Pro"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Apple iPhone 15 Pro (128GB)</h4>
                  <p className="text-xs text-emerald-400 font-extrabold">{formatNaira(1380000)}</p>
                </div>
              </div>

              {/* Progress simulation */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progress (Week 6 of 12)</span>
                  <span className="text-emerald-400 font-bold">50% Saved</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-1/2 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Saved: {formatNaira(690000)}</span>
                  <span>Remaining: {formatNaira(690000)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>Weekly installment:</span>
                <span className="font-bold text-white">{formatNaira(115000)} / week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Credably BNPL Feature Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border border-blue-800/40 p-3 sm:p-12">
          <div className="flex flex-row items-start justify-between gap-2 sm:gap-8">
            <div className="min-w-0 flex-1 space-y-2 sm:space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <CreditCard className="w-3.5 h-3.5" />
                Credably Buy Now Pay Later
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Take it home today. Spread payments up to 12 months.
              </h2>
              <p className="text-[10px] sm:text-sm text-slate-300 leading-snug sm:leading-relaxed">
                Apply in under 5 minutes through our official Credably financing workflow. Simply choose your phone, select your preferred repayment tenure, provide your details, and collect your device upon approval.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-start gap-1 sm:gap-4 pt-1 sm:pt-2 text-[9px] sm:text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>3, 6, 9 & 12 Month Tenures</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Fast Online Decision</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Transparent Schedule</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('bnpl')}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition"
                >
                  <span>Explore Credably Financing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-[38%] shrink-0 p-2 sm:p-6 rounded-lg sm:rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 sm:space-y-3">
              <span className="text-[8px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Financing Partner
              </span>
              <div className="text-[10px] sm:text-2xl font-black text-white tracking-tight leading-tight">
                CREDABLY <span className="text-blue-400">FINANCING</span>
              </div>
              <p className="text-[8px] sm:text-xs text-slate-400 max-w-xs leading-snug">
                Underwritten by licensed lending providers in Nigeria. Direct API verification and secure disbursements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Trust & Customer Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Why Customers Across Nigeria Choose Neo Tech Gadget
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            We operate physical experience centers in Lagos and provide nationwide insured delivery.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="min-w-0 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1.5 sm:space-y-2">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
              <ShieldCheck className="w-4 h-4 sm:w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-[11px] sm:text-sm leading-tight">6-12 Months Warranty</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-snug sm:leading-relaxed">
              Every device comes with genuine warranty coverage and diagnostic support.
            </p>
          </div>

          <div className="min-w-0 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1.5 sm:space-y-2">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Truck className="w-4 h-4 sm:w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-[11px] sm:text-sm leading-tight">Nationwide Delivery</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-snug sm:leading-relaxed">
              Fast delivery across Lagos, Abuja, Port Harcourt, Ibadan, and all 36 Nigerian states.
            </p>
          </div>

          <div className="min-w-0 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1.5 sm:space-y-2">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <BatteryCharging className="w-4 h-4 sm:w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-[11px] sm:text-sm leading-tight">Tested Battery Health</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-snug sm:leading-relaxed">
              All UK-used iPhones have verified battery health and original Apple displays.
            </p>
          </div>

          <div className="min-w-0 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1.5 sm:space-y-2">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-4 h-4 sm:w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-[11px] sm:text-sm leading-tight">Verified Payments</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-snug sm:leading-relaxed">
              Bank transfers and deposits are verified before order processing for total security.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
