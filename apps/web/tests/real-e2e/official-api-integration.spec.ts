import { expect, test } from '@playwright/test';

test('consome os cinco endpoints reais com a release oficial publicada', async ({
  page,
}) => {
  const successfulPaths = new Set<string>();
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith('/api/v1/') && response.ok()) {
      successfulPaths.add(url.pathname);
    }
  });

  await page.goto('/?view=list');
  await expect(page.getByText(/Dados publicados para \d{4}/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Espanha ESP' })).toBeVisible();

  await page.getByRole('button', { name: 'Espanha ESP' }).click();
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(page.locator('.metric-value').first()).not.toContainText(
    'Dado indisponível',
  );

  await page.getByRole('tab', { name: 'Fontes' }).click();
  await expect(page.getByText('Eurostat', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Histórico' }).click();
  await expect(
    page.getByRole('img', {
      name: /Série histórica com (?:[2-9]|\d{2,}) valores disponíveis/,
    }),
  ).toBeVisible();

  await expect
    .poll(() => [...successfulPaths].sort())
    .toEqual([
      '/api/v1/countries',
      '/api/v1/countries/ESP',
      '/api/v1/countries/ESP/timeseries',
      '/api/v1/filters/defaults',
      '/api/v1/stats/map',
    ]);
});
