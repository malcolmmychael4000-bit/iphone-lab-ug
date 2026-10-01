import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWhatsAppLink } from './format';

test('buildWhatsAppLink uses the ordering desk number and encodes the message', () => {
  assert.equal(
    buildWhatsAppLink('Hello iPhone Lab, I need an iPhone repair.'),
    'https://wa.me/256753234218?text=Hello%20iPhone%20Lab%2C%20I%20need%20an%20iPhone%20repair.'
  );
});
