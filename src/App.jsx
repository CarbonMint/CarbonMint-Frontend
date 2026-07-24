import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import GlobalShortcuts from './components/GlobalShortcuts.jsx';
import RouteAnnouncer from './components/RouteAnnouncer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ScrollToTopButton from './components/ScrollToTopButton.jsx';
import Home from './pages/Home.jsx';
import Marketplace from './pages/Marketplace.jsx';
import BatchDetail from './pages/BatchDetail.jsx';
import MyCredits from './pages/MyCredits.jsx';
import Retirements from './pages/Retirements.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import './App.css';

/**
 * Application shell: persistent navbar/footer with routed page content.
 */
export default function App() {
  return (
    <>
      <RouteAnnouncer />
      <GlobalShortcuts />
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ScrollToTopButton />
      <Navbar />
      <main className="app-main" id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/batch/:id" element={<BatchDetail />} />
          <Route path="/my-credits" element={<MyCredits />} />
          <Route path="/retirements" element={<Retirements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
