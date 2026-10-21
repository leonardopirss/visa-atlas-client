import type { Page } from '@playwright/test';

const countries = [
  { iso3: 'ESP', iso2: 'ES', name: 'Espanha', region: 'Europa' },
  { iso3: 'DEU', iso2: 'DE', name: 'Alemanha', region: 'Europa' },
  { iso3: 'FRA', iso2: 'FR', name: 'França', region: 'Europa' },
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
      const data = countries.filter((country) =>
        country.name.toLocaleLowerCase('pt-BR').includes(term),
      );
      await route.fulfill({
        json: { data, page: 1, pageSize: 100, total: data.length },
      });
      return;
    }
    if (path === '/api/v1/stats/map') {
      await route.fulfill({
        json: {
          citizenship: 'BRA',
          purpose: 'WORK',
          year: 2025,
          legendLabel: 'Primeiras autorizações',
          countries: countries.map((country) => ({
            iso3: country.iso3,
            statistic,
          })),
        },
      });
      return;
    }
    const timeseriesMatch = path.match(
      /^\/api\/v1\/countries\/([A-Z]{3})\/timeseries$/,
    );
    if (timeseriesMatch !== null) {
      await route.fulfill({
        json: {
          iso3: timeseriesMatch[1],
          citizenship: 'BRA',
          purpose: 'WORK',
          metricType: statistic.metricType,
          comparisonGroupId: statistic.comparisonGroupId,
          points: [
            {
              year: 2024,
              statistic: { ...statistic, value: 7, period: '2024' },
            },
            { year: 2025, statistic },
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
      const countryStatistic =
        detailMatch[1] === 'FRA'
          ? { ...statistic, value: null, dataStatus: 'UNAVAILABLE' }
          : statistic;
      await route.fulfill({
        json: {
          country,
          statistics: countryStatistic,
          classifications: [],
          visaPrograms: [],
          sources: detailMatch[1] === 'FRA' ? [] : [statistic.source],
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
