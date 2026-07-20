/**
 * Tests for the slippage tolerance feature.
 *
 * Coverage:
 *   - validateSlippageTolerance  — all boundary and error cases
 *   - submitBuy                  — slippage enforcement in the API layer
 *   - BuyForm (slippage UI)      — preset buttons, custom input, warnings,
 *                                  max-cost display, form submission
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── validateSlippageTolerance ────────────────────────────────────────────────

import { validateSlippageTolerance } from '../utils/validate.js';

describe('validateSlippageTolerance', () => {
  it('returns valid for a standard value (1 %)', () => {
    expect(validateSlippageTolerance(1)).toEqual({ valid: true, error: null });
  });

  it('returns valid for the lower boundary (0.1 %)', () => {
    expect(validateSlippageTolerance(0.1)).toEqual({ valid: true, error: null });
  });

  it('returns valid for the upper boundary (50 %)', () => {
    expect(validateSlippageTolerance(50)).toEqual({ valid: true, error: null });
  });

  it('returns valid for a decimal value (2.5 %)', () => {
    expect(validateSlippageTolerance(2.5)).toEqual({ valid: true, error: null });
  });

  it('returns an error for an empty string', () => {
    const result = validateSlippageTolerance('');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/enter a slippage/i);
  });

  it('returns an error for null', () => {
    const result = validateSlippageTolerance(null);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/enter a slippage/i);
  });

  it('returns an error for undefined', () => {
    const result = validateSlippageTolerance(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/enter a slippage/i);
  });

  it('returns an error for a non-numeric string', () => {
    const result = validateSlippageTolerance('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/must be a number/i);
  });

  it('returns an error for a value below 0.1 %', () => {
    const result = validateSlippageTolerance(0.05);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least 0\.1/i);
  });

  it('returns an error for zero', () => {
    const result = validateSlippageTolerance(0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least 0\.1/i);
  });

  it('returns an error for a negative value', () => {
    const result = validateSlippageTolerance(-1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least 0\.1/i);
  });

  it('returns an error for a value above 50 %', () => {
    const result = validateSlippageTolerance(51);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/cannot exceed 50/i);
  });

  it('accepts a numeric string representation of a valid value', () => {
    expect(validateSlippageTolerance('2')).toEqual({ valid: true, error: null });
  });
});

// ─── submitBuy — slippage enforcement ────────────────────────────────────────

// submitBuy mutates the in-memory BATCHES array, so each test that calls it
// must restore the original state to avoid cross-test pollution.  We do that
// by resetting the module between describe blocks via vi.resetModules() and
// re-importing inside each test group.

describe('submitBuy — slippage tolerance', () => {
  let submitBuy;
  let BATCHES;

  beforeEach(async () => {
    // Fresh module state so mutations don't bleed between tests.
    vi.resetModules();
    const api = await import('../services/api.js');
    const market = await import('../services/market.js');
    submitBuy = api.submitBuy;
    BATCHES = market.BATCHES;
  });

  it('resolves when slippage tolerance is within range', async () => {
    const batch = BATCHES[0]; // pricePerTonne = 14.5
    const result = await submitBuy({
      batchId: batch.id,
      quantity: 1,
      buyer: 'GTEST',
      slippageTolerance: 1, // max price = 14.645 — listed price is 14.5, OK
    });
    expect(result).toMatchObject({
      batchId: batch.id,
      quantity: 1,
      slippageTolerance: 1,
    });
  });

  it('includes slippageTolerance in the returned receipt', async () => {
    const batch = BATCHES[0];
    const result = await submitBuy({
      batchId: batch.id,
      quantity: 1,
      buyer: 'GTEST',
      slippageTolerance: 2,
    });
    expect(result.slippageTolerance).toBe(2);
  });

  it('defaults to 1 % when slippageTolerance is omitted', async () => {
    const batch = BATCHES[0];
    const result = await submitBuy({
      batchId: batch.id,
      quantity: 1,
      buyer: 'GTEST',
    });
    expect(result.slippageTolerance).toBe(1);
  });

  it('rejects when the listed price exceeds the slippage limit', async () => {
    const batch = BATCHES[0]; // pricePerTonne = 14.5

    // Pass a referencePrice significantly lower than the current listed price
    // so the guard triggers: maxAcceptable = 1.0 * 1.001 = 1.001, but the
    // actual price is 14.5 — well above the limit.
    await expect(
      submitBuy({
        batchId: batch.id,
        quantity: 1,
        buyer: 'GTEST',
        slippageTolerance: 0.1,
        referencePrice: 1.0, // far below the current listed price of 14.5
      })
    ).rejects.toThrow(/slippage limit/i);
  });

  it('throws when the batch is not found', async () => {
    await expect(
      submitBuy({ batchId: 'does-not-exist', quantity: 1, buyer: 'GTEST' })
    ).rejects.toThrow('Batch not found.');
  });

  it('throws when quantity exceeds available tonnes', async () => {
    const batch = BATCHES[0];
    await expect(
      submitBuy({
        batchId: batch.id,
        quantity: batch.availableTonnes + 9999,
        buyer: 'GTEST',
        slippageTolerance: 1,
      })
    ).rejects.toThrow(/not enough/i);
  });
});

// ─── BuyForm — slippage UI ────────────────────────────────────────────────────

vi.mock('../hooks/useWallet.js', () => ({ useWallet: vi.fn() }));
import { useWallet } from '../hooks/useWallet.js';
import BuyForm from '../components/BuyForm.jsx';

const mockBatch = {
  id: 'batch-1',
  availableTonnes: 100,
  pricePerTonne: 15,
};

describe('BuyForm — slippage tolerance UI', () => {
  beforeEach(() => {
    useWallet.mockReturnValue({ isConnected: true, connect: vi.fn() });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the slippage tolerance fieldset', () => {
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);
    expect(
      screen.getByRole('group', { name: /preset slippage tolerances/i })
    ).toBeInTheDocument();
  });

  it('renders preset buttons for 0.5 %, 1 %, and 2 %', () => {
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);
    expect(screen.getByRole('button', { name: '0.5%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2%' })).toBeInTheDocument();
  });

  it('marks the 1 % preset as active by default (aria-pressed=true)', () => {
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);
    expect(screen.getByRole('button', { name: '1%' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('updates the active preset and custom input when a preset button is clicked', async () => {
    const user = userEvent.setup();
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    await user.click(screen.getByRole('button', { name: '2%' }));

    expect(screen.getByRole('button', { name: '2%' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: '1%' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('spinbutton', { name: /custom slippage/i })
    ).toHaveValue(2);
  });

  it('shows a high-slippage warning when tolerance > 5 %', async () => {
    const user = userEvent.setup();
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    const customInput = screen.getByRole('spinbutton', { name: /custom slippage/i });
    await user.clear(customInput);
    await user.type(customInput, '10');

    expect(screen.getByText(/high slippage/i)).toBeInTheDocument();
  });

  it('does not show a high-slippage warning for 5 % or below', async () => {
    const user = userEvent.setup();
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    const customInput = screen.getByRole('spinbutton', { name: /custom slippage/i });
    await user.clear(customInput);
    await user.type(customInput, '5');

    expect(screen.queryByText(/high slippage/i)).not.toBeInTheDocument();
  });

  it('shows a slippage validation error when an invalid value is submitted', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />
    );

    const customInput = screen.getByRole('spinbutton', { name: /custom slippage/i });
    await user.clear(customInput);
    await user.type(customInput, '0');

    fireEvent.submit(container.querySelector('.buy-form'));

    const errors = screen.getAllByRole('alert');
    const texts = errors.map((el) => el.textContent);
    expect(texts.some((t) => /at least 0\.1/i.test(t))).toBe(true);
  });

  it('displays the max cost line when quantity and slippage are valid', async () => {
    const user = userEvent.setup();
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    await user.type(screen.getByRole('spinbutton', { name: /quantity/i }), '10');

    // Default slippage = 1 %, pricePerTonne = 15, quantity = 10
    // max cost = 10 * 15 * 1.01 = 151.50
    expect(screen.getByText(/max cost with slippage/i)).toBeInTheDocument();
    expect(screen.getByText(/151\.50/)).toBeInTheDocument();
  });

  it('calls onBuy with quantity AND slippageTolerance when the form is submitted', async () => {
    const user = userEvent.setup();
    const onBuy = vi.fn();
    render(<BuyForm batch={mockBatch} onBuy={onBuy} submitting={false} />);

    await user.type(screen.getByRole('spinbutton', { name: /quantity/i }), '5');
    // Select the 2 % preset
    await user.click(screen.getByRole('button', { name: '2%' }));
    await user.click(screen.getByRole('button', { name: 'Buy now' }));

    expect(onBuy).toHaveBeenCalledTimes(1);
    expect(onBuy).toHaveBeenCalledWith(5, 2);
  });

  it('does not call onBuy when slippage is invalid', async () => {
    const user = userEvent.setup();
    const onBuy = vi.fn();
    render(<BuyForm batch={mockBatch} onBuy={onBuy} submitting={false} />);

    await user.type(screen.getByRole('spinbutton', { name: /quantity/i }), '5');
    const customInput = screen.getByRole('spinbutton', { name: /custom slippage/i });
    await user.clear(customInput);
    // Leave it blank — will fail validation
    await user.click(screen.getByRole('button', { name: 'Buy now' }));

    expect(onBuy).not.toHaveBeenCalled();
  });

  it('disables Buy now when slippage is invalid and form has been touched', async () => {
    const user = userEvent.setup();
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    // Enter a valid quantity so only slippage blocks submission.
    await user.type(screen.getByRole('spinbutton', { name: /quantity/i }), '5');
    const customInput = screen.getByRole('spinbutton', { name: /custom slippage/i });
    await user.clear(customInput);
    await user.tab(); // trigger blur / touch

    fireEvent.submit(
      screen.getByRole('button', { name: 'Buy now' }).closest('form')
    );

    expect(screen.getByRole('button', { name: 'Buy now' })).toBeDisabled();
  });
});
