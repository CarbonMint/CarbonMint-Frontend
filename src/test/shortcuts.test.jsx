import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import GlobalShortcuts from '../components/GlobalShortcuts.jsx';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('GlobalShortcuts', () => {
  it('navigates to "/" when "h" is pressed', () => {
    render(
      <MemoryRouter>
        <GlobalShortcuts />
      </MemoryRouter>
    );
    // Simulate key press
    const event = new KeyboardEvent('keydown', { key: 'h' });
    document.dispatchEvent(event);
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to "/marketplace" when "m" is pressed', () => {
    render(
      <MemoryRouter>
        <GlobalShortcuts />
      </MemoryRouter>
    );
    const event = new KeyboardEvent('keydown', { key: 'm' });
    document.dispatchEvent(event);
    expect(mockedNavigate).toHaveBeenCalledWith('/marketplace');
  });
});
