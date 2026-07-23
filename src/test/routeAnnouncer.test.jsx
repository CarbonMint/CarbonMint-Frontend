import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import RouteAnnouncer from '../components/RouteAnnouncer.jsx';

function TestApp({ initialRoute = '/' }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <RouteAnnouncer />
      <nav>
        <Link to="/">Home</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/my-credits">My Credits</Link>
        <Link to="/batch/abc-123">Batch Detail</Link>
        <Link to="/bogus">Not Found</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/marketplace" element={<div>Marketplace page</div>} />
        <Route path="/my-credits" element={<div>My Credits page</div>} />
        <Route path="/batch/:id" element={<div>Batch Detail page</div>} />
        <Route path="*" element={<div>Not Found page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RouteAnnouncer', () => {
  it('announces the initial route on mount', () => {
    render(<TestApp initialRoute="/" />);
    expect(screen.getByText('Navigated to Home')).toBeInTheDocument();
  });

  it('announces the initial route when starting on a non-root path', () => {
    render(<TestApp initialRoute="/marketplace" />);
    expect(screen.getByText('Navigated to Marketplace')).toBeInTheDocument();
  });

  it('announces "Marketplace" when navigating to /marketplace', async () => {
    const user = userEvent.setup();
    render(<TestApp initialRoute="/" />);
    await user.click(screen.getByRole('link', { name: 'Marketplace' }));
    expect(screen.getByText('Navigated to Marketplace')).toBeInTheDocument();
  });

  it('announces "My Credits" when navigating to /my-credits', async () => {
    const user = userEvent.setup();
    render(<TestApp initialRoute="/" />);
    await user.click(screen.getByRole('link', { name: 'My Credits' }));
    expect(screen.getByText('Navigated to My Credits')).toBeInTheDocument();
  });

  it('announces "Batch Detail" when navigating to /batch/:id', async () => {
    const user = userEvent.setup();
    render(<TestApp initialRoute="/" />);
    await user.click(screen.getByRole('link', { name: 'Batch Detail' }));
    expect(screen.getByText('Navigated to Batch Detail')).toBeInTheDocument();
  });

  it('announces "Not Found" when navigating to an unmatched route', async () => {
    const user = userEvent.setup();
    render(<TestApp initialRoute="/" />);
    await user.click(screen.getByRole('link', { name: 'Not Found' }));
    expect(screen.getByText('Navigated to Not Found')).toBeInTheDocument();
  });
});
