import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Smartphone,
  Battery,
  Layers,
  Box,
  Camera,
  Shield,
  Zap,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  ShieldCheck,
  RefreshCw,
  Info,
  SlidersHorizontal,
  X,
  Wrench,
  Sparkles,
  Check,
} from 'lucide-react';
import { INITIAL_PARTS } from '../data/seedData';
import { PartProduct } from '../types';
import { formatUGX, buildWhatsAppLink } from '../utils/format';
import { mergeWithStoredParts, sanitizeImageUrl, hydrateCatalogFromIdb } from '../utils/catalogStorage';

const DEFAULT_INCELL_SCREEN_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350' viewBox='0 0 600 350'><rect width='600' height='350' fill='%23090d16' rx='16'/><rect x='190' y='20' width='220' height='310' rx='28' fill='%231e293b' stroke='%231D9BB5' stroke-width='4'/><rect x='206' y='40' width='188' height='270' rx='18' fill='%23020617'/><path d='M250 40 h100 v10 h-100 z' fill='%231e293b'/><rect x='220' y='75' width='160' height='200' rx='10' fill='%231D9BB5' fill-opacity='0.15' stroke='%231D9BB5' stroke-width='2' stroke-dasharray='4,4'/><text x='300' y='160' font-family='sans-serif' font-weight='900' font-size='22' fill='%231D9BB5' text-anchor='middle'>INCELL (JH)</text><text x='300' y='185' font-family='sans-serif' font-weight='700' font-size='12' fill='%2394a3b8' text-anchor='middle'>HIGH BRIGHTNESS DISPLAY</text><rect x='225' y='295' width='150' height='24' rx='6' fill='%231D9BB5'/><text x='300' y='311' font-family='sans-serif' font-weight='800' font-size='11' fill='%23ffffff' text-anchor='middle'>JH IC CHIPSET FLEX</text></svg>";
const DEFAULT_OLED_SCREEN_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350' viewBox='0 0 600 350'><rect width='600' height='350' fill='%23030712' rx='16'/><rect x='190' y='20' width='220' height='310' rx='28' fill='%230f172a' stroke='%2306b6d4' stroke-width='4'/><rect x='206' y='40' width='188' height='270' rx='18' fill='%23000000'/><path d='M250 40 h100 v10 h-100 z' fill='%230f172a'/><circle cx='300' cy='165' r='60' fill='%2306b6d4' fill-opacity='0.18'/><text x='300' y='160' font-family='sans-serif' font-weight='900' font-size='22' fill='%2322d3ee' text-anchor='middle'>OLED (DD)</text><text x='300' y='185' font-family='sans-serif' font-weight='700' font-size='12' fill='%2338bdf8' text-anchor='middle'>SUPER RETINA XDR</text><rect x='215' y='295' width='170' height='24' rx='6' fill='%230284c7'/><text x='300' y='311' font-family='sans-serif' font-weight='800' font-size='11' fill='%23ffffff' text-anchor='middle'>OEM SOFT OLED FLEX</text></svg>";

function getScreenDisplayImage(part: PartProduct, tier: 'Incell' | 'OLED'): string {
  const slug = part.id.replace('part-screen-', '');

  // Check custom uploads first: prefer explicit upload/data/custom URL
  const incellCandidate = [part.incell_image_url, part.incellImageUrl].find(
    (value) => typeof value === 'string' && value.trim(),
  );
  const oledCandidate = [part.oled_image_url, part.oledImageUrl].find(
    (value) => typeof value === 'string' && value.trim(),
  );
  const mainCandidate = [part.image_url, part.imageUrl].find(
    (value) => typeof value === 'string' && value.trim(),
  );

  const customIncell = sanitizeImageUrl(incellCandidate, part.id, 'incell');
  const customOled = sanitizeImageUrl(oledCandidate, part.id, 'oled');
  const mainImage = sanitizeImageUrl(mainCandidate, part.id, 'main');

  if (tier === 'Incell') {
    if (customIncell) return customIncell;
    if (part.screenTier === 'Incell' && mainImage) return mainImage;
    return `/images/parts/part-screen-${slug}-incell.png`;
  } else {
    if (customOled) return customOled;
    if (part.screenTier === 'OLED' && mainImage) return mainImage;
    return `/images/parts/part-screen-${slug}-oled.png`;
  }
}

interface PartsProductsSectionProps {
  isDarkMode: boolean;
  onSelectPartForBooking: (partName: string) => void;
}

type SeriesFilterType = 'All' | '16-17' | '15' | '14' | '13' | '12' | '11' | 'x-xs-xr';
type SortOptionType = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export const PartsProductsSection: React.FC<PartsProductsSectionProps> = ({
  isDarkMode,
  onSelectPartForBooking,
}) => {
  const [parts, setParts] = useState<PartProduct[]>(() => mergeWithStoredParts(INITIAL_PARTS));
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedSeries, setSelectedSeries] = useState<SeriesFilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOptionType>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [displayLimit, setDisplayLimit] = useState<number>(12);
  const [selectedScreenTier, setSelectedScreenTier] = useState<Record<string, 'Incell' | 'OLED'>>({});

  const categories: { label: string; value: string; icon: React.FC<{ className?: string }> }[] = [
    { label: 'All Parts', value: 'All', icon: Package },
    { label: 'Screens', value: 'Screens', icon: Smartphone },
    { label: 'Batteries', value: 'Batteries', icon: Battery },
    { label: 'Back Glasses', value: 'Back Glasses', icon: Layers },
    { label: 'Housings', value: 'Housings', icon: Box },
    { label: 'Camera Glasses', value: 'Camera Glasses', icon: Camera },
    { label: 'Screen Guards', value: 'Screen Guards', icon: Shield },
    { label: 'Accessories', value: 'Accessories', icon: Zap },
  ];

  const seriesFilters: { label: string; value: SeriesFilterType }[] = [
    { label: 'All Models', value: 'All' },
    { label: 'iPhone 16 & 17', value: '16-17' },
    { label: 'iPhone 15 Series', value: '15' },
    { label: 'iPhone 14 Series', value: '14' },
    { label: 'iPhone 13 Series', value: '13' },
    { label: 'iPhone 12 Series', value: '12' },
    { label: 'iPhone 11 Series', value: '11' },
    { label: 'iPhone X / XS / XR', value: 'x-xs-xr' },
  ];

  // Fetch Parts from Express Backend API and merge with persistent storage
  const fetchParts = async () => {
    try {
      const res = await fetch('/api/parts');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const merged = mergeWithStoredParts(data);
          setParts(merged);
          return;
        }
      }
    } catch (err) {
      console.warn('Background parts sync note:', err);
    }

    const fallback = mergeWithStoredParts(INITIAL_PARTS);
    setParts(fallback);
  };

  useEffect(() => {
    hydrateCatalogFromIdb().then((idbParts) => {
      if (idbParts && idbParts.length > 0) {
        setParts(mergeWithStoredParts(INITIAL_PARTS));
      }
    });

    fetchParts();

    const handleCatalogUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PartProduct[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setParts(mergeWithStoredParts(customEvent.detail));
      } else {
        fetchParts();
      }
    };

    window.addEventListener('iphone_lab_catalog_updated', handleCatalogUpdate);
    window.addEventListener('storage', fetchParts);
    return () => {
      window.removeEventListener('iphone_lab_catalog_updated', handleCatalogUpdate);
      window.removeEventListener('storage', fetchParts);
    };
  }, []);

  const handleTierToggle = (partId: string, tier: 'Incell' | 'OLED') => {
    setSelectedScreenTier((prev) => ({ ...prev, [partId]: tier }));
  };

  // Category ordering helper
  const CATEGORY_ORDER: string[] = [
    'Screens',
    'Batteries',
    'Back Glasses',
    'Housings',
    'Camera Glasses',
    'Screen Guards',
    'Accessories',
  ];

  const getCategoryIndex = (category: string) => {
    const idx = CATEGORY_ORDER.indexOf(category);
    return idx !== -1 ? idx : 999;
  };

  const getScreenOrderIndex = (partName: string) => {
    const order = [
      'iPhone 17 Pro Max Screen',
      'iPhone 17 Pro Screen',
      'iPhone 16 Pro Max Screen',
      'iPhone 16 Pro Screen',
      'iPhone 16 Screen',
      'iPhone 15 Pro Max Screen',
      'iPhone 15 Pro Screen',
      'iPhone 15 Plus Screen',
      'iPhone 15 Screen',
      'iPhone 14 Pro Max Screen',
      'iPhone 14 Pro Screen',
      'iPhone 14 Plus Screen',
      'iPhone 14 Screen',
      'iPhone 13 Pro Max Screen',
      'iPhone 13 Pro Screen',
      'iPhone 13 Mini Screen',
      'iPhone 13 Screen',
      'iPhone 12 Pro Max Screen',
      'iPhone 12 & 12 Pro Screen',
      'iPhone 12 Mini Screen',
      'iPhone 11 Pro Max Screen',
      'iPhone 11 Pro Screen',
      'iPhone 11 Screen',
      'iPhone XS Max Screen',
      'iPhone XS Screen',
      'iPhone XR Screen',
      'iPhone X Screen',
    ];
    const index = order.indexOf(partName);
    return index !== -1 ? index : 999;
  };

  const getBatteryOrderIndex = (partName: string) => {
    const order = [
      'iPhone 16 Pro Max Battery',
      'iPhone 16 Pro Battery',
      'iPhone 16 Plus Battery',
      'iPhone 16 Battery',
      'iPhone 15 Pro Max Battery',
      'iPhone 15 Pro Battery',
      'iPhone 15 Plus Battery',
      'iPhone 15 Battery',
      'iPhone 14 Pro Max Battery',
      'iPhone 14 Plus Battery',
      'iPhone 14 Pro Battery',
      'iPhone 14 Battery',
      'iPhone 13 Pro Max Battery',
      'iPhone 13 Pro Battery',
      'iPhone 13 Mini Battery',
      'iPhone 13 Battery',
      'iPhone 12 Pro Max Battery',
      'iPhone 12 & 12 Pro Battery',
      'iPhone 12 Mini Battery',
      'iPhone 11 Pro Max Battery',
      'iPhone 11 Pro Battery',
      'iPhone 11 Battery',
      'iPhone XS Max Battery',
      'iPhone XR Battery',
      'iPhone XS Battery',
      'iPhone X Battery',
    ];
    const index = order.indexOf(partName);
    return index !== -1 ? index : 999;
  };

  const getModelScore = (part: PartProduct): number => {
    if (part.category === 'Screens') return getScreenOrderIndex(part.name);
    if (part.category === 'Batteries') return getBatteryOrderIndex(part.name);

    const text = (part.name + ' ' + part.compatibilityRange).toLowerCase();
    if (text.includes('17')) return 10;
    if (text.includes('16')) return 20;
    if (text.includes('15')) return 30;
    if (text.includes('14')) return 40;
    if (text.includes('13')) return 50;
    if (text.includes('12')) return 60;
    if (text.includes('11')) return 70;
    if (text.includes('xs') || text.includes('xr') || /\bx\b/.test(text)) return 80;
    return 999;
  };

  // Match Series Filter
  const matchesSeriesFilter = (part: PartProduct, series: SeriesFilterType): boolean => {
    if (series === 'All') return true;
    const text = (part.name + ' ' + part.compatibilityRange + ' ' + part.id).toLowerCase();

    switch (series) {
      case '16-17':
        return text.includes('16') || text.includes('17');
      case '15':
        return text.includes('15');
      case '14':
        return text.includes('14');
      case '13':
        return text.includes('13');
      case '12':
        return text.includes('12');
      case '11':
        return text.includes('11');
      case 'x-xs-xr':
        return text.includes('xs') || text.includes('xr') || /\bx\b/.test(text) || text.includes('iphone x');
      default:
        return true;
    }
  };

  // Filter & Sort Parts Logic
  const filteredParts = useMemo(() => {
    return parts
      .filter((part) => {
        const matchesCategory = activeCategory === 'All' || part.category === activeCategory;
        const matchesSeries = matchesSeriesFilter(part, selectedSeries);
        const matchesStock = onlyInStock ? part.stockStatus === 'In Stock' : true;

        const matchesSearch =
          searchQuery === '' ||
          part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.compatibilityRange.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (part.description && part.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSeries && matchesStock && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
  const priceA = (a.category === 'Screens' ? (a.incellPriceUGX ?? 0) : (a.priceUGX ?? 0));
  const priceB = (b.category === 'Screens' ? (b.incellPriceUGX ?? 0) : (b.priceUGX ?? 0));
  return priceA - priceB;
}
if (sortBy === 'price-desc') {
  const priceA = (a.category === 'Screens' ? (a.incellPriceUGX ?? 0) : (a.priceUGX ?? 0));
  const priceB = (b.category === 'Screens' ? (b.incellPriceUGX ?? 0) : (b.priceUGX ?? 0));
  return priceB - priceA;
}
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }

        // Default 'featured': Sort by category order, then model generation
        const catDiff = getCategoryIndex(a.category) - getCategoryIndex(b.category);
        if (catDiff !== 0) return catDiff;
        return getModelScore(a) - getModelScore(b);
      });
  }, [parts, activeCategory, selectedSeries, onlyInStock, searchQuery, sortBy]);

  // Dynamic counts for accessibility summary
  const totalCategoryCount = useMemo(() => {
    const counts: Record<string, number> = { All: parts.length };
    parts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [parts]);

  const activeFiltersCount = (activeCategory !== 'All' ? 1 : 0) + (selectedSeries !== 'All' ? 1 : 0) + (onlyInStock ? 1 : 0) + (searchQuery ? 1 : 0);

  const resetAllFilters = () => {
    setActiveCategory('All');
    setSelectedSeries('All');
    setSearchQuery('');
    setOnlyInStock(false);
    setSortBy('featured');
    setDisplayLimit(12);
  };

  return (
    <section
      id="parts"
      aria-label="Genuine iPhone Replacement Parts Catalog"
      className={`py-20 relative transition-colors ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-slate-50'}`}
    >
      {/* Ambient Teal Refraction Glow */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#1D9BB5]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-[#1F3864]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1D9BB5]/10 text-[#1D9BB5] text-xs font-bold uppercase tracking-wider mb-3">
            <Package className="w-4 h-4" />
            Retail &amp; Technician Store · Pioneer Mall PB86
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
            Tested Genuine Replacement Parts
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Browse verified stock for screens (Incell JH vs OLED (DD)), batteries, back glasses, camera modules, and genuine Apple accessories with walk-in testing.
          </p>
        </div>

        {/* Accessibility & Search Hub Container */}
        <div className="max-w-5xl mx-auto mb-10 space-y-5">
          {/* Top Search Bar with High Contrast Input & Clear Action */}
          <div className="relative" role="search">
            <label htmlFor="parts-search-input" className="sr-only">
              Search genuine iPhone parts by model, part name, or specifications
            </label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              id="parts-search-input"
              name="search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(12);
              }}
              placeholder="Search by iPhone model (e.g. '15 Pro Max', '13 Screen', 'Battery')..."
              className={`w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] focus-visible:ring-2 focus-visible:ring-[#1D9BB5] transition-all shadow-sm ${
                isDarkMode
                  ? 'bg-slate-900/90 text-white border-slate-700 placeholder:text-slate-400'
                  : 'bg-white text-slate-900 border-slate-300 placeholder:text-slate-500 shadow-xs'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-[#1D9BB5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills with Touch-Friendly Scroll & Count Badges */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Part Category
              </span>
              <span className="text-[11px] font-semibold text-[#1D9BB5]">
                {parts.length} Total Inventory Items
              </span>
            </div>

            <div
              className="flex overflow-x-auto max-w-full no-scrollbar sm:flex-wrap items-center justify-start sm:justify-center gap-2 p-1.5 rounded-2xl bg-[#1D9BB5]/5 border border-[#1D9BB5]/20 backdrop-blur-md"
              role="tablist"
              aria-label="Part categories"
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.value;
                const count = totalCategoryCount[cat.value] || 0;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${cat.label} (${count} products)`}
                    onClick={() => {
                      setActiveCategory(cat.value);
                      setDisplayLimit(12);
                    }}
                    className={`relative shrink-0 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5] ${
                      isActive
                        ? 'bg-[#1D9BB5] text-white shadow-md shadow-[#1D9BB5]/30'
                        : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-white/10'
                        : 'text-slate-700 hover:text-[#1D9BB5] hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDarkMode
                          ? 'bg-white/10 text-slate-400'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Series Quick Filters (iPhone 16/17, 15, 14, 13, 12, 11, X/XS/XR) */}
          <div className={`p-3 sm:p-4 rounded-2xl border transition-colors ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1D9BB5]" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Filter by iPhone Model Series:
                </span>
              </div>

              {/* In-Stock Only Toggle & Reset */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-400 hover:text-[#1D9BB5]">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1D9BB5] focus:ring-[#1D9BB5] rounded-sm accent-[#1D9BB5]"
                  />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>In Stock Only</span>
                </label>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-rose-500 hover:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Model Generation Filter Buttons */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:flex-wrap items-center">
              {seriesFilters.map((series) => {
                const isSelected = selectedSeries === series.value;
                return (
                  <button
                    key={series.value}
                    type="button"
                    onClick={() => {
                      setSelectedSeries(series.value);
                      setDisplayLimit(12);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5] ${
                      isSelected
                        ? 'bg-[#1D9BB5] text-white shadow-sm'
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{series.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By & Results Count Announcement Bar */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs px-1"
            role="status"
            aria-live="polite"
          >
            <div className={`font-semibold flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="w-2 h-2 rounded-full bg-[#1D9BB5]" />
              <span>
                Showing <strong className="text-[#1D9BB5]">{filteredParts.length}</strong>{' '}
                {activeCategory === 'All' ? 'products' : activeCategory}
                {selectedSeries !== 'All' ? ` for ${seriesFilters.find((s) => s.value === selectedSeries)?.label}` : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label htmlFor="sort-by-select" className={`font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Sort:
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOptionType)}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900 text-white border-slate-700'
                    : 'bg-white text-slate-800 border-slate-300'
                }`}
              >
                <option value="featured">Model Lineup (Newest First)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-[#1D9BB5] animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">Loading Genuine Parts Inventory...</p>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl p-8 max-w-xl mx-auto border ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">No parts found matching your criteria</h3>
            <p className="text-xs text-slate-400 mb-5">
              Try adjusting your model series, category filter, or search query.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="glow-btn text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredParts.slice(0, searchQuery ? undefined : displayLimit).map((part) => {
                const isScreen = part.category === 'Screens';
                const hasIncell = isScreen && (part.screenTier === 'Incell' || part.screenTier === 'Both' || Boolean(part.incellPriceUGX));
                const hasOled = isScreen && (part.screenTier === 'OLED' || part.screenTier === 'Both' || Boolean(part.oledPriceUGX));
                const hasBothTiers = hasIncell && hasOled;

                const customIncell = part.incellImageUrl || part.incell_image_url;
                const customOled = part.oledImageUrl || part.oled_image_url;

                // Smart default: If user hasn't toggled yet, default to whichever tier has a photo
                const defaultTier: 'Incell' | 'OLED' = hasBothTiers
                  ? (customIncell && !customOled ? 'Incell' : 'OLED')
                  : hasIncell
                  ? 'Incell'
                  : 'OLED';

                const currentTier: 'Incell' | 'OLED' = isScreen
                  ? (selectedScreenTier[part.id] || defaultTier)
                  : 'OLED';

                const incellPrice = part.incellPriceUGX || part.priceUGX || 100000;
                const oledPrice = part.oledPriceUGX || part.priceUGX || 150000;

                const activePrice = isScreen
                  ? currentTier === 'Incell'
                    ? incellPrice
                    : oledPrice
                  : part.priceUGX;

                const isOutOfStock = part.stockStatus === 'Out of Stock';

                // Check for custom uploaded image (for batteries, back glasses, housing, etc.)
                const customProductImage = sanitizeImageUrl(part.imageUrl || part.image_url, part.id, 'main');
                const hasCustomPhoto = Boolean(customProductImage);

                // For Screens: We show screen display image. For other items: ONLY render photo container if a real custom image exists!
                const shouldRenderImage = isScreen || hasCustomPhoto;

                const displayImage: string = isScreen
                  ? getScreenDisplayImage(part, currentTier)
                  : customProductImage || '';

                if (isScreen) {
                  console.log('[Screen image diagnostics]', {
                    productId: part.id,
                    title: part.name,
                    selectedTier: currentTier,
                    incell_image_url: part.incell_image_url,
                    oled_image_url: part.oled_image_url,
                    image_url: part.image_url,
                    incellImageUrl: part.incellImageUrl,
                    oledImageUrl: part.oledImageUrl,
                    displayImage,
                  });
                }
                const whatsappText = isOutOfStock
                  ? `Hello iPhone Lab UG, I am inquiring about: ${part.name} (${
                      isScreen ? currentTier + ' Tier' : ''
                    }) which is currently Out of Stock. Please notify me when restocked at Shop PB86.`
                  : `Hello iPhone Lab UG, I am inquiring about: ${part.name} (${
                      isScreen ? currentTier + ' Tier' : ''
                    } – Listed at ${formatUGX(activePrice ?? 0)}. Is this in stock at Shop PB86?`;
                const whatsappUrl = buildWhatsAppLink('0753234218', whatsappText);

                return (
                  <article
                    key={part.id}
                    className={`relative rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-lg hover:-translate-y-1 ${
                      isDarkMode
                        ? 'bg-[#111622]/90 border-slate-800 hover:border-[#1D9BB5]/60 hover:shadow-[#1D9BB5]/10'
                        : 'bg-white border-slate-200 hover:border-[#1D9BB5] hover:shadow-xl'
                    }`}
                  >
                    {/* Top Glow Highlights */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1D9BB5]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div>
                      {/* Top Category Badge & Stock */}
                      <div className="flex items-center justify-between mb-3.5 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#1D9BB5]/10 text-[#1D9BB5] border border-[#1D9BB5]/20">
                          {part.category === 'Screens' && <Smartphone className="w-3.5 h-3.5" />}
                          {part.category === 'Batteries' && <Battery className="w-3.5 h-3.5" />}
                          {part.category === 'Back Glasses' && <Layers className="w-3.5 h-3.5" />}
                          {part.category === 'Housings' && <Box className="w-3.5 h-3.5" />}
                          {part.category === 'Camera Glasses' && <Camera className="w-3.5 h-3.5" />}
                          {part.category === 'Screen Guards' && <Shield className="w-3.5 h-3.5" />}
                          {part.category === 'Accessories' && <Zap className="w-3.5 h-3.5" />}
                          <span>{part.category}</span>
                        </span>

                        {part.stockStatus === 'Out of Stock' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : part.stockStatus === 'Limited Stock' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            Limited Stock
                          </span>
                        ) : part.stockStatus === 'Pre-Order' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                            <Clock className="w-3 h-3" />
                            Pre-Order
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                      </div>

                      {/* Product Photo Container (ONLY rendered if isScreen or custom photo exists - No empty placeholder box!) */}
                      {shouldRenderImage && displayImage && (
                        <div className="mb-4 rounded-2xl overflow-hidden aspect-[16/9] border border-white/10 relative bg-slate-900 group-hover:border-[#1D9BB5]/50 transition-colors z-10 flex items-center justify-center p-2">
                          <div className="w-full h-full flex items-center justify-center">
                            <img
                              key={`${part.id}-${currentTier}`}
                              src={displayImage}
                              alt={`${part.name} ${isScreen ? currentTier + ' Display' : ''}`}
                              width="300"
                              height="169"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (isScreen) {
                                  if (target.dataset.hasFallback !== 'true') {
                                    target.dataset.hasFallback = 'true';
                                    target.src = currentTier === 'Incell' ? DEFAULT_INCELL_SCREEN_IMAGE : DEFAULT_OLED_SCREEN_IMAGE;
                                  }
                                } else {
                                  // If non-screen custom image fails, hide container gracefully
                                  target.style.display = 'none';
                                }
                              }}
                            />
                          </div>
                          {isScreen && (
                            <span className={`absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-black border shadow-lg flex items-center gap-1.5 z-20 ${
                              currentTier === 'Incell'
                                ? 'text-[#1D9BB5] border-[#1D9BB5]/40'
                                : 'text-cyan-300 border-cyan-400/40'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                currentTier === 'Incell' ? 'bg-[#1D9BB5]' : 'bg-cyan-400'
                              }`} />
                              {currentTier === 'Incell' ? 'InCell (JH) Photo' : 'OLED (DD) Photo'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Part Title */}
                      <h3 className={`text-base sm:text-lg font-black mb-1.5 transition-colors relative z-10 leading-snug ${
                        isDarkMode ? 'text-white group-hover:text-[#1D9BB5]' : 'text-[#1F3864] group-hover:text-[#1D9BB5]'
                      }`}>
                        {part.name}
                      </h3>

                      {/* Compatibility Tag */}
                      <div className={`mb-3 text-xs font-semibold px-3 py-1.5 rounded-xl border relative z-10 ${
                        isDarkMode ? 'text-slate-200 bg-white/5 border-white/10' : 'text-slate-800 bg-slate-100 border-slate-200'
                      }`}>
                        <span className="text-[#1D9BB5] font-bold">Compatible:</span> {part.compatibilityRange}
                      </div>

                      {/* Description / Tech Specs */}
                      {part.description && (
                        <p className={`text-xs leading-relaxed mb-4 relative z-10 ${
                          isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {part.description}
                        </p>
                      )}

                      {/* Screen Tier Quality Selector & Comparison */}
                      {isScreen && (
                        <div className={`mb-4 p-2.5 rounded-2xl border relative z-10 transition-colors ${
                          isDarkMode
                            ? 'bg-black/40 border-[#1D9BB5]/30'
                            : 'bg-slate-100 border-slate-200 shadow-inner'
                        }`}>
                          {hasBothTiers ? (
                            <>
                              <div className="flex items-center justify-between text-[11px] font-semibold mb-2 px-1">
                                <span className={isDarkMode ? 'text-slate-300 font-semibold' : 'text-slate-700 font-semibold'}>
                                  Select Quality Tier:
                                </span>
                                <span className={`flex items-center gap-1 text-[11px] font-medium ${
                                  isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                                }`}>
                                  <Info className="w-3 h-3" /> Compare Specs
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleTierToggle(part.id, 'Incell')}
                                  aria-label={`Select InCell JH screen for ${part.name}`}
                                  aria-pressed={currentTier === 'Incell'}
                                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer min-h-[44px] flex flex-col justify-center items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5] ${
                                    currentTier === 'Incell'
                                      ? 'bg-[#1D9BB5] text-white shadow-md ring-2 ring-[#1D9BB5]/50'
                                      : isDarkMode
                                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                                      : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <div>InCell (JH)</div>
                                  <div className="text-[11px] opacity-90">{formatUGX(incellPrice)}</div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleTierToggle(part.id, 'OLED')}
                                  aria-label={`Select OLED (DD) screen for ${part.name}`}
                                  aria-pressed={currentTier === 'OLED'}
                                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer min-h-[44px] flex flex-col justify-center items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                                    currentTier === 'OLED'
                                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md ring-2 ring-cyan-500/50'
                                      : isDarkMode
                                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                                      : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <div>OLED (DD)</div>
                                  <div className="text-[11px] opacity-90">{formatUGX(oledPrice)}</div>
                                </button>
                              </div>
                            </>
                          ) : hasIncell ? (
                            <div className="flex items-center justify-between px-1.5 py-1">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#1D9BB5] animate-pulse" />
                                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                  Quality: <span className="text-[#1D9BB5]">InCell (JH) Display</span>
                                </span>
                              </div>
                              <span className="text-xs font-black text-[#1D9BB5]">{formatUGX(incellPrice)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between px-1.5 py-1">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                  Quality: <span className="text-cyan-400">OLED (DD) Display</span>
                                </span>
                              </div>
                              <span className="text-xs font-black text-cyan-400">{formatUGX(oledPrice)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pricing, WhatsApp Order & Quick Book Installation Action */}
                    <div className={`pt-3.5 border-t relative z-10 flex flex-col gap-2.5 mt-2 ${
                      isDarkMode ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {isScreen ? `${currentTier} Rate` : 'Retail / Tech Price'}
                        </span>
                        <div className="text-xl font-black text-[#1D9BB5] tracking-tight">
                          {formatUGX(activePrice ?? 0)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Book Installation directly */}
                        <button
                          type="button"
                          onClick={() => onSelectPartForBooking(part.name)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5] ${
                            isDarkMode
                              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                          }`}
                          title={`Book repair or installation for ${part.name}`}
                        >
                          <Wrench className="w-3.5 h-3.5 text-[#1D9BB5]" />
                          <span>Book Fix</span>
                        </button>

                        {/* Order via WhatsApp */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-bold px-2.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                            isOutOfStock
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                              : 'glow-btn text-white'
                          }`}
                          title={isOutOfStock ? "Request restocking notification via WhatsApp" : "Inquire or Buy Part via WhatsApp"}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{isOutOfStock ? 'Notify Me' : 'Order Part'}</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Progressive Load More Parts Button */}
            {!searchQuery && filteredParts.length > displayLimit && (
              <div className="text-center mt-12">
                <button
                  type="button"
                  onClick={() => setDisplayLimit((prev) => prev + 12)}
                  className="px-8 py-4 rounded-2xl bg-[#1D9BB5] hover:bg-[#188094] text-white font-bold text-sm shadow-xl shadow-[#1D9BB5]/25 transition-all inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BB5]"
                >
                  <Package className="w-4 h-4" />
                  <span>Load More Genuine Parts ({filteredParts.length - displayLimit} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Wholesale Technician Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#1F3864] text-white max-w-4xl mx-auto shadow-2xl border border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-left space-y-1">
              <h4 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1D9BB5]" />
                Are you an iPhone Repair Technician in Kampala?
              </h4>
              <p className="text-xs sm:text-sm text-slate-200">
                We supply genuine iPhone screens, zero-cycle batteries, back glasses, and charging accessories at wholesale rates.
              </p>
            </div>
            <a
              href={buildWhatsAppLink('0730700368', 'Hello iPhone Lab, I am a repair technician interested in wholesale genuine iPhone parts supply in Kampala.')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#D4A017] hover:bg-[#b88a12] text-black font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm whitespace-nowrap shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Contact Wholesale Desk
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
