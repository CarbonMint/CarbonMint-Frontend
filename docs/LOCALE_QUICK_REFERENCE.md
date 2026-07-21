# Locale Feature - Quick Reference Card

## For Users

### How to Change Currency Format

1. Click **Settings** in the navigation bar
2. Select your preferred format from the dropdown
3. View the live preview to confirm
4. Your choice is automatically saved

### Available Formats

- 🇺🇸 **English (US)**: 1,234.56 USDC
- 🇬🇧 **English (UK)**: 1,234.56 USDC
- 🇩🇪 **German**: 1.234,56 USDC
- 🇫🇷 **French**: 1 234,56 USDC
- 🇪🇸 **Spanish**: 1.234,56 USDC
- 🇧🇷 **Portuguese**: 1.234,56 USDC
- 🇯🇵 **Japanese**: 1,234.56 USDC

---

## For Developers

### Quick Implementation

```jsx
// Import the hook
import { useFormat } from '../hooks/useFormat.js';

// Use in component
function MyComponent() {
  const { formatCurrency, formatTonnes } = useFormat();
  
  return (
    <div>
      <span>{formatCurrency(1234.56)}</span>
      <span>{formatTonnes(1000)}</span>
    </div>
  );
}
```

### Available Functions

```jsx
const {
  formatCurrency,        // 1234.56 → "1,234.56 USDC"
  formatTonnes,          // 1000 → "1,000 tCO2e"
  formatTonnesCompact,   // 12500 → "12.5K tCO2e"
  formatPricePerTonne,   // 15.5 → "15.50 USDC / tCO2e"
  formatDate,            // ISO → "Jul 21, 2026"
  getMonthLabel,         // ISO → "July 2026"
  getWeekLabel,          // ISO → "Week of Jul 14"
  formatRelativeTime,    // Date → "5 minutes ago"
} = useFormat();
```

### Access Locale Directly

```jsx
import { useLocale } from '../hooks/useLocale.js';

const { locale, setLocale } = useLocale();
// locale: "en-US" | "de-DE" | "fr-FR" | ...
// setLocale: (newLocale: string) => void
```

### Manual Formatting

```jsx
import { formatCurrency } from '../utils/format.js';

// Pass locale explicitly
formatCurrency(1234.56, 'de-DE'); // "1.234,56 USDC"
```

### Testing Pattern

```jsx
import { render } from '@testing-library/react';
import { AppProvider } from '../context/AppContext.jsx';

test('displays formatted price', () => {
  localStorage.setItem('carbonmint:locale', 'de-DE');
  
  render(
    <AppProvider>
      <MyComponent />
    </AppProvider>
  );
  
  expect(screen.getByText(/1\.234,56 USDC/)).toBeInTheDocument();
});
```

---

## File Locations

### Source Files
- **Context**: `src/context/AppContext.jsx`
- **Hooks**: `src/hooks/useLocale.js`, `src/hooks/useFormat.js`
- **Utils**: `src/utils/format.js`
- **UI**: `src/components/LocaleSelector.jsx`
- **Page**: `src/pages/Settings.jsx`

### Tests
- `src/test/formatCurrency.test.js`
- `src/test/formatTonnes.test.js`
- `src/test/locale.test.jsx`

### Documentation
- `README.md` - Feature overview
- `docs/LOCALE_INTEGRATION.md` - Full integration guide
- `docs/LOCALE_EXAMPLES.md` - Visual examples
- `LOCALE_FEATURE.md` - Implementation summary

---

## Cheat Sheet

### ✅ Do

```jsx
// Use the hook
const { formatCurrency } = useFormat();
return <span>{formatCurrency(price)}</span>;

// Provide locale parameter with default
function formatCurrency(value, locale = 'en-US') { }

// Wrap tests in AppProvider
<AppProvider><Component /></AppProvider>
```

### ❌ Don't

```jsx
// Don't hardcode formatting
const formatted = `$${price.toFixed(2)}`;

// Don't use hooks conditionally
if (show) { const { formatCurrency } = useFormat(); }

// Don't test without provider
render(<Component />); // Will error!
```

---

## Common Tasks

### Add Locale to New Component

1. Import `useFormat` hook
2. Destructure needed formatters
3. Use instead of direct imports
4. Test with multiple locales

### Update Existing Component

**Before:**
```jsx
import { formatCurrency } from '../utils/format.js';
```

**After:**
```jsx
import { useFormat } from '../hooks/useFormat.js';
const { formatCurrency } = useFormat();
```

### Add New Locale

1. Add to `LocaleSelector.jsx` locales array
2. Test formatting with new locale
3. Update documentation
4. Add example to `LOCALE_EXAMPLES.md`

---

## Debug Checklist

- [ ] Component wrapped in `AppProvider`?
- [ ] Using `useFormat` hook or passing locale?
- [ ] Locale state updating in context?
- [ ] localStorage available?
- [ ] Locale code is valid BCP 47 tag?
- [ ] Browser supports `Intl.NumberFormat`?

---

## Performance Tips

- ✅ `useFormat` memoizes formatters with `useCallback`
- ✅ Context only updates on locale change
- ✅ localStorage access is minimal
- ✅ Native `toLocaleString` is optimized

---

## Support

- **Documentation**: See `docs/LOCALE_INTEGRATION.md`
- **Examples**: See `docs/LOCALE_EXAMPLES.md`
- **Tests**: See `src/test/formatCurrency.test.js`
- **Implementation**: See `LOCALE_FEATURE.md`
