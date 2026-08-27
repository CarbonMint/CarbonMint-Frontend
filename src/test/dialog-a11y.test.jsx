/**
 * Regression tests for purchase and retirement dialog accessibility.
 *
 * Original failure mode: carbon actions were unreachable or silent for
 * keyboard / screen-reader users because dialogs lacked focus trapping
 * and return, fields lacked programmatic names, and validation errors
 * were neither announced nor associated with their controls.
 *
 * Coverage:
 *   - RetireModal dialog semantics, labels, keyboard, trap, return
 *   - BuyForm labels, error association, keyboard submit, announcements
 *   - useFocusTrap recapture + restore
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

vi.mock('../hooks/useWallet.js', () => ({
  useWallet: vi.fn(),
}));

import { useWallet } from '../hooks/useWallet.js';
import RetireModal from '../components/RetireModal.jsx';
import BuyForm from '../components/BuyForm.jsx';
import { getFocusableElements } from '../hooks/useFocusTrap.js';

const holding = {
  batchId: 'h-1',
  projectName: 'Forest Guardians',
  vintage: '2024',
  tonnes: 80,
  pricePerTonne: 15,
};

const mockBatch = {
  id: 'batch-1',
  availableTonnes: 100,
  pricePerTonne: 15,
};

function renderRetire(overrides = {}) {
  const props = {
    holding,
    submitting: false,
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  const result = render(<RetireModal {...props} />);
  return { ...result, props };
}

describe('RetireModal — dialog semantics', () => {
  it('exposes a labelled modal dialog', () => {
    renderRetire();

    const dialog = screen.getByRole('dialog', { name: 'Retire credits' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const title = screen.getByRole('heading', { name: 'Retire credits' });
    expect(dialog).toHaveAttribute('aria-labelledby', title.id);

    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy)).toHaveTextContent(/Forest Guardians/);
  });

  it('gives every field a programmatic name', () => {
    renderRetire();

    expect(screen.getByLabelText(/tonnes to retire/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/beneficiary/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /maximum available tonnes/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });
});

describe('RetireModal — keyboard operation', () => {
  it('closes on Escape without a pointer', async () => {
    const user = userEvent.setup();
    const { props } = renderRetire();

    await user.keyboard('{Escape}');
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('submits from the keyboard when the tonnes field is valid', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderRetire({ onConfirm });

    await user.type(screen.getByLabelText(/tonnes to retire/i), '5');
    await user.keyboard('{Enter}');

    expect(onConfirm).toHaveBeenCalledWith(5, '');
  });

  it('activates Max from the keyboard', async () => {
    const user = userEvent.setup();
    renderRetire();

    await user.click(screen.getByRole('button', { name: /maximum available tonnes/i }));
    expect(screen.getByLabelText(/tonnes to retire/i)).toHaveValue(80);
  });
});

describe('RetireModal — error announcement and association', () => {
  it('announces a validation error and associates it with the tonnes field', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderRetire({ onConfirm });

    await user.click(screen.getByRole('button', { name: 'Confirm retire' }));

    const input = screen.getByLabelText(/tonnes to retire/i);
    const error = screen.getByRole('alert');

    expect(error).toHaveTextContent(/enter an amount/i);
    expect(error).toHaveAttribute('aria-live', 'assertive');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('clears the association once the field becomes valid', async () => {
    const user = userEvent.setup();
    renderRetire();

    await user.click(screen.getByRole('button', { name: 'Confirm retire' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/tonnes to retire/i), '2');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/tonnes to retire/i)).not.toHaveAttribute(
      'aria-invalid'
    );
  });

  it('announces processing status while the retirement is submitting', () => {
    renderRetire({ submitting: true });
    expect(screen.getByText('Processing your retirement…')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('RetireModal — focus trap and return', () => {
  it('focuses the tonnes input on open', () => {
    renderRetire();
    expect(document.activeElement).toBe(screen.getByLabelText(/tonnes to retire/i));
  });

  it('keeps Tab from leaving the dialog (wraps last → first)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside before</button>
        <RetireModal
          holding={holding}
          submitting={false}
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />
        <button type="button">Outside after</button>
      </>
    );

    const dialog = screen.getByRole('dialog');
    const focusable = getFocusableElements(dialog);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    await act(async () => {
      last.focus();
    });
    await user.tab();

    expect(document.activeElement).toBe(first);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('keeps Shift+Tab from leaving the dialog (wraps first → last)', async () => {
    const user = userEvent.setup();
    renderRetire();

    // Fill a valid amount first so blurring the tonnes field does not disable
    // the submit button and change the tab order mid-assertion.
    await user.type(screen.getByLabelText(/tonnes to retire/i), '2');

    const dialog = screen.getByRole('dialog');
    const focusable = getFocusableElements(dialog);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    await act(async () => {
      first.focus();
    });
    await user.tab({ shift: true });

    expect(document.activeElement).toBe(last);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('recaptures focus if it is moved outside the active dialog', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <RetireModal
          holding={holding}
          submitting={false}
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />
      </>
    );

    const dialog = screen.getByRole('dialog');
    screen.getByRole('button', { name: 'Outside' }).focus();

    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it('returns focus to the trigger when the dialog closes', async () => {
    const user = userEvent.setup();

    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Retire
          </button>
          {open && (
            <RetireModal
              holding={holding}
              submitting={false}
              onConfirm={vi.fn()}
              onClose={() => setOpen(false)}
            />
          )}
        </>
      );
    }

    render(<Host />);

    const trigger = screen.getByRole('button', { name: 'Retire' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('BuyForm — labels, errors, keyboard, announcements', () => {
  beforeEach(() => {
    useWallet.mockReturnValue({ isConnected: true, connect: vi.fn() });
  });

  it('names the quantity and slippage fields for assistive tech', () => {
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    expect(screen.getByLabelText(/quantity \(tonnes\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: /custom slippage/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: /preset slippage tolerances/i })
    ).toBeInTheDocument();
  });

  it('associates a quantity error with the field and announces it', async () => {
    const user = userEvent.setup();
    const onBuy = vi.fn();
    render(<BuyForm batch={mockBatch} onBuy={onBuy} submitting={false} />);

    await user.click(screen.getByRole('button', { name: 'Buy now' }));

    const input = screen.getByLabelText(/quantity/i);
    const error = screen.getByRole('alert');

    expect(error).toHaveTextContent(/enter a quantity/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('associates a slippage error with the custom slippage field', async () => {
    const user = userEvent.setup();
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting={false} />);

    await user.type(screen.getByLabelText(/quantity/i), '3');
    const slippage = screen.getByRole('spinbutton', { name: /custom slippage/i });
    await user.clear(slippage);
    fireEvent.submit(document.querySelector('.buy-form'));

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(/enter a slippage/i);
    expect(slippage).toHaveAttribute('aria-invalid', 'true');
    expect(slippage.getAttribute('aria-describedby') || '').toContain(error.id);
  });

  it('completes a purchase from the keyboard without a pointer', async () => {
    const user = userEvent.setup();
    const onBuy = vi.fn();
    render(<BuyForm batch={mockBatch} onBuy={onBuy} submitting={false} />);

    const quantity = screen.getByLabelText(/quantity/i);
    await user.type(quantity, '4');
    await user.keyboard('{Enter}');

    expect(onBuy).toHaveBeenCalledWith(4, 1);
  });

  it('announces processing status while the purchase is submitting', () => {
    render(<BuyForm batch={mockBatch} onBuy={vi.fn()} submitting />);

    expect(screen.getByText('Processing your purchase…')).toBeInTheDocument();
    expect(document.querySelector('.buy-form')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('getFocusableElements', () => {
  it('omits disabled controls and negative tabindex', () => {
    const { container } = render(
      <div>
        <button type="button">Ok</button>
        <button type="button" disabled>
          No
        </button>
        <a href="#x">Link</a>
        <span tabIndex={-1}>Skip</span>
      </div>
    );

    const found = getFocusableElements(container.firstChild);
    expect(found.map((el) => el.textContent)).toEqual(['Ok', 'Link']);
  });
});
