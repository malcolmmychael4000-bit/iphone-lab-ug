import React from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  Package,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  MessageCircle,
  Layers,
  Zap,
} from 'lucide-react';
import { Hero } from '../components/Hero';
import { buildWhatsAppLink, formatUGX } from '../utils/format';

interface HomePageProps {
  isDarkMode: boolean;
  onNavigate: (page: string, params?: { service?: string }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ isDarkMode, onNavigate }) => {
  const whatsappUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG, I am interested in repairing my iPhone at Shop PB86, Pioneer Mall.'
  );

  const featuredServices = [
    {
      title: 'Screen Replacement',
      desc: 'High-brightness InCell & factory OEM OLED (DD) screens with True Tone programming.',
      turnaround: '30–45 Mins',
      tag: 'Most Popular',
      id: 'Screen Replacement (InCell / OLED (DD))',
    },
    {
      title: 'Motherboard Micro-Soldering',
      desc: 'Component-level trace repair, short circuit clearing, audio IC, and PMIC diagnostics under microscope.',
      turnaround: '1–3 Hours',
      tag: 'Lab Specialty',
      id: 'Micro Soldering & Board Component Repair',
    },
    {
      title: 'OEM Battery Health Swap',
      desc: '100% health Grade-A cells with calibrated BMS to restore all-day battery life.',
      turnaround: '30 Mins',
      tag: 'Instant Fix',
      id: 'Battery Replacement (100% Health OEM)',
    },
    {
      title: 'Laser Back Glass Replacement',
      desc: 'Automated laser machine removes shattered rear glass without opening or stressing internal chassis.',
      turnaround: '1–2 Hours',
      tag: 'Clean Finish',
      id: 'Back Glass Replacement (Laser Precision)',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Carousel Component */}
      <Hero onNavigate={onNavigate} isDarkMode={isDarkMode} />

      {/* Featured Services Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#1D9BB5]/10 text-[#1D9BB5] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Specialized iPhone Fixes
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Component-Level Repair Laboratory
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              We fix what other shops call "unrepairable". From quick screen swaps to complex logic board micro-soldering in Kampala.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1D9BB5] hover:text-[#17859c] group shrink-0 transition-colors"
          >
            <span>View All 8+ Specialized Services</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredServices.map((service, index) => (
            <div
              key={index}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between hover:shadow-xl group ${
                isDarkMode
                  ? 'bg-slate-900/60 border-white/10 hover:border-[#1D9BB5]/50 hover:bg-slate-900'
                  : 'bg-white border-slate-200 hover:border-[#1D9BB5]/50 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1D9BB5]/15 text-[#1D9BB5]">
                    {service.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1D9BB5]" />
                    {service.turnaround}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight mb-2 group-hover:text-[#1D9BB5] transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {service.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('book', { service: service.id })}
                  className="text-xs font-extrabold text-[#1D9BB5] hover:underline flex items-center gap-1"
                >
                  Book Fix
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('services')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parts & Screens Teaser Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-[#0F172A] via-[#0A0E1A] to-[#0A0A0A] border-white/10'
            : 'bg-gradient-to-br from-slate-100 via-white to-sky-50 border-slate-200 shadow-lg'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/10 text-sky-400">
                <Package className="w-3.5 h-3.5" />
                Genuine Parts & Displays
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Quality Parts for Every Budget & Repair Shop
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-300 leading-relaxed">
                Whether you need high-grade affordable <strong className="text-[#1D9BB5]">InCell (JH)</strong> screens or original factory-spec <strong className="text-sky-400">OLED (DD)</strong> displays with vivid color calibration, we keep ready inventory for all models from iPhone X to iPhone 16 & 17.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="text-xs font-bold text-slate-400">Screen Tiers</div>
                  <div className="text-sm font-black text-[#1D9BB5]">InCell &amp; OLED DD</div>
                </div>
                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="text-xs font-bold text-slate-400">Warranty</div>
                  <div className="text-sm font-black text-emerald-400">30-Day Testing</div>
                </div>
                <div className={`p-3 rounded-2xl border col-span-2 sm:col-span-1 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="text-xs font-bold text-slate-400">Wholesale Supply</div>
                  <div className="text-sm font-black text-amber-400">Technician Rates</div>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('parts')}
                  className="glow-btn text-white font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg"
                >
                  <Package className="w-4 h-4" />
                  <span>Browse Full Parts Catalog</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${
                    isDarkMode
                      ? 'border-white/15 text-slate-200 hover:bg-white/10'
                      : 'border-slate-300 text-slate-800 hover:bg-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Wholesale Inquiry</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/80 border-cyan-500/30' : 'bg-white border-slate-200'}`}>
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#1D9BB5] text-white">InCell (JH)</span>
                  <div className="text-sm font-black mt-2">Display Replacement</div>
                  <div className="text-xs text-slate-400 mt-1">High brightness, durable glass, cost-effective</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-xs font-bold text-[#1D9BB5]">
                  From UGX 100,000
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/80 border-sky-500/30' : 'bg-white border-slate-200'}`}>
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-500 text-white">OLED (DD)</span>
                  <div className="text-sm font-black mt-2">Super Retina XDR</div>
                  <div className="text-xs text-slate-400 mt-1">Vivid blacks, 120Hz smooth touch, OEM standard</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-xs font-bold text-sky-400">
                  From UGX 150,000
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/80 border-emerald-500/30' : 'bg-white border-slate-200'}`}>
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">OEM Cells</span>
                  <div className="text-sm font-black mt-2">High-Capacity Batteries</div>
                  <div className="text-xs text-slate-400 mt-1">100% battery health, zero warning chip swap</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-xs font-bold text-emerald-400">
                  From UGX 80,000
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/80 border-amber-500/30' : 'bg-white border-slate-200'}`}>
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-white">Laser Rear</span>
                  <div className="text-sm font-black mt-2">Back Glass &amp; Housings</div>
                  <div className="text-xs text-slate-400 mt-1">Precision fit, wireless charging safe</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-xs font-bold text-amber-400">
                  From UGX 90,000
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Lab Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border flex items-start gap-4 ${isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#1D9BB5]/10 text-[#1D9BB5] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base mb-1">30-Day Testing Warranty</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Every genuine screen and battery installed at our lab comes with a replacement testing warranty for complete peace of mind.
              </p>
              <button
                onClick={() => onNavigate('about')}
                className="text-xs font-bold text-[#1D9BB5] mt-2 inline-flex items-center gap-1 hover:underline"
              >
                Learn About Our Standards <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border flex items-start gap-4 ${isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#1F3864]/30 text-[#38BDF8] flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base mb-1">Microscope Diagnostic Lab</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Equipped with stereo microscopes, thermal inspection cameras, and laser separators at Shop PB86 Pioneer Mall.
              </p>
              <button
                onClick={() => onNavigate('about')}
                className="text-xs font-bold text-[#1D9BB5] mt-2 inline-flex items-center gap-1 hover:underline"
              >
                Tour Our Lab Equipment <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border flex items-start gap-4 ${isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base mb-1">Central Kampala Location</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Shop PB86, New Pioneer Mall. Open Mon–Sat 8:00 AM – 7:00 PM for walk-in rapid repairs and parts collection.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="text-xs font-bold text-[#1D9BB5] mt-2 inline-flex items-center gap-1 hover:underline"
              >
                Get Directions &amp; Contacts <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Appointment Booking CTA Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden border ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#1F3864] via-[#102447] to-[#1D9BB5]/50 border-white/15 text-white'
            : 'bg-gradient-to-r from-[#1F3864] to-[#1D9BB5] text-white shadow-xl'
        }`}>
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-white/15 text-white backdrop-blur-md">
              <Calendar className="w-3.5 h-3.5" />
              Skip The Waiting Line
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Restore Your iPhone to Factory Perfection?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Book your priority slot online in seconds. Our certified technicians will have the exact genuine parts reserved for your device upon arrival at Shop PB86.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('book')}
                className="bg-white text-[#1F3864] hover:bg-slate-100 font-black px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Book Your Repair Slot
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat On WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
