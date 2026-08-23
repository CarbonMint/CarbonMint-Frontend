import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Button from './Button.jsx';
import LiveRegion from './LiveRegion.jsx';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { formatTonnes } from '../utils/format.js';
import { validateRetireQuantity } from '../utils/validate.js';
import './RetireModal.css';

/**
 * Modal dialog for retiring credits from a single holding. On confirm it
 * calls onConfirm(tonnes, beneficiary) and lets the parent issue the
 * certificate.
 *
 * Accessibility:
 * - role=dialog + aria-modal with labelled / described heading
 * - focus is trapped while open and returned to the trigger on close
 * - fields have explicit labels; errors are announced and associated
 * - the full flow is operable from the keyboard (Tab, Enter, Escape)
 *
 * @param {object} props
 * @param {object} props.holding
 * @param {boolean} props.submitting
 * @param {(tonnes: number, beneficiary: string) => void} props.onConfirm
 * @param {() => void} props.onClose
 */
export default function RetireModal({ holding, submitting, onConfirm, onClose }) {
  const [tonnes, setTonnes] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const reactId = useId();

  const titleId = `${reactId}-title`;
  const descId = `${reactId}-desc`;
  const tonnesId = `${reactId}-tonnes`;
  const tonnesErrorId = `${reactId}-tonnes-error`;
  const beneficiaryId = `${reactId}-beneficiary`;
  const statusId = `${reactId}-status`;

  const validation = useMemo(
    () => validateRetireQuantity(tonnes, holding.tonnes),
    [tonnes, holding.tonnes]
  );

  const showTonnesError = touched && !validation.valid;

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Trap focus inside the dialog while it is open; restore on unmount.
  useFocusTrap(dialogRef, true);

  // Move focus into the first invalidatable field so keyboard users start inside.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submitForm(event) {
    event?.preventDefault();
    event?.stopPropagation();
    setTouched(true);
    if (!validation.valid) {
      inputRef.current?.focus();
      return;
    }
    onConfirm(Number(tonnes), beneficiary.trim());
  }

  function handleSubmit(event) {
    submitForm(event);
  }

  function handleInputKeyDown(event) {
    if (event.key === 'Enter') {
      submitForm(event);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        aria-busy={submitting ? true : undefined}
        noValidate
        tabIndex={-1}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <h3 id={titleId}>Retire credits</h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <p className="modal-sub" id={descId}>
          {holding.projectName} · Vintage {holding.vintage}
        </p>
        <p className="modal-balance">
          You hold {formatTonnes(holding.tonnes)} in this batch.
        </p>

        <div className="modal-field">
          <label htmlFor={tonnesId}>Tonnes to retire</label>
          <div className="modal-input-row">
            <input
              id={tonnesId}
              ref={inputRef}
              type="number"
              name="tonnes"
              min="1"
              step="1"
              inputMode="numeric"
              value={tonnes}
              placeholder="0"
              required
              aria-required="true"
              aria-invalid={showTonnesError ? true : undefined}
              aria-describedby={showTonnesError ? tonnesErrorId : undefined}
              disabled={submitting}
              onChange={(e) => setTonnes(e.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={handleInputKeyDown}
            />
            <button
              type="button"
              className="modal-max"
              aria-label="Use maximum available tonnes"
              disabled={submitting}
              onClick={() => setTonnes(String(holding.tonnes))}
            >
              Max
            </button>
          </div>
        </div>

        <div className="modal-field">
          <label htmlFor={beneficiaryId}>Beneficiary (optional)</label>
          <input
            id={beneficiaryId}
            type="text"
            name="beneficiary"
            value={beneficiary}
            placeholder="On behalf of..."
            autoComplete="name"
            disabled={submitting}
            onChange={(e) => setBeneficiary(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        {showTonnesError && (
          <p
            id={tonnesErrorId}
            className="modal-error"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {validation.error}
          </p>
        )}

        {/* Screen-reader announcement for submit state */}
        <LiveRegion
          id={statusId}
          message={submitting ? 'Processing your retirement…' : ''}
        />

        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={submitting || showTonnesError}
            aria-busy={submitting ? true : undefined}
          >
            {submitting ? 'Retiring...' : 'Confirm retire'}
          </Button>
        </div>
      </form>
    </div>
  );
}
