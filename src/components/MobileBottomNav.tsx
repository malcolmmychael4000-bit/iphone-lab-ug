import React from 'react';
import { Wrench, Package, Calendar, MapPin, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenMenu: () => void;
  isDarkMode: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onNavigate,
  onOpenMenu,
  isDarkMode,
}) => {
  const navTabs = [
    {
      id: 'services',
      label: 'Fixes',
      icon: Wrench,
      ariaLabel: 'View iPhone repair services',
    },
    {
      id: 'parts',
      label: 'Parts',
      icon: Package,
      ariaLabel: 'Browse genuine iPhone parts and displays',
    },
    {
      id: 'booking',
      label: 'Book Now',
      icon: Calendar,
      isSpecial: true,
      ariaLabel: 'Book an iPhone repair appointment',
    },
    {
      id: 'contact',
      label: 'Shop PB86',
      icon: MapPin,
      ariaLabel: 'Find iPhone Lab location and directions',
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Quick Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-300 border-t ${
        isDarkMode
          ? 'bg-[#090D16]/90 backdrop-blur-2xl border-white/10 text-white'
          : 'bg-white/90 backdrop-blur-2xl border-slate-200/90 text-slate-900'
      } shadow-[0_-8px_30px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom,0px)]`}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {/* Services Tab */}
        {navTabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px] ${
                isActive
                  ? 'text-[#1D9BB5] font-black scale-105'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1D9BB5] rounded-full shadow-sm" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 leading-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Highlighted Center Primary Action: Book Now */}
        <button
          onClick={() => onNavigate('booking')}
          aria-label="Book an iPhone repair appointment now"
          aria-current={activeSection === 'booking' ? 'page' : undefined}
          className="flex-1 flex flex-col items-center justify-center -mt-4 py-0.5 group focus:outline-none min-h-[52px]"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:scale-105 group-active:scale-95 ${
              activeSection === 'booking'
                ? 'bg-gradient-to-tr from-[#1D9BB5] to-[#38BDF8] text-white ring-4 ring-[#1D9BB5]/30 shadow-[#1D9BB5]/40'
                : 'bg-gradient-to-tr from-[#1F3864] to-[#1D9BB5] text-white shadow-cyan-900/40'
            }`}
          >
            <Calendar className="w-6 h-6 stroke-[2.2px]" />
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-black tracking-tight mt-1 leading-tight ${
              activeSection === 'booking' ? 'text-[#1D9BB5]' : isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Book
          </span>
        </button>

        {/* Contact / Find Us Tab */}
        {navTabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px] ${
                isActive
                  ? 'text-[#1D9BB5] font-black scale-105'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1D9BB5] rounded-full shadow-sm" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 leading-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Menu Tab (Opens full slide drawer) */}
        <button
          onClick={onOpenMenu}
          aria-label="Open full navigation and contact menu"
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px] ${
            isDarkMode
              ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 leading-tight font-medium">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
