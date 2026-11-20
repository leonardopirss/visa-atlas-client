import type {
  MetricType,
  PopulationBasis,
  VisaPurpose,
} from '@visa-atlas/contracts';

export type FilterState = {
  citizenship: string;
  purpose: VisaPurpose;
  year: number | null;
  metricType: MetricType;
  comparisonGroupId: string | null;
  populationBasis?: PopulationBasis;
  programKey?: string;
};

export type DefaultFiltersQuery = Pick<
  FilterState,
  'citizenship' | 'purpose' | 'metricType' | 'populationBasis' | 'programKey'
>;

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
