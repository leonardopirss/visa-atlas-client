import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { MetricType, VisaPurpose } from '@visa-atlas/contracts';
import type { FilterState } from '../services/api/types';
import {
  INITIAL_METRIC,
  metricForDestination,
} from '../features/comparison/destination-metric';
import {
  parseNavigationState,
  writeNavigationState,
  type AppView,
} from './navigation-state';

export const INITIAL_FILTERS: FilterState = {
  citizenship: 'BRA',
  purpose: 'WORK',
  year: null,
  metricType: INITIAL_METRIC,
  comparisonGroupId: null,
};

export type CoverageMetric = MetricType | 'ALL';

type AppStateValue = {
  filters: FilterState;
  coverageMetric: CoverageMetric;
  selectedCountryIso3: string | null;
  comparisonIso3s: readonly string[];
  view: AppView;
  navigationNotice: string;
  selectCountry: (iso3: string) => void;
  clearSelection: () => void;
  setView: (view: Exclude<AppView, 'compare'>) => void;
  openComparison: (iso3s: readonly string[]) => void;
  closeComparison: () => void;
  reconcileCatalog: (validIso3s: ReadonlySet<string>) => void;
  selectCoverageMetric: (metric: CoverageMetric) => void;
  selectPurpose: (purpose: VisaPurpose) => void;
  replaceFilters: (filters: FilterState) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const initialNavigation = useMemo(
    () => parseNavigationState(window.location.search),
    [],
  );
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    metricType:
      initialNavigation.countryIso3 === null
        ? INITIAL_FILTERS.metricType
        : metricForDestination(initialNavigation.countryIso3),
  }));
  const [coverageMetric, setCoverageMetric] = useState<CoverageMetric>('ALL');
  const [selectedCountryIso3, setSelectedCountryIso3] = useState<string | null>(
    initialNavigation.countryIso3,
  );
  const [comparisonIso3s, setComparisonIso3s] = useState<readonly string[]>(
    initialNavigation.comparisonIso3s,
  );
  const [view, setViewState] = useState<AppView>(initialNavigation.view);
  const [navigationNotice, setNavigationNotice] = useState('');
  const previousViewRef = useRef<Exclude<AppView, 'compare'>>('globe');

  const selectCountry = useCallback(
    (iso3: string) => {
      setSelectedCountryIso3(iso3);
      setNavigationNotice('');
      setComparisonIso3s([]);
      const nextView = view === 'compare' ? 'globe' : view;
      if (nextView !== view) setViewState(nextView);
      writeNavigationState(
        { countryIso3: iso3, comparisonIso3s: [], view: nextView },
        'push',
      );
      setFilters((current) => {
        const metricType = metricForDestination(
          iso3,
          current.metricType,
          current.purpose,
        );
        if (metricType === current.metricType) return current;
        return { ...current, metricType, year: null, comparisonGroupId: null };
      });
    },
    [view],
  );
  const clearSelection = useCallback(() => {
    setSelectedCountryIso3(null);
    setNavigationNotice('');
    writeNavigationState(
      { countryIso3: null, comparisonIso3s: [], view },
      'push',
    );
  }, [view]);
  const setView = useCallback(
    (nextView: Exclude<AppView, 'compare'>) => {
      setViewState(nextView);
      setNavigationNotice('');
      setComparisonIso3s([]);
      writeNavigationState(
        {
          countryIso3: selectedCountryIso3,
          comparisonIso3s: [],
          view: nextView,
        },
        'push',
      );
    },
    [selectedCountryIso3],
  );
  const openComparison = useCallback(
    (iso3s: readonly string[]) => {
      const next = parseNavigationState(`?compare=${iso3s.join(',')}`);
      if (next.comparisonIso3s.length === 0) return;
      setNavigationNotice('');
      if (view !== 'compare') previousViewRef.current = view;
      setSelectedCountryIso3(null);
      setComparisonIso3s(next.comparisonIso3s);
      setViewState('compare');
      writeNavigationState(next, 'push');
    },
    [view],
  );
  const closeComparison = useCallback(() => {
    const nextView = previousViewRef.current;
    setComparisonIso3s([]);
    setNavigationNotice('');
    setViewState(nextView);
    writeNavigationState(
      { countryIso3: null, comparisonIso3s: [], view: nextView },
      'push',
    );
  }, []);
  const reconcileCatalog = useCallback(
    (validIso3s: ReadonlySet<string>) => {
      const nextCountryIso3 =
        selectedCountryIso3 !== null && validIso3s.has(selectedCountryIso3)
          ? selectedCountryIso3
          : null;
      const nextComparisonIso3s = comparisonIso3s.filter((iso3) =>
        validIso3s.has(iso3),
      );
      const removed =
        Number(selectedCountryIso3 !== null && nextCountryIso3 === null) +
        (comparisonIso3s.length - nextComparisonIso3s.length);
      if (removed === 0) return;

      const nextView =
        view === 'compare' && nextComparisonIso3s.length === 0 ? 'globe' : view;
      setSelectedCountryIso3(nextCountryIso3);
      setComparisonIso3s(nextComparisonIso3s);
      setViewState(nextView);
      setNavigationNotice(
        removed === 1
          ? 'Um destino inválido ou desconhecido foi ignorado.'
          : `${removed} destinos inválidos ou desconhecidos foram ignorados.`,
      );
      writeNavigationState(
        {
          countryIso3: nextCountryIso3,
          comparisonIso3s: nextComparisonIso3s,
          view: nextView,
        },
        'replace',
      );
    },
    [comparisonIso3s, selectedCountryIso3, view],
  );
  const replaceFilters = useCallback(
    (nextFilters: FilterState) => setFilters(nextFilters),
    [],
  );
  const selectCoverageMetric = useCallback((metric: CoverageMetric) => {
    setCoverageMetric(metric);
    setFilters((current) => ({
      ...current,
      metricType: metric === 'ALL' ? INITIAL_METRIC : metric,
      year: null,
      comparisonGroupId: null,
    }));
  }, []);
  const selectPurpose = useCallback(
    (purpose: VisaPurpose) => {
      setCoverageMetric('ALL');
      setFilters((current) => ({
        ...current,
        purpose,
        metricType:
          selectedCountryIso3 === null
            ? INITIAL_METRIC
            : metricForDestination(
                selectedCountryIso3,
                INITIAL_METRIC,
                purpose,
              ),
        year: null,
        comparisonGroupId: null,
      }));
    },
    [selectedCountryIso3],
  );

  useEffect(() => {
    const handlePopState = () => {
      const navigation = parseNavigationState(window.location.search);
      setSelectedCountryIso3(navigation.countryIso3);
      setNavigationNotice('');
      setComparisonIso3s(navigation.comparisonIso3s);
      setViewState(navigation.view);
      if (navigation.countryIso3 !== null) {
        setFilters((current) => ({
          ...current,
          metricType: metricForDestination(
            navigation.countryIso3 ?? '',
            current.metricType,
            current.purpose,
          ),
          year: null,
          comparisonGroupId: null,
        }));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      filters,
      coverageMetric,
      selectedCountryIso3,
      comparisonIso3s,
      view,
      navigationNotice,
      selectCountry,
      clearSelection,
      setView,
      openComparison,
      closeComparison,
      reconcileCatalog,
      selectCoverageMetric,
      selectPurpose,
      replaceFilters,
    }),
    [
      clearSelection,
      closeComparison,
      comparisonIso3s,
      coverageMetric,
      filters,
      openComparison,
      navigationNotice,
      reconcileCatalog,
      replaceFilters,
      selectCoverageMetric,
      selectPurpose,
      selectCountry,
      selectedCountryIso3,
      setView,
      view,
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
