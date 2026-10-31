import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ShieldCheck,
  ArrowRight,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { ordersService } from '../services/ordersService';
import { formatNaira, formatDate, getStatusColor } from '../utils/formatters';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onOpenReceipt: (order: Order) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onOpenReceipt,
  onNavigate,
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const performSearch = async (num: string) => {
    if (!num.trim()) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const order = await ordersService.getOrderByNumber(num.trim());
      if (order) {
        setSearchedOrder(order);
      } else {
        setSearchedOrder(null);
        setSearchError(`No order found matching "${num}". Please check your order reference number.`);
      }
    } catch {
      setSearchError('Error looking up order. Please check your network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      performSearch(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(orderQuery);
  };

  // Determine active step index (0 to 4)
  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending Payment':
        return 0;
      case 'Payment Verification':
        return 1;
      case 'Confirmed':
      case 'Processing':
      case 'Ready for Pickup':
        return 2;
      case 'Dispatched':
      case 'In Transit':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const steps = [
    { title: 'Order Placed', desc: 'Received in system' },
    { title: 'Payment Verification', desc: 'Audit confirmation' },
    { title: 'Confirmed & Packaged', desc: 'Device prepped & inspected' },
    { title: 'Dispatched / In Transit', desc: 'With courier or ready at hub' },
    { title: 'Delivered / Collected', desc: 'Handed over to customer' },
  ];

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/10 text-red-400 border border-red-500/30">
          <Truck className="w-3.5 h-3.5" />
          Live Order Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Track Your Smartphone Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Enter your Neo Tech Gadget order reference (e.g. NTG-ORD-123456) to see live delivery and fulfillment status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            required
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order # (e.g. NTG-ORD-749102)"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-28 py-3.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
          >
            {isSearching ? 'Tracking...' : 'Track'}
          </button>
        </div>
      </form>

      {searchError && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-300 text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Order Status Result Card */}
      {searchedOrder && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 animate-in fade-in duration-300">
          {/* Card header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-black text-white">
                  {searchedOrder.orderNumber}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(searchedOrder.orderStatus).bg} ${getStatusColor(searchedOrder.orderStatus).text} ${getStatusColor(searchedOrder.orderStatus).border}`}>
                  {searchedOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Placed on {formatDate(searchedOrder.createdAt)} by {searchedOrder.customerName}
              </p>
            </div>

            <button
              onClick={() => onOpenReceipt(searchedOrder)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 transition w-fit"
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>Official Invoice & Receipt</span>
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Fulfillment Journey
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={st.title}
                    className={`p-3.5 rounded-2xl border transition ${
                      isCurrent
                        ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500/40 text-white'
                        : isPassed
                        ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-red-500 text-white animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isPassed && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <span className="text-[11px] font-bold leading-tight line-clamp-1">{st.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & Tracking Info */}
          {searchedOrder.trackingNumber && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Courier Tracking Reference:</span>
                  <span className="font-mono font-bold text-white text-sm">{searchedOrder.trackingNumber}</span>
                </div>
              </div>
              <span className="text-[11px] text-cyan-300 font-semibold">Active Dispatch</span>
            </div>
          )}

          {/* Ordered Devices */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Purchased Devices ({searchedOrder.items.length})
            </h4>
            <div className="divide-y divide-slate-800 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden text-xs">
              {searchedOrder.items.map(item => (
                <div key={item.productId} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt=""
                      className="w-12 h-12 object-contain rounded-lg bg-slate-900 p-1"
                    />
                    <div>
                      <p className="font-bold text-white">{item.productName}</p>
                      <p className="text-slate-400 text-[11px]">
                        {item.color} • {item.storage} • {item.condition === 'brand-new' ? 'Brand New' : 'UK-Used'}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-white text-right">
                    <span>{formatNaira(item.price * item.quantity)}</span>
                    <span className="text-[10px] text-slate-500 block">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment details */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="text-slate-400 font-semibold block">Delivery Information:</span>
            {searchedOrder.fulfillmentType === 'delivery' ? (
              <p>
                {searchedOrder.deliveryAddress?.fullAddress}, {searchedOrder.deliveryAddress?.lga}, {searchedOrder.deliveryAddress?.state}
              </p>
            ) : (
              <p>Store Collection: Neo Tech Gadget Experience Center, Computer Village, Ikeja, Lagos</p>
            )}
            <p className="text-[11px] text-slate-400 pt-1">
              Recipient: {searchedOrder.customerName} ({searchedOrder.customerPhone})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
