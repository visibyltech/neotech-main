import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
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

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white font-sans antialiased">
      {/* Top Navigation */}
      {currentView !== 'admin' && (
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
            onOpenSaveToBuyModal={(prod, opts) => {
              handleNavigate('save-to-buy', { productId: prod.id });
            }}
            onOpenBNPLModal={(prod, opts) => {
              handleNavigate('bnpl', { productId: prod.id });
            }}
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

        {currentView === 'admin' && (
          <AdminDashboardView
            onNavigate={handleNavigate}
            onOpenReceipt={(order) => setReceiptOrder(order)}
          />
        )}
      </div>

      {/* Footer */}
      {currentView !== 'admin' && <Footer onNavigate={handleNavigate} />}

      {/* Floating WhatsApp Support Button */}
      <WhatsAppButton whatsappNumber={settings?.contactInfo.whatsappNumber || '2348149024432'} />

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
