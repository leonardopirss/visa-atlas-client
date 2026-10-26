import { queryOptions } from '@tanstack/react-query';
import {
  getCountryDetail,
  getCountryTimeseries,
  getFilterDefaults,
  getMapStatistics,
  listAllCountries,
  listCountries,
} from './client';
import type {
  CountriesQuery,
  CountryQuery,
  FilterState,
  TimeseriesQuery,
} from './types';

export const apiQueryKeys = {
  defaults: ['filters', 'defaults'] as const,
  allCountries: ['countries', 'all'] as const,
  countries: (query: CountriesQuery) => ['countries', query] as const,
  map: (filters: FilterState) => ['stats', 'map', filters] as const,
  detail: (query: CountryQuery) => ['countries', 'detail', query] as const,
  timeseries: (query: TimeseriesQuery) =>
    ['countries', 'timeseries', query] as const,
};

export const defaultsQueryOptions = () =>
  queryOptions({
    queryKey: apiQueryKeys.defaults,
    queryFn: ({ signal }) => getFilterDefaults(signal),
    staleTime: 5 * 60_000,
  });

export const countriesQueryOptions = (query: CountriesQuery) =>
  queryOptions({
    queryKey: apiQueryKeys.countries(query),
    queryFn: ({ signal }) => listCountries(query, signal),
    staleTime: 60_000,
  });

export const allCountriesQueryOptions = () =>
  queryOptions({
    queryKey: apiQueryKeys.allCountries,
    queryFn: ({ signal }) => listAllCountries(signal),
    staleTime: 5 * 60_000,
  });

export const mapStatisticsQueryOptions = (filters: FilterState) =>
  queryOptions({
    queryKey: apiQueryKeys.map(filters),
    queryFn: ({ signal }) => getMapStatistics(filters, signal),
    staleTime: 60_000,
  });

export const countryDetailQueryOptions = (query: CountryQuery) =>
  queryOptions({
    queryKey: apiQueryKeys.detail(query),
    queryFn: ({ signal }) => getCountryDetail(query, signal),
    staleTime: 60_000,
  });

export const timeseriesQueryOptions = (query: TimeseriesQuery) =>
  queryOptions({
    queryKey: apiQueryKeys.timeseries(query),
    queryFn: ({ signal }) => getCountryTimeseries(query, signal),
    staleTime: 5 * 60_000,
  });
