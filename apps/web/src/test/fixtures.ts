import type {
  CountryDetail,
  Statistic,
  TimeseriesResponse,
} from '@visa-atlas/contracts';

export const availableStatistic: Statistic = {
  metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
  value: 0,
  dataStatus: 'AVAILABLE',
  freshness: 'CURRENT',
  unit: 'pessoas',
  period: '2025',
  comparisonGroupId: 'eu-work-first-permits',
  source: {
    organization: 'Eurostat',
    datasetCode: 'migr_resfirst',
    releaseId: 'synthetic-test-release',
    url: 'https://ec.europa.eu/eurostat/',
  },
};

export function countryDetailFixture(
  iso3 = 'ESP',
  name = 'Espanha',
  statistic: Statistic = availableStatistic,
): CountryDetail {
  return {
    country: { iso3, iso2: iso3.slice(0, 2), name, region: 'Europa' },
    statistics: statistic,
    classifications: [],
    visaPrograms: [],
    sources: statistic.source === null ? [] : [statistic.source],
  };
}

export const timeseriesFixture: TimeseriesResponse = {
  iso3: 'ESP',
  citizenship: 'BRA',
  purpose: 'WORK',
  metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
  comparisonGroupId: 'eu-work-first-permits',
  points: [
    {
      year: 2024,
      statistic: { ...availableStatistic, period: '2024', value: 7 },
    },
    {
      year: 2025,
      statistic: { ...availableStatistic, period: '2025', value: 11 },
    },
  ],
};
