import type {
  CountriesResponse,
  Country,
  CountryDetail,
  FilterDefaults,
  MapStatisticsResponse,
  TimeseriesResponse,
} from '@visa-atlas/contracts';
import type {
  CountriesQuery,
  CountryQuery,
  FilterState,
  TimeseriesQuery,
} from './types';
import {
  parseApiError,
  parseCountries,
  parseCountryDetail,
  parseFilterDefaults,
  parseMapStatistics,
  parseTimeseries,
} from './validation';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(
  /\/$/,
  '',
);

export class VisaAtlasApiError extends Error {
  readonly code: string;
  readonly correlationId: string | null;
  readonly status: number;

  constructor(
    message: string,
    status: number,
    code: string,
    correlationId: string | null,
  ) {
    super(message);
    this.name = 'VisaAtlasApiError';
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
  }
}

function appendFilters(params: URLSearchParams, filters: FilterState): void {
  params.set('citizenship', filters.citizenship);
  params.set('purpose', filters.purpose);
  params.set('metricType', filters.metricType);
  if (filters.year !== null) params.set('year', String(filters.year));
  if (filters.comparisonGroupId !== null) {
    params.set('comparisonGroupId', filters.comparisonGroupId);
  }
}

async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    ...(signal === undefined ? {} : { signal }),
  });
  const value: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = parseApiError(value);
    throw new VisaAtlasApiError(
      apiError?.message ?? 'Não foi possível concluir a consulta.',
      response.status,
      apiError?.code ?? 'UNEXPECTED_RESPONSE',
      apiError?.correlationId ?? null,
    );
  }
  return value;
}

export async function getFilterDefaults(
  signal?: AbortSignal,
): Promise<FilterDefaults> {
  return parseFilterDefaults(await request('/filters/defaults', signal));
}

export async function listCountries(
  query: CountriesQuery,
  signal?: AbortSignal,
): Promise<CountriesResponse> {
  const params = new URLSearchParams();
  if (query.search !== undefined && query.search.trim() !== '') {
    params.set('search', query.search.trim());
  }
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.pageSize !== undefined)
    params.set('pageSize', String(query.pageSize));
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return parseCountries(await request(`/countries${suffix}`, signal));
}

export async function listAllCountries(
  signal?: AbortSignal,
): Promise<Country[]> {
  const pageSize = 100;
  const firstPage = await listCountries({ page: 1, pageSize }, signal);
  const countries = [...firstPage.data];
  const totalPages = Math.ceil(firstPage.total / pageSize);

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await listCountries({ page, pageSize }, signal);
    countries.push(...response.data);
  }

  return countries;
}

export async function getMapStatistics(
  filters: FilterState,
  signal?: AbortSignal,
): Promise<MapStatisticsResponse> {
  const params = new URLSearchParams();
  appendFilters(params, filters);
  return parseMapStatistics(
    await request(`/stats/map?${params.toString()}`, signal),
  );
}

export async function getCountryDetail(
  query: CountryQuery,
  signal?: AbortSignal,
): Promise<CountryDetail> {
  const params = new URLSearchParams();
  appendFilters(params, query);
  return parseCountryDetail(
    await request(
      `/countries/${encodeURIComponent(query.iso3)}?${params.toString()}`,
      signal,
    ),
  );
}

export async function getCountryTimeseries(
  query: TimeseriesQuery,
  signal?: AbortSignal,
): Promise<TimeseriesResponse> {
  const params = new URLSearchParams();
  appendFilters(params, { ...query, year: null, comparisonGroupId: null });
  if (query.fromYear !== undefined)
    params.set('fromYear', String(query.fromYear));
  if (query.toYear !== undefined) params.set('toYear', String(query.toYear));
  return parseTimeseries(
    await request(
      `/countries/${encodeURIComponent(query.iso3)}/timeseries?${params.toString()}`,
      signal,
    ),
  );
}
