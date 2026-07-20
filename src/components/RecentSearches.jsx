import { useRef } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import './RecentSearches.css';

/**
 * Displays recent search terms as clickable chips with a clear-all action.
 * Closes when the user clicks outside the container.
 * @param {object} props
 * @param {string[]} props.searches - list of recent terms
 * @param {(term: string) => void} props.onSelect - called when a chip is clicked
 * @param {(term: string) => void} props.onRemove - called to remove a single term
 * @param {() => void} props.onClear - called to clear all terms
 * @param {boolean} props.visible
 * @param {() => void} props.onClose
 */
export default function RecentSearches({
  searches,
  onSelect,
  onRemove,
  onClear,
  visible,
  onClose,
}) {
  const ref = useRef(null);
  useOnClickOutside(ref, onClose);

  if (!visible || searches.length === 0) return null;

  return (
    <div className="recent-searches" ref={ref} role="listbox" aria-label="Recent searches">
      <div className="recent-searches-head">
        <span className="recent-searches-label">Recent searches</span>
        <button
          type="button"
          className="recent-searches-clear"
          onClick={onClear}
          aria-label="Clear recent searches"
        >
          Clear
        </button>
      </div>
      <div className="recent-searches-list">
        {searches.map((term) => (
          <span key={term} className="recent-searches-chip" role="option">
            <button
              type="button"
              className="recent-searches-term"
              onClick={() => onSelect(term)}
              aria-label={`Search for "${term}"`}
            >
              {term}
            </button>
            <button
              type="button"
              className="recent-searches-dismiss"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(term);
              }}
              aria-label={`Remove "${term}"`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
