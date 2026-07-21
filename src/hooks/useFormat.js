import { useCallback } from 'react';
import { useLocale } from './useLocale.js';
import * as format from '../utils/format.js';

/**
 * Provides locale-aware formatting functions that automatically use the
 * user's locale preference from AppContext.
 *
 * @returns {object} Formatting functions bound to the current locale
 */
export function useFormat() {
  const { locale } = useLocale();

  const formatCurrency = useCallback(
    (value) => format.formatCurrency(value, locale),
    [locale]
  );

  const formatTonnes = useCallback(
    (value) => format.formatTonnes(value, locale),
    [locale]
  );

  const formatTonnesCompact = useCallback(
    (value) => format.formatTonnesCompact(value, locale),
    [locale]
  );

  const formatPricePerTonne = useCallback(
    (value) => format.formatPricePerTonne(value, locale),
    [locale]
  );

  const formatDate = useCallback(
    (iso) => format.formatDate(iso, locale),
    [locale]
  );

  const getMonthLabel = useCallback(
    (iso) => format.getMonthLabel(iso, locale),
    [locale]
  );

  const getWeekLabel = useCallback(
    (iso) => format.getWeekLabel(iso, locale),
    [locale]
  );

  const formatRelativeTime = useCallback(
    (value, now) => format.formatRelativeTime(value, now, locale),
    [locale]
  );

  return {
    formatCurrency,
    formatTonnes,
    formatTonnesCompact,
    formatPricePerTonne,
    formatDate,
    getMonthLabel,
    getWeekLabel,
    formatRelativeTime,
    // Re-export non-locale-dependent functions
    roundTo: format.roundTo,
    shortenAddress: format.shortenAddress,
    availabilityPercent: format.availabilityPercent,
    formatPercent: format.formatPercent,
    getWeekStart: format.getWeekStart,
  };
}
