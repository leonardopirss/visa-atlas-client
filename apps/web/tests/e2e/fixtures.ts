import type { Page } from '@playwright/test';

const countries = [
  { iso3: 'ESP', iso2: 'ES', name: 'Espanha', region: 'Europa' },
  { iso3: 'DEU', iso2: 'DE', name: 'Alemanha', region: 'Europa' },
  { iso3: 'FRA', iso2: 'FR', name: 'França', region: 'Europa' },
  { iso3: 'CAN', iso2: 'CA', name: 'Canadá', region: 'Américas' },
];

const statistic = {
  metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
  value: 11,
  dataStatus: 'AVAILABLE',
  freshness: 'CURRENT',
  unit: 'pessoas',
  period: '2025',
  comparisonGroupId: 'eu-work-first-permits',
  source: {
    organization: 'Eurostat',
    datasetCode: 'migr_resfirst',
    releaseId: 'synthetic-e2e-release',
    url: 'https://ec.europa.eu/eurostat/',
    methodologyUrl:
      'https://ec.europa.eu/eurostat/cache/metadata/en/migr_res_esms.htm',
  },
};

const canadaStatistic = {
  ...statistic,
  metricType: 'VALID_PERMIT_HOLDERS',
  value: 15_655,
  period: '2024',
  comparisonGroupId: 'ircc-canada-imp-year-end',
  source: {
    ...statistic.source,
    organization: 'Immigration, Refugees and Citizenship Canada',
    datasetCode: 'canada-imp-year-end',
  },
};

function statisticForMetric(metricType: string | null, iso3: string) {
  if (metricType === 'VALID_PERMIT_HOLDERS' && iso3 === 'CAN') {
    return canadaStatistic;
  }
  if (
    metricType === 'FIRST_RESIDENCE_PERMITS_GRANTED' &&
    (iso3 === 'ESP' || iso3 === 'DEU')
  ) {
    return statistic;
  }
  return {
    ...(metricType === 'VALID_PERMIT_HOLDERS' ? canadaStatistic : statistic),
    value: null,
    dataStatus: 'UNAVAILABLE',
    source: null,
  };
}

export async function installSyntheticApi(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === '/api/v1/filters/defaults') {
      await route.fulfill({
        json: {
          citizenship: 'BRA',
          purpose: 'WORK',
          year: 2025,
          metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
          comparisonGroupId: 'eu-work-first-permits',
          dataAvailable: true,
        },
      });
      return;
    }
    if (path === '/api/v1/countries') {
      const term = (url.searchParams.get('search') ?? '').toLocaleLowerCase(
        'pt-BR',
      );
      const filtered = countries.filter((country) =>
        country.name.toLocaleLowerCase('pt-BR').includes(term),
      );
      const pageNumber = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const data = filtered.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize,
      );
      await route.fulfill({
        json: {
          data,
          page: pageNumber,
          pageSize,
          total: filtered.length,
        },
      });
      return;
    }
    if (path === '/api/v1/stats/map') {
      const metricType = url.searchParams.get('metricType');
      await route.fulfill({
        json: {
          citizenship: 'BRA',
          purpose: 'WORK',
          year: metricType === 'VALID_PERMIT_HOLDERS' ? 2024 : 2025,
          legendLabel:
            metricType === 'VALID_PERMIT_HOLDERS'
              ? 'Titulares de permissão'
              : 'Primeiras autorizações',
          countries: countries.map((country) => ({
            iso3: country.iso3,
            statistic: statisticForMetric(metricType, country.iso3),
          })),
        },
      });
      return;
    }
    const timeseriesMatch = path.match(
      /^\/api\/v1\/countries\/([A-Z]{3})\/timeseries$/,
    );
    if (timeseriesMatch !== null) {
      const timeseriesStatistic = statisticForMetric(
        url.searchParams.get('metricType'),
        timeseriesMatch[1] ?? '',
      );
      await route.fulfill({
        json: {
          iso3: timeseriesMatch[1],
          citizenship: 'BRA',
          purpose: 'WORK',
          metricType: timeseriesStatistic.metricType,
          comparisonGroupId: timeseriesStatistic.comparisonGroupId,
          points: [
            {
              year: 2024,
              statistic: timeseriesStatistic,
            },
          ],
        },
      });
      return;
    }
    const detailMatch = path.match(/^\/api\/v1\/countries\/([A-Z]{3})$/);
    if (detailMatch !== null) {
      const country = countries.find(
        (candidate) => candidate.iso3 === detailMatch[1],
      );
      const countryStatistic = statisticForMetric(
        url.searchParams.get('metricType'),
        detailMatch[1] ?? '',
      );
      await route.fulfill({
        json: {
          country,
          statistics: countryStatistic,
          classifications: [],
          visaPrograms: [],
          sources:
            countryStatistic.source === null ? [] : [countryStatistic.source],
        },
      });
      return;
    }
    await route.fulfill({
      status: 404,
      json: { code: 'NOT_FOUND', message: 'Not found', correlationId: 'e2e' },
    });
  });
}
