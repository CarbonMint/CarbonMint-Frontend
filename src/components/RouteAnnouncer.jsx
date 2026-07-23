import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LiveRegion from './LiveRegion.jsx';

const ROUTE_LABELS = {
  '/': 'Home',
  '/marketplace': 'Marketplace',
  '/my-credits': 'My Credits',
  '/retirements': 'Retirements',
  '/settings': 'Settings',
};

function getPageName(pathname) {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (/^\/batch\//.test(pathname)) return 'Batch Detail';
  return 'Not Found';
}

export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(`Navigated to ${getPageName(pathname)}`);
  }, [pathname]);

  return <LiveRegion message={message} />;
}
