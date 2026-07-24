import { useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import './Dropdown.css';

/**
 * A button that toggles a floating menu of selectable options. Closes on an
 * outside click or when an item is chosen. Supports arrow-key navigation
 * within the menu when open.
 * @param {object} props
 * @param {string} props.label - text shown on the trigger button
 * @param {{ value: string, label: string }[]} props.items - menu options
 * @param {(value: string) => void} props.onSelect - called with the chosen value
 */
export default function Dropdown({ label, items = [], onSelect }) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useOnClickOutside(ref, () => setOpen(false));

  const choose = useCallback((value) => {
    onSelect?.(value);
    setOpen(false);
    triggerRef.current?.focus();
  }, [onSelect]);

  function handleTriggerKeyDown(event) {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
        setFocusIndex(0);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function handleItemKeyDown(event, index) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(items[index].value);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        ref={triggerRef}
        className="dropdown-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
      >
        {label}
        <span className="dropdown-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul className="dropdown-menu" role="menu">
          {items.map((item, index) => (
            <li key={item.value} role="none">
              <button
                type="button"
                role="menuitem"
                className="dropdown-item"
                tabIndex={index === focusIndex ? 0 : -1}
                ref={(el) => {
                  if (el && index === focusIndex) el.focus();
                }}
                onClick={() => choose(item.value)}
                onKeyDown={(e) => handleItemKeyDown(e, index)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
