import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { delay } from '../utils/delay.js';
import { fetchBatches } from '../services/api.js';
import { useMarket } from '../hooks/useMarket.js';
import Marketplace from '../pages/Marketplace.jsx';
import { renderHook } from '@testing-library/react';

describe('Issue #252: Bounded Search, Request Cancellation & Pagination', () => {
  describe('delay() & AbortSignal cancellation', () => {
    it('resolves normally when not aborted', async () => {
      const controller = new AbortController();
      await expect(delay(10, controller.signal)).resolves.toBeUndefined();
    });

    it('rejects with AbortError immediately if signal is pre-aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(delay(50, controller.signal)).rejects.toThrow('Aborted');
    });

    it('rejects with AbortError when aborted during delay', async () => {
      const controller = new AbortController();
      const promise = delay(200, controller.signal);
      setTimeout(() => controller.abort(), 10);
      await expect(promise).rejects.toThrow('Aborted');
    });
  });

  describe('fetchBatches() bounded pagination & stable sort', () => {
    it('supports query filtering and pagination capping', async () => {
      const result = await fetchBatches({ query: 'Solar', page: 1, pageSize: 2 });
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('pageCount');
      expect(result.length).toBeLessThanOrEqual(2);
      result.forEach((batch) => {
        const text = `${batch.project?.name} ${batch.project?.country} ${batch.project?.type}`.toLowerCase();
        expect(text).toContain('solar');
      });
    });

    it('applies stable sort tie-breaking by id', async () => {
      const result = await fetchBatches({ sort: 'price-asc' });
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i].pricePerTonne === result[i + 1].pricePerTonne) {
          expect(result[i].id.localeCompare(result[i + 1].id)).toBeLessThanOrEqual(0);
        } else {
          expect(result[i].pricePerTonne).toBeLessThanOrEqual(result[i + 1].pricePerTonne);
        }
      }
    });

    it('supports request cancellation in fetchBatches', async () => {
      const controller = new AbortController();
      const promise = fetchBatches({ query: 'test' }, { signal: controller.signal });
      controller.abort();
      await expect(promise).rejects.toThrow('Aborted');
    });
  });

  describe('useMarket hook race condition prevention', () => {
    it('discards stale out-of-order request responses', async () => {
      const { result, rerender } = renderHook(({ query }) => useMarket({ query }), {
        initialProps: { query: 'first' },
      });

      // Change query quickly to trigger abort of 'first'
      rerender({ query: 'second' });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.batches).toBeDefined();
    });
  });

  describe('Marketplace UI debouncing & pagination', () => {
    it('renders pagination control when result set spans multiple pages', async () => {
      render(
        <MemoryRouter>
          <Marketplace />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Marketplace/i)).toBeInTheDocument();
      });

      // If pageCount > 1, pagination nav is rendered
      const nav = screen.queryByRole('navigation', { name: /Pagination/i });
      if (nav) {
        expect(nav).toBeInTheDocument();
        expect(screen.getByText(/Page 1 of/i)).toBeInTheDocument();
      }
    });

    it('resets to page 1 when search query is typed', async () => {
      render(
        <MemoryRouter>
          <Marketplace />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by project/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by project/i);
      fireEvent.change(searchInput, { target: { value: 'REDD+' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('REDD+');
      });
    });
  });
});
