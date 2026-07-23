import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext.jsx';
import { LocaleSelector } from '../components/LocaleSelector.jsx';
import Settings from '../pages/Settings.jsx';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('prefers-contrast CSS', () => {
  it('defines the prefers-contrast: more media query', () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, '../index.css'),
      'utf-8',
    );
    expect(css).toContain('@media (prefers-contrast: more)');
  });

  it('defines the prefers-contrast: less media query', () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, '../index.css'),
      'utf-8',
    );
    expect(css).toContain('@media (prefers-contrast: less)');
  });

  it('overrides color-text to white in high-contrast mode', () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, '../index.css'),
      'utf-8',
    );
    const match = css.match(
      /@media\s*\(prefers-contrast:\s*more\)\s*\{[^}]*--color-text:\s*(#[0-9a-fA-F]+)/,
    );
    expect(match).not.toBeNull();
    expect(match[1]).toBe('#ffffff');
  });

  it('sets lighter background in low-contrast mode', () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, '../index.css'),
      'utf-8',
    );
    const match = css.match(
      /@media\s*\(prefers-contrast:\s*less\)\s*\{[^}]*--color-bg:\s*(#[0-9a-fA-F]+)/,
    );
    expect(match).not.toBeNull();
    expect(match[1]).toBe('#1a2622');
  });
});

describe('Settings page renders with contrast-aware CSS', () => {
  it('renders the settings page heading', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Settings />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Settings' }),
    ).toBeInTheDocument();
  });
});

describe('LocaleSelector renders with contrast-aware CSS', () => {
  it('renders the locale dropdown', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <LocaleSelector />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('combobox', { name: /locale|currency|format/i }),
    ).toBeInTheDocument();
  });
});
