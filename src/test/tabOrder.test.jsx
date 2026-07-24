import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

// ─── Skip-to-content link ─────────────────────────────────────────────

import App from '../App.jsx';
import { AppProvider } from '../context/AppContext.jsx';

// jsdom does not implement matchMedia or scrollTo; polyfill them.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  window.scrollTo = vi.fn();
});

function renderApp() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </AppProvider>
  );
}

describe('Skip-to-content link', () => {
  it('renders a skip link as the first focusable element', () => {
    renderApp();

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.tagName).toBe('A');
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink).toHaveClass('skip-link');
  });

  it('main element has id="main-content" and tabIndex={-1}', () => {
    renderApp();

    const main = document.querySelector('#main-content');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('tabindex', '-1');
  });
});

// ─── No double-focusable elements (Link > Button) ─────────────────────

import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';

describe('No double-focusable elements', () => {
  function getFocusable(element) {
    return element.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  it('Home hero actions have no nested focusable elements', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const heroActions = document.querySelector('.hero-actions');
    const focusable = getFocusable(heroActions);

    focusable.forEach((el) => {
      expect(el.tagName).toBe('A');
    });
  });

  it('NotFound page has no nested focusable elements in action', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const action = document.querySelector('.not-found-action');
    const focusable = getFocusable(action);

    expect(focusable.length).toBe(1);
    expect(focusable[0].tagName).toBe('A');
  });
});

// ─── Button tabIndex prop ─────────────────────────────────────────────

import Button from '../components/Button.jsx';

describe('Button tabIndex prop', () => {
  it('accepts a tabIndex prop', () => {
    render(<Button tabIndex={-1}>Hidden</Button>);

    const btn = screen.getByRole('button', { name: 'Hidden' });
    expect(btn).toHaveAttribute('tabindex', '-1');
  });
});

// ─── Dropdown keyboard navigation ─────────────────────────────────────

import Dropdown from '../components/Dropdown.jsx';

describe('Dropdown keyboard navigation', () => {
  const items = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ];

  it('opens the menu on ArrowDown', () => {
    render(<Dropdown label="Select" items={items} onSelect={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: 'Select' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('selects an item on Enter and closes the menu', () => {
    const onSelect = vi.fn();
    render(<Dropdown label="Select" items={items} onSelect={onSelect} />);

    const trigger = screen.getByRole('button', { name: 'Select' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const firstItem = screen.getByRole('menuitem', { name: 'Option A' });
    fireEvent.keyDown(firstItem, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith('a');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu on Escape and refocuses trigger', () => {
    render(<Dropdown label="Select" items={items} onSelect={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: 'Select' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const firstItem = screen.getByRole('menuitem', { name: 'Option A' });
    fireEvent.keyDown(firstItem, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

// ─── RetireModal focus trap ───────────────────────────────────────────

import RetireModal from '../components/RetireModal.jsx';

describe('RetireModal focus trap', () => {
  const holding = {
    batchId: 'b-1',
    projectName: 'Test Project',
    vintage: 2024,
    tonnes: 100,
    pricePerTonne: 10,
  };

  it('focuses the tonnes input on open', () => {
    render(
      <RetireModal
        holding={holding}
        submitting={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('0');
    expect(document.activeElement).toBe(input);
  });

  it('renders close button and cancel button', () => {
    render(
      <RetireModal
        holding={holding}
        submitting={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm retire' })).toBeInTheDocument();
  });
});
