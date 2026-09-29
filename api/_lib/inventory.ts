import { createClient } from '@supabase/supabase-js';

export const PRODUCT_BUCKET = 'products';

export interface InventoryPart {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  screenTier?: string;
  incellPriceUGX?: number;
  oledPriceUGX?: number;
  oemPriceUGX?: number;
  priceUGX: number;
  compatibilityRange: string;
  stockStatus: string;
  description?: string;
  image_url: string;
  imageUrl: string;
  incell_image_url: string;
  incellImageUrl: string;
  oled_image_url: string;
  oledImageUrl: string;
  created_at?: string;
}

export function getPublicSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase public environment is not configured');
  return createClient(url, key);
}

export function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured');
  return createClient(url, key);
}

function firstString(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === 'string' && value.trim() !== '')?.trim() || '';
}

export function normalizePart(row: Record<string, unknown>): InventoryPart {
  const imageUrl = firstString(row.image_url, row.imageUrl);
  const incellImageUrl = firstString(row.incell_image_url, row.incellImageUrl);
  const oledImageUrl = firstString(row.oled_image_url, row.oledImageUrl);
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    category: String(row.category || 'Accessories'),
    subCategory: firstString(row.sub_category, row.subCategory, row.subcategory) || undefined,
    screenTier: firstString(row.screen_tier, row.screenTier, row.screentier) || undefined,
    incellPriceUGX: Number(row.incell_price_ugx ?? row.incellPriceUGX ?? row.incellpriceugx) || undefined,
    oledPriceUGX: Number(row.oled_price_ugx ?? row.oledPriceUGX ?? row.oledpriceugx) || undefined,
    oemPriceUGX: Number(row.oem_price_ugx ?? row.oemPriceUGX ?? row.oempriceugx) || undefined,
    priceUGX: Number(row.price_ugx ?? row.priceUGX ?? row.priceugx ?? 0),
    compatibilityRange: firstString(row.compatibility_range, row.compatibilityRange, row.compatibilityrange) || 'iPhone Series',
    stockStatus: firstString(row.stock_status, row.stockStatus, row.stockstatus) || 'In Stock',
    description: firstString(row.description) || undefined,
    image_url: imageUrl,
    imageUrl,
    incell_image_url: incellImageUrl,
    incellImageUrl,
    oled_image_url: oledImageUrl,
    oledImageUrl,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  };
}

export function toSupabasePart(part: Record<string, unknown>, existing?: InventoryPart): Record<string, unknown> {
  const normalized = normalizePart({ ...existing, ...part });
  return {
    id: normalized.id || `part-${Date.now()}`,
    name: normalized.name,
    category: normalized.category,
    sub_category: normalized.subCategory || null,
    screen_tier: normalized.screenTier || null,
    incell_price_ugx: normalized.incellPriceUGX ?? null,
    oled_price_ugx: normalized.oledPriceUGX ?? null,
    oem_price_ugx: normalized.oemPriceUGX ?? null,
    price_ugx: normalized.priceUGX,
    compatibility_range: normalized.compatibilityRange,
    stock_status: normalized.stockStatus,
    description: normalized.description || null,
    image_url: firstString(part.image_url, part.imageUrl, existing?.image_url, existing?.imageUrl),
    incell_image_url: firstString(part.incell_image_url, part.incellImageUrl, existing?.incell_image_url, existing?.incellImageUrl),
    oled_image_url: firstString(part.oled_image_url, part.oledImageUrl, existing?.oled_image_url, existing?.oledImageUrl),
  };
}

export function requireAdmin(req: { headers: Record<string, string | string[] | undefined> }): void {
  const authorization = req.headers.authorization;
  const token = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!token || !token.startsWith('Bearer admin-token-')) {
    throw new Error('Unauthorized Admin Session');
  }
}

export function sendError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown, fallback: string): void {
  const message = error instanceof Error ? error.message : fallback;
  res.status(500).json({ error: message });
}
