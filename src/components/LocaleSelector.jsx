import { useLocale } from '../hooks/useLocale.js';
import './LocaleSelector.css';

/**
 * Locale selector dropdown for currency and date formatting preferences.
 *
 * Supported locales with their formatting characteristics:
 * - en-US: 1,234.56 (comma thousands, period decimal)
 * - de-DE: 1.234,56 (period thousands, comma decimal)
 * - fr-FR: 1 234,56 (space thousands, comma decimal)
 * - es-ES: 1.234,56 (period thousands, comma decimal)
 * - ja-JP: 1,234.56 (comma thousands, period decimal)
 * - pt-BR: 1.234,56 (period thousands, comma decimal)
 * - en-GB: 1,234.56 (comma thousands, period decimal)
 */
export function LocaleSelector() {
  const { locale, setLocale } = useLocale();

  const locales = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'de-DE', label: 'Deutsch (Deutschland)' },
    { code: 'fr-FR', label: 'Français (France)' },
    { code: 'es-ES', label: 'Español (España)' },
    { code: 'pt-BR', label: 'Português (Brasil)' },
    { code: 'ja-JP', label: '日本語 (日本)' },
  ];

  const handleChange = (e) => {
    setLocale(e.target.value);
  };

  return (
    <div className="locale-selector">
      <label htmlFor="locale-select" className="locale-selector-label">
        Currency format
      </label>
      <select
        id="locale-select"
        className="locale-selector-dropdown"
        value={locale}
        onChange={handleChange}
        aria-label="Select currency and number formatting locale"
      >
        {locales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.label}
          </option>
        ))}
      </select>
      <p className="locale-selector-hint">
        Changes how prices and numbers are formatted throughout the application.
      </p>
    </div>
  );
}
