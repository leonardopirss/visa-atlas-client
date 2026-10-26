import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import type { MetricType } from '@visa-atlas/contracts';
import {
  allCountriesQueryOptions,
  mapStatisticsQueryOptions,
} from '../../services/api/queries';
import type { FilterState } from '../../services/api/types';
import { deriveCoverage } from './coverage';

const COVERAGE_METRICS: readonly MetricType[] = [
  'FIRST_RESIDENCE_PERMITS_GRANTED',
  'WORK_VISAS_ISSUED',
  'VALID_PERMIT_HOLDERS',
];

export function useCoverage(filters: FilterState) {
  const catalog = useQuery(allCountriesQueryOptions());
  const statisticQueries = useQueries({
    queries: COVERAGE_METRICS.map((metricType) =>
      mapStatisticsQueryOptions({
        ...filters,
        metricType,
        year: null,
        comparisonGroupId: null,
      }),
    ),
  });
  const summary = useMemo(
    () =>
      deriveCoverage(
        catalog.data ?? [],
        statisticQueries.map((query) => ({
          data: query.data,
          failed: query.isError,
        })),
      ),
    [catalog.data, statisticQueries],
  );

  const statistics = {
    isPending: statisticQueries.some((query) => query.isPending),
    isError: statisticQueries.every((query) => query.isError),
    hasError: statisticQueries.some((query) => query.isError),
  };

  return { catalog, statistics, summary };
}
