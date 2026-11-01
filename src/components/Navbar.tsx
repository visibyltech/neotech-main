import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  Smartphone,
  Layers,
  ArrowRight,
  LogOut,
  ShoppingBag,
  PiggyBank,
  CreditCard,
  Truck,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { firebaseUser, profile, openAuthModal, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const canAccessAdminPortal = Boolean(
    firebaseUser?.email?.trim().toLowerCase() === 'usitakatelvin@gmail.com'
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const logoPath = '/assets/aistudio/IMG-20260722-WA0013_22ef81f2.jpg';

  const handleNavClick = (view: string, params?: any) => {
    onNavigate(view, params);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 transition-all">
      {/* Top micro-bar */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border-b border-red-900/30 text-xs text-slate-300 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-red-400 font-semibold uppercase tracking-wider text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Official Store
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-300">
              Direct UK-Used & Brand-New iPhones & Flagships with Guarantee
            </span>
          </div>

        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-red-500/40 shadow-lg shadow-red-950/40 p-0.5 group-hover:border-red-500 transition-all flex items-center justify-center">
              <img
                src={logoPath}
                alt="Neo Tech Gadget Logo"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // Fallback if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                className="logo-fallback hidden w-full h-full rounded-lg bg-gradient-to-br from-red-600 to-slate-900 items-center justify-center font-bold text-white text-base tracking-tighter"
              >
                NT
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold tracking-tight text-xl text-white">
                  Neo<span className="text-red-500">Tech</span>
                </span>
                <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase border-l border-slate-700 pl-1.5 ml-0.5">
                  Gadget
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium hidden sm:inline">
                Smarter Tech. Better Life.
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'products' && e.target.value.trim().length > 0) {
                    onNavigate('products');
                  }
                }}
                placeholder="Search iPhone 16 Pro, UK-used 14 Pro, S24 Ultra..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('dashboard', { tab: 'wishlist' })}
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
              title="My Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => handleNavClick('cart')}
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <div className="relative">
              {firebaseUser ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-red-500 text-sm font-medium text-slate-200 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                    {(profile?.fullName || firebaseUser.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate">
                    {profile?.fullName || firebaseUser.displayName || 'Account'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-red-500 hover:bg-red-600/10 transition"
                  title="Sign in or open your profile"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
              )}

              {/* Profile Dropdown */}
              {profileDropdownOpen && firebaseUser && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {profile?.fullName || firebaseUser.email}
                    </p>
                    <p className="text-[11px] text-red-400 font-mono capitalize">
                      {canAccessAdminPortal ? 'Admin' : 'Customer'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavClick('dashboard', { tab: 'overview' })}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Customer Dashboard
                  </button>

                  <button
                    onClick={() => handleNavClick('dashboard', { tab: 'orders' })}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 transition"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    My Orders
                  </button>

                  <button
                    onClick={() => handleNavClick('dashboard', { tab: 'savings' })}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 transition"
                  >
                    <PiggyBank className="w-4 h-4 text-emerald-400" />
                    Save to Buy Plans
                  </button>

                  <button
                    onClick={() => handleNavClick('dashboard', { tab: 'bnpl' })}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 transition"
                  >
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    Credably BNPL Apps
                  </button>

                  {canAccessAdminPortal && (
                    <div className="pt-1 mt-1 border-t border-slate-800">
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 font-semibold hover:bg-red-500/10 flex items-center gap-2.5 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-400" />
                        Admin Portal
                      </button>
                    </div>
                  )}

                  <div className="pt-1 mt-1 border-t border-slate-800">
                    <button
                      onClick={async () => {
                        await logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Direct Button (Always visible for admin) */}
            {canAccessAdminPortal && (
              <button
                onClick={() => handleNavClick('admin')}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-red-500/60 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'products' && e.target.value.trim().length > 0) {
                  onNavigate('products');
                }
              }}
              placeholder="Search iPhones, Samsung, Pixel..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Secondary Category / Feature Navigation Bar */}
      <nav className="bg-slate-950/70 border-t border-slate-900 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 text-xs font-medium whitespace-nowrap">
          <button
            onClick={() => handleNavClick('products')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentView === 'products' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            All Phones & Devices
          </button>

          <button
            onClick={() => handleNavClick('products', { category: 'apple-iphone', condition: 'brand-new' })}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-1.5 transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-red-400" />
            Brand-New iPhones
          </button>

          <button
            onClick={() => handleNavClick('products', { category: 'apple-iphone', condition: 'uk-used' })}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-1.5 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            UK-Used iPhones
          </button>

          <button
            onClick={() => handleNavClick('products', { category: 'samsung' })}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Samsung Galaxy
          </button>

          <button
            onClick={() => handleNavClick('products', { category: 'google-pixel' })}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Google Pixel
          </button>

          <button
            onClick={() => handleNavClick('products', { category: 'phone-accessories' })}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Accessories
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          {/* 3 Core Purchasing Methods Quick Links */}
          <button
            onClick={() => handleNavClick('save-to-buy')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              currentView === 'save-to-buy'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            Save to Buy
          </button>

          <button
            onClick={() => handleNavClick('bnpl')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              currentView === 'bnpl'
                ? 'bg-blue-600 text-white'
                : 'text-blue-400 hover:bg-blue-950/40 border border-blue-900/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Credably BNPL
          </button>

          <button
            onClick={() => handleNavClick('track-order')}
            className={`px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 flex items-center gap-1 transition ${
              currentView === 'track-order' ? 'text-white bg-slate-900' : ''
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Track Order
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('products')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              All Smartphones & Gadgets
            </button>
            <button
              onClick={() => handleNavClick('products', { category: 'apple-iphone', condition: 'brand-new' })}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Brand-New iPhones
            </button>
            <button
              onClick={() => handleNavClick('products', { category: 'apple-iphone', condition: 'uk-used' })}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              UK-Used iPhones (Inspected)
            </button>
            <button
              onClick={() => handleNavClick('save-to-buy')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-400 bg-emerald-950/20 rounded-lg flex items-center justify-between"
            >
              <span>Save to Buy Savings Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavClick('bnpl')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-blue-400 bg-blue-950/20 rounded-lg flex items-center justify-between"
            >
              <span>Credably Buy Now Pay Later</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavClick('track-order')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Track Order Status
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Customer Dashboard
            </button>
            {canAccessAdminPortal && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-red-400 bg-red-950/30 rounded-lg"
              >
                Administrator Portal
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
