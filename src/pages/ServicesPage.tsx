import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  Cpu,
  Droplets,
  ScanFace,
  BatteryCharging,
  Layers,
  ArrowRight,
  HelpCircle,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { ServicesGrid } from '../components/ServicesGrid';
import { buildWhatsAppLink } from '../utils/format';

interface ServicesPageProps {
  isDarkMode: boolean;
  onNavigate: (page: string, params?: { service?: string }) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ isDarkMode, onNavigate }) => {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const handleSelectServiceForBooking = (serviceTitle: string) => {
    onNavigate('book', { service: serviceTitle });
  };

  const whatsappUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG, I have a question about a specialized iPhone repair service at Pioneer Mall.'
  );

  const faqs = [
    {
      q: 'Will True Tone and Face ID work after a screen replacement?',
      a: 'Yes! Unlike standard roadside shops, iPhone Lab UG uses hardware programmers to clone the True Tone serial code from your original display onto the new InCell or DD OLED screen. We also preserve and transplant your original Face ID sensor flex so biometrics remain 100% functional.',
    },
    {
      q: 'What is component-level micro-soldering and how long does it take?',
      a: 'Micro-soldering involves repairing tiny microscopic traces, resistors, capacitors, and microchips (PMIC, audio IC, baseband modem, charging Hydra chip) directly on the iPhone logic board using high-powered stereoscopic lab microscopes. Most board repairs take 1 to 3 hours depending on diagnostics.',
    },
    {
      q: 'Can you recover an iPhone that has fallen in water or liquids?',
      a: 'Yes! We perform an emergency ultrasonic chemical decontamination bath to dissolve mineral oxidation and corrosion. We then test board traces for short circuits under thermal cameras. Please avoid turning on or charging a water-damaged iPhone before bringing it to Shop PB86.',
    },
    {
      q: 'Will my battery show 100% maximum capacity and no non-genuine warning?',
      a: 'Yes. On newer iPhones (XS through 16 Pro Max), Apple pairs the battery serial to the board. We can either calibrate and spot-weld your original BMS board onto a Grade-A fresh cell or program the battery flex so your device displays full 100% battery health with normal cycle reporting.',
    },
    {
      q: 'How does your automated laser back glass machine work?',
      a: 'Our high-precision laser ablation machine scans the exact vector pattern of your iPhone model and vaporizes the tough factory epoxy glue beneath the shattered glass without needing to heat or bend the internal motherboard and camera modules.',
    },
  ];

  return (
    <div className="py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Breadcrumb & Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4">
          <button onClick={() => onNavigate('home')} className="hover:text-[#1D9BB5] transition-colors">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1D9BB5]">Services &amp; Laboratory Repairs</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#1D9BB5]/10 text-[#1D9BB5] mb-3">
              <Wrench className="w-3.5 h-3.5" />
              Specialized Hardware Services
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              iPhone Repair Laboratory
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Component-level diagnostics, micro-soldering, OEM display restoration, and rapid walk-in repairs at Shop PB86, New Pioneer Mall Kampala.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('book')}
              className="glow-btn text-white font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg"
            >
              <span>Book A Repair Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

      {/* Main Interactive Services Grid Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServicesGrid
          isDarkMode={isDarkMode}
          onSelectServiceForBooking={handleSelectServiceForBooking}
        />
      </div>

      {/* Repair Quality & Testing Checklist */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-10 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}>
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Our 32-Point Post-Repair Lab Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every phone repaired in our lab undergoes systematic hardware stress testing before customer pickup.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              'True Tone & 120Hz Calibration',
              'Ear Speaker & Microphone Audio',
              'Face ID Dot Projector Testing',
              'Battery Health & Current Draw',
              'Wi-Fi & Cellular Signal RSSI',
              'Camera Optical Image Stabilization',
              'Port Ampere Charge Testing',
              '30-Day Testing Guarantee Included',
            ].map((check, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
                  isDarkMode ? 'bg-black/30 border-white/5 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  ✓
                </div>
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Repair FAQs Accordion */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Clear Answers
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Frequently Asked Repair Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-black text-sm sm:text-base focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-[#1D9BB5] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Action Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
          isDarkMode ? 'bg-gradient-to-r from-[#1F3864]/50 to-[#1D9BB5]/20 border-[#1D9BB5]/30' : 'bg-gradient-to-r from-sky-50 to-cyan-50 border-cyan-200'
        }`}>
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Have an iPhone hardware problem not listed here?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Speak directly with our senior hardware technician for instant diagnostics and quotes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('book')}
              className="glow-btn text-white font-black px-6 py-3 rounded-xl text-sm"
            >
              Book Lab Inspection
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
