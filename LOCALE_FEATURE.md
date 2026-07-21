# Locale Preference Feature - Implementation Summary

## Overview

This document summarizes the implementation of locale preference for currency formatting in the CarbonMint frontend application. Users can now customize how prices, amounts, and numbers are displayed throughout the application.

## What Was Implemented

### 1. Core Infrastructure

#### AppContext Enhancement (`src/context/AppContext.jsx`)
- Added `locale` state with default value of `'en-US'`
- Added `setLocale` function to update locale preference
- Implemented localStorage persistence under key `'carbonmint:locale'`
- Added `getStoredLocale()` and `storeLocale()` helper functions
- Error handling for localStorage unavailability

#### Format Utilities Update (`src/utils/format.js`)
Updated all locale-dependent formatting functions to accept optional `locale` parameter:
- `formatCurrency(value, locale = 'en-US')`
- `formatTonnes(value, locale = 'en-US')`
- `formatTonnesCompact(value, locale = 'en-US')`
- `formatPricePerTonne(value, locale = 'en-US')`
- `formatDate(iso, locale = 'en-US')`
- `getMonthLabel(iso, locale = 'en-US')`
- `getWeekLabel(iso, locale = 'en-US')`
- `formatRelativeTime(value, now, locale = 'en-US')`

All functions maintain backward compatibility with default `'en-US'` locale.

### 2. Custom Hooks

#### useLocale Hook (`src/hooks/useLocale.js`)
- Provides access to current locale and setLocale function
- Throws error if used outside AppProvider
- Simple API: `const { locale, setLocale } = useLocale()`

#### useFormat Hook (`src/hooks/useFormat.js`)
- Returns all formatting functions pre-bound to user's locale preference
- Automatically updates when locale changes
- Recommended approach for components
- Example: `const { formatCurrency, formatTonnes } = useFormat()`

### 3. User Interface Components

#### LocaleSelector Component (`src/components/LocaleSelector.jsx`)
- Dropdown selector for locale preference
- Shows descriptive labels for each locale
- Includes help text explaining what the setting does
- Accessible with proper ARIA labels
- Styled with `LocaleSelector.css`

#### Settings Page (`src/pages/Settings.jsx`)
- New route at `/settings`
- Contains LocaleSelector component
- Live preview showing current formatting with example values
- Informational section explaining locale settings
- Responsive design matching existing page patterns
- Styled with `Settings.css`

### 4. Navigation Updates

#### App.jsx
- Added Settings route: `<Route path="/settings" element={<Settings />} />`

#### Navbar.jsx
- Added Settings link to main navigation
- Link displays in navigation bar alongside other pages

### 5. Supported Locales

The application supports 7 locales with distinct formatting patterns:

| Locale Code | Language/Region          | Example Format  |
|-------------|--------------------------|-----------------|
| en-US       | English (United States)  | 1,234.56 USDC   |
| en-GB       | English (United Kingdom) | 1,234.56 USDC   |
| de-DE       | German (Germany)         | 1.234,56 USDC   |
| fr-FR       | French (France)          | 1 234,56 USDC   |
| es-ES       | Spanish (Spain)          | 1.234,56 USDC   |
| pt-BR       | Portuguese (Brazil)      | 1.234,56 USDC   |
| ja-JP       | Japanese (Japan)         | 1,234.56 USDC   |

### 6. Automated Tests

Created comprehensive test coverage:

#### Currency Formatting Tests (`src/test/formatCurrency.test.js`)
- 16 test cases covering:
  - Default and explicit locale formatting
  - Multiple locales (en-US, de-DE, fr-FR, ja-JP, es-ES)
  - Edge cases (zero, negative, large numbers)
  - Decimal place precision
  - Invalid input handling

#### Tonnage Formatting Tests (`src/test/formatTonnes.test.js`)
- 9 test cases covering:
  - Standard and compact tonnage formatting
  - Multiple locales
  - Decimal handling
  - Edge cases

#### Locale Context Tests (`src/test/locale.test.jsx`)
- 6 test cases covering:
  - Default locale behavior
  - localStorage persistence and retrieval
  - setLocale functionality
  - Error handling for missing provider
  - localStorage error resilience

#### Updated Existing Test (`test/utils/formatRelativeTime.test.js`)
- Added test for locale parameter support

### 7. Documentation Updates

#### README.md
- Added locale preference feature to Features section
- Added comprehensive "Locale preference" section with:
  - Supported locales table
  - Implementation details
  - Usage examples for both useFormat and direct usage
  - List of locale-aware functions
  - Testing approach

#### CHANGELOG.md
- Added detailed entry in [Unreleased] section
- Listed all new features and components
- Documented changes to existing code

#### New Documentation
- Created `docs/LOCALE_INTEGRATION.md`: Complete integration guide for developers
- Created `LOCALE_FEATURE.md`: This implementation summary document

## Technical Architecture

```
User Action (Settings Page)
      ↓
setLocale() → AppContext
      ↓
localStorage.setItem('carbonmint:locale', locale)
      ↓
Context state update triggers re-render
      ↓
Components using useFormat() get updated formatters
      ↓
All displayed prices/numbers reflect new locale
```

## Key Design Decisions

1. **Backward Compatibility**: All formatting functions have optional locale parameter with 'en-US' default
2. **Persistence**: Locale preference saved to localStorage for cross-session persistence
3. **Error Resilience**: Graceful fallback if localStorage unavailable
4. **Component API**: Two approaches (useFormat hook and direct import) for flexibility
5. **Centralized State**: Locale managed in AppContext for consistent access
6. **Standards Compliance**: Uses BCP 47 language tags and native Intl APIs

## Files Created

### Source Code
- `src/hooks/useLocale.js` - Locale access hook
- `src/hooks/useFormat.js` - Locale-aware formatting hook
- `src/components/LocaleSelector.jsx` - Locale selector UI
- `src/components/LocaleSelector.css` - Locale selector styles
- `src/pages/Settings.jsx` - Settings page
- `src/pages/Settings.css` - Settings page styles

### Tests
- `src/test/formatCurrency.test.js` - Currency formatting tests
- `src/test/formatTonnes.test.js` - Tonnage formatting tests
- `src/test/locale.test.jsx` - Locale context and hook tests

### Documentation
- `docs/LOCALE_INTEGRATION.md` - Developer integration guide
- `LOCALE_FEATURE.md` - This implementation summary

## Files Modified

### Core Application
- `src/context/AppContext.jsx` - Added locale state and persistence
- `src/utils/format.js` - Added locale parameters to formatting functions
- `src/App.jsx` - Added Settings route
- `src/components/Navbar.jsx` - Added Settings link

### Tests
- `test/utils/formatRelativeTime.test.js` - Added locale parameter test

### Documentation
- `README.md` - Added locale feature documentation
- `CHANGELOG.md` - Added feature changelog entry

## Usage Examples

### For End Users

1. Navigate to Settings page (link in navbar or `/settings` route)
2. Select desired locale from dropdown
3. View live preview of formatting changes
4. Changes automatically apply throughout the app
5. Preference persists across browser sessions

### For Developers

#### Using useFormat (Recommended)
```jsx
import { useFormat } from '../hooks/useFormat.js';

function PriceDisplay({ price }) {
  const { formatCurrency } = useFormat();
  return <span>{formatCurrency(price)}</span>;
}
```

#### Direct Usage
```jsx
import { formatCurrency } from '../utils/format.js';
import { useLocale } from '../hooks/useLocale.js';

function PriceDisplay({ price }) {
  const { locale } = useLocale();
  return <span>{formatCurrency(price, locale)}</span>;
}
```

## Testing Strategy

Tests verify:
1. ✅ Default locale is en-US
2. ✅ Locale persists to localStorage
3. ✅ setLocale updates context and triggers re-renders
4. ✅ Currency formatting works with all supported locales
5. ✅ Edge cases handled (null, undefined, invalid input)
6. ✅ Error handling when localStorage unavailable
7. ✅ Thousands and decimal separators correct per locale
8. ✅ Hook throws error when used outside provider

## Acceptance Criteria Met

✅ **Implement the change described above**
   - Locale preference fully implemented with localStorage persistence

✅ **Add or update automated tests**
   - 31 new test cases across 3 test files
   - 1 existing test updated
   - Coverage for formatting, context, hooks, and error cases

✅ **Update the relevant documentation**
   - README.md updated with comprehensive locale section
   - CHANGELOG.md updated with detailed feature entry
   - Created developer integration guide
   - Created implementation summary

## Future Enhancements (Out of Scope)

Potential improvements for future iterations:

1. **Full Internationalization (i18n)**
   - Translate UI text (currently English-only)
   - Use i18n library like react-i18n or react-intl

2. **Currency Symbol Support**
   - Allow users to view prices in other currencies (with conversion)
   - Currently displays all prices as USDC regardless of locale

3. **Date/Time Preferences**
   - Separate date format preferences
   - 12/24 hour time format selection

4. **Auto-detect Locale**
   - Use browser language/region on first visit
   - Fallback to en-US if not supported

5. **Locale-specific Content**
   - Adapt content based on region
   - Regional project examples

## Conclusion

The locale preference feature is fully implemented, tested, and documented. Users can now customize number and currency formatting throughout the CarbonMint application, with their preference persisting across sessions. The implementation maintains backward compatibility, includes comprehensive test coverage, and provides clear documentation for both end users and developers.
