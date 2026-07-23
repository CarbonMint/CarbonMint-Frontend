import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet.js';
import { useHoldings } from '../hooks/useHoldings.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { retireCredits } from '../services/retirement.js';
import { formatCurrency, formatTonnes } from '../utils/format.js';
import Button from '../components/Button.jsx';
import RetireModal from '../components/RetireModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LiveRegion from '../components/LiveRegion.jsx';
import './MyCredits.css';

/** Column definitions for the holdings table. */
const HOLDING_COLUMNS = [
  { key: 'name', label: 'Project' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'price', label: 'Price' },
  { key: 'tonnes', label: 'Held' },
];

/**
 * Shows the connected wallet's credit holdings and lets the user retire
 * (burn) credits to receive a certificate.
 */
export default function MyCredits() {
  useDocumentTitle('My Credits');
  const { wallet, isConnected, connect } = useWallet();
  const { holdings, totals, retireHolding } = useHoldings();

  const [active, setActive] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [retireSuccess, setRetireSuccess] = useState('');
  const [sort, setSort] = useState('default');

  /** Toggle a column header: asc -> desc -> none. */
  const handleSortToggle = useCallback((field) => {
    setSort((prev) => {
      if (prev === `${field}-asc`) return `${field}-desc`;
      if (prev === `${field}-desc`) return 'default';
      return `${field}-asc`;
    });
  }, []);

  /** Apply current sort to the holdings list. */
  const sortedHoldings = useMemo(() => {
    if (sort === 'default') return holdings;
    const [field, dir] = sort.split('-');
    return [...holdings].sort((a, b) => {
      let va, vb;
      switch (field) {
        case 'name':
          va = (a.projectName || '').toLowerCase();
          vb = (b.projectName || '').toLowerCase();
          break;
        case 'vintage':
          va = a.vintage;
          vb = b.vintage;
          break;
        case 'price':
          va = a.pricePerTonne;
          vb = b.pricePerTonne;
          break;
        case 'tonnes':
          va = a.tonnes;
          vb = b.tonnes;
          break;
        default:
          return 0;
      }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [holdings, sort]);

  async function handleConfirm(tonnes, beneficiary) {
    setSubmitting(true);
    setError(null);
    setRetireSuccess('');
    try {
      const certificate = await retireCredits({
        holding: active,
        tonnes,
        owner: wallet?.publicKey,
        beneficiary,
      });
      retireHolding(active.batchId, tonnes, certificate);
      setRetireSuccess(
        `Retirement complete. ${formatTonnes(tonnes)} from ${active.projectName} have been permanently retired.`
      );
      setActive(null);
    } catch (err) {
      setError(err.message || 'Retirement failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isConnected) {
    return (
      <EmptyState
        title="Connect your wallet"
        message="Connect a wallet to view your carbon-credit holdings."
        action={<Button onClick={connect}>Connect Wallet</Button>}
      />
    );
  }

  return (
    <div className="my-credits">
      <div className="page-header">
        <h1>My Credits</h1>
        <p>Credits held by {wallet.publicKey.slice(0, 6)}...</p>
      </div>

      <div className="holdings-summary">
        <div className="summary-card">
          <span>Held</span>
          <strong>{formatTonnes(totals.owned)}</strong>
        </div>
        <div className="summary-card">
          <span>Retired</span>
          <strong>{formatTonnes(totals.retired)}</strong>
        </div>
      </div>

      {/* Polite announcement for successful retirements */}
      <LiveRegion message={retireSuccess} />
      {/* Assertive announcement for retirement errors */}
      <LiveRegion politeness="assertive" message={error || ''} />

      {error && <ErrorMessage message={error} />}

      {holdings.length === 0 ? (
        <EmptyState
          title="No credits yet"
          message="Buy verified carbon credits from the marketplace to get started."
          action={
            <Link to="/marketplace" className="btn btn-primary">
              Browse Marketplace
            </Link>
          }
        />
      ) : (
        <>
          <div className="holdings-controls">
            <select
              className="holdings-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort holdings"
            >
              <option value="default">Sort: Default</option>
              <option value="name-asc">Project: A to Z</option>
              <option value="name-desc">Project: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="tonnes-desc">Most held</option>
              <option value="tonnes-asc">Least held</option>
              <option value="vintage-desc">Vintage: Newest first</option>
              <option value="vintage-asc">Vintage: Oldest first</option>
            </select>
          </div>
          <div className="holdings-list" role="grid" aria-label="Credit holdings">
            <div className="holdings-header" role="row">
              {HOLDING_COLUMNS.map((col) => {
                const isAsc = sort === `${col.key}-asc`;
                const isDesc = sort === `${col.key}-desc`;
                return (
                  <button
                    key={col.key}
                    type="button"
                    role="columnheader"
                    className={`holdings-header-btn${isAsc || isDesc ? " active" : ""}`}
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
              <span className="holdings-header-action">Action</span>
            </div>
            {sortedHoldings.map((holding) => (
              <div className="holding-row" key={holding.batchId} role="row">
                <div className="holding-info" role="gridcell">
                  <strong>{holding.projectName}</strong>
                  <span className="holding-sub">
                    Vintage {holding.vintage} · {formatCurrency(holding.pricePerTonne)}{' '}
                    / tonne
                  </span>
                </div>
                <div className="holding-amount" role="gridcell">{formatTonnes(holding.tonnes)}</div>
                <div role="gridcell">
                  <Button variant="danger" onClick={() => setActive(holding)}>
                    Retire
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {active && (
        <RetireModal
          holding={active}
          submitting={submitting}
          onConfirm={handleConfirm}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
