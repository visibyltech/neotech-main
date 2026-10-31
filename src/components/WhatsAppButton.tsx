import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppButtonProps {
  whatsappNumber?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  whatsappNumber = '2348135933346',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const defaultMessage = encodeURIComponent(
    'Hello Neo Tech Gadget! I am browsing your website and would like assistance with buying a smartphone or starting a Save to Buy / BNPL plan.'
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end flex-col select-none">
      {/* Tooltip greeting */}
      {showTooltip && (
        <div className="mb-2 p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-white text-xs shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-2 relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-1.5 right-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400">Neo Tech Live Support</span>
          </div>
          <p className="text-slate-300">
            Have questions about iPhones, battery health, or Save to Buy plans? Chat with our team now!
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
        title="Chat with Neo Tech Gadget on WhatsApp"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping opacity-40"></span>
        <MessageCircle className="w-7 h-7 fill-slate-950 text-emerald-500 group-hover:rotate-6 transition" />
      </a>
    </div>
  );
};
