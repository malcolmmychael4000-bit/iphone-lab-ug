import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  ChevronRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { BookingForm } from '../components/BookingForm';
import { buildWhatsAppLink } from '../utils/format';

interface BookingPageProps {
  isDarkMode: boolean;
  preselectedService?: string;
  onNavigate: (page: string) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  isDarkMode,
  preselectedService,
  onNavigate,
}) => {
  const whatsappUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG, I would like to book a priority repair appointment at Shop PB86.'
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
          <span className="text-[#1D9BB5]">Book Priority Repair</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#1D9BB5]/10 text-[#1D9BB5] mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Priority In-Lab Queue
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Book Your Repair Appointment
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Reserve genuine screen tiers, battery cells, and technician lab time at Shop PB86, New Pioneer Mall. Skip the waiting line with advance booking.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold px-5 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Book via WhatsApp</span>
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

      {/* Pioneer Mall Priority Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDarkMode ? 'bg-[#1F3864]/30 border-[#1D9BB5]/30' : 'bg-sky-50 border-sky-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D9BB5] text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black">Same-Day Walk-In Priority Guaranteed</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Most display swaps take 30–45 mins. Battery swaps take 30 mins.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D9BB5] shrink-0">
            <MapPin className="w-4 h-4" />
            <span>Shop PB86, New Pioneer Mall, Kampala</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Booking Form Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookingForm
          isDarkMode={isDarkMode}
          preselectedService={preselectedService}
        />
      </div>

      {/* Pre-Visit Checklist & Advice */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-4 text-[#1D9BB5]">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Before Dropping Off Your iPhone
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-extrabold">1. Backup Your Data (If Screen Displays)</strong>
              <p>If your device is still operational, back up via iCloud or your computer. For dead/liquid damaged boards, we prioritize data preservation.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-extrabold">2. Device Passcode for Diagnostics</strong>
              <p>To verify cameras, touch sensors, and audio post-repair, our technician will test basic functions with you in person.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-extrabold">3. Liquid Damage Precaution</strong>
              <p>If your iPhone fell in water, do not connect it to a charger. Power it down immediately and bring it to Shop PB86 for ultrasonic cleaning.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-extrabold">4. 30-Day Testing Period</strong>
              <p>Retain your repair receipt and test warranty badge for instant replacement if any component defect arises within 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
