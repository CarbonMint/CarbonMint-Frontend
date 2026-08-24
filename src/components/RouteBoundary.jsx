import { Component } from "react";
import { Link } from "react-router-dom";
import "./RouteBoundary.css";

// Credential patterns to strip from diagnostic context before logging.
const REDACT_KEYS = /key|token|secret|auth|password|credential|seed|mnemonic/i;

/**
 * Classify whether an error is worth retrying (transient network/provider
 * failures) vs. a hard render bug that retry won't fix.
 * @param {Error} error
 * @returns {boolean}
 */
function isRetryable(error) {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("fetch") ||
    msg.includes("provider") ||
    msg.includes("failed to fetch") ||
    (error.name === "TypeError" && msg.includes("load"))
  );
}

/**
 * Generate a short correlation ID for incident reference.
 * Format: 8 hex chars — readable but not guessable.
 * @returns {string}
 */
function generateCorrelationId() {
  return Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
}

/**
 * Strip credential-like keys from a plain object before logging.
 * Operates one level deep (component info shape from React).
 * @param {object} obj
 * @returns {object}
 */
function redactSensitiveKeys(obj) {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      REDACT_KEYS.test(k) ? [k, "[REDACTED]"] : [k, v],
    ),
  );
}

/**
 * Per-route error boundary.
 *
 * Catches render-time errors scoped to a single route so that a failing
 * wallet/provider screen cannot blank unrelated registry, project, or
 * certificate pages. Features:
 *
 * - Correlation ID shown to the user and included in the log entry.
 * - Retryable errors (network, timeout, provider) offer a "Try again" action
 *   that resets the boundary and re-mounts the subtree.
 * - Non-retryable errors offer safe navigation back to Home.
 * - Diagnostic context is redacted of credential-like keys before logging.
 *
 * Usage: wrap each <Route element> in App.jsx.
 */
export default class RouteBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      correlationId: null,
      retryable: false,
    };
    this._handleRetry = this._handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      correlationId: generateCorrelationId(),
      retryable: isRetryable(error),
    };
  }

  componentDidCatch(error, info) {
    const safeInfo = redactSensitiveKeys(
      info && typeof info === "object" ? { ...info } : {},
    );
    // eslint-disable-next-line no-console
    console.error("[RouteBoundary]", {
      correlationId: this.state.correlationId,
      message: error?.message,
      name: error?.name,
      retryable: this.state.retryable,
      componentStack: safeInfo.componentStack,
    });
  }

  _handleRetry() {
    this.setState({
      hasError: false,
      error: null,
      correlationId: null,
      retryable: false,
    });
  }

  render() {
    const { hasError, correlationId, retryable } = this.state;

    if (!hasError) {
      return this.props.children;
    }

    return (
      <div
        className="route-boundary"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <span className="route-boundary__icon" aria-hidden="true">
          !
        </span>
        <h2 className="route-boundary__title">This page ran into a problem</h2>
        <p className="route-boundary__body">
          {retryable
            ? "A connection or provider error occurred. You can try again without leaving."
            : "An unexpected error occurred while rendering this page."}
        </p>
        <p className="route-boundary__correlation">
          Reference: <code>{correlationId}</code>
        </p>
        <div className="route-boundary__actions">
          {retryable && (
            <button
              type="button"
              className="route-boundary-btn route-boundary-btn--primary"
              onClick={this._handleRetry}
            >
              Try again
            </button>
          )}
          <Link
            to="/"
            className="route-boundary-btn route-boundary-btn--secondary"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }
}
