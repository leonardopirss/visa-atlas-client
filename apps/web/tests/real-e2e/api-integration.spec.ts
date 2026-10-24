import { expect, test } from '@playwright/test';

test('integra os cinco endpoints reais e preserva zero e supressão', async ({
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
  await expect(page.getByText('Dados publicados para 2025')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Espanha ESP' })).toBeVisible();

  await page.getByRole('button', { name: 'Espanha ESP' }).click();
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(page.locator('.metric-value').first()).toContainText('42');
  await page.getByRole('tab', { name: 'Modalidades' }).click();
  await expect(
    page.getByText('Programa oficial verificado para teste'),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Histórico' }).click();
  await expect(
    page.getByRole('img', {
      name: 'Série histórica com 1 valores disponíveis',
    }),
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Alemanha DEU' }).click();
  await expect(page.locator('.metric-value').first()).toContainText(/^0/);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'França FRA' }).click();
  await expect(
    page.getByText('Valor suprimido pela fonte oficial'),
  ).toBeVisible();

  await expect
    .poll(() => [...successfulPaths].sort())
    .toEqual([
      '/api/v1/countries',
      '/api/v1/countries/DEU',
      '/api/v1/countries/ESP',
      '/api/v1/countries/ESP/timeseries',
      '/api/v1/countries/FRA',
      '/api/v1/filters/defaults',
      '/api/v1/stats/map',
    ]);
});

test('abre país do catálogo mundial sem observação como indisponível, não como erro', async ({
  page,
}) => {
  await page.goto('/');
  const search = page.getByRole('combobox', {
    name: 'Buscar país de destino',
  });

  await search.fill('Rússia');
  await page.getByRole('option', { name: 'Rússia RUS' }).click();

  await expect(page.getByRole('heading', { name: 'Rússia' })).toBeVisible();
  await expect(
    page.getByText('Sem dado disponível para este recorte'),
  ).toBeVisible();
  await expect(page.getByText('Não foi possível carregar o país')).toBeHidden();
});
