import React from 'react';
import { motion } from 'motion/react';
import { Microscope, Cpu, UserCheck, Sparkles, Check } from 'lucide-react';

interface TrustSectionProps {
  isDarkMode: boolean;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ isDarkMode }) => {
  const valueProps = [
    {
      icon: Microscope,
      title: 'Micro Precision Repair',
      description: 'Component-level logic board trace re-wiring and micro-chip reballing under high-powered lab microscopes.',
      badge: 'Advanced Lab',
    },
    {
      icon: Cpu,
      title: 'Advanced Diagnostic Tools',
      description: 'Automated laser back glass separation machine, True Tone programmers, and thermal imaging cameras.',
      badge: 'State-of-the-Art',
    },
    {
      icon: UserCheck,
      title: 'Certified Technicians',
      description: 'Kampala’s top Apple hardware specialists with years of micro-electronics repair mastery.',
      badge: 'Expert Hands',
    },
  ];

  const stats = [
    { value: '5,000+', label: 'iPhones Repaired in Kampala' },
    { value: '99.4%', label: 'Repair Success Rate' },
    { value: '100%', label: 'Tested Genuine Parts' },
    { value: 'Shop PB86', label: 'New Pioneer Mall, Kampala' },
  ];

  return (
    <section id="trust" className={`py-20 relative overflow-hidden ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-white text-slate-900'}`}>
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1D9BB5]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D9BB5]/10 text-[#1D9BB5] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Why Choose iPhone Lab UG
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
            Built on Precision, Equipment & Integrity
          </h2>
          <p className={`text-base sm:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            We combine high-tech laboratory diagnostic equipment with genuine parts to give your iPhone factory-grade performance.
          </p>
        </div>

        {/* 3 Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {valueProps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`p-6 rounded-2xl border transition-all duration-300 relative ${
                  isDarkMode
                    ? 'glass-card-dark hover:border-[#1D9BB5]/50'
                    : 'glass-card-light hover:border-[#1D9BB5]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center liquid-teal text-[#1D9BB5] border border-[#1D9BB5]/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isDarkMode
                        ? 'bg-white/10 text-[#1D9BB5]'
                        : 'bg-slate-200 text-[#1F3864]'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
                  {item.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Banner */}
        <div className="bg-[#1F3864] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1D9BB5]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="space-y-1"
              >
                <div className="text-3xl sm:text-5xl font-black tracking-tight text-[#1D9BB5]">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1D9BB5]" />
              <span>Direct Customer Drop-off & Wholesale Parts Orders Accepted</span>
            </div>
            <div className="font-semibold text-white">
              Location: Shop PB86, New Pioneer Mall, Kampala
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
