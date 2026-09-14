import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { buildWhatsAppLink } from '../utils/format';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG! I need assistance with an iPhone repair or genuine part inquiry.'
  );

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2">
      {/* Tooltip Preview Banner */}
      {showTooltip && (
        <div className="glass-card-dark text-white p-3.5 rounded-2xl shadow-2xl border border-[#1D9BB5]/40 text-xs max-w-xs relative animate-bounce backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            aria-label="Dismiss fast assistance prompt"
            className="absolute top-1 right-1 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5]"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="font-bold text-[#1D9BB5] mb-0.5">Need Fast Assistance?</div>
          <p className="text-[11px] text-slate-200">
            Chat live with our Kampala technicians at Shop PB86!
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </div>
  );
};
