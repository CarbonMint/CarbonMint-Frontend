import { CONFIG } from '../constants/config.js';
import { getLang } from '../utils/lang.js';
import './Footer.css';

/**
 * Site footer with project tagline and a network status note.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" lang={getLang()}>
      <div className="footer-inner">
        <p className="footer-tagline">
          CarbonMint — tokenized carbon credits on Stellar &amp; Soroban.
        </p>
        <p className="footer-note">
          Demo build · mock data · {year} · Network: {CONFIG.network}
        </p>
      </div>
    </footer>
  );
}
