import assert from 'node:assert';
import { test } from 'node:test';

import { formatCurrency } from '../utils/format.js';

test('formatCurrency formats with default en-US locale', () => {
  assert.strictEqual(formatCurrency(1234.56), '1,234.56 USDC');
});

test('formatCurrency formats with en-US locale explicitly', () => {
  assert.strictEqual(formatCurrency(1234.56, 'en-US'), '1,234.56 USDC');
});

test('formatCurrency formats with de-DE locale (German - uses comma for decimal)', () => {
  const result = formatCurrency(1234.56, 'de-DE');
  // German uses period for thousands and comma for decimal
  assert.strictEqual(result, '1.234,56 USDC');
});

test('formatCurrency formats with fr-FR locale (French)', () => {
  const result = formatCurrency(1234.56, 'fr-FR');
  // French uses non-breaking space for thousands and comma for decimal
  // Note: The actual character is a non-breaking space (U+202F or U+00A0)
  assert.match(result, /1[\s\u00A0\u202F]234,56 USDC/);
});

test('formatCurrency formats with ja-JP locale (Japanese)', () => {
  assert.strictEqual(formatCurrency(1234.56, 'ja-JP'), '1,234.56 USDC');
});

test('formatCurrency formats with es-ES locale (Spanish)', () => {
  const result = formatCurrency(1234.56, 'es-ES');
  // Spanish uses period for thousands and comma for decimal
  assert.strictEqual(result, '1.234,56 USDC');
});

test('formatCurrency handles zero', () => {
  assert.strictEqual(formatCurrency(0), '0.00 USDC');
  assert.strictEqual(formatCurrency(0, 'de-DE'), '0,00 USDC');
});

test('formatCurrency handles negative values', () => {
  assert.strictEqual(formatCurrency(-150.25), '-150.25 USDC');
  assert.strictEqual(formatCurrency(-150.25, 'de-DE'), '-150,25 USDC');
});

test('formatCurrency handles large numbers', () => {
  assert.strictEqual(formatCurrency(1234567.89, 'en-US'), '1,234,567.89 USDC');
  assert.strictEqual(formatCurrency(1234567.89, 'de-DE'), '1.234.567,89 USDC');
});

test('formatCurrency always shows 2 decimal places', () => {
  assert.strictEqual(formatCurrency(100), '100.00 USDC');
  assert.strictEqual(formatCurrency(100.5), '100.50 USDC');
  assert.strictEqual(formatCurrency(100.123), '100.12 USDC');
});

test('formatCurrency handles null and undefined', () => {
  assert.strictEqual(formatCurrency(null), '0.00 USDC');
  assert.strictEqual(formatCurrency(undefined), '0.00 USDC');
});

test('formatCurrency handles string numbers', () => {
  assert.strictEqual(formatCurrency('1234.56'), '1,234.56 USDC');
});

test('formatCurrency handles invalid input', () => {
  assert.strictEqual(formatCurrency('invalid'), '0.00 USDC');
  assert.strictEqual(formatCurrency(NaN), '0.00 USDC');
});
