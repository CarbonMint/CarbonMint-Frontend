# Locale Feature Architecture

## Overview

The locale preference feature enables users to customize how currency, numbers, and dates are formatted throughout the CarbonMint application. This document provides a technical overview of the architecture, data flow, and implementation decisions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Storage Layer                    │
│  localStorage['carbonmint:locale'] = 'en-US' | 'de-DE' | ... │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ getStoredLocale()
                         ↓ storeLocale(locale)
┌─────────────────────────────────────────────────────────────┐
│                     AppContext (State)                       │
│  - locale: string (default: 'en-US')                        │
│  - setLocale: (locale: string) => void                      │
│                                                              │
│  Responsibilities:                                           │
│  • Initialize locale from localStorage                       │
│  • Provide locale state to all components                   │
│  • Persist locale changes to localStorage                   │
│  • Handle localStorage errors gracefully                    │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             │                           │
         ┌───▼───────┐           ┌───────▼────────┐
         │ useLocale │           │   useFormat    │
         │   Hook    │           │     Hook       │
         └───┬───────┘           └───────┬────────┘
             │                           │
             │ Returns:                  │ Returns:
             │ { locale,                 │ { formatCurrency,
             │   setLocale }             │   formatTonnes,
             │                           │   formatDate, ... }
             │                           │
             │                           │ (all pre-bound to locale)
             │                           │
         ┌───▼───────────────────────────▼────────┐
         │         React Components                │
         │  • Settings (LocaleSelector)            │
         │  • BatchCard                            │
         │  • BuyForm                              │
         │  • MyCredits                            │
         │  • CertificateCard                      │
         │  • Marketplace                          │
         └─────────────────────────────────────────┘
```

## Core Components

### 1. AppContext (`src/context/AppContext.jsx`)

**Purpose:** Central state management for application-wide settings including locale preference.

**State:**
```javascript
{
  locale: string,        // BCP 47 language tag (e.g., 'en-US')
  setLocale: function,   // Updates locale and persists to localStorage
  // ... other context values (wallet, holdings, etc.)
}
```

**Key Functions:**

- `getStoredLocale()`: Retrieves locale from localStorage with error handling
- `storeLocale(locale)`: Persists locale to localStorage with error handling
- `setLocale(newLocale)`: Updates state and calls storeLocale

**Error Handling:**
```javascript
// Gracefully handles localStorage unavailable (private browsing, quota exceeded)
try {
  const stored = localStorage.getItem('carbonmint:locale');
  return stored || 'en-US';
} catch (error) {
  console.warn('Could not access localStorage:', error);
  return 'en-US';
}
```

### 2. useLocale Hook (`src/hooks/useLocale.js`)

**Purpose:** Provides access to locale state and setter function.

**API:**
```javascript
const { locale, setLocale } = useLocale();
```

**Usage:**
```javascript
import { useLocale } from '../hooks/useLocale.js';

function MyComponent() {
  const { locale, setLocale } = useLocale();
  
  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="en-US">English (US)</option>
      <option value="de-DE">German</option>
    </select>
  );
}
```

**Error Handling:**
```javascript
// Throws error if used outside AppProvider
if (!context) {
  throw new Error('useLocale must be used within an AppProvider');
}
```

### 3. useFormat Hook (`src/hooks/useFormat.js`)

**Purpose:** Provides formatting functions pre-bound to user's locale preference.

**API:**
```javascript
const {
  formatCurrency,
  formatTonnes,
  formatTonnesCompact,
  formatPricePerTonne,
  formatDate,
  getMonthLabel,
  getWeekLabel,
  formatRelativeTime,
  // Non-locale-dependent utilities
  roundTo,
  shortenAddress,
  availabilityPercent,
  formatPercent,
  getWeekStart,
} = useFormat();
```

**Implementation:**
```javascript
export function useFormat() {
  const { locale } = useLocale();

  // Memoize formatters to prevent unnecessary re-renders
  const formatCurrency = useCallback(
    (value) => formatCurrencyFn(value, locale),
    [locale]
  );

  return {
    formatCurrency,
    // ... other formatters
  };
}
```

**Benefits:**
- Automatic locale updates when user changes preference
- Memoization for performance
- Cleaner component code (no need to pass locale explicitly)
- Recommended approach for most components

### 4. Format Utilities (`src/utils/format.js`)

**Purpose:** Core formatting functions using native JavaScript Intl APIs.

**All locale-aware functions signature:**
```javascript
function formatCurrency(value, locale = 'en-US'): string
function formatTonnes(value, locale = 'en-US'): string
function formatTonnesCompact(value, locale = 'en-US'): string
function formatPricePerTonne(value, locale = 'en-US'): string
function formatDate(iso, locale = 'en-US'): string
function getMonthLabel(iso, locale = 'en-US'): string
function getWeekLabel(iso, locale = 'en-US'): string
function formatRelativeTime(value, now, locale = 'en-US'): string
```

**Example Implementation:**
```javascript
export function formatCurrency(value, locale = 'en-US') {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.00 USDC';

  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted} USDC`;
}
```

**Design Decisions:**
- Default parameter ensures backward compatibility
- Native `toLocaleString` leverages browser's locale data
- Consistent error handling (invalid input → '0.00 USDC')
- Always append currency suffix (USDC) or unit (tCO2e)

### 5. LocaleSelector Component (`src/components/LocaleSelector.jsx`)

**Purpose:** UI for selecting locale preference.

**Features:**
- Dropdown with descriptive labels
- Help text explaining the setting
- Accessible (ARIA labels, keyboard navigation)
- Updates immediately on change

**Supported Locales:**
```javascript
const LOCALES = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'de-DE', label: 'Deutsch (Deutschland)' },
  { value: 'fr-FR', label: 'Français (France)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'ja-JP', label: '日本語 (日本)' },
];
```

### 6. Settings Page (`src/pages/Settings.jsx`)

**Purpose:** User-facing interface for managing preferences.

**Sections:**
1. **Regional Preferences** - Contains LocaleSelector
2. **Live Preview** - Shows example values in current locale
3. **About Locale Settings** - Explains what the setting does

**Live Preview:**
```javascript
const examplePrice = 1234.56;
const exampleLarge = 1234567.89;

<dl className="settings-preview-list">
  <dt>Small amount:</dt>
  <dd>{formatCurrency(examplePrice, locale)}</dd>
  
  <dt>Large amount:</dt>
  <dd>{formatCurrency(exampleLarge, locale)}</dd>
  
  <dt>Current locale:</dt>
  <dd><code>{locale}</code></dd>
</dl>
```

## Data Flow

### Initialization (App Load)

```
1. AppContext initializes
   ↓
2. getStoredLocale() reads from localStorage
   ↓
3. If found: use stored locale
   If not found: use default 'en-US'
   ↓
4. Set initial state: { locale: '...' }
   ↓
5. Components using useFormat receive formatters
```

### User Changes Locale

```
1. User selects locale in Settings
   ↓
2. LocaleSelector calls setLocale(newLocale)
   ↓
3. AppContext updates state
   ↓
4. storeLocale(newLocale) persists to localStorage
   ↓
5. Context state update triggers re-render
   ↓
6. Components using useFormat get new formatters
   ↓
7. All displayed prices/numbers update
```

### Component Renders Price

```
Option A (Recommended - useFormat):
1. Component calls useFormat()
   ↓
2. Hook reads locale from context
   ↓
3. Returns formatCurrency pre-bound to locale
   ↓
4. Component calls formatCurrency(value)
   ↓
5. Returns formatted string

Option B (Direct):
1. Component calls useLocale()
   ↓
2. Hook returns current locale
   ↓
3. Component imports formatCurrency from utils
   ↓
4. Component calls formatCurrency(value, locale)
   ↓
5. Returns formatted string
```

## Implementation Patterns

### Pattern 1: useFormat (Recommended)

**When to use:** Most components displaying prices/numbers

```javascript
import { useFormat } from '../hooks/useFormat.js';

function BatchCard({ batch }) {
  const { formatCurrency, formatTonnes } = useFormat();
  
  return (
    <div className="batch-card">
      <div className="price">{formatCurrency(batch.pricePerTonne)}</div>
      <div className="available">{formatTonnes(batch.availableTonnes)}</div>
    </div>
  );
}
```

**Benefits:**
- Automatic updates on locale change
- Cleaner code (no locale parameter)
- Memoized for performance
- Type-safe (all formatters always available)

### Pattern 2: Direct with useLocale

**When to use:** Need explicit control over locale or using outside component

```javascript
import { formatCurrency } from '../utils/format.js';
import { useLocale } from '../hooks/useLocale.js';

function PriceDisplay({ price }) {
  const { locale } = useLocale();
  
  // Can conditionally use different locale
  const displayLocale = someCondition ? 'en-US' : locale;
  
  return <span>{formatCurrency(price, displayLocale)}</span>;
}
```

### Pattern 3: Direct Import (Utilities)

**When to use:** Non-component code (utilities, services, tests)

```javascript
import { formatCurrency } from '../utils/format.js';

// In a utility function
export function calculateTotal(items, locale) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return formatCurrency(total, locale);
}

// In tests
test('formats price correctly', () => {
  expect(formatCurrency(1234.56, 'de-DE')).toBe('1.234,56 USDC');
});
```

## Locale Support

### Supported Locales

| Code | Region | Thousands | Decimal | Example |
|------|--------|-----------|---------|---------|
| en-US | United States | , | . | 1,234.56 |
| en-GB | United Kingdom | , | . | 1,234.56 |
| de-DE | Germany | . | , | 1.234,56 |
| fr-FR | France | ␣ | , | 1 234,56 |
| es-ES | Spain | . | , | 1.234,56 |
| pt-BR | Brazil | . | , | 1.234,56 |
| ja-JP | Japan | , | . | 1,234.56 |

### Adding New Locales

1. **Add to LocaleSelector:**
```javascript
const LOCALES = [
  // ... existing
  { value: 'it-IT', label: 'Italiano (Italia)' },
];
```

2. **Test formatting:**
```javascript
test('formatCurrency formats with it-IT locale', () => {
  assert.strictEqual(formatCurrency(1234.56, 'it-IT'), '1.234,56 USDC');
});
```

3. **Update documentation:**
- Add to README.md supported locales table
- Add to LOCALE_EXAMPLES.md
- Update LOCALE_QUICK_REFERENCE.md

## Testing Strategy

### Unit Tests

**formatCurrency.test.js** - Currency formatting
- Default locale (en-US)
- Explicit locales (de-DE, fr-FR, etc.)
- Edge cases (zero, negative, large numbers)
- Decimal precision
- Invalid input handling

**formatTonnes.test.js** - Tonnage formatting
- Standard format
- Compact format
- Multiple locales
- Edge cases

**locale.test.jsx** - Context and hooks
- Default locale behavior
- localStorage persistence
- setLocale updates state
- Error handling (no provider, storage unavailable)

### Integration Tests

Components should be tested with AppProvider:

```javascript
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context/AppContext.jsx';

test('displays formatted price', () => {
  localStorage.setItem('carbonmint:locale', 'de-DE');
  
  render(
    <AppProvider>
      <MyComponent price={1234.56} />
    </AppProvider>
  );
  
  expect(screen.getByText(/1\.234,56 USDC/)).toBeInTheDocument();
});
```

## Performance Considerations

### Memoization

useFormat hook memoizes formatters with useCallback:

```javascript
const formatCurrency = useCallback(
  (value) => formatCurrencyFn(value, locale),
  [locale]  // Only recreate when locale changes
);
```

### Context Updates

AppContext only triggers re-renders when locale actually changes:
- Initial load: reads from localStorage once
- User changes: single state update
- Components: only re-render if they consume locale

### Native APIs

`toLocaleString` is optimized by browsers:
- Locale data compiled into browser
- Formatting engine is native code
- No external library dependencies

## Error Handling

### localStorage Unavailable

```javascript
function getStoredLocale() {
  try {
    return localStorage.getItem('carbonmint:locale') || 'en-US';
  } catch (error) {
    console.warn('Could not access localStorage:', error);
    return 'en-US';
  }
}
```

**Scenarios:**
- Private browsing mode
- Storage quota exceeded
- Browser extension blocking

**Behavior:**
- Falls back to en-US
- Logs warning to console
- Application continues working
- Changes not persisted (session only)

### Invalid Locale

```javascript
function formatCurrency(value, locale = 'en-US') {
  // toLocaleString handles invalid locales gracefully
  // Falls back to default browser locale
  const formatted = num.toLocaleString(locale, options);
  return `${formatted} USDC`;
}
```

### Hook Used Outside Provider

```javascript
export function useLocale() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useLocale must be used within an AppProvider');
  }
  return { locale: context.locale, setLocale: context.setLocale };
}
```

## Browser Compatibility

### Intl API Support

Required APIs:
- `Number.prototype.toLocaleString()` - Chrome 24+, Firefox 29+, Safari 10+
- `Date.prototype.toLocaleString()` - Chrome 24+, Firefox 29+, Safari 10+
- `Intl.NumberFormat` - Chrome 24+, Firefox 29+, Safari 10+

All modern browsers fully support these APIs.

### localStorage Support

- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)

Universal support in modern browsers.

## Future Enhancements

### Potential Improvements

1. **Full Internationalization (i18n)**
   - Translate UI text (currently English-only)
   - Use library like react-i18n or formatjs
   - Separate language from number formatting

2. **Currency Conversion**
   - Support multiple display currencies
   - Fetch real-time exchange rates
   - User selects display currency (USD, EUR, etc.)

3. **Advanced Date Formatting**
   - 12/24 hour preference
   - Date order preference (MM/DD vs DD/MM)
   - Localized relative time units

4. **Auto-detection**
   - Use `navigator.language` on first visit
   - Fallback to en-US if not supported
   - Allow override in Settings

5. **Timezone Support**
   - Display times in user's timezone
   - Show timezone in Settings
   - Convert UTC times automatically

## Migration Guide

### Updating Existing Components

**Before:**
```javascript
import { formatCurrency } from '../utils/format.js';

function MyComponent({ price }) {
  return <span>{formatCurrency(price)}</span>;
}
```

**After:**
```javascript
import { useFormat } from '../hooks/useFormat.js';

function MyComponent({ price }) {
  const { formatCurrency } = useFormat();
  return <span>{formatCurrency(price)}</span>;
}
```

**Steps:**
1. Replace direct import with useFormat hook
2. Destructure needed formatters
3. Remove locale parameter if present
4. Test with multiple locales
5. Update tests to wrap in AppProvider

## Security Considerations

### localStorage Safety

- Store only non-sensitive preference data
- Validate locale values before use
- Handle storage errors gracefully
- Don't store PII or credentials

### XSS Prevention

- No user input in locale value (predefined list)
- React escapes formatted strings automatically
- No `dangerouslySetInnerHTML` used

## Accessibility

### Keyboard Navigation

- LocaleSelector fully keyboard accessible
- Tab navigation through options
- Enter/Space to select
- Escape to close dropdown

### Screen Readers

- Proper ARIA labels on form elements
- Live region announces preview updates
- Semantic HTML (labels, descriptions)

### Visual

- High contrast maintained
- Focus indicators visible
- Text remains readable at any size

## Conclusion

The locale preference architecture provides:
- ✅ User-friendly interface for changing locale
- ✅ Persistent preferences across sessions
- ✅ Automatic updates throughout application
- ✅ Flexible integration patterns
- ✅ Comprehensive error handling
- ✅ Excellent performance
- ✅ Full test coverage

The implementation follows React best practices, maintains backward compatibility, and provides a solid foundation for future internationalization features.
