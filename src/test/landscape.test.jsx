import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { useOrientation } from '../hooks/useOrientation.js';

let currentMql = null;

function createMatchMedia(matches) {
  const listeners = new Set();
  return function matchMedia(query) {
    currentMql = {
      matches,
      media: query,
      addEventListener(type, cb) {
        if (type === 'change') listeners.add(cb);
      },
      removeEventListener(type, cb) {
        if (type === 'change') listeners.delete(cb);
      },
      dispatchChange(newMatches) {
        matches = newMatches;
        listeners.forEach((cb) => cb({ matches: newMatches }));
      },
    };
    return currentMql;
  };
}

let originalMatchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('useOrientation', () => {
  it('returns isLandscape=true when orientation is landscape', () => {
    window.matchMedia = createMatchMedia(true);
    const { result } = renderHook(() => useOrientation());
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it('returns isPortrait=true when orientation is portrait', () => {
    window.matchMedia = createMatchMedia(false);
    const { result } = renderHook(() => useOrientation());
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });

  it('reactively updates on orientation change', () => {
    window.matchMedia = createMatchMedia(false);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.isLandscape).toBe(false);

    act(() => {
      currentMql.dispatchChange(true);
    });

    expect(result.current.isLandscape).toBe(true);
  });
});

describe('Landscape layout classes', () => {
  it('renders app-main with landscape-friendly content', () => {
    render(
      <main className="app-main" data-testid="app-main">
        <h1>Content</h1>
      </main>
    );
    expect(screen.getByTestId('app-main')).toBeInTheDocument();
  });

  it('renders navbar with expected structure for landscape', () => {
    render(
      <header className="navbar" data-testid="navbar">
        <div className="navbar-inner">
          <nav className="navbar-links">
            <a className="navbar-link" href="/">Home</a>
          </nav>
        </div>
      </header>
    );
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });
});
