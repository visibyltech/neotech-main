import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { Order } from '../types';
import { formatNaira, formatDate } from '../utils/formatters';

interface PaymentReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Top actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Official Tax Invoice & Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="space-y-6 text-xs text-slate-300 print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-white">Neo<span className="text-red-500">Tech</span> Gadget</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                Smarter Tech. Better Life.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Suite B4, Tech Plaza, Computer Village, Ikeja, Lagos
              </p>
              <p className="text-[11px] text-slate-400">
                Hotline: +234 814 902 4432 | support@neotechgadget.com
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="font-mono text-base font-extrabold text-red-400 block">
                {order.orderNumber}
              </span>
              <p className="text-slate-400 text-[11px]">Date: {formatDate(order.createdAt)}</p>
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-white border border-slate-700">
                Status: {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer</span>
              <p className="font-bold text-white text-sm">{order.customerName}</p>
              <p className="text-slate-400">{order.customerPhone}</p>
              <p className="text-slate-400">{order.customerEmail}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Fulfillment</span>
              <p className="font-bold text-white text-sm capitalize">{order.fulfillmentType}</p>
              <p className="text-slate-400">
                {order.fulfillmentType === 'delivery'
                  ? `${order.deliveryAddress?.fullAddress}, ${order.deliveryAddress?.state}`
                  : 'Pickup: Ikeja Experience Center'}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Item & Specifications</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {order.items.map(item => (
                  <tr key={item.productId} className="text-xs">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.productName}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.color} • {item.storage} • {item.condition === 'brand-new' ? 'Sealed Brand New' : 'UK-Used Tested'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-300">
                      {formatNaira(item.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-white">
                      {formatNaira(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-bold text-white">{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge:</span>
                <span className="font-bold text-white">{formatNaira(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-red-400 text-lg">{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Verification stamp */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Payment Reference:{' '}
                <strong className="text-white font-mono">{order.paymentReference || 'NTG-SYS-AUTO'}</strong>
              </span>
            </div>
            <span className="font-bold text-emerald-400 capitalize">Payment {order.paymentStatus}</span>
          </div>

          <div className="text-center text-[10px] text-slate-500 pt-2">
            Thank you for shopping with Neo Tech Gadget! All devices include our warranty and diagnostic guarantee.
          </div>
        </div>
      </div>
    </div>
  );
};
