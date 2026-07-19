import { useMemo, useState, useCallback } from "react";
import { useMarket } from "../hooks/useMarket.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { useInterval } from "../hooks/useInterval.js";
import { formatRelativeTime } from "../utils/format.js";
import BatchCard from "../components/BatchCard.jsx";
import ListingRow from "../components/ListingRow.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import "./Marketplace.css";

/** All column keys that the table / sort controls support. */
const COLUMNS = [
  { key: "name", label: "Project" },
  { key: "country", label: "Country" },
  { key: "vintage", label: "Vintage" },
  { key: "available", label: "Available" },
  { key: "price", label: "Price" },
];

/**
 * Marketplace page listing all available carbon-credit batches. Supports a
 * grid and list view toggle, search, and column-based sorting.
 */
export default function Marketplace() {
  useDocumentTitle("Marketplace");
  const { batches, loading, error, lastUpdated, reload } = useMarket();
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const debouncedQuery = useDebounce(query);

  // Re-render every 30s so the relative "updated Xs ago" label stays fresh
  // without needing to refetch the data itself.
  const [, forceTick] = useState(0);
  useInterval(() => forceTick((n) => n + 1), lastUpdated ? 30000 : null);

  /** Toggle a column header: asc → desc → none. */
  const handleSortToggle = useCallback((field) => {
    setSort((prev) => {
      if (prev === `${field}-asc`) return `${field}-desc`;
      if (prev === `${field}-desc`) return "default";
      return `${field}-asc`;
    });
  }, []);

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
    if (sort !== "default") {
      const [field, dir] = sort.split("-");
      sorted.sort((a, b) => {
        let va, vb;
        switch (field) {
          case "name":
            va = (a.project?.name || "").toLowerCase();
            vb = (b.project?.name || "").toLowerCase();
            break;
          case "country":
            va = (a.project?.country || "").toLowerCase();
            vb = (b.project?.country || "").toLowerCase();
            break;
          case "vintage":
            va = a.vintage;
            vb = b.vintage;
            break;
          case "available":
            va = a.availableTonnes;
            vb = b.availableTonnes;
            break;
          case "price":
            va = a.pricePerTonne;
            vb = b.pricePerTonne;
            break;
          default:
            return 0;
        }
        if (va < vb) return dir === "asc" ? -1 : 1;
        if (va > vb) return dir === "asc" ? 1 : -1;
        return 0;
      });
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
          <input
            type="search"
            className="marketplace-search"
            placeholder="Search by project, country or type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="marketplace-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort batches"
          >
            <option value="default">Sort: Default</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="available-desc">Most available</option>
            <option value="available-asc">Least available</option>
            <option value="vintage-desc">Vintage: Newest first</option>
            <option value="vintage-asc">Vintage: Oldest first</option>
            <option value="country-asc">Country: A to Z</option>
            <option value="country-desc">Country: Z to A</option>
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
          <div className="listing-header" role="row">
            {COLUMNS.map((col) => {
              const isAsc = sort === `${col.key}-asc`;
              const isDesc = sort === `${col.key}-desc`;
              return (
                <button
                  key={col.key}
                  type="button"
                  role="columnheader"
                  className={`listing-header-btn${isAsc || isDesc ? " active" : ""}`}
                  aria-sort={isAsc ? "ascending" : isDesc ? "descending" : "none"}
                  onClick={() => handleSortToggle(col.key)}
                >
                  {col.label}
                  <span className="sort-arrow" aria-hidden="true">
                    {isAsc ? " ▲" : isDesc ? " ▼" : ""}
                  </span>
                </button>
              );
            })}
          </div>
          {filtered.map((batch) => (
            <ListingRow key={batch.id} batch={batch} />
          ))}
        </div>
      )}
    </div>
  );
}
