import React from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  ChevronRight,
  Phone,
  Clock,
  MessageCircle,
  Video,
  Navigation,
  Sparkles,
  Building,
} from 'lucide-react';
import { ContactSection } from '../components/ContactSection';
import { buildWhatsAppLink } from '../utils/format';

interface ContactPageProps {
  isDarkMode: boolean;
  onNavigate: (page: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ isDarkMode, onNavigate }) => {
  const whatsappUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG, I am heading to Pioneer Mall and need directions to Shop PB86.'
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
          <span className="text-[#1D9BB5]">Location &amp; Contact</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#1D9BB5]/10 text-[#1D9BB5] mb-3">
              <MapPin className="w-3.5 h-3.5" />
              Visit Our Kampala Lab
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Shop PB86, New Pioneer Mall
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Centrally located in Kampala City Centre. Walk in anytime Mon–Sat 8:00 AM – 7:00 PM for diagnostic testing, screen replacements, and genuine parts retail.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:0753234218"
              className="glow-btn text-white font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span>Call Technician</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Pioneer Mall Physical Landmark Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1D9BB5]/15 text-[#1D9BB5] flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base">Shop Number PB86</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Located on the ground floor arcade of New Pioneer Mall, Kampala. Look for the illuminated <strong>iPhone Lab UG</strong> badge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base">Lab Operating Hours</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <strong>Monday – Saturday:</strong> 8:00 AM – 7:00 PM<br />
                  <strong>Sunday:</strong> 10:00 AM – 4:00 PM (Emergency WhatsApp booking)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base">Getting Here &amp; Parking</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Secure car parking available at Pioneer Mall. Easily accessible via Kampala Road and Luwum Street.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Contact Section Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactSection isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};
