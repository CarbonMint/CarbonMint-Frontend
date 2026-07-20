import { useMemo, useRef, useState } from "react";
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
import "./Marketplace.css";

/**
 * Marketplace page listing all available carbon-credit batches. Supports a
 * grid and list view toggle, plus a recent-searches dropdown.
 */
export default function Marketplace() {
  useDocumentTitle("Marketplace");
  const { batches, loading, error, lastUpdated, reload } = useMarket();
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [showRecent, setShowRecent] = useState(false);
  const debouncedQuery = useDebounce(query);
  const { searches, push, remove, clear } = useRecentSearches();
  const searchRef = useRef(null);

  // Re-render every 30s so the relative "updated Xs ago" label stays fresh
  // without needing to refetch the data itself.
  const [, forceTick] = useState(0);
  useInterval(() => forceTick((n) => n + 1), lastUpdated ? 30000 : null);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
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
    if (sort === "price-asc") {
      sorted.sort((a, b) => a.pricePerTonne - b.pricePerTonne);
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => b.pricePerTonne - a.pricePerTonne);
    } else if (sort === "available-desc") {
      sorted.sort((a, b) => b.availableTonnes - a.availableTonnes);
    }
    return sorted;
  }, [batches, debouncedQuery, sort]);

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
      {!loading && !error && batches.length > 0 && filtered.length === 0 && (
        <EmptyState
          title="No matches"
          message="No batches match your search. Try a different term."
        />
      )}

      {!loading && !error && filtered.length > 0 && view === "grid" && (
        <div className="marketplace-grid">
          {filtered.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && view === "list" && (
        <div className="marketplace-list">
          <div className="listing-header">
            <span>Project</span>
            <span>Country</span>
            <span>Vintage</span>
            <span>Available</span>
            <span className="listing-header-price">Price</span>
          </div>
          {filtered.map((batch) => (
            <ListingRow key={batch.id} batch={batch} />
          ))}
        </div>
      )}
    </div>
  );
}
