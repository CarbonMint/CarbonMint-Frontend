# Changelog

All notable changes to the CarbonMint frontend are documented here. The format
is loosely based on [Keep a Changelog](https://keepachangelog.com/), and the
project follows semantic versioning.

## [Unreleased]

### Added

- **Landscape layout for tablets**: New CSS media queries optimise spacing,
  typography, and grid proportions for tablet-sized screens in landscape
  orientation (width ≤ 1100px in landscape). Covers App shell, Navbar, Home,
  Marketplace, BatchDetail, MyCredits, and Settings pages.
- `useOrientation` hook for detecting viewport orientation via
  `window.matchMedia('(orientation: landscape)')`.
- **Landscape layout styling**: Compact paddings, tighter gaps, optimised hero
  section, adjusted grid ratios, smaller summary cards, and denser controls
  when the device is in landscape orientation at tablet widths.
- **Locale preference for currency formatting**: Users can now select their
  preferred number and currency formatting locale from the Settings page.
  Supported locales include en-US, en-GB, de-DE, fr-FR, es-ES, pt-BR, and ja-JP.
  The preference is persisted to localStorage and affects all prices, amounts,
  and dates throughout the application.
- Settings page (`/settings`) with locale selector and live formatting preview.
- `useLocale` hook for accessing and updating locale preference.
- `useFormat` hook providing locale-aware formatting functions.
- `LocaleSelector` component for choosing currency format.
- Comprehensive test coverage for locale functionality including currency
  formatting with multiple locales and localStorage persistence.
- Keyboard-friendly buy and retire forms that submit when pressing Enter in a
  quantity or tonnes field.
- Last-updated timestamp on the Marketplace page, shown as a relative time
  (e.g. "Updated 2 minutes ago") that refreshes automatically and shows the
  full local date/time on hover.
- Reusable UI components: `Tag`, `Alert`, `Tabs`, `CopyButton`, `ProgressBar`,
  `Avatar` and `Pagination`.
- Utility hooks: `useToggle`, `usePrevious`, `useWindowSize`,
  `useOnClickOutside`, `useKeyPress` and `useInterval`.
- Compact tonnage and per-tonne price formatters, plus a Stellar public key
  shape validator.
- Carbon standards reference catalog and two additional sample projects.

### Changed

- All formatting functions in `src/utils/format.js` now accept an optional
  `locale` parameter (BCP 47 language tag) with `en-US` as the default.
- `AppContext` now includes locale state and setLocale function.

## [0.1.0] - Initial demo

### Added

- Marketplace with grid and list views of mock credit batches.
- Validated buy flow and retire flow with offset certificates.
- Mock Stellar wallet connect/disconnect and runtime config from env vars.
