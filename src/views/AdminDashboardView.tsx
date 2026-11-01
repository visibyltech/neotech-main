import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Smartphone,
  ShoppingBag,
  CreditCard,
  PiggyBank,
  Image as ImageIcon,
  Settings,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Eye,
  Upload,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  Product,
  Category,
  Banner,
  Order,
  SavingsPlan,
  SavingsTransaction,
  BNPLApplication,
  BusinessSettings,
  OrderStatus,
  PaymentStatus,
  ProductCondition,
} from '../types';
import { productsService } from '../services/productsService';
import { ordersService } from '../services/ordersService';
import { savingsService } from '../services/savingsService';
import { bnplService } from '../services/bnplService';
import { settingsService } from '../services/settingsService';
import { formatNaira, formatDate, getStatusColor } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenReceipt: (order: Order) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  onOpenReceipt,
}) => {
  const { firebaseUser, isAdmin } = useAuth();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'products' | 'orders' | 'payments' | 'bnpl' | 'savings' | 'banners' | 'settings'
  >('overview');

  // Datasets
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [bnplApps, setBnplApps] = useState<BNPLApplication[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Modals & form state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  // Settings form local state
  const [settingsForm, setSettingsForm] = useState<BusinessSettings | null>(null);

  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [prods, cats, bans, ords, plans, txs, apps, setts] = await Promise.all([
        productsService.getAllProducts(),
        productsService.getCategories(),
        productsService.getBanners(),
        ordersService.getAllOrders(),
        savingsService.getAllPlans(),
        savingsService.getAllTransactions(),
        bnplService.getAllApplications(),
        settingsService.getSettings(),
      ]);

      setProducts(prods);
      setCategories(cats);
      setBanners(bans);
      setOrders(ords);
      setSavingsPlans(plans);
      setSavingsTransactions(txs);
      setBnplApps(apps);
      setSettings(setts);
      setSettingsForm(setts);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) refreshAllData();
  }, [isAdmin]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    const prodId = editingProduct.id || `prod_${Date.now()}`;
    const cleanProduct: Product = {
      id: prodId,
      name: editingProduct.name,
      brand: (editingProduct.brand as any) || 'Apple',
      model: editingProduct.model || editingProduct.name,
      description: editingProduct.description || '',
      price: Number(editingProduct.price),
      previousPrice: editingProduct.previousPrice ? Number(editingProduct.previousPrice) : undefined,
      condition: (editingProduct.condition as ProductCondition) || 'brand-new',
      colors: Array.isArray(editingProduct.colors)
        ? editingProduct.colors
        : String(editingProduct.colors || 'Space Black, Silver').split(',').map(s => s.trim()),
      storageOptions: Array.isArray(editingProduct.storageOptions)
        ? editingProduct.storageOptions
        : String(editingProduct.storageOptions || '128GB, 256GB').split(',').map(s => s.trim()),
      stock: Number(editingProduct.stock || 5),
      images: editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'],
      specifications: editingProduct.specifications || {
        Display: 'OLED ProMotion Display',
        Battery: 'Tested original capacity',
      },
      warranty: editingProduct.warranty || '1 Year Store Warranty',
      isAvailable: Number(editingProduct.stock || 5) > 0,
      batteryHealth: editingProduct.batteryHealth ? Number(editingProduct.batteryHealth) : 100,
      simConfig: editingProduct.simConfig || 'Physical SIM + eSIM',
      faceId: editingProduct.faceId || 'Working 100%',
      physicalCondition: editingProduct.physicalCondition || 'Brand New Sealed',
      networkStatus: editingProduct.networkStatus || 'Factory Unlocked (All Networks)',
      categoryId: (editingProduct.categoryId as any) || 'apple-iphone',
      featured: Boolean(editingProduct.featured),
      isNewArrival: Boolean(editingProduct.isNewArrival),
      isBestSeller: Boolean(editingProduct.isBestSeller),
      createdAt: editingProduct.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await productsService.saveProduct(cleanProduct);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    showFeedback('Product successfully saved to inventory!');
    refreshAllData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await productsService.deleteProduct(id);
      showFeedback('Product deleted.');
      refreshAllData();
    }
  };

  // Order status progression
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await ordersService.updateOrderStatus(orderId, status);
    showFeedback(`Order status updated to ${status}`);
    refreshAllData();
  };

  const handleVerifyOrderPayment = async (orderId: string) => {
    await ordersService.updateOrderStatus(orderId, 'Confirmed', {
      paymentStatus: 'paid',
      verifiedBy: firebaseUser?.email || 'Admin',
    });
    showFeedback('Order payment verified and marked as Confirmed!');
    refreshAllData();
  };

  // Savings verification
  const handleVerifySavingsTx = async (txId: string) => {
    await savingsService.verifyTransaction(txId, firebaseUser?.email || 'Admin');
    showFeedback('Savings deposit verified and credited to customer balance!');
    refreshAllData();
  };

  // Credably status update
  const handleUpdateBnplStatus = async (appId: string, status: BNPLApplication['status']) => {
    await bnplService.updateApplicationStatus(appId, status, `Updated by admin on ${new Date().toLocaleDateString()}`);
    showFeedback(`Credably application status updated to ${status}`);
    refreshAllData();
  };

  // Save business settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    await settingsService.updateSettings(settingsForm);
    showFeedback('Business settings successfully updated!');
    refreshAllData();
  };

  // Metrics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingPaymentsCount = orders.filter(
    o => o.paymentStatus === 'verifying' || o.paymentStatus === 'pending'
  ).length;

  const pendingSavingsCount = savingsTransactions.filter(t => t.status === 'pending').length;
  const pendingBnplCount = bnplApps.filter(a => a.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.stock <= 3);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <ShieldCheck className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">Administrator access restricted</h1>
          <p className="text-sm text-slate-400">Sign in with the authorised Neo Tech Gadget administrator email to access this area.</p>
          <button onClick={() => onNavigate('home')} className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold">Return to store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 sm:p-6 space-y-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/40">
            NT
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white">Neo Tech Admin</h2>
            <p className="text-[10px] text-slate-400 font-mono">Operations Console</p>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-semibold">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition ${
              activeSection === 'overview' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Metrics</span>
          </button>

          <button
            onClick={() => setActiveSection('products')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition ${
              activeSection === 'products' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4" />
              <span>Inventory & Stock</span>
            </div>
            {lowStockProducts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {lowStockProducts.length} low
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition ${
              activeSection === 'orders' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders Management</span>
            </div>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('payments')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition ${
              activeSection === 'payments' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Verify Bank Payments</span>
            </div>
            {pendingPaymentsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                {pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('savings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition ${
              activeSection === 'savings' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              <span>Save to Buy Desk</span>
            </div>
            {pendingSavingsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                {pendingSavingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('bnpl')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition ${
              activeSection === 'bnpl' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Credably BNPL Desk</span>
            </div>
            {pendingBnplCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">
                {pendingBnplCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('banners')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition ${
              activeSection === 'banners' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Promotional Slides</span>
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition ${
              activeSection === 'settings' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Store Configuration</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <span>Exit to Storefront</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* SECTION 1: OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Business Overview</h1>
              <p className="text-xs text-slate-400 mt-0.5">Key operational metrics and revenue summary</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block">Total Confirmed Revenue</span>
                <div className="text-2xl font-black text-white mt-1">{formatNaira(totalRevenue)}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Verified transactions</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block">Total Orders</span>
                <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
                <span className="text-[10px] text-slate-400">All channels</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-900/40">
                <span className="text-emerald-400 text-xs block">Active Save to Buy Plans</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{savingsPlans.length}</div>
                <span className="text-[10px] text-emerald-500 font-semibold">{pendingSavingsCount} pending deposits</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-blue-900/40">
                <span className="text-blue-400 text-xs block">Credably BNPL Applications</span>
                <div className="text-2xl font-black text-blue-400 mt-1">{bnplApps.length}</div>
                <span className="text-[10px] text-blue-400 font-semibold">{pendingBnplCount} awaiting review</span>
              </div>
            </div>

            {/* Low stock alerts */}
            {lowStockProducts.length > 0 && (
              <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-600/40 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Low Stock Warnings ({lowStockProducts.length} devices under 3 units)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="text-white font-bold truncate pr-2">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 shrink-0">
                        {p.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: PRODUCTS MANAGEMENT */}
        {activeSection === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Smartphone Catalogue & Stock</h1>
                <p className="text-xs text-slate-400 mt-0.5">Manage iPhone conditions, specs, prices, and stock units</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    brand: 'Apple',
                    condition: 'brand-new',
                    colors: ['Black', 'Silver'],
                    storageOptions: ['128GB', '256GB'],
                    stock: 5,
                    categoryId: 'apple-iphone',
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Smartphone</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Battery Health</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt=""
                          className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                          <span className="text-[10px] text-slate-400">{prod.brand}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          prod.condition === 'brand-new'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {prod.condition === 'brand-new' ? 'New' : 'UK-Used'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{formatNaira(prod.price)}</td>
                      <td className="py-3 px-4 font-bold">
                        <span className={prod.stock <= 3 ? 'text-amber-400' : 'text-slate-300'}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {prod.batteryHealth ? `${prod.batteryHealth}%` : '100% (New)'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: ORDERS MANAGEMENT */}
        {activeSection === 'orders' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Order Fulfillment Center</h1>
              <p className="text-xs text-slate-400 mt-0.5">Update tracking numbers, change delivery stages, and verify receipts</p>
            </div>

            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-black text-white">{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${getStatusColor(order.orderStatus).bg} ${getStatusColor(order.orderStatus).text}`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenReceipt(order)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-400" />
                        <span>Receipt</span>
                      </button>

                      {order.proofOfPaymentUrl && (
                        <button
                          onClick={() => setViewingProofUrl(order.proofOfPaymentUrl || null)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 border border-emerald-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Proof Slip</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer and Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Customer</span>
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-slate-400">{order.customerPhone}</p>
                      <p className="text-slate-400">{order.customerEmail}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Fulfillment</span>
                      <p className="font-bold text-white capitalize">{order.fulfillmentType}</p>
                      {order.fulfillmentType === 'delivery' ? (
                        <div className="mt-1 space-y-1 text-slate-300">
                          <p><span className="text-slate-500">Recipient:</span> {order.deliveryAddress?.recipientName || order.customerName}</p>
                          <p><span className="text-slate-500">Delivery phone:</span> {order.deliveryAddress?.recipientPhone || order.customerPhone}</p>
                          <p className="whitespace-pre-wrap break-words">{order.deliveryAddress?.fullAddress}</p>
                          <p>{order.deliveryAddress?.lga}, {order.deliveryAddress?.state}</p>
                          {order.deliveryAddress?.instructions && <p className="whitespace-pre-wrap break-words text-amber-300"><span className="text-slate-500">Instructions:</span> {order.deliveryAddress.instructions}</p>}
                        </div>
                      ) : (
                        <p className="text-slate-400">Pickup: Robinson Plaza, Warri</p>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Financial</span>
                      <p className="font-extrabold text-white text-sm">{formatNaira(order.total)}</p>
                      <p className="text-slate-400 capitalize">Method: {order.paymentMethod}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentStatus === 'paid' ? 'text-emerald-400 bg-emerald-950' : 'text-amber-400 bg-amber-950'
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Status Stepper Selector */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 text-xs font-semibold mr-1">Update Status:</span>
                    {[
                      'Pending Payment',
                      'Payment Verification',
                      'Confirmed',
                      'Processing',
                      'Ready for Pickup',
                      'Dispatched',
                      'In Transit',
                      'Delivered',
                    ].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(order.id, st as OrderStatus)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                          order.orderStatus === st
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: PAYMENT VERIFICATION */}
        {activeSection === 'payments' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Bank Transfer Verifications</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect customer uploaded bank payment receipts and verify orders with one click
              </p>
            </div>

            <div className="space-y-4">
              {orders.filter(o => o.paymentStatus !== 'paid' || o.proofOfPaymentUrl).map(order => (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-base font-black text-white">{order.orderNumber}</span>
                      <p className="text-slate-400 text-[11px]">
                        Customer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white">{formatNaira(order.total)}</span>
                      {order.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => handleVerifyOrderPayment(order.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Mark Paid</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {order.proofOfPaymentUrl ? (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                      <img
                        src={order.proofOfPaymentUrl}
                        alt="Proof"
                        className="w-24 h-24 object-cover rounded-xl border border-slate-800 cursor-pointer"
                        onClick={() => setViewingProofUrl(order.proofOfPaymentUrl || null)}
                      />
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold">Proof of Payment Attached</span>
                        <p className="text-slate-400 text-[11px]">
                          Reference: <strong className="text-white">{order.paymentReference || 'N/A'}</strong>
                        </p>
                        <button
                          onClick={() => setViewingProofUrl(order.proofOfPaymentUrl || null)}
                          className="text-red-400 underline text-[11px]"
                        >
                          Click to inspect full screenshot
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No transfer receipt uploaded yet by customer.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: SAVE TO BUY DESK */}
        {activeSection === 'savings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Save to Buy Administration</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify customer savings deposits and monitor savings progress
              </p>
            </div>

            {/* Pending Deposits Table */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Pending Savings Deposits ({pendingSavingsCount})</h3>
              {savingsTransactions.filter(t => t.status === 'pending').length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Zero pending deposit verifications. All transactions are up to date!
                </div>
              ) : (
                <div className="space-y-3">
                  {savingsTransactions.filter(t => t.status === 'pending').map(tx => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white text-sm">{formatNaira(tx.amount)}</span>
                        <p className="text-slate-400 text-[11px]">
                          Plan ID: {tx.planId} • Ref: {tx.reference}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {tx.proofOfPaymentUrl && (
                          <button
                            onClick={() => setViewingProofUrl(tx.proofOfPaymentUrl || null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                          >
                            Inspect Slip
                          </button>
                        )}
                        <button
                          onClick={() => handleVerifySavingsTx(tx.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                        >
                          Approve Deposit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 6: CREDABLY BNPL DESK */}
        {activeSection === 'bnpl' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Credably Financing Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Review applicant credit scores, underwriting notes, and disbursement statuses
              </p>
            </div>

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

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full font-bold uppercase text-[11px] bg-blue-950 text-blue-300 border border-blue-800">
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-500 block">Applicant</span>
                      <p className="font-bold text-white">{app.customerName}</p>
                      <p className="text-slate-400">{app.customerPhone}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Employment / Income</span>
                      <p className="font-bold text-white">{app.employmentStatus}</p>
                      <p className="text-slate-400">{formatNaira(app.monthlyIncome)} / mo</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Financing Terms</span>
                      <p className="font-bold text-white">{formatNaira(app.requestedAmount)}</p>
                      <p className="text-blue-400 font-bold">{formatNaira(app.monthlyInstallment)} / mo ({app.tenureMonths} mos)</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block">BVN/NIN Mask</span>
                      <p className="font-mono font-bold text-white">{app.bvnOrNinMasked}</p>
                    </div>
                  </div>

                  {/* Decision updater */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <span className="text-slate-400">Change Credably Decision:</span>
                    <button
                      onClick={() => handleUpdateBnplStatus(app.id, 'approved')}
                      className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold hover:bg-emerald-900"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateBnplStatus(app.id, 'disbursed')}
                      className="px-3 py-1 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 font-bold hover:bg-blue-900"
                    >
                      Disburse / Release Device
                    </button>
                    <button
                      onClick={() => handleUpdateBnplStatus(app.id, 'rejected')}
                      className="px-3 py-1 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 font-bold hover:bg-rose-900"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: PROMOTIONAL SLIDES */}
        {activeSection === 'banners' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Homepage Promotional Slides</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize banners, slogans, and campaign links shown on the storefront
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map(ban => (
                <div
                  key={ban.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden text-xs space-y-3"
                >
                  <img src={ban.imageUrl} alt="" className="w-full h-40 object-cover" />
                  <div className="p-5 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600/20 text-red-400">
                      {ban.badge}
                    </span>
                    <h3 className="font-bold text-white text-base">{ban.title}</h3>
                    <p className="text-slate-400">{ban.subtitle}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Link: {ban.ctaLink}</span>
                      <span className="font-bold text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: SETTINGS */}
        {activeSection === 'settings' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Store Business Settings</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure company bank details, WhatsApp support number, and delivery matrix
              </p>
            </div>

            {/* Bank details */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm">Official Bank Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={settingsForm.bankDetails.bankName}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      bankDetails: { ...settingsForm.bankDetails, bankName: e.target.value },
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={settingsForm.bankDetails.accountName}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      bankDetails: { ...settingsForm.bankDetails, accountName: e.target.value },
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={settingsForm.bankDetails.accountNumber}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      bankDetails: { ...settingsForm.bankDetails, accountNumber: e.target.value },
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Contact & WhatsApp */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm">Contact & WhatsApp Integration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">WhatsApp Hotline (digits only)</label>
                  <input
                    type="text"
                    value={settingsForm.contactInfo.whatsappNumber}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      contactInfo: { ...settingsForm.contactInfo, whatsappNumber: e.target.value },
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Customer Support Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contactInfo.phone}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      contactInfo: { ...settingsForm.contactInfo, phone: e.target.value },
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Official Business Address</label>
                  <textarea
                    rows={2}
                    value={settingsForm.contactInfo.address}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      contactInfo: { ...settingsForm.contactInfo, address: e.target.value },
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration Changes</span>
            </button>
          </form>
        )}
      </main>

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 text-xs">
            <h3 className="text-lg font-bold text-white">
              {editingProduct.id ? 'Edit Smartphone' : 'Add New Smartphone to Inventory'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <select
                    value={editingProduct.brand || 'Apple'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Condition</label>
                  <select
                    value={editingProduct.condition || 'brand-new'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="brand-new">Brand New (Sealed)</option>
                    <option value="uk-used">UK-Used (Tested)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selling Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Previous Price (₦) [Optional]</label>
                  <input
                    type="number"
                    value={editingProduct.previousPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, previousPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Available Stock (Units)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || 5}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Battery Health (%) [For UK-used]</label>
                  <input
                    type="number"
                    value={editingProduct.batteryHealth || 100}
                    onChange={(e) => setEditingProduct({ ...editingProduct, batteryHealth: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Face ID / Biometrics</label>
                  <input
                    type="text"
                    value={editingProduct.faceId || 'Working 100%'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, faceId: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warranty Term</label>
                  <input
                    type="text"
                    value={editingProduct.warranty || '6 Months Store Warranty'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Save Smartphone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROOF OF PAYMENT ZOOM MODAL */}
      {viewingProofUrl && (
        <div
          onClick={() => setViewingProofUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg max-h-[85vh] bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <img src={viewingProofUrl} alt="Payment Proof" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
            <p className="text-center text-xs text-slate-400 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
