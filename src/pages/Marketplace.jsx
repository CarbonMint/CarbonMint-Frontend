import { useEffect, useMemo, useRef, useState } from "react";
import { useMarket } from "../hooks/useMarket.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { useInterval } from "../hooks/useInterval.js";
import { formatRelativeTime } from "../utils/format.js";
import { useRecentSearches } from "../hooks/useRecentSearches.js";
import BatchCard from "../components/BatchCard.jsx";
import ListingRow from "../components/ListingRow.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import RecentSearches from "../components/RecentSearches.jsx";
import Pagination from "../components/Pagination.jsx";
import "./Marketplace.css";

const DEFAULT_PAGE_SIZE = 6;

/**
 * Marketplace page listing available carbon-credit batches with bounded search,
 * debounced input, pagination, request cancellation, and stable filtering/sorting.
 */
export default function Marketplace() {
  useDocumentTitle("Marketplace");
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [showRecent, setShowRecent] = useState(false);

  const debouncedQuery = useDebounce(query, 250);
  const { searches, push, remove, clear } = useRecentSearches();
  const searchRef = useRef(null);

  // Reset pagination to page 1 whenever query or sort changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, sort]);

  const {
    batches,
    totalCount: serverTotal,
    pageCount: serverPageCount,
    loading,
    error,
    lastUpdated,
    reload,
  } = useMarket({
    query: debouncedQuery,
    sort,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // Re-render every 30s so the relative "updated Xs ago" label stays fresh
  const [, forceTick] = useState(0);
  useInterval(() => forceTick((n) => n + 1), lastUpdated ? 30000 : null);

  const { displayBatches, effectivePageCount } = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    // Check if batches provided by useMarket is already filtered and paginated
    const isServerPaginated =
      serverPageCount !== undefined &&
      serverTotal !== undefined &&
      batches.length <= DEFAULT_PAGE_SIZE &&
      !q;

    if (isServerPaginated) {
      return {
        displayBatches: batches,
        effectivePageCount: serverPageCount,
      };
    }

    // Client-side fallback (handles mocks and un-paginated data safely)
    const matched = !q
      ? batches
      : batches.filter((batch) => {
          const project = batch.project || {};
          return (
            project.name?.toLowerCase().includes(q) ||
            project.country?.toLowerCase().includes(q) ||
            project.type?.toLowerCase().includes(q)
          );
        });

    const sorted = [...matched];
    sorted.sort((a, b) => {
      let diff = 0;
      if (sort === "price-asc") diff = a.pricePerTonne - b.pricePerTonne;
      else if (sort === "price-desc") diff = b.pricePerTonne - a.pricePerTonne;
      else if (sort === "available-desc") diff = b.availableTonnes - a.availableTonnes;

      if (diff !== 0) return diff;
      return (a.id || "").localeCompare(b.id || "");
    });

    const calculatedPageCount = Math.max(1, Math.ceil(sorted.length / DEFAULT_PAGE_SIZE));
    const currentPage = Math.max(1, Math.min(page, calculatedPageCount));

    const paged =
      sorted.length > DEFAULT_PAGE_SIZE
        ? sorted.slice((currentPage - 1) * DEFAULT_PAGE_SIZE, currentPage * DEFAULT_PAGE_SIZE)
        : sorted;

    return {
      displayBatches: paged,
      effectivePageCount: serverPageCount ?? calculatedPageCount,
    };
  }, [batches, debouncedQuery, sort, page, serverPageCount, serverTotal]);

  return (
    <div className="marketplace">
      <div className="marketplace-head">
        <div className="page-header">
          <h1>Marketplace</h1>
          <p>Verified carbon-credit batches available to purchase.</p>
        </div>
        <div className="view-toggle-wrap">
          <div className="view-toggle">
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
            >
              Grid
            </button>
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
          {lastUpdated && (
            <span
              className="marketplace-updated"
              title={lastUpdated.toLocaleString()}
            >
              Updated {formatRelativeTime(lastUpdated)}
            </span>
          )}
        </div>
      </div>

      {!loading && !error && batches.length > 0 && (
        <div className="marketplace-controls">
          <div className="marketplace-search-wrap" ref={searchRef}>
            <input
              type="search"
              className="marketplace-search"
              placeholder="Search by project, country or type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowRecent(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  push(query);
                  setShowRecent(false);
                  e.target.blur();
                }
                if (e.key === "Escape") {
                  setShowRecent(false);
                }
              }}
            />
            <RecentSearches
              searches={searches}
              visible={showRecent}
              onSelect={(term) => {
                setQuery(term);
                push(term);
                setShowRecent(false);
              }}
              onRemove={(term) => remove(term)}
              onClear={() => clear()}
              onClose={() => setShowRecent(false)}
            />
          </div>
          <select
            className="marketplace-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort batches"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="available-desc">Most available</option>
          </select>
        </div>
      )}

      {loading && <SkeletonGrid />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && batches.length === 0 && (
        <EmptyState
          title="No batches listed"
          message="Check back soon as new verified projects mint their credits."
        />
      )}
      {!loading && !error && batches.length > 0 && displayBatches.length === 0 && (
        <EmptyState
          title="No matches"
          message="No batches match your search. Try a different term."
        />
      )}

      {!loading && !error && displayBatches.length > 0 && view === "grid" && (
        <div className="marketplace-grid">
          {displayBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}

      {!loading && !error && displayBatches.length > 0 && view === "list" && (
        <div className="marketplace-list">
          <div className="listing-header">
            <span>Project</span>
            <span>Country</span>
            <span>Vintage</span>
            <span>Available</span>
            <span className="listing-header-price">Price</span>
          </div>
          {displayBatches.map((batch) => (
            <ListingRow key={batch.id} batch={batch} />
          ))}
        </div>
      )}

      {!loading && !error && effectivePageCount > 1 && (
        <Pagination
          page={page}
          pageCount={effectivePageCount}
          onChange={(nextPage) => setPage(nextPage)}
        />
      )}
    </div>
  );
}

