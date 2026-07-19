import { formatDate, formatTonnes, shortenAddress } from '../utils/format.js';
import { getLang, getTechnicalLang } from '../utils/lang.js';
import './CertificateCard.css';

/**
 * Displays a single retirement certificate as a printable-looking card.
 * @param {object} props
 * @param {object} props.certificate
 */
export default function CertificateCard({ certificate }) {
  const lang = getLang();
  const techLang = getTechnicalLang();
  return (
    <article className="certificate" lang={lang}>
      <div className="certificate-ribbon">Retirement Certificate</div>
      <div className="certificate-body">
        <h3 className="certificate-tonnes">{formatTonnes(certificate.tonnes)}</h3>
        <p className="certificate-project">{certificate.projectName}</p>

        <dl className="certificate-meta">
          <div>
            <dt>Certificate ID</dt>
            {/* Technical identifier — locale-independent character sequence */}
            <dd className="mono" lang={techLang}>{certificate.id}</dd>
          </div>
          <div>
            <dt>Vintage</dt>
            <dd>{certificate.vintage}</dd>
          </div>
          <div>
            <dt>Serial</dt>
            {/* Registry serial — locale-independent */}
            <dd className="mono" lang={techLang}>{certificate.serial}</dd>
          </div>
          <div>
            <dt>Retired</dt>
            <dd>{formatDate(certificate.retiredAt)}</dd>
          </div>
          <div>
            <dt>Beneficiary</dt>
            <dd>{certificate.beneficiary || shortenAddress(certificate.owner)}</dd>
          </div>
          <div>
            <dt>Burn tx</dt>
            {/* Transaction hash — locale-independent */}
            <dd className="mono certificate-tx" lang={techLang}>{certificate.burnTxHash}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
