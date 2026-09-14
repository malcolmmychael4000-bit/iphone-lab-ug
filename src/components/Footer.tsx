import React from 'react';
import { Logo } from './Logo';
import { Phone, MapPin, Clock, Lock, ArrowUp } from 'lucide-react';

interface FooterProps {
  isDarkMode: boolean;
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ isDarkMode, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      aria-label="Site Footer"
      className={`border-t transition-colors ${
        isDarkMode ? 'bg-[#0A0A0A] border-slate-800 text-slate-200' : 'bg-[#1F3864] border-[#1F3864] text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Logo isDarkMode={true} />
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              Kampala’s specialized iPhone repair laboratory &amp; genuine parts supplier. Micro-soldering, laser back glass, screen swaps, and high capacity batteries.
            </p>
            <div className="text-xs font-bold text-[#D4A017] tracking-wider uppercase">
              &quot;We Fix. We Care. We Connect.&quot;
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#38BDF8]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#38BDF8] transition-colors py-1 text-left min-h-[36px] flex items-center"
                >
                  What We Fix
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('parts')}
                  className="hover:text-[#38BDF8] transition-colors py-1 text-left min-h-[36px] flex items-center"
                >
                  Genuine Parts Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('trust')}
                  className="hover:text-[#38BDF8] transition-colors py-1 text-left min-h-[36px] flex items-center"
                >
                  Why Choose Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('booking')}
                  className="hover:text-[#38BDF8] transition-colors py-1 text-left min-h-[36px] flex items-center"
                >
                  Book Repair Slot
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#38BDF8] transition-colors py-1 text-left min-h-[36px] flex items-center"
                >
                  Find Our Kampala Shop
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#38BDF8]">
              Shop PB86 Details
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <span>New Pioneer Mall, Kampala, Shop PB86</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <div className="flex flex-wrap gap-1">
                  <a href="tel:0753234218" className="hover:underline py-0.5">0753 234 218</a>
                  <span>/</span>
                  <a href="tel:0730700368" className="hover:underline py-0.5">0730 700 368</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <span>Mon – Sat: 8:00 AM – 7:00 PM<br />Sunday: Appointments Only</span>
              </div>
            </div>
          </div>

          {/* Col 4: Social & Community */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#38BDF8]">
              Social &amp; Community
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="https://www.tiktok.com/search?q=iphone%20lab%20uganda"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit iPhone Lab Uganda on TikTok (opens in new tab)"
                className="inline-flex items-center gap-2.5 px-4 py-3 min-h-[44px] rounded-xl bg-black hover:bg-black/80 border border-white/20 hover:border-[#38BDF8] text-white font-bold transition-all shadow-md group"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
                <span>TikTok: iPhone Lab Uganda</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with subtle Staff Login / Admin Link */}
        <div className="pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-3 text-center sm:text-left">
            <span>© {new Date().getFullYear()} iPhone Lab UG. All Rights Reserved. Specialized iPhone Repair Laboratory, Kampala.</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('admin');
              }}
              aria-label="Staff Login Panel"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#38BDF8] transition-colors font-medium text-[11px] hover:underline p-1"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Staff Login</span>
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-[#1D9BB5] text-white transition-all shrink-0"
            aria-label="Scroll back to top of page"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
