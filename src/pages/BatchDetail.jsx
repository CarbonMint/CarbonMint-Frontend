import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBatch, submitBuy } from '../services/api.js';
import { useWallet } from '../hooks/useWallet.js';
import { useHoldings } from '../hooks/useHoldings.js';
import { formatCurrency, formatTonnes } from '../utils/format.js';
import { getTechnicalLang } from '../utils/lang.js';
import BuyForm from '../components/BuyForm.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LiveRegion from '../components/LiveRegion.jsx';
import './BatchDetail.css';

/**
 * Detail page for a single batch including project info and the buy flow.
 */
export default function BatchDetail() {
  const { id } = useParams();
  const { wallet } = useWallet();
  const { addHolding } = useHoldings();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBatch(id);
      setBatch(data);
    } catch (err) {
      setError(err.message || 'Failed to load batch.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBuy(quantity, slippageTolerance) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitBuy({
        batchId: batch.id,
        quantity,
        buyer: wallet?.publicKey,
        slippageTolerance,
        // Pass the price the user saw so the API can detect any price movement
        // between form render and submission.
        referencePrice: batch.pricePerTonne,
      });
      addHolding({
        batchId: batch.id,
        projectId: batch.projectId,
        projectName: batch.project?.name,
        vintage: batch.vintage,
        tonnes: quantity,
        pricePerTonne: batch.pricePerTonne,
        serial: batch.serial,
      });
      setReceipt(result);
      setBatch((prev) => ({
        ...prev,
        availableTonnes: prev.availableTonnes - quantity,
      }));
    } catch (err) {
      setError(err.message || 'Purchase failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader label="Loading batch..." />;
  if (error && !batch) return <ErrorMessage message={error} onRetry={load} />;
  if (!batch) return null;

  const { project } = batch;

  return (
    <div className="batch-detail">
      <Link to="/marketplace" className="batch-back">
        ← Back to marketplace
      </Link>

      <div className="batch-detail-grid">
        <div className="batch-detail-main">
          <span className="batch-detail-type">{project?.type}</span>
          <h1>{project?.name}</h1>
          <p className="batch-detail-desc">{project?.description}</p>

          <dl className="batch-detail-facts">
            <div>
              <dt>Country</dt>
              <dd>{project?.country}</dd>
            </div>
            <div>
              <dt>Registry</dt>
              <dd>{project?.registry}</dd>
            </div>
            <div>
              <dt>Vintage</dt>
              <dd>{batch.vintage}</dd>
            </div>
            <div>
              <dt>Serial</dt>
              {/* Registry serial — locale-independent character sequence */}
              <dd className="mono" lang={getTechnicalLang()}>{batch.serial}</dd>
            </div>
            <div>
              <dt>Total minted</dt>
              <dd>{formatTonnes(batch.totalTonnes)}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{formatCurrency(batch.pricePerTonne)} / tonne</dd>
            </div>
          </dl>
        </div>

        <aside className="batch-detail-side">
          {/* Polite announcement when a purchase completes successfully */}
          <LiveRegion
            message={
              receipt
                ? `Purchase complete. You bought ${formatTonnes(receipt.quantity)} for ${formatCurrency(receipt.total)}.`
                : ''
            }
          />
          {/* Assertive announcement for buy errors that need immediate attention */}
          <LiveRegion
            politeness="assertive"
            message={error && batch ? error : ''}
          />
          {receipt && (
            <div className="buy-receipt">
              <strong>Purchase complete</strong>
              <p>
                You bought {formatTonnes(receipt.quantity)} for{' '}
                {formatCurrency(receipt.total)}.
              </p>
              {/* Transaction hash — locale-independent */}
              <p className="mono buy-receipt-tx" lang={getTechnicalLang()}>{receipt.txHash}</p>
              <Link to="/my-credits">View in My Credits →</Link>
            </div>
          )}
          {error && batch && <ErrorMessage message={error} />}
          <BuyForm batch={batch} onBuy={handleBuy} submitting={submitting} />
        </aside>
      </div>
    </div>
  );
}
