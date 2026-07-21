import { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';

/**
 * Access the user's locale preference and the setter to change it.
 * @returns {{ locale: string, setLocale: (locale: string) => void }}
 */
export function useLocale() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useLocale must be used within an AppProvider');
  }
  return { locale: context.locale, setLocale: context.setLocale };
}
