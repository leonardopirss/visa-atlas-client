import type { MetricType } from '@visa-atlas/contracts';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FilterState } from '../services/api/types';

const INITIAL_METRIC: MetricType = 'FIRST_RESIDENCE_PERMITS_GRANTED';

export const INITIAL_FILTERS: FilterState = {
  citizenship: 'BRA',
  purpose: 'WORK',
  year: null,
  metricType: INITIAL_METRIC,
  comparisonGroupId: null,
};

type AppStateValue = {
  filters: FilterState;
  selectedCountryIso3: string | null;
  selectCountry: (iso3: string) => void;
  clearSelection: () => void;
  replaceFilters: (filters: FilterState) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedCountryIso3, setSelectedCountryIso3] = useState<string | null>(
    null,
  );
  const selectCountry = useCallback(
    (iso3: string) => setSelectedCountryIso3(iso3),
    [],
  );
  const clearSelection = useCallback(() => setSelectedCountryIso3(null), []);
  const replaceFilters = useCallback(
    (nextFilters: FilterState) => setFilters(nextFilters),
    [],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      filters,
      selectedCountryIso3,
      selectCountry,
      clearSelection,
      replaceFilters,
    }),
    [
      clearSelection,
      filters,
      replaceFilters,
      selectCountry,
      selectedCountryIso3,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (value === null)
    throw new Error('useAppState deve ser usado dentro de AppStateProvider.');
  return value;
}
