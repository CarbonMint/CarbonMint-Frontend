import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { LocaleSelector } from '../components/LocaleSelector.jsx';
import { formatCurrency } from '../utils/format.js';
import { useLocale } from '../hooks/useLocale.js';
import './Settings.css';

/**
 * Settings page for user preferences including locale/currency formatting.
 */
export default function Settings() {
  useDocumentTitle('Settings');
  const { locale } = useLocale();

  // Example values to demonstrate current formatting
  const examplePrice = 1234.56;
  const exampleLarge = 1234567.89;

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p className="settings-subtitle">
          Manage your preferences and customize your CarbonMint experience.
        </p>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h2 className="settings-section-title">Regional Preferences</h2>
          <div className="settings-section-body">
            <LocaleSelector />
            
            <div className="settings-preview">
              <h3 className="settings-preview-title">Preview</h3>
              <p className="settings-preview-description">
                This is how prices will appear with your current locale setting:
              </p>
              <dl className="settings-preview-list">
                <div className="settings-preview-item">
                  <dt>Small amount:</dt>
                  <dd>{formatCurrency(examplePrice, locale)}</dd>
                </div>
                <div className="settings-preview-item">
                  <dt>Large amount:</dt>
                  <dd>{formatCurrency(exampleLarge, locale)}</dd>
                </div>
                <div className="settings-preview-item">
                  <dt>Current locale:</dt>
                  <dd><code>{locale}</code></dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">About Locale Settings</h2>
          <div className="settings-section-body">
            <p className="settings-info-text">
              The currency format setting changes how numbers are displayed throughout
              the application, including thousands separators and decimal points.
              All prices are denominated in USDC regardless of the format.
            </p>
            <p className="settings-info-text">
              Your preference is saved locally in your browser and will be remembered
              on your next visit.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
