import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useHoldings } from '../hooks/useHoldings.js';
import { useWallet } from '../hooks/useWallet.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatTonnes, getMonthLabel, getWeekLabel, getWeekStart } from '../utils/format.js';
import CertificateCard from '../components/CertificateCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import './Retirements.css';

function groupCertificates(certificates) {
  const sorted = [...certificates].sort(
    (a, b) => new Date(b.retiredAt) - new Date(a.retiredAt)
  );

  const groups = [];
  const monthMap = {};

  for (const cert of sorted) {
    const monthKey = cert.retiredAt.slice(0, 7);
    const weekKey = getWeekStart(cert.retiredAt).toISOString().slice(0, 10);

    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { label: getMonthLabel(cert.retiredAt), weeks: {} };
      groups.push(monthMap[monthKey]);
    }

    const month = monthMap[monthKey];
    if (!month.weeks[weekKey]) {
      month.weeks[weekKey] = {
        label: getWeekLabel(cert.retiredAt),
        items: [],
      };
    }

    month.weeks[weekKey].items.push(cert);
  }

  return groups;
}

export default function Retirements() {
  useDocumentTitle('Retirements');
  const { isConnected, connect } = useWallet();
  const { certificates, totals } = useHoldings();

  const groups = useMemo(() => groupCertificates(certificates), [certificates]);

  if (!isConnected) {
    return (
      <EmptyState
        title="Connect your wallet"
        message="Connect a wallet to view your retirement certificates."
        action={<Button onClick={connect}>Connect Wallet</Button>}
      />
    );
  }

  return (
    <div className="retirements">
      <div className="page-header">
        <h1>Retirements</h1>
        <p>
          Proof-of-offset certificates for credits you have permanently retired.
          Total retired: {formatTonnes(totals.retired)}.
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          title="No retirements yet"
          message="Retire credits from My Credits to generate an offset certificate."
          action={
            <Link to="/my-credits">
              <Button>Go to My Credits</Button>
            </Link>
          }
        />
      ) : (
        <div className="retirement-groups">
          {groups.map((month) => (
            <div className="month-group" key={month.label}>
              <h2 className="month-heading">{month.label}</h2>
              {Object.values(month.weeks).map((week) => (
                <div className="week-group" key={week.label}>
                  <h3 className="week-heading">{week.label}</h3>
                  <div className="certificates-grid">
                    {week.items.map((certificate) => (
                      <CertificateCard key={certificate.id} certificate={certificate} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
