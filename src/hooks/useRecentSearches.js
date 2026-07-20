import { useCallback, useState } from 'react';

const STORAGE_KEY = 'carbonmint.recentSearches';
const MAX_ITEMS = 8;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function save(searches) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    /* storage full or unavailable – silently ignore */
  }
}

/**
 * Persist and retrieve recent search terms via localStorage.
 * Deduplicates and caps at {@link MAX_ITEMS} entries.
 * @returns {{ searches: string[], push: (term: string) => void, remove: (term: string) => void, clear: () => void }}
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState(load);

  const push = useCallback((term) => {
    const trimmed = (term || '').trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const next = [trimmed, ...filtered].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((term) => {
    setSearches((prev) => {
      const next = prev.filter((s) => s !== term);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSearches([]);
    save([]);
  }, []);

  return { searches, push, remove, clear };
}
