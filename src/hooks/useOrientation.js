import { useEffect, useState } from 'react';

/**
 * Track whether the viewport is in landscape or portrait orientation using
 * window.matchMedia. Updates reactively on orientation change.
 * @returns {{ isLandscape: boolean, isPortrait: boolean }}
 */
export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(orientation: landscape)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia('(orientation: landscape)');
    function onChange(e) {
      setIsLandscape(e.matches);
    }
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return {
    isLandscape,
    isPortrait: !isLandscape,
  };
}
