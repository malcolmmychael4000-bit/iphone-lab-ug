import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ChevronRight,
  Microscope,
  Cpu,
  UserCheck,
  Award,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TrustSection } from '../components/TrustSection';
import { ReviewsSection } from '../components/ReviewsSection';
import { buildWhatsAppLink } from '../utils/format';

interface AboutPageProps {
  isDarkMode: boolean;
  onNavigate: (page: string, params?: { service?: string }) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ isDarkMode, onNavigate }) => {
  const whatsappUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG, I would like to learn more about your repair lab at Pioneer Mall.'
  );

  const workflowSteps = [
    {
      step: '01',
      title: 'Free In-Lab Diagnostics',
      desc: 'Our technician inspects your iPhone under microscope, measures ampere current draw, and identifies component-level faults.',
    },
    {
      step: '02',
      title: 'Transparent Written Quote',
      desc: 'You receive clear pricing in UGX with screen tier options (InCell vs DD OLED) before any work starts. No surprise fees.',
    },
    {
      step: '03',
      title: 'Precision Cleanroom Repair',
      desc: 'Repairs are executed using ESD anti-static mats, digital soldering stations, thermal cameras, and automated laser glass machines.',
    },
    {
      step: '04',
      title: '32-Point Stress Testing',
      desc: 'We test biometrics, True Tone, cameras, microphones, charging speeds, and antenna signal strength before handover.',
    },
    {
      step: '05',
      title: '30-Day Testing Guarantee',
      desc: 'You leave with a verified device backed by our 30-day replacement testing warranty on parts and workmanship.',
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
          <span className="text-[#1D9BB5]">Why Choose Us &amp; Lab Standards</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#1D9BB5]/10 text-[#1D9BB5] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Excellence in Hardware Engineering
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Why iPhone Lab UG
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Kampala’s dedicated hardware laboratory for Apple mobile electronics. Original components, surgical micro-soldering precision, and trusted customer transparency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('book')}
              className="glow-btn text-white font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg"
            >
              <span>Book Priority Repair</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Talk to Technician</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lab Story & Workshop Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#1D9BB5]">
                Our Mission in Kampala
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                "We Fix. We Care. We Connect."
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-300 leading-relaxed">
                Founded at <strong className="text-slate-900 dark:text-white">Shop PB86, New Pioneer Mall</strong>, iPhone Lab UG was established to solve a critical gap in Uganda’s smartphone repair market: the lack of precision micro-soldering tooling and unverified counterfeit replacement parts.
              </p>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-300 leading-relaxed">
                We invested heavily in stereoscopic optical microscopes, thermal PCB diagnostic imagers, laser automated rear glass ablation machines, and hardware EEPROM programmers. Today, we handle both end-customer walk-ins and complex board-level referrals from hundreds of repair technicians across Uganda.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1 text-[#1D9BB5]">
                  <CheckCircle2 className="w-4 h-4" /> Real Optical Micro-Soldering
                </span>
                <span className="flex items-center gap-1 text-[#1D9BB5]">
                  <CheckCircle2 className="w-4 h-4" /> True Tone Cloned On Every Screen
                </span>
                <span className="flex items-center gap-1 text-[#1D9BB5]">
                  <CheckCircle2 className="w-4 h-4" /> Safe Laser Glass Removal
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl sm:text-4xl font-black text-[#1D9BB5]">5,000+</div>
                <div className="text-xs font-bold text-slate-400 mt-1">iPhones Successfully Repaired</div>
              </div>
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl sm:text-4xl font-black text-sky-400">99.4%</div>
                <div className="text-xs font-bold text-slate-400 mt-1">Diagnostics &amp; Fix Rate</div>
              </div>
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">30 Days</div>
                <div className="text-xs font-bold text-slate-400 mt-1">Testing Guarantee Policy</div>
              </div>
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl sm:text-4xl font-black text-amber-400">PB86</div>
                <div className="text-xs font-bold text-slate-400 mt-1">Pioneer Mall Location</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Trust Section Component */}
      <TrustSection isDarkMode={isDarkMode} />

      {/* 5-Step Repair Workflow Protocol */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#1D9BB5]">
            Transparent Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
            Our 5-Step Repair Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            From the moment you walk into Shop PB86 to the moment you test your restored device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border relative flex flex-col justify-between ${
                isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <span className="text-2xl font-black text-[#1D9BB5]/40 block mb-2">
                  {step.step}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Customer Reviews Component */}
      <ReviewsSection isDarkMode={isDarkMode} />
    </div>
  );
};
