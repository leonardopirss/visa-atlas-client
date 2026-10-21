import type { MetricType } from '@visa-atlas/contracts';

export type FilterState = {
  citizenship: string;
  purpose: 'WORK';
  year: number | null;
  metricType: MetricType;
  comparisonGroupId: string | null;
};

export type CountryQuery = FilterState & { iso3: string };

export type TimeseriesQuery = Omit<CountryQuery, 'year'> & {
  fromYear?: number;
  toYear?: number;
};

export type CountriesQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
};
