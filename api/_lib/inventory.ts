import { createClient } from '@supabase/supabase-js';

export const PRODUCT_BUCKET = 'products';
export const INVENTORY_TABLE = 'parts_inventory';

type InventoryCategory = 'Screens' | 'Batteries' | 'Back Glasses' | 'Housings' | 'Camera Glasses' | 'Screen Guards' | 'Accessories';
type InventoryStockStatus = 'In Stock' | 'Low Stock' | 'Limited Stock' | 'Pre-Order' | 'Out of Stock';

export interface InventoryPart {
  id: string;
  name: string;
  category: InventoryCategory;
  subCategory?: string;
  screenTier?: string;
  incellPriceUGX?: number;
  oledPriceUGX?: number;
  oemPriceUGX?: number;
  priceUGX: number;
  compatibilityRange: string;
  stockStatus: InventoryStockStatus;
  description?: string;
  image_url: string;
  imageUrl: string;
  incell_image_url: string;
  incellImageUrl: string;
  oled_image_url: string;
  oledImageUrl: string;
  created_at?: string;
}

export function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured');
  return createClient(url, key);
}

const FIELD_ALIASES = {
  id: ['id'],
  name: ['name'],
  category: ['category'],
  subCategory: ['sub_category', 'subCategory', 'subcategory'],
  screenTier: ['screen_tier', 'screenTier', 'screentier'],
  incellPriceUGX: ['incell_price_ugx', 'incellPriceUGX', 'incellpriceugx'],
  oledPriceUGX: ['oled_price_ugx', 'oledPriceUGX', 'oledpriceugx'],
  oemPriceUGX: ['oem_price_ugx', 'oemPriceUGX', 'oempriceugx'],
  priceUGX: ['price_ugx', 'priceUGX', 'priceugx'],
  compatibilityRange: ['compatibility_range', 'compatibilityRange', 'compatibilityrange'],
  stockStatus: ['stock_status', 'stockStatus', 'stockstatus'],
  description: ['description'],
  imageUrl: ['image_url', 'imageUrl', 'imageurl'],
  incellImageUrl: ['incell_image_url', 'incellImageUrl', 'incellimageurl'],
  oledImageUrl: ['oled_image_url', 'oledImageUrl', 'oledimageurl'],
} as const;

function normalizedKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function readField(row: Record<string, unknown>, aliases: readonly string[]): unknown {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, alias) && row[alias] !== undefined && row[alias] !== null) {
      return row[alias];
    }
  }
  const matchingKey = Object.keys(row).find((key) =>
    row[key] !== undefined
    && row[key] !== null
    && aliases.some((alias) => normalizedKey(key) === normalizedKey(alias)),
  );
  return matchingKey === undefined ? undefined : row[matchingKey];
}

function hasField(row: Record<string, unknown>, aliases: readonly string[]): boolean {
  if (aliases.some((alias) =>
    Object.prototype.hasOwnProperty.call(row, alias) && row[alias] !== undefined && row[alias] !== null,
  )) return true;
  return Object.keys(row).some((key) =>
    row[key] !== undefined
    && row[key] !== null
    && aliases.some((alias) => normalizedKey(key) === normalizedKey(alias)),
  );
}

function firstString(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === 'string' && value.trim() !== '')?.trim() || '';
}

export function normalizePart(row: Record<string, unknown>): InventoryPart {
  const imageUrl = firstString(readField(row, FIELD_ALIASES.imageUrl));
  const incellImageUrl = firstString(readField(row, FIELD_ALIASES.incellImageUrl));
  const oledImageUrl = firstString(readField(row, FIELD_ALIASES.oledImageUrl));
  const numberField = (aliases: readonly string[]) => {
    const value = readField(row, aliases);
    return value === undefined || value === null || value === '' ? undefined : Number(value) || undefined;
  };
  const category = firstString(readField(row, FIELD_ALIASES.category));
  return {
    id: String(readField(row, FIELD_ALIASES.id) || ''),
    name: firstString(readField(row, FIELD_ALIASES.name)),
    category: (category || 'Accessories') as InventoryCategory,
    subCategory: firstString(readField(row, FIELD_ALIASES.subCategory)) || undefined,
    screenTier: firstString(readField(row, FIELD_ALIASES.screenTier)) || undefined,
    incellPriceUGX: numberField(FIELD_ALIASES.incellPriceUGX),
    oledPriceUGX: numberField(FIELD_ALIASES.oledPriceUGX),
    oemPriceUGX: numberField(FIELD_ALIASES.oemPriceUGX),
    priceUGX: numberField(FIELD_ALIASES.priceUGX) ?? 0,
    compatibilityRange: firstString(readField(row, FIELD_ALIASES.compatibilityRange)) || 'iPhone Series',
    stockStatus: (firstString(readField(row, FIELD_ALIASES.stockStatus)) || 'In Stock') as InventoryStockStatus,
    description: firstString(readField(row, FIELD_ALIASES.description)) || undefined,
    image_url: imageUrl,
    imageUrl,
    incell_image_url: incellImageUrl,
    incellImageUrl,
    oled_image_url: oledImageUrl,
    oledImageUrl,
    created_at: typeof readField(row, ['created_at', 'createdAt']) === 'string'
      ? String(readField(row, ['created_at', 'createdAt']))
      : undefined,
  };
}

export async function getInventoryColumns(client: ReturnType<typeof getSupabase>): Promise<string[]> {
  const { data, error } = await client.from(INVENTORY_TABLE).select('*').limit(1);
  if (error) throw error;
  return data?.[0] ? Object.keys(data[0]) : [];
}

export function toSupabasePart(
  part: Record<string, unknown>,
  existing?: Record<string, unknown>,
  columns?: string[],
): Record<string, unknown> {
  const incoming = normalizePart(part);
  const previous = normalizePart(existing || {});
  const choose = <K extends keyof InventoryPart>(key: K, aliases: readonly string[]) =>
    hasField(part, aliases) ? incoming[key] : previous[key];
  const normalized: InventoryPart = {
    id: String(choose('id', FIELD_ALIASES.id) || incoming.id || previous.id || `part-${Date.now()}`),
    name: String(choose('name', FIELD_ALIASES.name) || ''),
    category: String(choose('category', FIELD_ALIASES.category) || 'Accessories') as InventoryCategory,
    subCategory: choose('subCategory', FIELD_ALIASES.subCategory),
    screenTier: choose('screenTier', FIELD_ALIASES.screenTier),
    incellPriceUGX: choose('incellPriceUGX', FIELD_ALIASES.incellPriceUGX),
    oledPriceUGX: choose('oledPriceUGX', FIELD_ALIASES.oledPriceUGX),
    oemPriceUGX: choose('oemPriceUGX', FIELD_ALIASES.oemPriceUGX),
    priceUGX: Number(choose('priceUGX', FIELD_ALIASES.priceUGX) ?? 0),
    compatibilityRange: String(choose('compatibilityRange', FIELD_ALIASES.compatibilityRange) || 'iPhone Series'),
    stockStatus: String(choose('stockStatus', FIELD_ALIASES.stockStatus) || 'In Stock') as InventoryStockStatus,
    description: choose('description', FIELD_ALIASES.description),
    image_url: firstString(incoming.image_url, previous.image_url),
    imageUrl: firstString(incoming.imageUrl, previous.imageUrl),
    incell_image_url: firstString(incoming.incell_image_url, previous.incell_image_url),
    incellImageUrl: firstString(incoming.incellImageUrl, previous.incellImageUrl),
    oled_image_url: firstString(incoming.oled_image_url, previous.oled_image_url),
    oledImageUrl: firstString(incoming.oledImageUrl, previous.oledImageUrl),
  };

  const valueByField: Record<string, unknown> = {
    id: normalized.id,
    name: normalized.name,
    category: normalized.category,
    subCategory: normalized.subCategory || null,
    screenTier: normalized.screenTier || null,
    incellPriceUGX: normalized.incellPriceUGX ?? null,
    oledPriceUGX: normalized.oledPriceUGX ?? null,
    oemPriceUGX: normalized.oemPriceUGX ?? null,
    priceUGX: normalized.priceUGX,
    compatibilityRange: normalized.compatibilityRange,
    stockStatus: normalized.stockStatus,
    description: normalized.description || null,
    imageUrl: firstString(normalized.image_url, normalized.imageUrl) || null,
    incellImageUrl: firstString(normalized.incell_image_url, normalized.incellImageUrl) || null,
    oledImageUrl: firstString(normalized.oled_image_url, normalized.oledImageUrl) || null,
  };
  const fieldAliases = Object.entries(FIELD_ALIASES) as [keyof typeof FIELD_ALIASES, readonly string[]][];
  const knownColumns = columns?.length ? columns : Object.keys(existing || {});
  const payload: Record<string, unknown> = {};

  for (const [field, aliases] of fieldAliases) {
    const column = aliases.find((alias) =>
      knownColumns.some((known) => normalizedKey(known) === normalizedKey(alias)),
    ) || (knownColumns.length ? undefined : aliases[0]);
    if (column) {
      const actualColumn = knownColumns.find((known) => normalizedKey(known) === normalizedKey(column)) || column;
      payload[actualColumn] = valueByField[field];
    }
  }
  return payload;
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
