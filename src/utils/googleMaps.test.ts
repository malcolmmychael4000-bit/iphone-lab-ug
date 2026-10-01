import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGoogleMapsEmbedUrl } from './googleMaps';

test('buildGoogleMapsEmbedUrl returns a standard encoded Google Maps embed URL', () => {
  const url = new URL(buildGoogleMapsEmbedUrl());

  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.pathname, '/maps');
  assert.equal(url.searchParams.get('q'), 'New Pioneer Mall, Kampala, Uganda');
  assert.equal(url.searchParams.get('output'), 'embed');
});

test('buildGoogleMapsEmbedUrl safely encodes a supplied location', () => {
  const url = new URL(buildGoogleMapsEmbedUrl('Shop PB86 & Kampala'));

  assert.equal(url.searchParams.get('q'), 'Shop PB86 & Kampala');
  assert.equal(url.searchParams.get('output'), 'embed');
});
