import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets,
  Smartphone,
  Layers,
  BatteryCharging,
  WifiOff,
  VolumeX,
  Volume2,
  Lock,
  Unlock,
  SignalHigh,
  RefreshCw,
  Zap,
  ScanFace,
  Cpu,
  Microscope,
  Activity,
  Wrench,
  ChevronRight,
  X,
  Ear,
  SmartphoneNfc,
} from 'lucide-react';
import { ServiceItem } from '../types';
import { INITIAL_SERVICES } from '../data/seedData';

interface ServicesGridProps {
  isDarkMode: boolean;
  onSelectServiceForBooking: (serviceTitle: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Droplets,
  Smartphone,
  Layers,
  BatteryCharging,
  WifiOff,
  VolumeX,
  Volume2,
  Lock,
  Unlock,
  SignalHigh,
  RefreshCw,
  Zap,
  ScanFace,
  Cpu,
  Microscope,
  Activity,
  Wrench,
  Ear,
  SmartphoneNfc,
};

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  isDarkMode,
  onSelectServiceForBooking,
}) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleBookService = (service: ServiceItem) => {
    onSelectServiceForBooking(service.title);
    setSelectedService(null);
  };

  const sortedServices = React.useMemo(() => {
    return [...INITIAL_SERVICES].sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
  }, []);

  return (
    <section id="services" className={`py-20 relative overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-slate-50'}`}>
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[30%] -right-[10%] w-[500px] h-[500px] bg-[#1F3864] rounded-full blur-[140px] opacity-30" />
        <div className="absolute bottom-[20%] -left-[10%] w-[450px] h-[450px] bg-[#1D9BB5] rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-teal border border-[#1D9BB5]/30 text-[#1D9BB5] text-xs font-bold uppercase tracking-wider mb-3">
            <Wrench className="w-3.5 h-3.5" />
            Laboratories & Workshop
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
            What We Fix
          </h2>
          <p className={`text-base sm:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Specialized component-level hardware repair, diagnostic testing, and micro-soldering for all iPhone models from iPhone X to 17 Pro Max.
          </p>
        </div>

        {/* Services 12-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedServices.map((service, index) => {
            const IconComponent = ICON_MAP[service.iconName] || Wrench;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => setSelectedService(service)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedService(service);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${service.title}`}
                className={`group cursor-pointer rounded-2xl p-6 relative transition-all duration-300 shadow-lg flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                  isDarkMode
                    ? 'glass-card-dark hover:border-[#1D9BB5]/50'
                    : 'glass-card-light hover:border-[#1D9BB5]'
                }`}
              >
                {/* Popular Badge */}
                {service.isPopular && (
                  <span className="absolute top-4 right-4 gold-badge text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Popular Fix
                  </span>
                )}

                <div>
                  {/* Icon Box */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                      isDarkMode ? 'liquid-teal text-[#1D9BB5] border border-[#1D9BB5]/20' : 'bg-[#1D9BB5]/10 text-[#1D9BB5]'
                    }`}
                  >
                    <IconComponent className="w-7 h-7" />
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-lg font-extrabold mb-2 transition-colors group-hover:text-[#1D9BB5] ${
                    isDarkMode ? 'text-white' : 'text-[#1F3864]'
                  }`}>
                    {service.title}
                  </h3>
                  <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700 font-medium'
                  }`}>
                    {service.description}
                  </p>
                </div>

                {/* Card Footer Info */}
                <div className={`pt-4 border-t flex items-center justify-end text-xs ${
                  isDarkMode ? 'border-white/10' : 'border-slate-200/80'
                }`}>
                  <span className="font-bold text-[#1D9BB5] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Modal Drawer */}
        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="service-modal-title"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl ${
                  isDarkMode ? 'glass-card-dark text-white' : 'glass-card-light text-slate-900'
                }`}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  aria-label="Close service details dialog"
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Modal Content */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl liquid-teal text-[#1D9BB5] border border-[#1D9BB5]/30 flex items-center justify-center shrink-0">
                    {React.createElement(ICON_MAP[selectedService.iconName] || Wrench, { className: 'w-8 h-8' })}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1D9BB5] uppercase tracking-wider">
                      iPhone Lab Service
                    </span>
                    <h3 id="service-modal-title" className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
                      {selectedService.title}
                    </h3>
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedService.description}
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleBookService(selectedService)}
                    className="flex-1 glow-btn text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Book This Repair</span>
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className={`py-3.5 px-5 rounded-xl text-sm font-semibold border ${
                      isDarkMode ? 'border-white/10 hover:bg-white/10 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
