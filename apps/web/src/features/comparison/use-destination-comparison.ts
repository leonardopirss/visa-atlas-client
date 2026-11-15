import { useQueries } from '@tanstack/react-query';
import type { CountryDetail } from '@visa-atlas/contracts';
import type { FilterState } from '../../services/api/types';
import { countryDetailQueryOptions } from '../../services/api/queries';
import { metricForDestination } from './destination-metric';

export type DestinationComparisonState =
  | { status: 'pending'; iso3: string }
  | { status: 'error'; iso3: string; retry: () => void }
  | {
      status: 'success' | 'unavailable';
      iso3: string;
      detail: CountryDetail;
    };

export function useDestinationComparison(
  iso3s: readonly string[],
  filters: FilterState,
): DestinationComparisonState[] {
  const queries = useQueries({
    queries: iso3s.map((iso3) =>
      countryDetailQueryOptions({
        iso3,
        citizenship: filters.citizenship,
        purpose: filters.purpose,
        metricType: metricForDestination(iso3, filters.metricType),
        year: null,
        comparisonGroupId: null,
      }),
    ),
  });

  return queries.map((query, index) => {
    const iso3 = iso3s[index] ?? '';
    if (query.isPending) return { status: 'pending', iso3 };
    if (query.isError || query.data.country.iso3 !== iso3) {
      return {
        status: 'error',
        iso3,
        retry: () => void query.refetch(),
      };
    }
    return {
      status: query.data.statistics.value === null ? 'unavailable' : 'success',
      iso3,
      detail: query.data,
    };
  });
}
