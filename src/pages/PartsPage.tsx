import React from 'react';
import { motion } from 'motion/react';
import {
  Package,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Sparkles,
  Info,
  Wrench,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PartsProductsSection } from '../components/PartsProductsSection';
import { buildWhatsAppLink } from '../utils/format';

interface PartsPageProps {
  isDarkMode: boolean;
  onNavigate: (page: string, params?: { service?: string }) => void;
}

export const PartsPage: React.FC<PartsPageProps> = ({ isDarkMode, onNavigate }) => {
  const handleSelectPartForBooking = (partName: string) => {
    onNavigate('book', { service: partName });
  };

  const whatsappWholesaleUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG, I am a phone technician/shop owner inquiring about wholesale screen and battery supply in Kampala.'
  );

  return (
    <div className="py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Breadcrumb & Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4">
          <button onClick={() => onNavigate('home')} className="hover:text-[#1D9BB5] transition-colors">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1D9BB5]">Genuine Parts &amp; Screen Catalog</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#1D9BB5]/10 text-[#1D9BB5] mb-3">
              <Package className="w-3.5 h-3.5" />
              Verified Hardware Inventory
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Genuine iPhone Parts &amp; Displays
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Tested displays (InCell &amp; DD OLED), 100% health batteries, laser back glass, camera modules, and flex assemblies for iPhone 6 through iPhone 17 Pro Max.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={whatsappWholesaleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold px-5 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Technician Wholesale Price</span>
            </a>
            <a
              href="tel:0753234218"
              className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${
                isDarkMode ? 'border-white/10 text-slate-200 hover:bg-white/5' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Phone className="w-4 h-4 text-[#1D9BB5]" />
              <span>0753 234 218</span>
            </a>
          </div>
        </div>
      </div>

      {/* Screen Tier Explainer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-slate-900/60 border-cyan-500/30' : 'bg-white border-cyan-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-[#1D9BB5] text-white">
                Tier 1 · InCell (JH)
              </span>
              <span className="text-xs font-extrabold text-[#1D9BB5]">Value &amp; Durability</span>
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2">High-Brightness InCell Display</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Advanced LCD embedded directly inside the glass. 650+ nits brightness, robust impact tolerance, responsive touch matrix, and full True Tone programmer compatibility at an accessible budget.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span>✓ 30-Day Testing</span>
              <span>✓ True Tone Ready</span>
              <span>✓ Budget-Friendly</span>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-slate-900/60 border-sky-500/30' : 'bg-white border-sky-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-sky-500 text-white">
                Tier 2 · OLED (DD)
              </span>
              <span className="text-xs font-extrabold text-sky-400">Factory Spec Precision</span>
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2">Super Retina XDR Soft OLED</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              True emissive organic diodes with infinite contrast ratio, deep pure blacks, native 120Hz ProMotion fluid scrolling, ultra-thin bezels, and factory color gamut fidelity.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span>✓ 100% Factory Colors</span>
              <span>✓ 120Hz ProMotion</span>
              <span>✓ Pure OLED Blacks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Parts Products Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartsProductsSection
          isDarkMode={isDarkMode}
          onSelectPartForBooking={handleSelectPartForBooking}
        />
      </div>

      {/* Wholesale & Bulk Supply Banner for Repair Shops */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-10 rounded-3xl border flex flex-col lg:flex-row items-center justify-between gap-6 ${
          isDarkMode
            ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/30'
            : 'bg-gradient-to-r from-amber-50 to-white border-amber-200 shadow-md'
        }`}>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500">
              <Wrench className="w-3.5 h-3.5" />
              For Phone Technicians &amp; Repair Shops in Uganda
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Looking for Bulk / Wholesale Parts Supply?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              We supply original and high-tier tested displays, batteries, laser glass, charging ICs, and True Tone programmers to phone repair technicians across Kampala, Entebbe, Jinja, and nationwide.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={whatsappWholesaleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-btn text-white font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <span>Get Wholesale Price Sheet</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
