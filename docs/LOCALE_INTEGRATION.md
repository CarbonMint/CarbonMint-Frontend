# Locale Integration Guide

This guide explains how to integrate locale-aware formatting into new or existing components.

## Quick Start

### Using the useFormat Hook (Recommended)

The `useFormat` hook provides formatting functions that automatically use the user's locale preference:

```jsx
import { useFormat } from '../hooks/useFormat.js';

function PriceDisplay({ price }) {
  const { formatCurrency } = useFormat();
  
  return <div className="price">{formatCurrency(price)}</div>;
}
```

### Available Functions

All formatting functions from `src/utils/format.js` are available through `useFormat`:

```jsx
const {
  formatCurrency,        // Format USDC amounts
  formatTonnes,          // Format tonnage values
  formatTonnesCompact,   // Format tonnage compactly (12.5K)
  formatPricePerTonne,   // Format per-tonne prices
  formatDate,            // Format ISO date strings
  getMonthLabel,         // Get month+year label
  getWeekLabel,          // Get week label
  formatRelativeTime,    // Format relative time ("5 minutes ago")
  // Non-locale-dependent functions
  roundTo,
  shortenAddress,
  availabilityPercent,
  formatPercent,
  getWeekStart,
} = useFormat();
```

## Direct Usage

If you need to pass the locale explicitly or can't use hooks:

```jsx
import { formatCurrency } from '../utils/format.js';
import { useLocale } from '../hooks/useLocale.js';

function PriceDisplay({ price }) {
  const { locale } = useLocale();
  
  return <div className="price">{formatCurrency(price, locale)}</div>;
}
```

## Updating Existing Components

### Before

```jsx
import { formatCurrency, formatTonnes } from '../utils/format.js';

function BatchCard({ batch }) {
  return (
    <div>
      <span>{formatCurrency(batch.pricePerTonne)}</span>
      <span>{formatTonnes(batch.availableTonnes)}</span>
    </div>
  );
}
```

### After

```jsx
import { useFormat } from '../hooks/useFormat.js';

function BatchCard({ batch }) {
  const { formatCurrency, formatTonnes } = useFormat();
  
  return (
    <div>
      <span>{formatCurrency(batch.pricePerTonne)}</span>
      <span>{formatTonnes(batch.availableTonnes)}</span>
    </div>
  );
}
```

## Changing Locale Preference

Users can change their locale preference through the Settings page, but you can also provide programmatic access:

```jsx
import { useLocale } from '../hooks/useLocale.js';

function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  
  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="en-US">English (US)</option>
      <option value="de-DE">German</option>
      <option value="fr-FR">French</option>
    </select>
  );
}
```

## Supported Locales

| Locale | Language/Region | Number Format |
|--------|----------------|---------------|
| en-US  | English (US)   | 1,234.56      |
| en-GB  | English (UK)   | 1,234.56      |
| de-DE  | German         | 1.234,56      |
| fr-FR  | French         | 1 234,56      |
| es-ES  | Spanish        | 1.234,56      |
| pt-BR  | Portuguese (BR)| 1.234,56      |
| ja-JP  | Japanese       | 1,234.56      |

## Testing

When writing tests for components that use locale-aware formatting:

```jsx
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context/AppContext.jsx';

test('displays price with correct locale', () => {
  // Mock localStorage
  localStorage.setItem('carbonmint:locale', 'de-DE');
  
  render(
    <AppProvider>
      <MyComponent />
    </AppProvider>
  );
  
  // German format uses comma for decimal
  expect(screen.getByText(/1\.234,56 USDC/)).toBeInTheDocument();
});
```

## Architecture

```
┌─────────────────────────────────────┐
│         AppContext                  │
│  - locale state (localStorage)      │
│  - setLocale function                │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    ┌────▼───┐  ┌───▼────┐
    │useLocale│  │useFormat│
    └─────┬──┘  └───┬────┘
          │         │
          └────┬────┘
               │
       ┌───────▼───────────┐
       │  Components       │
       │  - BatchCard      │
       │  - BuyForm        │
       │  - MyCredits      │
       │  - Settings       │
       └───────────────────┘
```

## Best Practices

1. **Use `useFormat` in components**: It's simpler and automatically subscribes to locale changes
2. **Use direct imports in utilities**: If you're writing utility functions that don't have access to hooks
3. **Provide locale parameter default**: All formatting functions default to `'en-US'` for backwards compatibility
4. **Test with multiple locales**: Verify your component works with different number formats
5. **Don't hardcode separators**: Let `toLocaleString` handle formatting based on locale

## Common Pitfalls

### ❌ Don't hardcode formatting

```jsx
// Bad - hardcoded format
const formatted = `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
```

### ✅ Use locale-aware functions

```jsx
// Good - respects user preference
const { formatCurrency } = useFormat();
const formatted = formatCurrency(price);
```

### ❌ Don't call hooks conditionally

```jsx
// Bad - breaks React rules
function MyComponent({ showPrice }) {
  if (showPrice) {
    const { formatCurrency } = useFormat(); // Error!
  }
}
```

### ✅ Call hooks at top level

```jsx
// Good - hooks at top level
function MyComponent({ showPrice }) {
  const { formatCurrency } = useFormat();
  
  if (!showPrice) return null;
  return <div>{formatCurrency(price)}</div>;
}
```

## Migration Checklist

When adding locale support to existing components:

- [ ] Replace direct imports of format functions with `useFormat` hook
- [ ] Verify component re-renders when locale changes
- [ ] Update tests to wrap components in `AppProvider`
- [ ] Test with at least 2-3 different locales
- [ ] Check that all numbers/currencies use formatting functions
- [ ] Update component documentation if needed
