import { describe, it, expect } from 'vitest';
import { getMonthLabel, getWeekLabel, getWeekStart } from '../utils/format.js';

describe('getMonthLabel', () => {
  it('returns month and year for a date', () => {
    expect(getMonthLabel('2026-07-15T12:00:00.000Z')).toBe('July 2026');
  });

  it('returns empty string for null', () => {
    expect(getMonthLabel(null)).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(getMonthLabel('not-a-date')).toBe('');
  });
});

describe('getWeekStart', () => {
  it('returns Monday of the week containing Wednesday', () => {
    const result = getWeekStart('2026-07-15T12:00:00.000Z');
    expect(result.getUTCDay()).toBe(1);
    expect(result.toISOString().slice(0, 10)).toBe('2026-07-13');
  });

  it('returns Monday of the week containing Sunday', () => {
    const result = getWeekStart('2026-07-19T12:00:00.000Z');
    expect(result.getUTCDay()).toBe(1);
    expect(result.toISOString().slice(0, 10)).toBe('2026-07-13');
  });

  it('returns same day for Monday', () => {
    const result = getWeekStart('2026-07-13T12:00:00.000Z');
    expect(result.getUTCDay()).toBe(1);
    expect(result.toISOString().slice(0, 10)).toBe('2026-07-13');
  });
});

describe('getWeekLabel', () => {
  it('returns week label for a mid-week date', () => {
    const label = getWeekLabel('2026-07-15T12:00:00.000Z');
    expect(label).toBe('Week of Jul 13');
  });
});
