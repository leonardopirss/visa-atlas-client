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

test('troca para estudo e exibe a série oficial europeia isolada de trabalho', async ({
  page,
}) => {
  const studyRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('purpose=STUDY')) {
      studyRequests.push(request.url());
    }
  });

  await page.goto('/?view=list');
  await page
    .getByRole('combobox', { name: 'Finalidade' })
    .selectOption('STUDY');
  await expect(page.getByText('Dados publicados para 2025')).toBeVisible();
  await page.getByRole('button', { name: 'Espanha ESP' }).click();

  await expect(
    page.getByText('Primeiras autorizações de residência por educação'),
  ).toBeVisible();
  await expect(page.locator('.metric-value').first()).toContainText('24');
  await page.getByRole('tab', { name: 'Histórico' }).click();
  await expect(
    page.getByRole('img', {
      name: 'Série histórica com 2 valores disponíveis',
    }),
  ).toBeVisible();
  await page.locator('[aria-label^="2024:"]').hover();
  await expect(page.getByRole('tooltip')).toContainText('18 PER');
  await expect(page.getByRole('tooltip').locator('text').last()).toHaveCSS(
    'fill',
    'rgb(255, 255, 255)',
  );
  expect(studyRequests.length).toBeGreaterThanOrEqual(3);
});

test('exibe estudo no Reino Unido e Canadá com métricas semanticamente corretas', async ({
  page,
}) => {
  await page.goto('/?view=list');
  await page
    .getByRole('combobox', { name: 'Finalidade' })
    .selectOption('STUDY');

  await page.getByRole('button', { name: 'Reino Unido GBR' }).click();
  await expect(
    page.getByText('Solicitações de visto de estudo recebidas'),
  ).toBeVisible();
  await expect(page.locator('.metric-value').first()).toContainText('60');
  await expect(
    page.getByText(/solicitações recebidas não equivalem a vistos concedidos/i),
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Canadá CAN' }).click();
  await expect(
    page.getByText('Titulares de permissão de estudo válida'),
  ).toBeVisible();
  await expect(page.locator('.metric-value').first()).toContainText('12.775');
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

test('salva e compara dois destinos usando respostas reais da API', async ({
  page,
}) => {
  await page.goto('/?view=list');
  await page.getByRole('button', { name: 'Espanha ESP' }).click();
  await page.getByRole('button', { name: 'Salvar destino' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Alemanha DEU' }).click();
  await page.getByRole('button', { name: 'Salvar destino' }).click();
  await page.getByLabel('Shortlist com 2 destinos').click();
  await page.getByRole('button', { name: 'Comparar destinos' }).click();

  await expect(
    page.getByRole('region', { name: 'Destinos comparáveis entre si' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alemanha' })).toBeVisible();
  await expect(page.locator('.comparison-card .metric-value')).toHaveCount(2);
});

test('separa Europa, Reino Unido e Canadá usando respostas reais da API', async ({
  page,
}) => {
  await page.goto('/?compare=ESP,GBR,CAN');

  await expect(
    page.getByRole('heading', { name: 'Contextos diferentes' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Reino Unido' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Canadá' })).toBeVisible();
  await expect(
    page.getByText('Primeiras autorizações de residência por trabalho'),
  ).toBeVisible();
  await expect(page.getByText('Vistos de trabalho emitidos')).toBeVisible();
  await expect(
    page.getByText('Titulares de permissão de trabalho válida'),
  ).toBeVisible();
});
