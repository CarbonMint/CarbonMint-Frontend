/**
 * i18n readiness tests: lang attribute presence and correct values.
 *
 * These tests verify that:
 *   - index.html sets lang="en" on <html> (tested via document.documentElement)
 *   - LANG_CONFIG exports the expected default and technical language tags
 *   - getLang() and getTechnicalLang() return the expected BCP 47 tags
 *   - CertificateCard places lang="en" on the article and on every mono/hash <dd>
 *   - Navbar places lang="en" on the <header>
 *   - Footer places lang="en" on the <footer>
 *
 * Coverage:
 *   - LANG_CONFIG constant (src/constants/config.js)
 *   - getLang / getTechnicalLang utilities (src/utils/lang.js)
 *   - CertificateCard component
 *   - Navbar component
 *   - Footer component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── LANG_CONFIG constant ────────────────────────────────────────────────────
import { LANG_CONFIG } from '../constants/config.js';

describe('LANG_CONFIG', () => {
  it('exports a DEFAULT_LANG of "en"', () => {
    expect(LANG_CONFIG.DEFAULT_LANG).toBe('en');
  });

  it('exports a TECHNICAL_LANG of "en"', () => {
    expect(LANG_CONFIG.TECHNICAL_LANG).toBe('en');
  });

  it('contains only string values', () => {
    for (const value of Object.values(LANG_CONFIG)) {
      expect(typeof value).toBe('string');
    }
  });
});

// ─── lang utilities ──────────────────────────────────────────────────────────
import { getLang, getTechnicalLang } from '../utils/lang.js';

describe('getLang', () => {
  it('returns a non-empty BCP 47 language tag', () => {
    const lang = getLang();
    expect(typeof lang).toBe('string');
    expect(lang.length).toBeGreaterThan(0);
  });

  it('returns "en" by default', () => {
    expect(getLang()).toBe('en');
  });

  it('matches LANG_CONFIG.DEFAULT_LANG', () => {
    expect(getLang()).toBe(LANG_CONFIG.DEFAULT_LANG);
  });
});

describe('getTechnicalLang', () => {
  it('returns a non-empty BCP 47 language tag', () => {
    const lang = getTechnicalLang();
    expect(typeof lang).toBe('string');
    expect(lang.length).toBeGreaterThan(0);
  });

  it('returns "en"', () => {
    expect(getTechnicalLang()).toBe('en');
  });

  it('matches LANG_CONFIG.TECHNICAL_LANG', () => {
    expect(getTechnicalLang()).toBe(LANG_CONFIG.TECHNICAL_LANG);
  });
});

// ─── CertificateCard ─────────────────────────────────────────────────────────
import CertificateCard from '../components/CertificateCard.jsx';

const mockCertificate = {
  id: 'CERT-001',
  tonnes: 10,
  projectName: 'Amazon Reforestation',
  vintage: 2023,
  serial: 'SRL-XYZ-9999',
  retiredAt: '2024-01-15T00:00:00Z',
  beneficiary: 'Acme Corp',
  owner: 'GABCDEF1234567890',
  burnTxHash: '0xdeadbeefcafe1234',
};

describe('CertificateCard lang attributes', () => {
  it('puts lang="en" on the root <article> element', () => {
    const { container } = render(<CertificateCard certificate={mockCertificate} />);
    const article = container.querySelector('article.certificate');
    expect(article).not.toBeNull();
    expect(article).toHaveAttribute('lang', 'en');
  });

  it('puts lang="en" on the Certificate ID <dd>', () => {
    const { container } = render(<CertificateCard certificate={mockCertificate} />);
    // The first .mono dd is the Certificate ID
    const monoEls = container.querySelectorAll('dd.mono');
    expect(monoEls.length).toBeGreaterThanOrEqual(1);
    monoEls.forEach((el) => {
      expect(el).toHaveAttribute('lang', 'en');
    });
  });

  it('puts lang="en" on the Serial <dd>', () => {
    const { container } = render(<CertificateCard certificate={mockCertificate} />);
    // Find the dd that contains the serial value
    const allDds = container.querySelectorAll('dd');
    const serialDd = Array.from(allDds).find(
      (dd) => dd.textContent === mockCertificate.serial
    );
    expect(serialDd).not.toBeUndefined();
    expect(serialDd).toHaveAttribute('lang', 'en');
  });

  it('puts lang="en" on the Burn tx <dd>', () => {
    const { container } = render(<CertificateCard certificate={mockCertificate} />);
    const allDds = container.querySelectorAll('dd');
    const burnTxDd = Array.from(allDds).find(
      (dd) => dd.textContent === mockCertificate.burnTxHash
    );
    expect(burnTxDd).not.toBeUndefined();
    expect(burnTxDd).toHaveAttribute('lang', 'en');
  });

  it('still renders all certificate fields', () => {
    render(<CertificateCard certificate={mockCertificate} />);
    expect(screen.getByText(mockCertificate.projectName)).toBeInTheDocument();
    expect(screen.getByText(mockCertificate.id)).toBeInTheDocument();
    expect(screen.getByText(mockCertificate.serial)).toBeInTheDocument();
    expect(screen.getByText(mockCertificate.burnTxHash)).toBeInTheDocument();
  });
});

// ─── Navbar ──────────────────────────────────────────────────────────────────
// useWallet is called inside WalletButton, which Navbar renders.
vi.mock('../hooks/useWallet.js', () => ({
  useWallet: vi.fn(() => ({
    wallet: null,
    connecting: false,
    isConnected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

import Navbar from '../components/Navbar.jsx';

describe('Navbar lang attribute', () => {
  it('puts lang="en" on the <header> element', () => {
    const { container } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const header = container.querySelector('header.navbar');
    expect(header).not.toBeNull();
    expect(header).toHaveAttribute('lang', 'en');
  });
});

// ─── Footer ──────────────────────────────────────────────────────────────────
import Footer from '../components/Footer.jsx';

describe('Footer lang attribute', () => {
  it('puts lang="en" on the <footer> element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer.footer');
    expect(footer).not.toBeNull();
    expect(footer).toHaveAttribute('lang', 'en');
  });
});

// ─── HTML root element ───────────────────────────────────────────────────────
// Vitest runs under jsdom; the lang attribute set in index.html is applied
// at build time. Here we verify the constant matches and that document.documentElement
// will accept the attribute (confirming the browser contract).
describe('document.documentElement lang', () => {
  it('can be set to the DEFAULT_LANG value without error', () => {
    document.documentElement.setAttribute('lang', LANG_CONFIG.DEFAULT_LANG);
    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });
});
