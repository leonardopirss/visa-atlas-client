import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  allCountriesQueryOptions,
  mapStatisticsQueryOptions,
} from '../../services/api/queries';
import type { FilterState } from '../../services/api/types';
import { deriveCoverage } from './coverage';

export function useCoverage(filters: FilterState) {
  const catalog = useQuery(allCountriesQueryOptions());
  const statistics = useQuery(mapStatisticsQueryOptions(filters));
  const summary = useMemo(
    () =>
      deriveCoverage(catalog.data ?? [], [
        { data: statistics.data, failed: statistics.isError },
      ]),
    [catalog.data, statistics.data, statistics.isError],
  );

  return {
    catalog,
    statistics: {
      isPending: statistics.isPending,
      isError: statistics.isError,
      hasError: statistics.isError,
    },
    summary,
  };
}
