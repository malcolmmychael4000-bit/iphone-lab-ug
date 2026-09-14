import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Hero } from './components/Hero';

// Code-split below-the-fold components for peak mobile performance & 90+ Lighthouse score
const ServicesGrid = lazy(() => import('./components/ServicesGrid').then(m => ({ default: m.ServicesGrid })));
const PartsProductsSection = lazy(() => import('./components/PartsProductsSection').then(m => ({ default: m.PartsProductsSection })));
const TrustSection = lazy(() => import('./components/TrustSection').then(m => ({ default: m.TrustSection })));
const ReviewsSection = lazy(() => import('./components/ReviewsSection').then(m => ({ default: m.ReviewsSection })));
const BookingForm = lazy(() => import('./components/BookingForm').then(m => ({ default: m.BookingForm })));
const ContactSection = lazy(() => import('./components/ContactSection').then(m => ({ default: m.ContactSection })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
const FloatingWhatsApp = lazy(() => import('./components/FloatingWhatsApp').then(m => ({ default: m.FloatingWhatsApp })));

// Admin panel is code-split so regular visitors don't load admin code
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));

export type ThemeMode = 'light' | 'dark' | 'system';

// Skeleton fallback loader only for Admin panel navigation
const AdminSkeleton: React.FC = () => (
  <div className="min-h-screen py-24 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center opacity-30 animate-pulse">
    <div className="h-10 w-72 bg-slate-700 rounded-xl mb-6" />
    <div className="h-6 w-96 bg-slate-800 rounded-lg mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <div className="h-64 bg-slate-800/60 rounded-3xl" />
      <div className="h-64 bg-slate-800/60 rounded-3xl" />
      <div className="h-64 bg-slate-800/60 rounded-3xl" />
    </div>
  </div>
);

// Zero-CLS Section Skeleton Fallbacks
interface SectionFallbackProps {
  id: string;
  minHeight: string;
  isDarkMode: boolean;
}

const SectionFallback: React.FC<SectionFallbackProps> = ({ id, minHeight, isDarkMode }) => (
  <section
    id={id}
    className={`w-full ${minHeight} py-16 flex items-center justify-center transition-colors ${
      isDarkMode ? 'bg-[#0A0A0A]' : 'bg-slate-50'
    }`}
  >
    <div className="w-full max-w-7xl mx-auto px-4 text-center opacity-25 animate-pulse">
      <div className="h-5 w-32 bg-slate-600 rounded-full mx-auto mb-3" />
      <div className="h-8 w-64 bg-slate-700 rounded-xl mx-auto mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="h-44 bg-slate-800/40 rounded-2xl" />
        <div className="h-44 bg-slate-800/40 rounded-2xl" />
        <div className="h-44 bg-slate-800/40 rounded-2xl hidden lg:block" />
      </div>
    </div>
  </section>
);

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('iphone_lab_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'dark'; // default
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('iphone_lab_theme') as ThemeMode;
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
  });

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<string>('');

  useEffect(() => {
    const checkRoute = () => {
      if (window.location.pathname.endsWith('/admin') || window.location.hash === '#admin') {
        setActiveSection('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Dynamic Scroll-Spy with requestAnimationFrame throttling to prevent main thread blocking & scroll jank
  useEffect(() => {
    if (activeSection === 'admin') return;

    const sections = ['hero', 'services', 'parts', 'trust', 'reviews', 'booking', 'contact'];
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 200;
          for (let i = sections.length - 1; i >= 0; i--) {
            const el = document.getElementById(sections[i]);
            if (el) {
              const top = el.offsetTop;
              if (scrollPosition >= top) {
                setActiveSection(sections[i]);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  // Idle background preloading of below-the-fold sections after initial render for 90+ Lighthouse mobile score
  useEffect(() => {
    const idlePreload = () => {
      import('./components/ServicesGrid');
      import('./components/PartsProductsSection');
      import('./components/TrustSection');
      import('./components/ReviewsSection');
      import('./components/BookingForm');
      import('./components/ContactSection');
      import('./components/Footer');
      import('./components/FloatingWhatsApp');
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(idlePreload, { timeout: 1500 });
      } else {
        setTimeout(idlePreload, 800);
      }
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isDark = themeMode === 'system' ? mediaQuery.matches : themeMode === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();
    localStorage.setItem('iphone_lab_theme', themeMode);

    const handleSystemThemeChange = () => {
      if (themeMode === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [themeMode]);

  const handleSetTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleToggleTheme = () => {
    if (themeMode === 'dark') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('system');
    } else {
      setThemeMode('dark');
    }
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);

    if (sectionId === 'admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate offset for fixed header
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectServiceForBooking = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
    handleNavigate('booking');
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-[#1D9BB5] selection:text-white transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-slate-50 text-slate-900'
    } pb-20 lg:pb-0`}>
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#1D9BB5] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-extrabold focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Top Fixed Navbar */}
      <Navbar
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        onSetTheme={handleSetTheme}
        onToggleTheme={handleToggleTheme}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isMobileMenuOpen={isMobileMenuOpen}
        onSetMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Single Page Content or Admin Console View */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {activeSection === 'admin' ? (
          <Suspense fallback={<AdminSkeleton />}>
            <AdminPanel
              isDarkMode={isDarkMode}
              onBackToMain={() => handleNavigate('hero')}
            />
          </Suspense>
        ) : (
          <>
            <Hero onNavigate={handleNavigate} isDarkMode={isDarkMode} />

            <Suspense fallback={<SectionFallback id="services" minHeight="min-h-[600px]" isDarkMode={isDarkMode} />}>
              <ServicesGrid
                isDarkMode={isDarkMode}
                onSelectServiceForBooking={handleSelectServiceForBooking}
              />
            </Suspense>

            <Suspense fallback={<SectionFallback id="parts" minHeight="min-h-[700px]" isDarkMode={isDarkMode} />}>
              <PartsProductsSection
                isDarkMode={isDarkMode}
                onSelectPartForBooking={(partName) => handleSelectServiceForBooking(partName)}
              />
            </Suspense>

            <Suspense fallback={<SectionFallback id="trust" minHeight="min-h-[400px]" isDarkMode={isDarkMode} />}>
              <TrustSection isDarkMode={isDarkMode} />
            </Suspense>

            <Suspense fallback={<SectionFallback id="reviews" minHeight="min-h-[450px]" isDarkMode={isDarkMode} />}>
              <ReviewsSection isDarkMode={isDarkMode} />
            </Suspense>

            <Suspense fallback={<SectionFallback id="booking" minHeight="min-h-[650px]" isDarkMode={isDarkMode} />}>
              <BookingForm
                isDarkMode={isDarkMode}
                preselectedService={preselectedService}
              />
            </Suspense>

            <Suspense fallback={<SectionFallback id="contact" minHeight="min-h-[500px]" isDarkMode={isDarkMode} />}>
              <ContactSection isDarkMode={isDarkMode} />
            </Suspense>
          </>
        )}
      </main>

      {/* Floating WhatsApp Action Button & Footer */}
      <Suspense fallback={null}>
        <FloatingWhatsApp />
      </Suspense>
      <Suspense fallback={<footer className="h-40 bg-slate-950" />}>
        <Footer isDarkMode={isDarkMode} onNavigate={handleNavigate} />
      </Suspense>

      {/* Modern App-Style Bottom Quick Navigation Bar for Mobile */}
      {activeSection !== 'admin' && (
        <MobileBottomNav
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
