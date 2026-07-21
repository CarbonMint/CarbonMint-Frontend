import { NavLink } from 'react-router-dom';
import WalletButton from './WalletButton.jsx';
import { getLang } from '../utils/lang.js';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/my-credits', label: 'My Credits' },
  { to: '/retirements', label: 'Retirements' },
  { to: '/settings', label: 'Settings' },
];

/**
 * Top navigation bar with brand, route links and the wallet control.
 */
export default function Navbar() {
  return (
    <header className="navbar" lang={getLang()}>
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">
            ◈
          </span>
          CarbonMint
        </NavLink>
        <nav className="navbar-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
