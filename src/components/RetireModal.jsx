import { useEffect, useMemo, useRef, useState } from 'react';
import Button from './Button.jsx';
import LiveRegion from './LiveRegion.jsx';
import { formatTonnes } from '../utils/format.js';
import { validateRetireQuantity } from '../utils/validate.js';
import './RetireModal.css';

/**
 * Modal dialog for retiring credits from a single holding. On confirm it
 * calls onConfirm(tonnes, beneficiary) and lets the parent issue the
 * certificate.
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

  const validation = useMemo(
    () => validateRetireQuantity(tonnes, holding.tonnes),
    [tonnes, holding.tonnes]
  );

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Move focus into the dialog so keyboard users start inside it.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submitForm(event) {
    event?.preventDefault();
    event?.stopPropagation();
    setTouched(true);
    if (!validation.valid) return;
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="retire-modal-title"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <h3 id="retire-modal-title">Retire credits</h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <p className="modal-sub">
          {holding.projectName} · Vintage {holding.vintage}
        </p>
        <p className="modal-balance">
          You hold {formatTonnes(holding.tonnes)} in this batch.
        </p>

        <label className="modal-field">
          <span>Tonnes to retire</span>
          <div className="modal-input-row">
            <input
              ref={inputRef}
              type="number"
              min="1"
              step="1"
              value={tonnes}
              placeholder="0"
              onChange={(e) => setTonnes(e.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={handleInputKeyDown}
            />
            <button
              type="button"
              className="modal-max"
              onClick={() => setTonnes(String(holding.tonnes))}
            >
              Max
            </button>
          </div>
        </label>

        <label className="modal-field">
          <span>Beneficiary (optional)</span>
          <input
            type="text"
            value={beneficiary}
            placeholder="On behalf of..."
            onChange={(e) => setBeneficiary(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </label>

        {touched && !validation.valid && (
          <p className="modal-error" role="alert" aria-live="polite" aria-atomic="true">
            {validation.error}
          </p>
        )}

        {/* Screen-reader announcement for submit state */}
        <LiveRegion message={submitting ? 'Processing your retirement…' : ''} />

        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={submitting || (touched && !validation.valid)}
          >
            {submitting ? 'Retiring...' : 'Confirm retire'}
          </Button>
        </div>
      </form>
    </div>
  );
}
