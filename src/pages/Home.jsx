import { Link } from 'react-router-dom';
import { BATCHES } from '../services/market.js';
import { PROJECTS } from '../constants/projects.js';
import { formatTonnes } from '../utils/format.js';
import './Home.css';

const totalAvailable = BATCHES.reduce((sum, b) => sum + b.availableTonnes, 0);

const stats = [
  { label: 'Projects', value: String(PROJECTS.length) },
  { label: 'Listed batches', value: String(BATCHES.length) },
  { label: 'Credits available', value: formatTonnes(totalAvailable) },
];

const steps = [
  {
    title: '1. Mint',
    body: 'Verified projects mint credit batches as CARBON tokens on Soroban, each tied to a registry serial and vintage year.',
  },
  {
    title: '2. Buy',
    body: 'Browse the marketplace and purchase tonnes of CO2e from the batches that match your offset goals and budget.',
  },
  {
    title: '3. Retire',
    body: 'Burn the credits you own to permanently retire them. CarbonMint issues an on-chain retirement certificate as proof.',
  },
];

/**
 * Landing page explaining the tokenized carbon-credit lifecycle.
 */
export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          Tokenized carbon credits, <span>transparent by design.</span>
        </h1>
        <p className="hero-subtitle">
          CarbonMint turns verified emission reductions into CARBON tokens on
          the Stellar network. Buy credits, hold them in your wallet, and retire
          them to claim a permanent, auditable offset certificate.
        </p>
        <div className="hero-actions">
          <Link to="/marketplace" className="btn btn-primary">
            Explore Marketplace
          </Link>
          <Link to="/my-credits" className="btn btn-secondary">
            View My Credits
          </Link>
        </div>
      </section>

      <section className="home-stats">
        {stats.map((stat) => (
          <div className="home-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="steps">
        {steps.map((step) => (
          <div className="step-card" key={step.title}>
            <h2 className="step-title">{step.title}</h2>
            <p>{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
