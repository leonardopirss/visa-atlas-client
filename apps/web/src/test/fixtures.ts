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

export const decisionRateStatistic: Statistic = {
  metricType: 'APPROVAL_RATE',
  value: 8750,
  dataStatus: 'AVAILABLE',
  freshness: 'CURRENT',
  unit: 'BASIS_POINTS',
  period: '2026',
  comparisonGroupId: 'synthetic-uk-decision-rate-2026',
  populationScope: {
    basis: 'CITIZENSHIP',
    populationKey: 'BRA',
    citizenshipIso3: 'BRA',
    programKey: 'home-office:entry-clearance:work',
    label: 'Fixture sintética · Brasil · trabalho',
  },
  derivation: {
    formula: 'APPROVAL_RATE',
    numerator: [
      {
        observationId: 'synthetic-granted',
        metricType: 'DECISIONS_GRANTED',
        value: 7,
        unit: 'COUNT',
        period: '2026',
        releaseId: 'synthetic-test-release',
        comparisonGroupId: 'synthetic-uk-decision-rate-2026',
        sourceCategoryCode: 'ISSUED',
        coefficient: 1,
      },
    ],
    denominator: [
      {
        observationId: 'synthetic-granted',
        metricType: 'DECISIONS_GRANTED',
        value: 7,
        unit: 'COUNT',
        period: '2026',
        releaseId: 'synthetic-test-release',
        comparisonGroupId: 'synthetic-uk-decision-rate-2026',
        sourceCategoryCode: 'ISSUED',
        coefficient: 1,
      },
      {
        observationId: 'synthetic-refused',
        metricType: 'DECISIONS_REFUSED',
        value: 1,
        unit: 'COUNT',
        period: '2026',
        releaseId: 'synthetic-test-release',
        comparisonGroupId: 'synthetic-uk-decision-rate-2026',
        sourceCategoryCode: 'REFUSED',
        coefficient: 1,
      },
    ],
    precision: 2,
  },
  source: {
    organization: 'Synthetic Home Office fixture',
    datasetCode: 'synthetic-vis-d02',
    releaseId: 'synthetic-test-release',
    url: 'https://example.gov.test/vis-d02',
  },
};

export const nationalPendingStatistic: Statistic = {
  metricType: 'PENDING_APPLICATIONS',
  value: 120,
  dataStatus: 'ESTIMATED',
  freshness: 'CURRENT',
  unit: 'COUNT',
  period: '2026',
  comparisonGroupId: 'synthetic-national-pending-2026',
  populationScope: {
    basis: 'NATIONAL',
    populationKey: 'ALL',
    programKey: 'ircc:study-permit',
    label: 'Fixture sintética · todos os requerentes',
  },
  measurement: { approximate: true, roundingIncrement: 5, precision: 0 },
  source: {
    organization: 'Synthetic IRCC fixture',
    datasetCode: 'synthetic-pending-applications',
    releaseId: 'synthetic-pending-release',
    url: 'https://example.gov.test/pending',
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
  populationBasis: 'CITIZENSHIP',
  programKey: 'ALL',
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
