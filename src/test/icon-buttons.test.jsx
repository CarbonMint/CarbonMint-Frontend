/**
 * Icon-only button accessibility tests: aria-labels on buttons that present
 * only a visual symbol or SVG with no visible text label.
 *
 * Coverage:
 *   - Drawer          — close button aria-label
 *   - Pagination      — previous / next page aria-labels
 *   - WalletButton    — connect / disconnect aria-labels
 *   - RetireModal     — close dialog aria-label
 *   - RecentSearches  — clear-all aria-label
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mock useWallet ──────────────────────────────────────────────────────────
vi.mock('../hooks/useWallet.js', () => ({
  useWallet: vi.fn(),
}));

import { useWallet } from '../hooks/useWallet.js';

// ─── Drawer ──────────────────────────────────────────────────────────────────
import Drawer from '../components/Drawer.jsx';

describe('Drawer close button', () => {
  it('has an aria-label', () => {
    render(<Drawer open onClose={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Close' })
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <Drawer open={false} onClose={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── Pagination ──────────────────────────────────────────────────────────────
import Pagination from '../components/Pagination.jsx';

describe('Pagination navigation buttons', () => {
  it('has an aria-label on the previous button', () => {
    render(<Pagination page={2} pageCount={5} onChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Previous page' })
    ).toBeInTheDocument();
  });

  it('has an aria-label on the next button', () => {
    render(<Pagination page={2} pageCount={5} onChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Next page' })
    ).toBeInTheDocument();
  });

  it('disables the previous button on the first page', () => {
    render(<Pagination page={1} pageCount={5} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('disables the next button on the last page', () => {
    render(<Pagination page={5} pageCount={5} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('renders nothing when pageCount is 1', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onChange={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });
});

// ─── WalletButton ────────────────────────────────────────────────────────────
import WalletButton from '../components/WalletButton.jsx';

describe('WalletButton connect / disconnect', () => {
  it('has aria-label on the disconnect button when connected', () => {
    useWallet.mockReturnValue({
      wallet: { publicKey: 'GABCDEF1234567890' },
      connecting: false,
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });
    render(<WalletButton />);
    expect(
      screen.getByRole('button', { name: 'Disconnect wallet' })
    ).toBeInTheDocument();
  });

  it('has aria-label on the connect button when disconnected', () => {
    useWallet.mockReturnValue({
      wallet: null,
      connecting: false,
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });
    render(<WalletButton />);
    expect(
      screen.getByRole('button', { name: 'Connect wallet' })
    ).toBeInTheDocument();
  });
});

// ─── RetireModal ─────────────────────────────────────────────────────────────
import RetireModal from '../components/RetireModal.jsx';

describe('RetireModal close button', () => {
  const holding = {
    batchId: 'h-1',
    projectName: 'Forest Guardians',
    vintage: '2024',
    tonnes: 80,
    pricePerTonne: 15,
  };

  it('has an aria-label', () => {
    render(
      <RetireModal
        holding={holding}
        onConfirm={() => {}}
        onClose={() => {}}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Close dialog' })
    ).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <RetireModal
        holding={holding}
        onConfirm={() => {}}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── RecentSearches clear button ─────────────────────────────────────────────
import RecentSearches from '../components/RecentSearches.jsx';

describe('RecentSearches clear button', () => {
  it('has an aria-label', () => {
    render(
      <RecentSearches
        searches={['amazon', 'kenya']}
        visible
        onSelect={() => {}}
        onRemove={() => {}}
        onClear={() => {}}
        onClose={() => {}}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Clear recent searches' })
    ).toBeInTheDocument();
  });
});
