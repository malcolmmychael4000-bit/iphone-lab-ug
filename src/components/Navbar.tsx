import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import {
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Phone,
  ShieldCheck,
  Wrench,
  Package,
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { buildWhatsAppLink } from '../utils/format';
import { ThemeMode } from '../App';

interface NavbarProps {
  isDarkMode: boolean;
  themeMode?: ThemeMode;
  onSetTheme?: (mode: ThemeMode) => void;
  onToggleTheme: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isMobileMenuOpen?: boolean;
  onSetMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  themeMode = 'dark',
  onSetTheme,
  onToggleTheme,
  activeSection,
  onNavigate,
  isMobileMenuOpen: externalMobileMenuOpen,
  onSetMobileMenuOpen: externalSetMobileMenuOpen,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);

  const mobileMenuOpen = externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : internalMobileMenuOpen;
  const setMobileMenuOpen = (open: boolean) => {
    if (externalSetMobileMenuOpen) {
      externalSetMobileMenuOpen(open);
    } else {
      setInternalMobileMenuOpen(open);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems = [
    {
      id: 'services',
      label: 'What We Fix',
      subtitle: 'Screens, motherboard micro-soldering & back glass',
      icon: Wrench,
    },
    {
      id: 'parts',
      label: 'Genuine Parts',
      subtitle: 'InCell, OLED (DD) & high-capacity batteries',
      icon: Package,
    },
    {
      id: 'trust',
      label: 'Why Us',
      subtitle: 'Original parts, 30-day warranty & expert lab equipment',
      icon: ShieldCheck,
    },
    {
      id: 'booking',
      label: 'Book Repair',
      subtitle: 'Fast walk-in priority & online appointment booking',
      icon: Calendar,
      isPrimary: true,
    },
    {
      id: 'contact',
      label: 'Find Us',
      subtitle: 'New Pioneer Mall, Kampala · Shop PB86',
      icon: MapPin,
    },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const whatsappUrl = buildWhatsAppLink(
    '0753234218',
    'Hello iPhone Lab UG, I would like to inquire about an iPhone repair or genuine part.'
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? isDarkMode
              ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'
              : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-md'
            : isDarkMode
            ? 'bg-gradient-to-b from-[#0A0A0A]/95 via-[#0A0A0A]/70 to-transparent backdrop-blur-sm'
            : 'bg-gradient-to-b from-white/95 to-transparent'
        }`}
      >
        {/* Top Notification Bar */}
        <div className="bg-[#1F3864]/95 backdrop-blur-md text-white text-xs py-1.5 px-3 sm:px-4 font-medium tracking-wide flex justify-between items-center max-w-7xl mx-auto border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <span className="truncate flex items-center gap-1 text-[11px] sm:text-xs">
              <MapPin className="w-3 h-3 text-[#38BDF8] shrink-0" />
              <span>New Pioneer Mall, Kampala · <strong className="text-[#38BDF8]">Shop PB86</strong></span>
            </span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:flex items-center gap-1 text-[#38BDF8] font-bold text-[11px] sm:text-xs">
              <Clock className="w-3 h-3 text-[#38BDF8]" />
              Mon–Sat: 8:00 AM – 7:00 PM
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:0753234218"
              className="hover:text-[#38BDF8] transition-colors flex items-center gap-1 font-bold text-slate-100 text-[11px] sm:text-xs px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20"
              aria-label="Call shop phone numbers"
            >
              <Phone className="w-3 h-3 text-[#38BDF8]" />
              <span>0753 234 218</span>
              <span className="hidden sm:inline text-slate-300">/ 0730 700 368</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo Section */}
            <button
              onClick={() => handleNavClick('hero')}
              className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5] rounded-xl p-1 -ml-1 group"
              aria-label="iPhone Lab UG Home"
            >
              <Logo isDarkMode={isDarkMode} className="my-auto py-1" />
            </button>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Primary Navigation"
              className={`hidden lg:flex items-center gap-1 xl:gap-2 p-1.5 rounded-2xl border backdrop-blur-md ${
                isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/80 border-slate-200'
              }`}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white bg-[#1D9BB5] shadow-lg shadow-[#1D9BB5]/30'
                        : isDarkMode
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-[#1F3864] hover:text-[#1D9BB5] hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#1D9BB5]'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Desktop Controls: Theme Switcher & WhatsApp CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {onSetTheme ? (
                <div
                  role="radiogroup"
                  aria-label="Theme Selection"
                  className={`flex items-center p-1 rounded-2xl border backdrop-blur-md ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-200/80 border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => onSetTheme('light')}
                    role="radio"
                    aria-checked={themeMode === 'light'}
                    className={`p-2 min-w-[36px] min-h-[36px] rounded-xl transition-all flex items-center justify-center text-xs font-semibold ${
                      themeMode === 'light'
                        ? 'bg-white text-slate-900 shadow-md font-bold'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Light Mode"
                    aria-label="Switch to Light Mode"
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                  </button>

                  <button
                    onClick={() => onSetTheme('dark')}
                    role="radio"
                    aria-checked={themeMode === 'dark'}
                    className={`p-2 min-w-[36px] min-h-[36px] rounded-xl transition-all flex items-center justify-center text-xs font-semibold ${
                      themeMode === 'dark'
                        ? 'bg-slate-800 text-white shadow-md font-bold'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Dark Mode"
                    aria-label="Switch to Dark Mode"
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                  </button>

                  <button
                    onClick={() => onSetTheme('system')}
                    role="radio"
                    aria-checked={themeMode === 'system'}
                    className={`p-2 min-w-[36px] min-h-[36px] rounded-xl transition-all flex items-center justify-center text-xs font-semibold ${
                      themeMode === 'system'
                        ? 'bg-[#1D9BB5] text-white shadow-md font-bold'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="System Theme"
                    aria-label="Switch to System Theme"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onToggleTheme}
                  className={`p-2.5 rounded-full transition-all border min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10 hover:border-yellow-400/50'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Toggle Theme"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {/* Direct WhatsApp Action Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact iPhone Lab via WhatsApp (opens in new tab)"
                className="glow-btn text-white font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 min-h-[44px]"
              >
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* Clean, High-Contrast Mobile Action Controls */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              {/* Quick Direct Call Button on Mobile */}
              <a
                href="tel:0753234218"
                className={`p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl border transition-all ${
                  isDarkMode
                    ? 'border-white/10 text-[#38BDF8] bg-slate-800/80 hover:bg-slate-700'
                    : 'border-slate-300 text-[#1F3864] bg-slate-100 hover:bg-slate-200'
                }`}
                aria-label="Call Shop PB86 Reception"
                title="Call 0753 234 218"
              >
                <Phone className="w-4 h-4 text-[#1D9BB5]" />
              </a>

              {/* Quick WhatsApp Icon Button on Mobile */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm hover:bg-[#20ba5a] transition-all"
                aria-label="WhatsApp live chat"
                title="WhatsApp Technician"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>

              {/* Hamburger / Close Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all ${
                  mobileMenuOpen
                    ? 'bg-[#1D9BB5] text-white border-[#1D9BB5] shadow-lg shadow-[#1D9BB5]/30'
                    : isDarkMode
                    ? 'border-white/15 text-white bg-slate-800/90 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-800 bg-white hover:bg-slate-100'
                }`}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-modal"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Slide-Over / Fullscreen Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-start"
        >
          {/* Backdrop Blur Overlay with Dismiss On Click */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet Container */}
          <div
            className={`relative z-10 w-full max-h-[92vh] overflow-y-auto flex flex-col rounded-b-3xl shadow-2xl border-b transition-all duration-300 ${
              isDarkMode
                ? 'bg-[#0A0E17] border-white/15 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Logo isDarkMode={isDarkMode} size="sm" />
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Mon–Sat
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all ${
                  isDarkMode ? 'text-slate-400 hover:text-white bg-white/5' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body: Navigation Links */}
            <nav className="p-4 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 mb-1">
                Explore Lab & Services
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full p-3 min-h-[54px] rounded-2xl flex items-center justify-between text-left transition-all ${
                      isActive
                        ? 'bg-[#1D9BB5] text-white shadow-lg shadow-[#1D9BB5]/25 ring-1 ring-white/20'
                        : item.isPrimary
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-[#1D9BB5]/20 to-blue-600/20 border border-[#1D9BB5]/30 text-white'
                          : 'bg-[#1D9BB5]/10 border border-[#1D9BB5]/30 text-slate-900'
                        : isDarkMode
                        ? 'bg-white/[0.04] hover:bg-white/10 text-slate-200 border border-white/5'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.isPrimary
                            ? 'bg-[#1D9BB5] text-white'
                            : isDarkMode
                            ? 'bg-white/10 text-[#1D9BB5]'
                            : 'bg-white text-[#1D9BB5] shadow-sm'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.isPrimary && !isActive && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#1D9BB5] text-white">
                              Online Queue
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs truncate max-w-[220px] sm:max-w-xs ${
                            isActive ? 'text-white/80' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? 'text-white' : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}

              {/* Direct Instant Action Buttons */}
              <div className="pt-3 space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp with iPhone Lab (opens in new tab)"
                  className="w-full glow-btn text-white font-black py-3.5 px-4 min-h-[50px] rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>WhatsApp Technical Desk</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:0753234218"
                    className={`py-3 px-3 min-h-[46px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                        : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#1D9BB5]" />
                    <span>0753 234 218</span>
                  </a>

                  <a
                    href="tel:0730700368"
                    className={`py-3 px-3 min-h-[46px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                        : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>0730 700 368</span>
                  </a>
                </div>
              </div>

              {/* Theme Selection in Mobile Drawer */}
              {onSetTheme && (
                <div className="pt-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 mb-1.5">
                    Display Appearance
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="Theme Selection"
                    className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl border ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => onSetTheme('light')}
                      role="radio"
                      aria-checked={themeMode === 'light'}
                      className={`py-2 px-2 min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                        themeMode === 'light'
                          ? 'bg-white text-slate-900 shadow-md font-black'
                          : isDarkMode
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light</span>
                    </button>

                    <button
                      onClick={() => onSetTheme('dark')}
                      role="radio"
                      aria-checked={themeMode === 'dark'}
                      className={`py-2 px-2 min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                        themeMode === 'dark'
                          ? 'bg-slate-800 text-white shadow-md font-black'
                          : isDarkMode
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Dark</span>
                    </button>

                    <button
                      onClick={() => onSetTheme('system')}
                      role="radio"
                      aria-checked={themeMode === 'system'}
                      className={`py-2 px-2 min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                        themeMode === 'system'
                          ? 'bg-[#1D9BB5] text-white shadow-md font-black'
                          : isDarkMode
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Shop Address & Admin Console Link in Drawer Footer */}
              <div
                className={`p-3 rounded-2xl border text-xs mt-2 ${
                  isDarkMode ? 'bg-white/[0.02] border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-slate-300 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1D9BB5]" />
                  <span>Shop PB86, New Pioneer Mall</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Kampala, Uganda · Direct technician walk-in & genuine parts retail lab.
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 dark:border-white/10 flex justify-between items-center">
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="text-[11px] font-bold text-slate-400 hover:text-[#1D9BB5] flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Admin Console</span>
                  </button>
                  <span className="text-[10px] text-slate-500">© iPhone Lab UG</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
