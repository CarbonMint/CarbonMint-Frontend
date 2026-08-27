import { useId, useMemo, useRef, useState } from 'react';
import Button from './Button.jsx';
import LiveRegion from './LiveRegion.jsx';
import { formatCurrency, formatTonnes, roundTo } from '../utils/format.js';
import { validateBuyQuantity, validateSlippageTolerance } from '../utils/validate.js';
import { useWallet } from '../hooks/useWallet.js';
import './BuyForm.css';

/** Preset slippage tolerance options shown as quick-select buttons (%). */ 
const SLIPPAGE_PRESETS = [0.5, 1, 2];

/** Default tolerance applied on first render. */
const DEFAULT_SLIPPAGE = 1;

const SLIPPAGE_HINT =
  'The maximum price increase you will accept. If the fill price exceeds this threshold the transaction will be rejected.';

/**
 * Purchase form for a batch. Validates the requested quantity against the
 * available supply and shows a live total cost. Includes a slippage tolerance
 * setting that caps the maximum acceptable fill price.
 *
 * Accessibility:
 * - every control has a programmatic name
 * - validation errors are announced (role=alert) and associated via
 *   aria-invalid / aria-describedby
 * - the form is fully operable from the keyboard (Tab, Enter, Space)
 * - submit progress is announced through a polite live region
 *
 * @param {object}   props
 * @param {object}   props.batch
 * @param {(quantity: number, slippageTolerance: number) => Promise<void>} props.onBuy
 * @param {boolean}  props.submitting
 */
export default function BuyForm({ batch, onBuy, submitting }) {
  const { isConnected, connect } = useWallet();
  const [quantity, setQuantity] = useState('');
  const [touched, setTouched] = useState(false);

  // Slippage tolerance state: track the raw string input and whether a custom
  // value is being entered (vs a preset).
  const [slippage, setSlippage] = useState(String(DEFAULT_SLIPPAGE));
  const [slippageTouched, setSlippageTouched] = useState(false);

  const quantityRef = useRef(null);
  const slippageRef = useRef(null);
  const reactId = useId();

  const titleId = `${reactId}-title`;
  const quantityId = `${reactId}-quantity`;
  const quantityErrorId = `${reactId}-quantity-error`;
  const slippageId = `${reactId}-slippage`;
  const slippageErrorId = `${reactId}-slippage-error`;
  const slippageWarningId = `${reactId}-slippage-warning`;
  const slippageHintId = `${reactId}-slippage-hint`;
  const statusId = `${reactId}-status`;

  const soldOut = batch.availableTonnes <= 0;

  const validation = useMemo(
    () => validateBuyQuantity(quantity, batch.availableTonnes),
    [quantity, batch.availableTonnes]
  );

  const slippageValidation = useMemo(
    () => validateSlippageTolerance(slippage),
    [slippage]
  );

  const total = useMemo(() => {
    const q = Number(quantity);
    if (Number.isNaN(q) || q <= 0) return 0;
    return roundTo(q * batch.pricePerTonne);
  }, [quantity, batch.pricePerTonne]);

  /** Maximum acceptable total cost given the slippage tolerance. */
  const maxTotal = useMemo(() => {
    const q = Number(quantity);
    const s = Number(slippage);
    if (Number.isNaN(q) || q <= 0 || Number.isNaN(s) || s <= 0) return null;
    return roundTo(q * batch.pricePerTonne * (1 + s / 100));
  }, [quantity, slippage, batch.pricePerTonne]);

  /** True when slippage > 5 % — show a gentle warning. */
  const highSlippage = Number(slippage) > 5;
  const showQuantityError = touched && !validation.valid;
  const showSlippageError = slippageTouched && !slippageValidation.valid;
  const showSlippageWarning = highSlippage && slippageValidation.valid;
  const hasChanges =
    quantity !== '' ||
    slippage !== String(DEFAULT_SLIPPAGE) ||
    showQuantityError ||
    showSlippageError;

  const slippageDescribedBy = [
    slippageHintId,
    showSlippageError ? slippageErrorId : null,
    showSlippageWarning ? slippageWarningId : null,
  ]
    .filter(Boolean)
    .join(' ');

  function handleSlippagePreset(preset) {
    setSlippage(String(preset));
    setSlippageTouched(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    setSlippageTouched(true);
    if (!validation.valid) {
      quantityRef.current?.focus();
      return;
    }
    if (!slippageValidation.valid) {
      slippageRef.current?.focus();
      return;
    }
    onBuy(Number(quantity), Number(slippage));
  }

  function handleReset(event) {
    event.preventDefault();
    if (submitting || !hasChanges) return;

    const confirmed = window.confirm(
      'Reset this form? Your entered values will be cleared.'
    );
    if (!confirmed) return;

    setQuantity('');
    setTouched(false);
    setSlippage(String(DEFAULT_SLIPPAGE));
    setSlippageTouched(false);
  }

  if (soldOut) {
    return (
      <div className="buy-form">
        <h2 className="buy-form-title">Buy credits</h2>
        <p className="buy-form-soldout">
          This batch is fully sold. Browse the marketplace for other available
          credits.
        </p>
      </div>
    );
  }

  return (
    <form
      className="buy-form"
      aria-labelledby={titleId}
      aria-busy={submitting ? true : undefined}
      noValidate
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <h2 className="buy-form-title" id={titleId}>
        Buy credits
      </h2>

      {/* ── Quantity ── */}
      <div className="buy-form-field">
        <label htmlFor={quantityId}>Quantity (tonnes)</label>
        <input
          id={quantityId}
          ref={quantityRef}
          type="number"
          name="quantity"
          min="1"
          step="1"
          inputMode="numeric"
          value={quantity}
          placeholder="0"
          required
          aria-required="true"
          aria-invalid={showQuantityError ? true : undefined}
          aria-describedby={showQuantityError ? quantityErrorId : undefined}
          disabled={submitting}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={() => setTouched(true)}
        />
      </div>

      {showQuantityError && (
        <p
          id={quantityErrorId}
          className="buy-form-error"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {validation.error}
        </p>
      )}

      {/* ── Slippage tolerance ── */}
      <fieldset className="buy-form-slippage" aria-describedby={slippageHintId}>
        <legend className="buy-form-slippage-legend">
          Slippage tolerance
          <span
            className="buy-form-slippage-hint"
            title={SLIPPAGE_HINT}
          >
            {' '}ⓘ
          </span>
        </legend>
        <p id={slippageHintId} className="sr-only">
          {SLIPPAGE_HINT}
        </p>

        <div className="buy-form-slippage-presets" role="group" aria-label="Preset slippage tolerances">
          {SLIPPAGE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`buy-form-slippage-preset${Number(slippage) === preset ? ' buy-form-slippage-preset--active' : ''}`}
              onClick={() => handleSlippagePreset(preset)}
              aria-pressed={Number(slippage) === preset}
              disabled={submitting}
            >
              {preset}%
            </button>
          ))}
        </div>

        <div className="buy-form-field buy-form-slippage-custom">
          <label className="sr-only" htmlFor={slippageId}>
            Custom slippage tolerance (%)
          </label>
          <div className="buy-form-slippage-input-wrap">
            <input
              id={slippageId}
              ref={slippageRef}
              type="number"
              name="slippage"
              min="0.1"
              max="50"
              step="0.1"
              value={slippage}
              aria-label="Custom slippage tolerance"
              aria-invalid={showSlippageError ? true : undefined}
              aria-describedby={slippageDescribedBy}
              disabled={submitting}
              onChange={(e) => {
                setSlippage(e.target.value);
                setSlippageTouched(true);
              }}
              onBlur={() => setSlippageTouched(true)}
            />
            <span className="buy-form-slippage-unit" aria-hidden="true">%</span>
          </div>
        </div>

        {showSlippageError && (
          <p
            id={slippageErrorId}
            className="buy-form-error"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {slippageValidation.error}
          </p>
        )}

        {showSlippageWarning && (
          <p
            id={slippageWarningId}
            className="buy-form-slippage-warning"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            ⚠ High slippage — your order may fill at a significantly higher price.
          </p>
        )}
      </fieldset>

      {/* Screen-reader announcement for submit state */}
      <LiveRegion id={statusId} message={submitting ? 'Processing your purchase…' : ''} />

      {/* ── Summary ── */}
      <div className="buy-form-summary" aria-live="polite" aria-atomic="true">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>

      {maxTotal !== null && slippageValidation.valid && (
        <p className="buy-form-max-cost">
          Max cost with slippage: <strong>{formatCurrency(maxTotal)}</strong>
        </p>
      )}

      <p className="buy-form-available">
        {formatTonnes(batch.availableTonnes)} available at{' '}
        {formatCurrency(batch.pricePerTonne)} / tonne
      </p>

      <div className="buy-form-actions">
        <Button
          type="reset"
          variant="ghost"
          disabled={submitting || !hasChanges}
        >
          Reset form
        </Button>

        {isConnected ? (
          <Button
            type="submit"
            disabled={
              submitting ||
              showQuantityError ||
              showSlippageError
            }
            aria-busy={submitting ? true : undefined}
          >
            {submitting ? 'Processing...' : 'Buy now'}
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={connect}>
            Connect wallet to buy
          </Button>
        )}
      </div>
    </form>
  );
}
