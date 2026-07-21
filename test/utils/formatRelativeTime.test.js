import assert from 'node:assert';
import { test } from 'node:test';

import { formatRelativeTime } from '../../src/utils/format.js';

const BASE = new Date('2026-07-19T12:00:00.000Z');

test('formatRelativeTime returns "just now" for sub-5s differences', () => {
  const then = new Date(BASE.getTime() - 2000);
  assert.strictEqual(formatRelativeTime(then, BASE), 'just now');
});

test('formatRelativeTime returns seconds ago under a minute', () => {
  const then = new Date(BASE.getTime() - 45 * 1000);
  assert.strictEqual(formatRelativeTime(then, BASE), '45s ago');
});

test('formatRelativeTime returns singular minute correctly', () => {
  const then = new Date(BASE.getTime() - 60 * 1000);
  assert.strictEqual(formatRelativeTime(then, BASE), '1 minute ago');
});

test('formatRelativeTime returns plural minutes', () => {
  const then = new Date(BASE.getTime() - 5 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(then, BASE), '5 minutes ago');
});

test('formatRelativeTime returns hours ago', () => {
  const then = new Date(BASE.getTime() - 3 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(then, BASE), '3 hours ago');
});

test('formatRelativeTime returns days ago under a week', () => {
  const then = new Date(BASE.getTime() - 2 * 24 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(then, BASE), '2 days ago');
});

test('formatRelativeTime falls back to a full date after a week', () => {
  const then = new Date(BASE.getTime() - 10 * 24 * 60 * 60 * 1000);
  const result = formatRelativeTime(then, BASE);
  assert.match(result, /\d{4}/);
  assert.doesNotMatch(result, /ago$/);
});

test('formatRelativeTime accepts ISO strings and epoch ms', () => {
  const then = new Date(BASE.getTime() - 60 * 1000);
  assert.strictEqual(formatRelativeTime(then.toISOString(), BASE), '1 minute ago');
  assert.strictEqual(formatRelativeTime(then.getTime(), BASE), '1 minute ago');
});

test('formatRelativeTime returns empty string for missing or invalid input', () => {
  assert.strictEqual(formatRelativeTime(null, BASE), '');
  assert.strictEqual(formatRelativeTime('not-a-date', BASE), '');
});

test('formatRelativeTime accepts optional locale parameter', () => {
  const then = new Date(BASE.getTime() - 10 * 24 * 60 * 60 * 1000);
  const resultEnUS = formatRelativeTime(then, BASE, 'en-US');
  const resultDeDE = formatRelativeTime(then, BASE, 'de-DE');
  
  // Both should return formatted dates (not "ago"), but with different locales
  assert.match(resultEnUS, /\d{4}/);
  assert.match(resultDeDE, /\d{4}/);
  assert.doesNotMatch(resultEnUS, /ago$/);
  assert.doesNotMatch(resultDeDE, /ago$/);
});
