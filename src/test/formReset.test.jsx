import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../hooks/useWallet.js', () => ({ useWallet: vi.fn() }));

import { useWallet } from '../hooks/useWallet.js';
import BuyForm from '../components/BuyForm.jsx';

const mockBatch = {
  id: 'batch-1',
  availableTonnes: 100,
  pricePerTonne: 15,
};

describe('BuyForm reset confirmation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useWallet.mockReturnValue({ isConnected: true, connect: vi.fn() });
  });

  it('keeps the reset action disabled until the form changes', async () => {
    const user = userEvent.setup();
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    const resetButton = screen.getByRole('button', { name: /reset form/i });
    expect(resetButton).toBeDisabled();

    await user.type(screen.getByRole('spinbutton', { name: /quantity/i }), '5');

    expect(resetButton).toBeEnabled();
  });

  it('preserves entered values when the user declines the confirmation', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    const slippageInput = screen.getByRole('spinbutton', {
      name: /custom slippage/i,
    });
    await user.type(quantityInput, '5');
    await user.clear(slippageInput);
    await user.type(slippageInput, '2');
    await user.click(screen.getByRole('button', { name: /reset form/i }));

    expect(confirm).toHaveBeenCalledWith(
      'Reset this form? Your entered values will be cleared.'
    );
    expect(quantityInput).toHaveValue(5);
    expect(slippageInput).toHaveValue(2);
  });

  it('restores defaults and clears validation state after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    const slippageInput = screen.getByRole('spinbutton', {
      name: /custom slippage/i,
    });
    await user.type(quantityInput, '101');
    await user.tab();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.clear(slippageInput);
    await user.type(slippageInput, '2');
    await user.click(screen.getByRole('button', { name: /reset form/i }));

    expect(quantityInput).toHaveValue(null);
    expect(slippageInput).toHaveValue(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/max cost with slippage/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset form/i })).toBeDisabled();
  });

  it('does not allow a reset while the purchase is submitting', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />
    );

    await user.type(screen.getByRole('spinbutton', { name: /quantity/i }), '5');
    rerender(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting />);

    expect(screen.getByRole('button', { name: /reset form/i })).toBeDisabled();
  });
});
