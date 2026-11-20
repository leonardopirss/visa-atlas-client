import { expect, test } from '@playwright/test';

test('exibe, historiza e compara taxa de decisão usando somente a API real', async ({
  page,
}) => {
  const insightRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (
      url.pathname.startsWith('/api/v1/') &&
      url.searchParams.get('metricType') === 'APPROVAL_RATE'
    ) {
      insightRequests.push(url.pathname);
    }
  });

  await page.goto('/?view=list');
  await page
    .getByRole('combobox', { name: 'Indicador estatístico' })
    .selectOption('APPROVAL_RATE');
  await expect(page.getByText(/Dados publicados para 2025/)).toBeVisible();

  await page.getByRole('button', { name: 'Reino Unido GBR' }).click();
  const detail = page.getByRole('dialog', { name: 'Detalhes de Reino Unido' });
  await expect(
    detail.getByText('Taxa derivada de decisões favoráveis'),
  ).toBeVisible();
  await expect(detail.locator('.metric-value').first()).toHaveText('75,00%');
  await expect(detail.getByText(/3 ÷ \(3 \+ 1\) × 100/i)).toBeVisible();
  await expect(
    detail.getByText(/Numerador: 3 decisões favoráveis/i),
  ).toBeVisible();
  await expect(detail.getByText(/Denominador: 4 decisões/i)).toBeVisible();
  await expect(
    detail.getByText(/não representa (?:(?:a|sua) )?chance individual/i),
  ).toBeVisible();
  await expect(
    detail.getByText(/Cidadania BRA.*uk-entry-clearance:work/i),
  ).toBeVisible();

  await detail.getByRole('tab', { name: 'Histórico' }).click();
  await expect(
    detail.getByRole('img', {
      name: /Série histórica com (?:[2-9]|\d{2,}) valores disponíveis/,
    }),
  ).toBeVisible();
  await detail.locator('[aria-label^="2025:"]').hover();
  await expect(detail.getByRole('tooltip')).toContainText('75,00%');

  await detail.getByRole('button', { name: 'Salvar destino' }).click();
  await detail
    .getByRole('button', { name: 'Fechar detalhes e retornar ao globo' })
    .click();
  await page.getByRole('button', { name: 'Canadá CAN' }).click();
  const canada = page.getByRole('dialog', { name: 'Detalhes de Canadá' });
  await expect(
    canada.getByText('Taxa indisponível para este recorte'),
  ).toBeVisible();
  await canada.getByRole('button', { name: 'Salvar destino' }).click();
  await page.getByLabel('Shortlist com 2 destinos').click();
  await page.getByRole('button', { name: 'Comparar destinos' }).click();

  const comparison = page.getByRole('region', {
    name: 'Contextos diferentes',
  });
  await expect(comparison).toBeVisible();
  await expect(
    comparison.getByRole('heading', { name: 'Reino Unido' }),
  ).toBeVisible();
  await expect(
    comparison.getByRole('heading', { name: 'Canadá' }),
  ).toBeVisible();
  await expect(
    comparison.locator('.comparison-card .metric-value'),
  ).toHaveCount(1);
  await expect(
    comparison.locator('.comparison-card .metric-value'),
  ).toContainText('%');
  await expect(
    comparison.getByText(/não representa (?:(?:a|sua) )?chance individual/i),
  ).toHaveCount(2);

  await expect
    .poll(() => new Set(insightRequests))
    .toEqual(
      new Set([
        '/api/v1/stats/map',
        '/api/v1/countries/GBR',
        '/api/v1/countries/GBR/timeseries',
        '/api/v1/countries/CAN',
      ]),
    );
});
