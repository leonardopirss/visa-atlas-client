import { useCallback, useEffect } from 'react';
import { useAppState } from '../../../app/app-state';

export function normalizeIso3(value: string): string | null {
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
}

export function useCountrySelection() {
  const { selectedCountryIso3, selectCountry, clearSelection } = useAppState();
  const selectNormalizedCountry = useCallback(
    (iso3: string) => {
      const normalized = normalizeIso3(iso3);
      if (normalized !== null) selectCountry(normalized);
    },
    [selectCountry],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedCountryIso3 !== null)
        clearSelection();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, selectedCountryIso3]);

  return {
    selectedCountryIso3,
    selectCountry: selectNormalizedCountry,
    clearSelection,
  };
}
