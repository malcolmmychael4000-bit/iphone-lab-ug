import assert from 'node:assert/strict';
import test from 'node:test';
import { PartProduct } from '../types';
import { getScreenImageCandidates, normalizeScreenTier } from './screenImages';

const part = (fields: Partial<PartProduct> = {}): PartProduct => ({
  id: 'part-screen-13',
  name: 'iPhone 13 Screen',
  category: 'Screens',
  compatibilityRange: 'iPhone 13',
  stockStatus: 'In Stock',
  ...fields,
});

test('normalizes screen tier labels without case sensitivity', () => {
  assert.equal(normalizeScreenTier('incell'), 'Incell');
  assert.equal(normalizeScreenTier('INCELL (JH)'), 'Incell');
  assert.equal(normalizeScreenTier('oled (DD)'), 'OLED');
  assert.equal(normalizeScreenTier('both'), 'Both');
  assert.equal(normalizeScreenTier('InCell / OLED'), 'Both');
  assert.equal(normalizeScreenTier(undefined), undefined);
});

test('prefers the selected tier image and keeps remote URLs intact', () => {
  const candidates = getScreenImageCandidates(part({
    incell_image_url: '/images/incell.webp',
    incellImageUrl: 'https://images.example/incell.webp',
    image_url: 'https://images.example/primary.webp',
  }), 'Incell', 'data:image/svg+xml,placeholder');

  assert.deepEqual(candidates, ['/images/incell.webp', 'https://images.example/primary.webp', 'data:image/svg+xml,placeholder']);
});

test('falls back from a missing tier image to primary and then the tier placeholder', () => {
  assert.deepEqual(
    getScreenImageCandidates(part({ screenTier: 'oLeD (DD)', imageUrl: '/images/primary.webp' }), 'OLED', 'data:image/svg+xml,oled-placeholder'),
    ['/images/primary.webp', 'data:image/svg+xml,oled-placeholder'],
  );
  assert.deepEqual(
    getScreenImageCandidates(part(), 'Incell', 'data:image/svg+xml,incell-placeholder'),
    ['data:image/svg+xml,incell-placeholder'],
  );
});

test('does not use an ambiguous or opposite-tier primary image for another tier', () => {
  assert.deepEqual(
    getScreenImageCandidates(part({ screenTier: 'Both', imageUrl: '/images/incell-primary.webp' }), 'OLED', 'data:image/svg+xml,oled-placeholder'),
    ['data:image/svg+xml,oled-placeholder'],
  );
  assert.deepEqual(
    getScreenImageCandidates(part({ screenTier: 'InCell', imageUrl: '/images/incell.webp' }), 'OLED', 'data:image/svg+xml,oled-placeholder'),
    ['data:image/svg+xml,oled-placeholder'],
  );
});
