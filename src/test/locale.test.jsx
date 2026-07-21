import assert from 'node:assert';
import { afterEach, beforeEach, test } from 'node:test';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AppProvider } from '../context/AppContext.jsx';
import { useLocale } from '../hooks/useLocale.js';

// Mock localStorage
let store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => {
    store[key] = value.toString();
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};

beforeEach(() => {
  global.localStorage = localStorageMock;
  store = {};
});

afterEach(() => {
  store = {};
});

test('AppProvider provides default locale of en-US', () => {
  function TestComponent() {
    const { locale } = useLocale();
    return <div data-testid="locale">{locale}</div>;
  }

  render(
    <AppProvider>
      <TestComponent />
    </AppProvider>
  );

  assert.strictEqual(screen.getByTestId('locale').textContent, 'en-US');
});

test('AppProvider loads persisted locale from localStorage', () => {
  store['carbonmint:locale'] = 'de-DE';

  function TestComponent() {
    const { locale } = useLocale();
    return <div data-testid="locale">{locale}</div>;
  }

  render(
    <AppProvider>
      <TestComponent />
    </AppProvider>
  );

  assert.strictEqual(screen.getByTestId('locale').textContent, 'de-DE');
});

test('setLocale updates the locale and persists to localStorage', async () => {
  const user = userEvent.setup();

  function TestComponent() {
    const { locale, setLocale } = useLocale();
    return (
      <div>
        <div data-testid="locale">{locale}</div>
        <button onClick={() => setLocale('fr-FR')}>Change Locale</button>
      </div>
    );
  }

  render(
    <AppProvider>
      <TestComponent />
    </AppProvider>
  );

  assert.strictEqual(screen.getByTestId('locale').textContent, 'en-US');

  await user.click(screen.getByRole('button', { name: 'Change Locale' }));

  await waitFor(() => {
    assert.strictEqual(screen.getByTestId('locale').textContent, 'fr-FR');
  });

  assert.strictEqual(store['carbonmint:locale'], 'fr-FR');
});

test('useLocale throws error when used outside AppProvider', () => {
  function TestComponent() {
    const { locale } = useLocale();
    return <div>{locale}</div>;
  }

  assert.throws(
    () => render(<TestComponent />),
    /useLocale must be used within an AppProvider/
  );
});

test('AppProvider handles localStorage errors gracefully', () => {
  // Simulate localStorage throwing error
  global.localStorage = {
    getItem: () => {
      throw new Error('Storage unavailable');
    },
    setItem: () => {
      throw new Error('Storage unavailable');
    },
  };

  function TestComponent() {
    const { locale, setLocale } = useLocale();
    return (
      <div>
        <div data-testid="locale">{locale}</div>
        <button onClick={() => setLocale('es-ES')}>Change Locale</button>
      </div>
    );
  }

  // Should not throw, should fall back to 'en-US'
  render(
    <AppProvider>
      <TestComponent />
    </AppProvider>
  );

  assert.strictEqual(screen.getByTestId('locale').textContent, 'en-US');

  // setLocale should not throw even if localStorage fails
  assert.doesNotThrow(async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change Locale' }));
  });
});
