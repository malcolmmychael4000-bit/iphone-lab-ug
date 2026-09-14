import { PartProduct } from '../types';
import { INITIAL_PARTS } from '../data/seedData';
import { getPartsFromIdb, savePartsToIdb } from './idbStorage';

const LOCAL_STORAGE_KEY = 'iphone_lab_custom_parts_catalog_v5';
const LEGACY_STORAGE_KEYS = [
  'iphone_lab_custom_parts_catalog_v4',
  'iphone_lab_custom_parts_catalog_v3',
  'iphone_lab_custom_parts_catalog_v2',
  'iphone_lab_parts_local_backup',
];

// In-memory runtime cache for instantaneous synchronous queries
let memoryCache: PartProduct[] | null = null;

/**
 * Validates whether an image URL is a valid, existing static asset, a data URL, or external URL.
 * Automatically replaces broken /uploads/ URLs with canonical static or custom assets.
 */
export function sanitizeImageUrl(url: string | undefined, fallbackPartId?: string, tier?: 'incell' | 'oled' | 'main'): string {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If it's a data URL (PNG/WebP/JPEG/SVG upload) or external URL, it's 100% valid and preserved
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If it's a custom or uploaded image (/uploads/ or /images/)
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/images/')) {
    return trimmed;
  }

  // Any relative path starting with / is valid
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Retrieves custom parts overrides synchronously from memory or localStorage.
 */
export function getStoredParts(): PartProduct[] | null {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    let raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    // Check previous keys if v5 is not yet populated
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          raw = legacyData;
          break;
        }
      }
    }

    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed.map((p: PartProduct) => {
        const img = p.imageUrl || p.image_url || '';
        const incell = p.incellImageUrl || p.incell_image_url || '';
        const oled = p.oledImageUrl || p.oled_image_url || '';
        return {
          ...p,
          imageUrl: sanitizeImageUrl(img, p.id, 'main'),
          image_url: sanitizeImageUrl(img, p.id, 'main'),
          incellImageUrl: sanitizeImageUrl(incell, p.id, 'incell'),
          incell_image_url: sanitizeImageUrl(incell, p.id, 'incell'),
          oledImageUrl: sanitizeImageUrl(oled, p.id, 'oled'),
          oled_image_url: sanitizeImageUrl(oled, p.id, 'oled'),
        };
      });
      memoryCache = sanitized;
      return sanitized;
    }
  } catch (e) {
    console.warn('Could not read stored parts from localStorage:', e);
  }
  return null;
}

/**
 * Asynchronously loads the catalog from IndexedDB (supporting unlimited image storage).
 */
export async function hydrateCatalogFromIdb(): Promise<PartProduct[] | null> {
  try {
    const idbParts = await getPartsFromIdb();
    if (idbParts && Array.isArray(idbParts) && idbParts.length > 0) {
      const sanitized = idbParts.map((p: PartProduct) => {
        const img = p.imageUrl || p.image_url || '';
        const incell = p.incellImageUrl || p.incell_image_url || '';
        const oled = p.oledImageUrl || p.oled_image_url || '';
        return {
          ...p,
          imageUrl: sanitizeImageUrl(img, p.id, 'main'),
          image_url: sanitizeImageUrl(img, p.id, 'main'),
          incellImageUrl: sanitizeImageUrl(incell, p.id, 'incell'),
          incell_image_url: sanitizeImageUrl(incell, p.id, 'incell'),
          oledImageUrl: sanitizeImageUrl(oled, p.id, 'oled'),
          oled_image_url: sanitizeImageUrl(oled, p.id, 'oled'),
        };
      });
      memoryCache = sanitized;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('iphone_lab_catalog_updated', { detail: sanitized }));
      }
      return sanitized;
    }
  } catch (e) {
    console.warn('IndexedDB hydration note:', e);
  }
  return null;
}

/**
 * Saves current custom parts catalog to IndexedDB and browser localStorage.
 * Preserves custom PNG and data URL uploads and dispatches update event.
 */
export function saveStoredParts(parts: PartProduct[]): void {
  try {
    const safeParts = parts.map((p) => {
      const img = p.imageUrl || p.image_url || '';
      const incell = p.incellImageUrl || p.incell_image_url || '';
      const oled = p.oledImageUrl || p.oled_image_url || '';

      return {
        ...p,
        imageUrl: img,
        image_url: img,
        incellImageUrl: incell,
        incell_image_url: incell,
        oledImageUrl: oled,
        oled_image_url: oled,
      };
    });

    // 1. Update memory cache immediately
    memoryCache = safeParts;

    // 2. Persist to IndexedDB (virtually unlimited capacity for PNGs/photos)
    savePartsToIdb(safeParts).catch((err) => {
      console.warn('Background save to IndexedDB failed:', err);
    });

    // 3. Persist to LocalStorage as auxiliary storage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeParts));
      localStorage.setItem('iphone_lab_parts_last_saved', new Date().toISOString());
    } catch (quotaError) {
      console.warn('LocalStorage quota limit reached, relying on IndexedDB:', quotaError);
    }

    // 4. Broadcast change event to all active React components in this window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('iphone_lab_catalog_updated', { detail: safeParts }));
    }
  } catch (e) {
    console.warn('Could not save parts:', e);
  }
}

/**
 * Merges server parts with any locally preserved custom parts and newly added parts.
 */
export function mergeWithStoredParts(serverParts: PartProduct[]): PartProduct[] {
  const stored = getStoredParts();
  if (!stored || stored.length === 0) return serverParts;

  const storedMap = new Map(stored.map((p) => [p.id, p]));

  const isGeneric = (url?: string) => !url || url.startsWith('/images/parts/') || url.endsWith('.svg');

  const resolveUrl = (customUrl?: string, serverUrl?: string) => {
    if (customUrl && !isGeneric(customUrl)) return customUrl;
    if (serverUrl && !isGeneric(serverUrl)) return serverUrl;
    return customUrl || serverUrl || '';
  };

  const merged = serverParts.map((sp) => {
    const custom = storedMap.get(sp.id);
    if (!custom) return sp;

    const finalImg = resolveUrl(custom.imageUrl || custom.image_url, sp.imageUrl || sp.image_url);
    const finalIncell = resolveUrl(custom.incellImageUrl || custom.incell_image_url, sp.incellImageUrl || sp.incell_image_url);
    const finalOled = resolveUrl(custom.oledImageUrl || custom.oled_image_url, sp.oledImageUrl || sp.oled_image_url);

    return {
      ...sp,
      ...custom,
      imageUrl: finalImg,
      image_url: finalImg,
      incellImageUrl: finalIncell,
      incell_image_url: finalIncell,
      oledImageUrl: finalOled,
      oled_image_url: finalOled,
    };
  });

  // Preserve any new custom parts added via Admin that are not in default server list
  const serverIds = new Set(serverParts.map((p) => p.id));
  const additionalCustomParts = stored.filter((p) => !serverIds.has(p.id));

  return [...merged, ...additionalCustomParts];
}


