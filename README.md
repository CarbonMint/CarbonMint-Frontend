# CarbonMint

A demo frontend for **CarbonMint**, a tokenized carbon-credit marketplace built
on the Stellar network and Soroban smart contracts. Verified emission-reduction
projects mint carbon credits as `CARBON` tokens; users buy them, hold them in a
wallet, and **retire** (burn) them to receive a permanent offset certificate.

> This is a UI demo. It runs entirely on **mock data** with a **mock wallet** —
> there are no network calls and no real blockchain interaction.

## Features

- Landing page explaining the tokenized carbon-credit lifecycle (mint → buy → retire).
- Marketplace with grid and list views of available credit batches, showing a
  live "last updated" timestamp for the listed data.
- Batch detail page with a validated buy flow and live cost calculation.
- My Credits page showing holdings with a retire flow.
- Retirements page listing issued offset certificates.
- Mock Stellar wallet connect/disconnect.

## Tech stack

- React 18 + Vite
- React Router
- Plain CSS (no UI framework)
- Mock Stellar/Soroban services

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

## Scripts

- `npm run dev` — start the Vite dev server with hot reloading.
- `npm run build` — produce an optimized production build in `dist/`.
- `npm run preview` — serve the production build locally to sanity-check it.
- `npm test` — run the unit test suite with the Node.js built-in test runner.

## CI

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and
pull request. It installs dependencies, builds the project, and runs the full
test suite. Any failure will block the workflow.

## How it works

1. **Mint** — verified projects mint credit batches as `CARBON` tokens. In this
   demo, batches are static mock data in `src/services/market.js`.
2. **Buy** — users connect a (mock) wallet and purchase tonnes from a batch.
   Holdings are tracked in `AppContext`.
3. **Retire** — users burn credits they hold; the app issues a retirement
   certificate as proof of offset.

## Project structure

```
src/
  components/   reusable UI (Navbar, BatchCard, BuyForm, RetireModal, ...)
  pages/        routed views (Home, Marketplace, BatchDetail, MyCredits, ...)
  services/     mock wallet, marketplace, api and retirement logic
  context/      AppContext global state provider
  hooks/        useWallet, useMarket, useHoldings, useDebounce, useDocumentTitle
  utils/        format and validate helpers
  constants/    project catalog and runtime config
```

## Internationalisation (i18n readiness)

The application is wired for future locale switching without requiring
component-level edits.

### Language constants

`src/constants/config.js` exports `LANG_CONFIG`:

```js
export const LANG_CONFIG = {
  DEFAULT_LANG: 'en',      // BCP 47 tag for all human-readable content
  TECHNICAL_LANG: 'en',    // tag for locale-independent content (hashes, IDs)
};
```

Override `DEFAULT_LANG` at build time with the `VITE_LANG` environment variable.

### Lang utilities

`src/utils/lang.js` exports two helpers:

| Function | Returns | Use on |
|---|---|---|
| `getLang()` | `LANG_CONFIG.DEFAULT_LANG` | Human-readable elements |
| `getTechnicalLang()` | `LANG_CONFIG.TECHNICAL_LANG` | Hashes, serials, contract IDs, wallet addresses |

```jsx
import { getLang, getTechnicalLang } from '../utils/lang.js';

<article lang={getLang()}>…</article>
<dd className="mono" lang={getTechnicalLang()}>{txHash}</dd>
```

### Current coverage

| Element | `lang` source |
|---|---|
| `<html>` in `index.html` | hardcoded `"en"` |
| `<header>` in `Navbar` | `getLang()` |
| `<footer>` in `Footer` | `getLang()` |
| `<article>` in `CertificateCard` | `getLang()` |
| Certificate ID / Serial / Burn tx `<dd>` | `getTechnicalLang()` |
| Batch serial and receipt tx hash `<p>` in `BatchDetail` | `getTechnicalLang()` |

### Adding locale support later

1. Store the user's locale preference (e.g. in `AppContext` or `localStorage`).
2. Update `getLang()` in `src/utils/lang.js` to read that preference instead of
   falling back directly to `LANG_CONFIG.DEFAULT_LANG`.
3. No component changes are needed — every `lang` attribute already calls
   `getLang()`.

## Accessibility

CarbonMint follows WCAG 2.1 SC 4.1.3 (Status Messages) to ensure screen readers
receive timely announcements for every asynchronous UI update.

### LiveRegion component

`src/components/LiveRegion.jsx` is a visually-hidden `role="status"` element that
accepts a `message` prop and an optional `politeness` prop (`"polite"` or
`"assertive"`). It is always present in the DOM so assistive technologies
register it before any message is injected, preventing missed announcements.

```jsx
// Non-critical feedback — announces after the current speech finishes
<LiveRegion message="Purchase complete. You bought 10 tCO2e for 150.00 USDC." />

// Urgent errors — interrupts immediately
<LiveRegion politeness="assertive" message={error} />
```

### Announcement map

| Location | Event | Politeness |
|---|---|---|
| `BuyForm` | Form submitting ("Processing your purchase…") | polite |
| `BuyForm` | Validation error (empty / out-of-range quantity) | polite (`role=alert`) |
| `RetireModal` | Form submitting ("Processing your retirement…") | polite |
| `RetireModal` | Validation error | polite (`role=alert`) |
| `BatchDetail` | Purchase receipt ("Purchase complete. You bought…") | polite |
| `BatchDetail` | Buy error after batch is loaded | assertive |
| `MyCredits` | Retirement success ("Retirement complete. X tCO2e retired…") | polite |
| `MyCredits` | Retirement error | assertive |
| `WalletButton` | Wallet connecting ("Connecting wallet…") | polite |
| `WalletButton` | Wallet connected ("Wallet connected: \<address\>") | polite |
| `CopyButton` | Clipboard copy ("Copied \<label\>") | polite |
| `Alert` | `danger` / `warning` variants | assertive (`role=alert`) |
| `Alert` | `info` / `success` variants | polite (`role=status`) |
| `ErrorMessage` | Any rendered error | assertive (`role=alert`) |
| `Loader` | Spinner visible | polite (`role=status`) |
| `SkeletonGrid` | Batch list loading | polite (`role=status aria-busy`) |

### Design decisions

- **Never use `aria-live="assertive"` for routine updates.** It is reserved for
  errors and urgent states that require the user's immediate attention. All
  success messages and progress indicators use `"polite"`.
- **`aria-atomic="true"`** is set on every live region so screen readers
  announce the complete updated string rather than just the changed fragment.
- **Always-present regions** (`LiveRegion`) prevent assistive technologies from
  missing the first announcement (some AT ignore content injected into newly
  created live regions).
- **`aria-relevant="additions text"`** on `LiveRegion` ensures both new content
  and text mutations are announced.

### Testing

Component-level accessibility tests live in `src/test/aria-live.test.jsx` and
run with [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/).

```bash
npm test
```

## Environment

Copy `.env.example` to `.env` to override defaults. All values are optional —
the demo runs without any configuration.

## Disclaimer

This project is for demonstration only. No real tokens, payments, or carbon
credits are involved.
