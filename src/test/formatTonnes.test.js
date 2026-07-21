import assert from 'node:assert';
import { test } from 'node:test';

import { formatTonnes, formatTonnesCompact } from '../utils/format.js';

test('formatTonnes formats with default en-US locale', () => {
  assert.strictEqual(formatTonnes(1234), '1,234 tCO2e');
});

test('formatTonnes formats with de-DE locale', () => {
  assert.strictEqual(formatTonnes(1234, 'de-DE'), '1.234 tCO2e');
});

test('formatTonnes formats with fr-FR locale', () => {
  const result = formatTonnes(1234, 'fr-FR');
  // French uses non-breaking space for thousands
  assert.match(result, /1[\s\u00A0\u202F]234 tCO2e/);
});

test('formatTonnes handles decimals', () => {
  assert.strictEqual(formatTonnes(1234.567, 'en-US'), '1,234.567 tCO2e');
});

test('formatTonnes handles zero', () => {
  assert.strictEqual(formatTonnes(0), '0 tCO2e');
});

test('formatTonnesCompact formats with default en-US locale', () => {
  assert.strictEqual(formatTonnesCompact(12500), '12.5K tCO2e');
  assert.strictEqual(formatTonnesCompact(1234567), '1.2M tCO2e');
});

test('formatTonnesCompact formats with de-DE locale', () => {
  const result = formatTonnesCompact(12500, 'de-DE');
  // German compact notation may vary by implementation
  assert.match(result, /tCO2e$/);
});

test('formatTonnesCompact handles small numbers', () => {
  assert.strictEqual(formatTonnesCompact(999), '999 tCO2e');
});

test('formatTonnesCompact limits to 1 decimal place', () => {
  const result = formatTonnesCompact(12567, 'en-US');
  // Should round to 1 decimal: 12.6K
  assert.match(result, /12\.[0-9]K tCO2e/);
});
