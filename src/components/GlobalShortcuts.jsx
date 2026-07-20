import { useNavigate } from 'react-router-dom';
import { useKeyPress } from '../hooks/useKeyPress';

/**
 * Global keyboard shortcuts for application navigation.
 */
export default function GlobalShortcuts() {
  const navigate = useNavigate();

  // Navigation shortcuts
  useKeyPress('h', () => navigate('/'));
  useKeyPress('m', () => navigate('/marketplace'));
  useKeyPress('c', () => navigate('/my-credits'));
  useKeyPress('r', () => navigate('/retirements'));

  return null;
}
