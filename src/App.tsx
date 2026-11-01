import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { AuthModal } from './components/AuthModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { HomeView } from './views/HomeView';
import { ProductsView } from './views/ProductsView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { SaveToBuyPlannerView } from './views/SaveToBuyPlannerView';
import { CredablyBNPLView } from './views/CredablyBNPLView';
import { CustomerDashboardView } from './views/CustomerDashboardView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { productsService } from './services/productsService';
import { settingsService } from './services/settingsService';
import { Product, Banner, Category, Order, BusinessSettings, SavingsFrequency, ProductCondition } from './types';

function MainApp() {
  const { isAdmin, openAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Global datasets
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  // Active product for detail page
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Receipt modal state
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Initial startup data sync & seeding
    productsService.seedInitialDataIfNeeded().then(() => {
      productsService.getAllProducts().then(setProducts);
      productsService.getCategories().then(setCategories);
      productsService.getBanners().then(setBanners);
      settingsService.getSettings().then(setSettings);
    });
  }, []);

  // Keep the device/browser Back button inside the website's view history.
  useEffect(() => {
    const appEntryUrl = window.location.href;
    const initialState = {
      neoTechApp: true,
      view: currentView,
      params: viewParams,
      productId: selectedProduct?.id || null,
    };
    window.history.replaceState(initialState, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.neoTechApp) {
        setCurrentView(state.view || 'home');
        setViewParams(state.params || {});
        setSelectedProduct(
          state.productId
            ? products.find((product) => product.id === state.productId) || null
            : null
        );
      } else {
        // If the browser reaches the app's entry point, restore the app
        // instead of leaving the site unexpectedly.
        window.history.pushState(initialState, '', appEntryUrl);
        setCurrentView('home');
        setViewParams({});
        setSelectedProduct(null);
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  const handleNavigate = (view: string, params: any = {}) => {
    const nextState = {
      neoTechApp: true,
      view,
      params,
      productId: null,
    };
    window.history.pushState(nextState, '', window.location.href);
    setCurrentView(view);
    setViewParams(params);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProduct = (product: Product) => {
    const nextState = {
      neoTechApp: true,
      view: 'product-detail',
      params: {},
      productId: product.id,
    };
    window.history.pushState(nextState, '', window.location.href);
    setSelectedProduct(product);
    setCurrentView('product-detail');
    setViewParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white font-sans antialiased">
      {/* Top Navigation */}
      {(currentView !== 'admin' || !isAdmin) && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            banners={banners}
            categories={categories}
            onOpenProduct={handleOpenProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'products' && (
          <ProductsView
            products={products}
            categories={categories}
            searchQuery={searchQuery}
            initialCategory={viewParams.category}
            initialCondition={viewParams.condition as ProductCondition}
            onOpenProduct={handleOpenProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => handleNavigate('products')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onNavigate={handleNavigate}
            onOpenReceipt={(order) => setReceiptOrder(order)}
          />
        )}

        {currentView === 'save-to-buy' && (
          <SaveToBuyPlannerView
            products={products}
            initialProductId={viewParams.productId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'bnpl' && (
          <CredablyBNPLView
            products={products}
            initialProductId={viewParams.productId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && (
          <CustomerDashboardView
            initialTab={viewParams.tab || 'overview'}
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProduct}
            onOpenReceipt={(order) => setReceiptOrder(order)}
          />
        )}

        {currentView === 'track-order' && (
          <OrderTrackingView
            initialOrderNumber={viewParams.orderNumber || ''}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin' && isAdmin && (
          <AdminDashboardView
            onNavigate={handleNavigate}
            onOpenReceipt={(order) => setReceiptOrder(order)}
          />
        )}

        {currentView === 'admin' && !isAdmin && (
          <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full text-center rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <h1 className="text-xl font-bold text-white mb-2">Administrator sign-in required</h1>
              <p className="text-sm text-slate-400 mb-5">The Neo Tech Gadget admin portal is private. Sign in with the assigned administrator email to continue.</p>
              <button onClick={() => openAuthModal('login')} className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold">Sign in as administrator</button>
              <button onClick={() => handleNavigate('home')} className="block mx-auto mt-3 text-sm text-slate-400 hover:text-white">Return to store</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {(currentView !== 'admin' || !isAdmin) && <Footer onNavigate={handleNavigate} />}

      {/* Floating WhatsApp Support Button */}
      <WhatsAppButton whatsappNumber={settings?.contactInfo.whatsappNumber || '2348135933346'} />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Payment Receipt / Invoice Modal */}
      <PaymentReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
