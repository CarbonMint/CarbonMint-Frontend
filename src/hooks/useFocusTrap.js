import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Collect tabbable descendants of a container. Hidden nodes (display:none /
 * visibility:hidden / inert) are excluded so the trap never parks focus on
 * an element the user cannot see.
 */
export function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter((node) => {
    if (node.hasAttribute('disabled') || node.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    if (node.tabIndex < 0) return false;
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  });
}

/**
 * Trap keyboard focus inside `ref` while `active` is true.
 *
 * Behaviour:
 * - Tab / Shift+Tab cycle within the container (never escape).
 * - A `focusin` listener pulls focus back if anything outside receives it.
 * - On deactivate / unmount, focus is restored to the element that had it
 *   when the trap started (the typical "return focus to the trigger" pattern).
 *
 * Initial focus is left to the caller so dialogs can choose a meaningful
 * first field (e.g. the tonnes input) instead of the close button.
 *
 * @param {import('react').RefObject<HTMLElement>} ref
 * @param {boolean} [active=true]
 * @param {{ restoreFocus?: boolean }} [options]
 */
export function useFocusTrap(ref, active = true, options = {}) {
  const { restoreFocus = true } = options;

  useEffect(() => {
    if (!active) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event) {
      if (event.key !== 'Tab') return;
      const container = ref.current;
      if (!container) return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        if (typeof container.focus === 'function') container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || !container.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last || !container.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleFocusIn(event) {
      const container = ref.current;
      if (!container) return;
      if (container.contains(event.target)) return;

      const focusable = getFocusableElements(container);
      const fallback = focusable[0] || container;
      // Recapture without scrolling the page behind the dialog.
      fallback.focus({ preventScroll: true });
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      if (
        restoreFocus &&
        previouslyFocused &&
        typeof previouslyFocused.focus === 'function' &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [ref, active, restoreFocus]);
}
