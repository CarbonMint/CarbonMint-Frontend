import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  connectWallet,
  disconnectWallet,
  getStoredWallet,
} from '../services/wallet.js';

export const AppContext = createContext(null);

const LOCALE_STORAGE_KEY = 'carbonmint:locale';

/**
 * Load the stored locale preference from localStorage.
 * @returns {string} locale identifier (BCP 47 tag) or 'en-US' as fallback
 */
function getStoredLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored || 'en-US';
  } catch {
    return 'en-US';
  }
}

/**
 * Persist the locale preference to localStorage.
 * @param {string} locale
 */
function storeLocale(locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage may be unavailable; fail silently
  }
}

/**
 * Global application state: wallet session, user credit holdings,
 * retirement certificates, and locale preference. Holdings and certificates
 * live in memory and are seeded empty; buying adds holdings, retiring
 * converts them into certificates. Locale is persisted to localStorage.
 */
export function AppProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [locale, setLocaleState] = useState(() => getStoredLocale());

  // Restore a persisted wallet session on first mount.
  useEffect(() => {
    const stored = getStoredWallet();
    if (stored) {
      setWallet(stored);
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const session = await connectWallet();
      setWallet(session);
      return session;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setWallet(null);
  }, []);

  const addHolding = useCallback((holding) => {
    setHoldings((prev) => {
      const existing = prev.find((h) => h.batchId === holding.batchId);
      if (existing) {
        return prev.map((h) =>
          h.batchId === holding.batchId
            ? { ...h, tonnes: h.tonnes + holding.tonnes }
            : h
        );
      }
      return [...prev, holding];
    });
  }, []);

  const retireHolding = useCallback((batchId, tonnes, certificate) => {
    setHoldings((prev) =>
      prev
        .map((h) =>
          h.batchId === batchId ? { ...h, tonnes: h.tonnes - tonnes } : h
        )
        .filter((h) => h.tonnes > 0)
    );
    setCertificates((prev) => [certificate, ...prev]);
  }, []);

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale);
    storeLocale(newLocale);
  }, []);

  const value = useMemo(
    () => ({
      wallet,
      connecting,
      connect,
      disconnect,
      holdings,
      certificates,
      addHolding,
      retireHolding,
      locale,
      setLocale,
    }),
    [
      wallet,
      connecting,
      connect,
      disconnect,
      holdings,
      certificates,
      addHolding,
      retireHolding,
      locale,
      setLocale,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
