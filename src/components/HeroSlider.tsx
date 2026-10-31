import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Shield, PiggyBank, CreditCard } from 'lucide-react';
import { Banner } from '../types';

interface HeroSliderProps {
  banners: Banner[];
  onNavigate: (view: string, params?: any) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners, onNavigate }) => {
  const activeBanners = banners.filter(b => b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800/80 shadow-2xl">
      <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center">
        {/* Background photo with atmospheric dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>

        {/* Slide Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 flex flex-col justify-center max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 bg-red-600/20 text-red-400 border border-red-500/30 w-fit backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            {current.badge || 'PROMOTIONAL SPECIAL'}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
            {current.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-8 max-w-lg">
            {current.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (current.ctaLink.includes('save-to-buy')) {
                  onNavigate('save-to-buy');
                } else if (current.ctaLink.includes('bnpl')) {
                  onNavigate('bnpl');
                } else if (current.ctaLink.includes('apple-iphone')) {
                  onNavigate('products', { category: 'apple-iphone' });
                } else {
                  onNavigate('products');
                }
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold text-sm shadow-xl shadow-red-600/30 flex items-center gap-2 hover:gap-3 transition-all"
            >
              <span>{current.ctaText || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('save-to-buy')}
              className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 font-medium text-sm flex items-center gap-2 transition backdrop-blur-md"
            >
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              <span>Save to Buy Option</span>
            </button>
          </div>
        </div>

        {/* Indicator dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-8 bg-red-500 shadow-md shadow-red-500/50'
                    : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
