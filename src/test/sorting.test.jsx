/**
 * Sorting controls tests: clickable column headers, sort dropdowns,
 * aria-sort attributes, and correct sort ordering.
 *
 * Coverage:
 *   - Marketplace list view — column header click toggles sort
 *   - Marketplace list view — dropdown syncs with header state
 *   - MyCredits — column header click toggles sort
 *   - MyCredits — dropdown syncs with header state
 *   - Accessibility — aria-sort on columnheader elements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock useMarket ──────────────────────────────────────────────────────────
vi.mock('../hooks/useMarket.js', () => ({
  useMarket: vi.fn(),
}));

import { useMarket } from '../hooks/useMarket.js';

const mockBatches = [
  {
    id: 'batch-1',
    project: { name: 'Amazon REDD+', country: 'Brazil', type: 'REDD+' },
    vintage: 2022,
    pricePerTonne: 14.5,
    availableTonnes: 3200,
  },
  {
    id: 'batch-2',
    project: { name: 'Kenya Cookstoves', country: 'Kenya', type: 'Cookstoves' },
    vintage: 2023,
    pricePerTonne: 9.75,
    availableTonnes: 1850,
  },
  {
    id: 'batch-3',
    project: { name: 'India Solar', country: 'India', type: 'Solar' },
    vintage: 2023,
    pricePerTonne: 7.2,
    availableTonnes: 6100,
  },
  {
    id: 'batch-4',
    project: { name: 'Iceland DAC', country: 'Iceland', type: 'DAC' },
    vintage: 2024,
    pricePerTonne: 185.0,
    availableTonnes: 275,
  },
];

// ─── Mock useInterval & useDebounce ──────────────────────────────────────────
vi.mock('../hooks/useInterval.js', () => ({
  useInterval: vi.fn(),
}));

vi.mock('../hooks/useDebounce.js', () => ({
  useDebounce: (v) => v,
}));

// ─── Marketplace list view sorting ──────────────────────────────────────────

import Marketplace from '../pages/Marketplace.jsx';

describe('Marketplace list view sorting', () => {
  beforeEach(() => {
    useMarket.mockReturnValue({
      batches: mockBatches,
      loading: false,
      error: null,
      lastUpdated: new Date(),
      reload: vi.fn(),
    });
  });

  function renderMarketplace() {
    return render(
      <MemoryRouter>
        <Marketplace />
      </MemoryRouter>
    );
  }

  it('renders the sort dropdown in list view', () => {
    renderMarketplace();
    fireEvent.click(screen.getByRole('button', { name: 'List' }));

    expect(screen.getByLabelText('Sort batches')).toBeInTheDocument();
  });

  it('sorts by price ascending when dropdown is set to Price: Low to High', () => {
    renderMarketplace();
    fireEvent.click(screen.getByRole('button', { name: 'List' }));

    fireEvent.change(screen.getByLabelText('Sort batches'), { target: { value: 'price-asc' } });

    const rows = document.querySelectorAll('.listing-row');
    expect(rows[0]).toHaveTextContent('India Solar');
    expect(rows[3]).toHaveTextContent('Iceland DAC');
  });

  it('sorts by price descending when dropdown is set to Price: High to Low', () => {
    renderMarketplace();
    fireEvent.click(screen.getByRole('button', { name: 'List' }));

    fireEvent.change(screen.getByLabelText('Sort batches'), { target: { value: 'price-desc' } });

    const rows = document.querySelectorAll('.listing-row');
    expect(rows[0]).toHaveTextContent('Iceland DAC');
    expect(rows[3]).toHaveTextContent('India Solar');
  });

  it('sorts by most available when dropdown is set to Most available', () => {
    renderMarketplace();
    fireEvent.click(screen.getByRole('button', { name: 'List' }));

    fireEvent.change(screen.getByLabelText('Sort batches'), { target: { value: 'available-desc' } });

    const rows = document.querySelectorAll('.listing-row');
    expect(rows[0]).toHaveTextContent('India Solar');
    expect(rows[3]).toHaveTextContent('Iceland DAC');
  });

  it('resets to default sort order', () => {
    renderMarketplace();
    fireEvent.click(screen.getByRole('button', { name: 'List' }));

    fireEvent.change(screen.getByLabelText('Sort batches'), { target: { value: 'price-asc' } });
    fireEvent.change(screen.getByLabelText('Sort batches'), { target: { value: 'default' } });

    const rows = document.querySelectorAll('.listing-row');
    expect(rows[0]).toHaveTextContent('Amazon REDD+');
  });
});

// ─── MyCredits holdings table sorting ────────────────────────────────────────

import MyCredits from '../pages/MyCredits.jsx';

// Mock useWallet and useHoldings
vi.mock('../hooks/useWallet.js', () => ({
  useWallet: vi.fn(),
}));

vi.mock('../hooks/useHoldings.js', () => ({
  useHoldings: vi.fn(),
}));

import { useWallet } from '../hooks/useWallet.js';
import { useHoldings } from '../hooks/useHoldings.js';

const mockHoldings = [
  {
    batchId: 'h-1',
    projectName: 'Amazon REDD+',
    vintage: 2022,
    pricePerTonne: 14.5,
    tonnes: 50,
  },
  {
    batchId: 'h-2',
    projectName: 'Kenya Cookstoves',
    vintage: 2023,
    pricePerTonne: 9.75,
    tonnes: 200,
  },
  {
    batchId: 'h-3',
    projectName: 'India Solar',
    vintage: 2023,
    pricePerTonne: 7.2,
    tonnes: 75,
  },
  {
    batchId: 'h-4',
    projectName: 'Iceland DAC',
    vintage: 2024,
    pricePerTonne: 185.0,
    tonnes: 10,
  },
];

describe('MyCredits holdings table sorting', () => {
  beforeEach(() => {
    useWallet.mockReturnValue({
      wallet: { publicKey: 'GABCDEF1234567890' },
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    useHoldings.mockReturnValue({
      holdings: mockHoldings,
      totals: { owned: 335, retired: 0 },
      retireHolding: vi.fn(),
    });
  });

  function renderMyCredits() {
    return render(
      <MemoryRouter>
        <MyCredits />
      </MemoryRouter>
    );
  }

  it('renders clickable column headers in the holdings table', () => {
    renderMyCredits();

    expect(screen.getByRole('columnheader', { name: /Project/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Vintage/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Price/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Held/ })).toBeInTheDocument();
  });

  it('sets aria-sort=none on all headers when no sort is active', () => {
    renderMyCredits();

    const headers = screen.getAllByRole('columnheader');
    headers.forEach((h) => {
      expect(h).toHaveAttribute('aria-sort', 'none');
    });
  });

  it('sets aria-sort=ascending after clicking the Held header once', () => {
    renderMyCredits();

    const heldHeader = screen.getByRole('columnheader', { name: /Held/ });
    fireEvent.click(heldHeader);

    expect(heldHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('sets aria-sort=descending after clicking the Held header twice', () => {
    renderMyCredits();

    const heldHeader = screen.getByRole('columnheader', { name: /Held/ });
    fireEvent.click(heldHeader);
    fireEvent.click(heldHeader);

    expect(heldHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('returns to aria-sort=none after clicking a header three times', () => {
    renderMyCredits();

    const heldHeader = screen.getByRole('columnheader', { name: /Held/ });
    fireEvent.click(heldHeader);
    fireEvent.click(heldHeader);
    fireEvent.click(heldHeader);

    expect(heldHeader).toHaveAttribute('aria-sort', 'none');
  });

  it('sorts holdings by tonnes descending when Held header is clicked twice', () => {
    renderMyCredits();

    // Click Held header twice for descending sort
    const heldHeader = screen.getByRole('columnheader', { name: /Held/ });
    fireEvent.click(heldHeader);
    fireEvent.click(heldHeader);

    const rows = document.querySelectorAll('.holding-row');
    // Kenya Cookstoves has 200 tonnes (most)
    expect(rows[0]).toHaveTextContent('Kenya Cookstoves');
    // Iceland DAC has 10 tonnes (least)
    expect(rows[3]).toHaveTextContent('Iceland DAC');
  });

  it('dropdown selection updates aria-sort on the corresponding header', () => {
    renderMyCredits();

    const dropdown = screen.getByLabelText('Sort holdings');
    fireEvent.change(dropdown, { target: { value: 'price-asc' } });

    const priceHeader = screen.getByRole('columnheader', { name: /Price/ });
    expect(priceHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('toggling sort on one column clears sort on another', () => {
    renderMyCredits();

    // Click Project header
    fireEvent.click(screen.getByRole('columnheader', { name: /Project/ }));
    expect(screen.getByRole('columnheader', { name: /Project/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    // Click Price header — Project should reset
    fireEvent.click(screen.getByRole('columnheader', { name: /Price/ }));
    expect(screen.getByRole('columnheader', { name: /Project/ })).toHaveAttribute(
      'aria-sort',
      'none'
    );
    expect(screen.getByRole('columnheader', { name: /Price/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
  });
});
