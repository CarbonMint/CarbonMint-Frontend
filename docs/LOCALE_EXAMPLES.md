# Locale Formatting Examples

This document provides visual examples of how different locales format numbers in the CarbonMint application.

## Number Formatting Comparison

### Price: 1234.56 USDC

| Locale | Output | Description |
|--------|--------|-------------|
| en-US  | `1,234.56 USDC` | Comma for thousands, period for decimal |
| en-GB  | `1,234.56 USDC` | Same as en-US |
| de-DE  | `1.234,56 USDC` | Period for thousands, comma for decimal |
| fr-FR  | `1 234,56 USDC` | Space for thousands, comma for decimal |
| es-ES  | `1.234,56 USDC` | Period for thousands, comma for decimal |
| pt-BR  | `1.234,56 USDC` | Period for thousands, comma for decimal |
| ja-JP  | `1,234.56 USDC` | Same as en-US |

### Large Price: 1234567.89 USDC

| Locale | Output |
|--------|--------|
| en-US  | `1,234,567.89 USDC` |
| de-DE  | `1.234.567,89 USDC` |
| fr-FR  | `1 234 567,89 USDC` |
| es-ES  | `1.234.567,89 USDC` |

### Tonnage: 12500 tCO2e

| Locale | Standard | Compact |
|--------|----------|---------|
| en-US  | `12,500 tCO2e` | `12.5K tCO2e` |
| de-DE  | `12.500 tCO2e` | `12,5 Tsd. tCO2e` |
| fr-FR  | `12 500 tCO2e` | `12,5 k tCO2e` |

## Real-World Component Examples

### Marketplace Batch Card

```
┌─────────────────────────────────────┐
│ Amazon Rainforest Conservation      │
│ Vintage 2024 • VCS                  │
├─────────────────────────────────────┤
│ Price            Available          │
│ 15.50 USDC      1,234 tCO2e        │ ← en-US
│ 15,50 USDC      1.234 tCO2e        │ ← de-DE
│ 15,50 USDC      1 234 tCO2e        │ ← fr-FR
└─────────────────────────────────────┘
```

### Buy Form Cost Display

**English (US):**
```
Quantity: 100 tCO2e
Price per tonne: 15.50 USDC
Total cost: 1,550.00 USDC
Max cost with slippage: 1,565.50 USDC
```

**German (Germany):**
```
Quantity: 100 tCO2e
Price per tonne: 15,50 USDC
Total cost: 1.550,00 USDC
Max cost with slippage: 1.565,50 USDC
```

**French (France):**
```
Quantity: 100 tCO2e
Price per tonne: 15,50 USDC
Total cost: 1 550,00 USDC
Max cost with slippage: 1 565,50 USDC
```

### My Credits Holdings Table

| Locale | Project Name | Vintage | Price | Held |
|--------|-------------|---------|-------|------|
| en-US  | Wind Farm Project | 2024 | 15.50 USDC / tonne | 1,000 tCO2e |
| de-DE  | Wind Farm Project | 2024 | 15,50 USDC / tonne | 1.000 tCO2e |
| fr-FR  | Wind Farm Project | 2024 | 15,50 USDC / tonne | 1 000 tCO2e |

## Settings Page Preview

The Settings page shows a live preview when changing locale:

```
┌─────────────────────────────────────────┐
│ Regional Preferences                    │
├─────────────────────────────────────────┤
│ Currency format                         │
│ ┌─────────────────────────────────────┐ │
│ │ Deutsch (Deutschland)              ▼│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Preview                                 │
│ This is how prices will appear:        │
│   Small amount:  1.234,56 USDC         │
│   Large amount:  1.234.567,89 USDC     │
│   Current locale: de-DE                 │
└─────────────────────────────────────────┘
```

## Date Formatting Examples

### formatDate()

**Input:** `2026-07-21T12:00:00.000Z`

| Locale | Output |
|--------|--------|
| en-US  | `Jul 21, 2026` |
| de-DE  | `21. Juli 2026` |
| fr-FR  | `21 juil. 2026` |
| es-ES  | `21 jul 2026` |
| ja-JP  | `2026年7月21日` |

### getMonthLabel()

**Input:** `2026-07-21`

| Locale | Output |
|--------|--------|
| en-US  | `July 2026` |
| de-DE  | `Juli 2026` |
| fr-FR  | `juillet 2026` |
| es-ES  | `julio 2026` |

### formatRelativeTime()

**Input:** 5 minutes ago

All locales use English time units:
- `5 minutes ago`
- `3 hours ago`
- `2 days ago`

But the fallback date (after 7 days) respects locale:
- en-US: `Jul 14, 2026, 3:30 PM`
- de-DE: `14. Juli 2026, 15:30`
- fr-FR: `14 juil. 2026, 15:30`

## Common Patterns

### Zero Values

| Locale | formatCurrency(0) |
|--------|-------------------|
| en-US  | `0.00 USDC` |
| de-DE  | `0,00 USDC` |
| fr-FR  | `0,00 USDC` |

### Negative Values

| Locale | formatCurrency(-150.25) |
|--------|------------------------|
| en-US  | `-150.25 USDC` |
| de-DE  | `-150,25 USDC` |
| fr-FR  | `-150,25 USDC` |

### Small Decimals

| Locale | formatCurrency(0.99) |
|--------|---------------------|
| en-US  | `0.99 USDC` |
| de-DE  | `0,99 USDC` |
| fr-FR  | `0,99 USDC` |

## Integration Testing Checklist

When testing locale formatting in your components:

- [ ] Test with en-US (default)
- [ ] Test with de-DE (different decimal separator)
- [ ] Test with fr-FR (space as thousands separator)
- [ ] Test zero values
- [ ] Test negative values
- [ ] Test very large numbers (millions)
- [ ] Test very small decimals
- [ ] Verify formatting updates when locale changes
- [ ] Check that USDC suffix always appears
- [ ] Verify screen reader announcements are locale-aware

## Browser Compatibility Notes

The locale formatting uses native JavaScript `Intl` APIs which are supported in all modern browsers:

- ✅ Chrome 24+
- ✅ Firefox 29+
- ✅ Safari 10+
- ✅ Edge (all versions)
- ✅ Opera 15+

Older browsers may display fallback formatting but functionality remains intact.

## Accessibility Considerations

### Screen Readers

Numbers formatted with locale-specific separators are announced correctly by screen readers:

**en-US:** "One thousand two hundred thirty-four point five six USDC"
**de-DE:** "Eintausendzweihundertvierunddreißig Komma fünfundfünfzig USDC"

### Visual Clarity

- Consistent use of separators improves scannability
- Decimal vs comma is familiar to users in their locale
- Spacing (fr-FR) provides visual grouping

### Cognitive Load

Users see numbers in their expected format, reducing:
- Mental translation effort
- Parsing errors
- Comprehension time

## Performance Notes

Locale formatting has minimal performance impact:

- `toLocaleString()` is optimized by browsers
- Formatting happens at render time, not in loops
- `useFormat` hook memoizes formatters with `useCallback`
- Context updates only trigger re-renders when locale changes

## Troubleshooting

### Issue: Numbers not updating when locale changes

**Solution:** Ensure component uses `useFormat` hook or reads locale from context

### Issue: Unexpected format in specific locale

**Solution:** Verify locale code is correct BCP 47 tag (e.g., 'de-DE' not 'de')

### Issue: Tests failing with locale formatting

**Solution:** Wrap test components in `<AppProvider>` and mock localStorage

### Issue: Formatting doesn't match locale

**Solution:** Check that formatting function receives locale parameter
