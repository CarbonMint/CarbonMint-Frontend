/**
 * Accessibility tests: aria-live regions for async UI updates.
 *
 * These tests verify that screen readers receive the expected announcements
 * when asynchronous operations (purchases, retirements, wallet actions, copy)
 * resolve or fail.
 *
 * Coverage:
 *   - LiveRegion — core component
 *   - Alert      — role / aria-live per variant
 *   - ErrorMessage — role=alert + aria-live=assertive
 *   - Loader     — role=status + aria-live=polite
 *   - SkeletonGrid — role=status + aria-busy
 *   - BuyForm    — validation error + submitting announcement
 *   - CopyButton — copy-confirmation announcement
 *   - WalletButton — connecting announcement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── helpers ────────────────────────────────────────────────────────────────
// Most components depend on useWallet which reads from AppContext. We mock it.
vi.mock('../hooks/useWallet.js', () => ({
  useWallet: vi.fn(),
}));

import { useWallet } from '../hooks/useWallet.js';

// ─── LiveRegion ──────────────────────────────────────────────────────────────
import LiveRegion from '../components/LiveRegion.jsx';

describe('LiveRegion', () => {
  it('renders a visually-hidden region with role=status and aria-live=polite by default', () => {
    const { container } = render(<LiveRegion message="Hello" />);
    const region = container.firstChild;
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region).toHaveTextContent('Hello');
  });

  it('renders aria-live=assertive when politeness="assertive"', () => {
    const { container } = render(
      <LiveRegion message="Urgent!" politeness="assertive" />
    );
    expect(container.firstChild).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders empty text when no message is provided', () => {
    const { container } = render(<LiveRegion />);
    expect(container.firstChild).toHaveTextContent('');
  });

  it('updates the announcement when message prop changes', () => {
    const { rerender, container } = render(<LiveRegion message="" />);
    expect(container.firstChild).toHaveTextContent('');

    rerender(<LiveRegion message="Purchase complete" />);
    expect(container.firstChild).toHaveTextContent('Purchase complete');
  });

  it('accepts an optional id prop', () => {
    const { container } = render(<LiveRegion id="my-region" message="test" />);
    expect(container.firstChild).toHaveAttribute('id', 'my-region');
  });

  it('is visually hidden via inline styles', () => {
    const { container } = render(<LiveRegion message="hidden" />);
    const el = container.firstChild;
    expect(el.style.position).toBe('absolute');
    expect(el.style.width).toBe('1px');
    expect(el.style.height).toBe('1px');
    expect(el.style.overflow).toBe('hidden');
  });
});

// ─── Alert ───────────────────────────────────────────────────────────────────
import Alert from '../components/Alert.jsx';

describe('Alert', () => {
  it('has role=status and aria-live=polite for info variant', () => {
    render(<Alert variant="info">Info message</Alert>);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });

  it('has role=status and aria-live=polite for success variant', () => {
    render(<Alert variant="success">Done</Alert>);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('has role=alert and aria-live=assertive for danger variant', () => {
    render(<Alert variant="danger">Error!</Alert>);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });

  it('has role=alert and aria-live=assertive for warning variant', () => {
    render(<Alert variant="warning">Warning!</Alert>);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders a title and children inside the alert body', () => {
    render(
      <Alert variant="info" title="Heads up">
        Some detail
      </Alert>
    );
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Some detail')).toBeInTheDocument();
  });
});

// ─── ErrorMessage ────────────────────────────────────────────────────────────
import ErrorMessage from '../components/ErrorMessage.jsx';

describe('ErrorMessage', () => {
  it('has role=alert, aria-live=assertive, and aria-atomic=true', () => {
    render(<ErrorMessage message="Something went wrong." />);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });

  it('displays the error message text', () => {
    render(<ErrorMessage message="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders a retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Failed" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('falls back to default message when none provided', () => {
    render(<ErrorMessage />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});

// ─── Loader ──────────────────────────────────────────────────────────────────
import Loader from '../components/Loader.jsx';

describe('Loader', () => {
  it('has role=status and aria-live=polite', () => {
    render(<Loader />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('displays the default label', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays a custom label', () => {
    render(<Loader label="Loading batch..." />);
    expect(screen.getByText('Loading batch...')).toBeInTheDocument();
  });
});

// ─── SkeletonGrid ────────────────────────────────────────────────────────────
import SkeletonGrid from '../components/SkeletonGrid.jsx';

describe('SkeletonGrid', () => {
  it('has role=status and aria-busy=true', () => {
    render(<SkeletonGrid />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('has an accessible label', () => {
    render(<SkeletonGrid />);
    expect(screen.getByLabelText(/loading batches/i)).toBeInTheDocument();
  });

  it('renders the requested number of skeleton cards', () => {
    const { container } = render(<SkeletonGrid count={3} />);
    expect(container.querySelectorAll('.skeleton-card').length).toBe(3);
  });
});

// ─── BuyForm ─────────────────────────────────────────────────────────────────
import BuyForm from '../components/BuyForm.jsx';
import RetireModal from '../components/RetireModal.jsx';

const mockBatch = {
  id: 'batch-1',
  availableTonnes: 100,
  pricePerTonne: 15,
};

describe('BuyForm', () => {
  beforeEach(() => {
    useWallet.mockReturnValue({
      isConnected: true,
      connect: vi.fn(),
    });
  });

  it('announces "Processing your purchase…" when submitting=true', () => {
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={true} />);
    // LiveRegion is visually hidden; query by text directly
    expect(screen.getByText('Processing your purchase…')).toBeInTheDocument();
  });

  it('shows no submitting announcement when submitting=false', () => {
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);
    expect(screen.queryByText('Processing your purchase…')).not.toBeInTheDocument();
  });

  it('shows validation error with role=alert after form is touched', () => {
    const { container } = render(
      <BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />
    );
    // Trigger submit without entering a quantity to expose the validation error
    fireEvent.submit(container.querySelector('.buy-form'));
    // The error paragraph has role=alert
    const errors = screen.getAllByRole('alert');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('submits the form when the user presses Enter in the quantity field', async () => {
    const user = userEvent.setup();
    const onBuy = vi.fn();

    render(<BuyForm batch={mockBatch} onBuy={onBuy} submitting={false} />);

    const input = screen.getByLabelText(/quantity/i);
    await user.clear(input);
    await user.type(input, '3');
    await user.keyboard('{Enter}');

    expect(onBuy).toHaveBeenCalledWith(3);
  });

  it('renders a "Sold out" message and no form when availableTonnes is 0', () => {
    const soldOut = { ...mockBatch, availableTonnes: 0 };
    render(<BuyForm batch={soldOut} onBuy={vi.fn()} submitting={false} />);
    expect(screen.getByText(/fully sold/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument();
  });

  it('submits the retire form when the user presses Enter in the tonnes field', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const holding = {
      id: 'holding-1',
      projectName: 'Forest Guardians',
      vintage: '2024',
      tonnes: 80,
    };

    render(
      <RetireModal
        holding={holding}
        submitting={false}
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/tonnes to retire/i);
    await user.clear(input);
    await user.type(input, '3');
    await user.keyboard('{Enter}');

    expect(onConfirm).toHaveBeenCalledWith(3, '');
  });

  it('shows "Connect wallet to buy" button when wallet not connected', () => {
    useWallet.mockReturnValue({ isConnected: false, connect: vi.fn() });
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);
    expect(screen.getByText(/connect wallet to buy/i)).toBeInTheDocument();
  });
});

// ─── CopyButton ──────────────────────────────────────────────────────────────
import CopyButton from '../components/CopyButton.jsx';

describe('CopyButton', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('announces "Copied <label>" via the live region after a successful copy', async () => {
    render(<CopyButton value="0xABC123" label="wallet address" />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText('Copied wallet address')).toBeInTheDocument();
  });

  it('shows no copy announcement before the button is clicked', () => {
    render(<CopyButton value="test" label="hash" />);
    expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
  });

  it('updates aria-label to "Copied <label>" after click', async () => {
    render(<CopyButton value="test" label="serial number" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Copied serial number'
    );
  });
});

// ─── WalletButton ────────────────────────────────────────────────────────────
import WalletButton from '../components/WalletButton.jsx';

describe('WalletButton', () => {
  it('announces "Connecting wallet…" via the live region when connecting=true', () => {
    useWallet.mockReturnValue({
      wallet: null,
      connecting: true,
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });
    render(<WalletButton />);
    expect(screen.getByText('Connecting wallet…')).toBeInTheDocument();
  });

  it('shows no connecting announcement when not connecting', () => {
    useWallet.mockReturnValue({
      wallet: null,
      connecting: false,
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });
    render(<WalletButton />);
    // The live region is present but empty
    expect(screen.queryByText('Connecting wallet…')).not.toBeInTheDocument();
  });

  it('announces the connected wallet address via the live region', () => {
    useWallet.mockReturnValue({
      wallet: { publicKey: 'GABCDEF1234567890' },
      connecting: false,
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });
    render(<WalletButton />);
    expect(
      screen.getByText('Wallet connected: GABCDEF1234567890')
    ).toBeInTheDocument();
  });

  it('disables the connect button while connecting', () => {
    useWallet.mockReturnValue({
      wallet: null,
      connecting: true,
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });
    render(<WalletButton />);
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeDisabled();
  });
});
