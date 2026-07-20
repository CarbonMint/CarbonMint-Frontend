# Changelog

All notable changes to the CarbonMint frontend are documented here. The format
is loosely based on [Keep a Changelog](https://keepachangelog.com/), and the
project follows semantic versioning.

## [Unreleased]

### Added

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

## [0.1.0] - Initial demo

### Added

- Marketplace with grid and list views of mock credit batches.
- Validated buy flow and retire flow with offset certificates.
- Mock Stellar wallet connect/disconnect and runtime config from env vars.
