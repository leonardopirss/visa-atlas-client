import type {
  ApiError,
  CountriesResponse,
  CountryDetail,
  FilterDefaults,
  MapStatisticsResponse,
  TimeseriesResponse,
} from '@visa-atlas/contracts';

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasString(value: JsonObject, key: string): boolean {
  return typeof value[key] === 'string';
}

function hasArray(value: JsonObject, key: string): boolean {
  return Array.isArray(value[key]);
}

function invalidPayload(endpoint: string): never {
  throw new Error(`A API retornou um payload inválido para ${endpoint}.`);
}

export function parseApiError(value: unknown): ApiError | null {
  if (
    !isObject(value) ||
    !hasString(value, 'code') ||
    !hasString(value, 'message') ||
    !hasString(value, 'correlationId')
  ) {
    return null;
  }
  return value as ApiError;
}

export function parseFilterDefaults(value: unknown): FilterDefaults {
  if (
    !isObject(value) ||
    !hasString(value, 'citizenship') ||
    value.purpose !== 'WORK' ||
    !hasString(value, 'metricType') ||
    !('year' in value) ||
    !('comparisonGroupId' in value)
  ) {
    return invalidPayload('/filters/defaults');
  }
  return value as FilterDefaults;
}

export function parseCountries(value: unknown): CountriesResponse {
  if (
    !isObject(value) ||
    !hasArray(value, 'data') ||
    typeof value.page !== 'number' ||
    typeof value.pageSize !== 'number' ||
    typeof value.total !== 'number'
  ) {
    return invalidPayload('/countries');
  }
  return value as CountriesResponse;
}

export function parseMapStatistics(value: unknown): MapStatisticsResponse {
  if (
    !isObject(value) ||
    !hasString(value, 'citizenship') ||
    value.purpose !== 'WORK' ||
    !hasArray(value, 'countries') ||
    !('year' in value)
  ) {
    return invalidPayload('/stats/map');
  }
  return value as MapStatisticsResponse;
}

export function parseCountryDetail(value: unknown): CountryDetail {
  if (
    !isObject(value) ||
    !isObject(value.country) ||
    !hasString(value.country, 'iso3') ||
    !isObject(value.statistics) ||
    !hasArray(value, 'classifications') ||
    !hasArray(value, 'visaPrograms') ||
    !hasArray(value, 'sources')
  ) {
    return invalidPayload('/countries/{iso3}');
  }
  return value as CountryDetail;
}

export function parseTimeseries(value: unknown): TimeseriesResponse {
  if (
    !isObject(value) ||
    !hasString(value, 'iso3') ||
    !hasString(value, 'citizenship') ||
    value.purpose !== 'WORK' ||
    !hasString(value, 'metricType') ||
    !hasArray(value, 'points')
  ) {
    return invalidPayload('/countries/{iso3}/timeseries');
  }
  return value as TimeseriesResponse;
}
