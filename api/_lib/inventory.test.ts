import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePart, toSupabasePart } from './inventory.js';

test('normalizes legacy lowercase inventory column names and keeps image URLs', () => {
  const part = normalizePart({
    id: 'part-1',
    name: 'iPhone 15 screen',
    category: 'Screens',
    sub_category: null,
    subcategory: 'Display',
    screentier: 'OLED',
    priceugx: '350000',
    compatibilityrange: 'iPhone 15',
    stockstatus: 'In Stock',
    image_url: null,
    imageurl: 'https://storage.example/main.webp',
    incellimageurl: 'https://storage.example/incell.webp',
    oledimageurl: 'https://storage.example/oled.webp',
    createdat: '2026-09-01T10:00:00Z',
  });

  assert.equal(part.subCategory, 'Display');
  assert.equal(part.screenTier, 'OLED');
  assert.equal(part.priceUGX, 350000);
  assert.equal(part.image_url, 'https://storage.example/main.webp');
  assert.equal(part.incell_image_url, 'https://storage.example/incell.webp');
  assert.equal(part.oled_image_url, 'https://storage.example/oled.webp');
  assert.equal(part.created_at, '2026-09-01T10:00:00Z');
});

test('maps updates to the observed schema and preserves stored images', () => {
  const existing = {
    id: 'part-2',
    name: 'Old name',
    category: 'Screens',
    subcategory: 'Display',
    screentier: 'OLED',
    priceugx: 350000,
    compatibilityrange: 'iPhone 15',
    stockstatus: 'In Stock',
    imageurl: 'https://storage.example/main.webp',
    incellimageurl: 'https://storage.example/incell.webp',
    oledimageurl: 'https://storage.example/oled.webp',
  };
  const columns = Object.keys(existing);
  const payload = toSupabasePart({ id: 'part-2', name: 'Updated name' }, existing, columns);

  assert.deepEqual(payload, {
    id: 'part-2',
    name: 'Updated name',
    category: 'Screens',
    subcategory: 'Display',
    screentier: 'OLED',
    priceugx: 350000,
    compatibilityrange: 'iPhone 15',
    stockstatus: 'In Stock',
    imageurl: 'https://storage.example/main.webp',
    incellimageurl: 'https://storage.example/incell.webp',
    oledimageurl: 'https://storage.example/oled.webp',
  });
  const changedAlias = toSupabasePart({ sub_category: null, subcategory: 'Changed display' }, existing, columns);
  assert.equal(changedAlias.subcategory, 'Changed display');
});

test('maps new inventory to the standard snake_case table columns', () => {
  const payload = toSupabasePart({
    id: 'part-3',
    name: 'iPhone 16 battery',
    category: 'Batteries',
    subCategory: 'Battery',
    incellPriceUGX: 120000,
    priceUGX: 120000,
    compatibilityRange: 'iPhone 16',
    stockStatus: 'In Stock',
  }, undefined, []);

  assert.equal(payload.sub_category, 'Battery');
  assert.equal(payload.incell_price_ugx, 120000);
  assert.equal(payload.price_ugx, 120000);
  assert.equal(payload.compatibility_range, 'iPhone 16');
  assert.equal(payload.image_url, null);
});
