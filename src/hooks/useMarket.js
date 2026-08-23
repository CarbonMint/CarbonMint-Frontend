import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBatches } from '../services/api.js';

/**
 * Load the list of marketplace batches with loading, error, and pagination state.
 * Supports request cancellation via AbortController so stale/out-of-order responses are discarded.
 * @param {{
 *   query?: string,
 *   type?: string,
 *   country?: string,
 *   sort?: string,
 *   page?: number,
 *   pageSize?: number
 * }} [params]
 * @returns {{
 *   batches: Array,
 *   totalCount: number,
 *   pageCount: number,
 *   page: number,
 *   loading: boolean,
 *   error: string|null,
 *   lastUpdated: Date|null,
 *   reload: Function,
 * }}
 */
export function useMarket(params) {
  const [batches, setBatches] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(params?.page || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const abortRef = useRef(null);
  const paramsKey = JSON.stringify(params || {});

  const load = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchBatches(params, { signal: controller.signal });
      if (controller.signal.aborted) return;

      const items = Array.isArray(data) ? data : data?.batches || [];
      setBatches(items);
      setTotalCount(data?.totalCount ?? items.length);
      setPageCount(data?.pageCount ?? 1);
      setPage(data?.page ?? (params?.page || 1));
      setLastUpdated(new Date());
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        return; // Discard aborted requests
      }
      setError(err.message || 'Failed to load marketplace.');
    } finally {
      if (!controller.signal?.aborted) {
        setLoading(false);
      }
    }
  }, [paramsKey]);

  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [load]);

  return {
    batches,
    totalCount,
    pageCount,
    page,
    loading,
    error,
    lastUpdated,
    reload: load,
  };
}

