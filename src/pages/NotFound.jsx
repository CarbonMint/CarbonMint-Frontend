import { Link } from 'react-router-dom';
import './NotFound.css';

/**
 * Fallback page for unmatched routes.
 */
export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>That page drifted off into the carbon sink.</p>
      <div className="not-found-action">
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
