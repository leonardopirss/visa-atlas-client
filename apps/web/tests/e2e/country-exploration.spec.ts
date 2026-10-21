import { expect, test } from '@playwright/test';
import { installSyntheticApi } from './fixtures';

test.beforeEach(async ({ page }) => {
  await installSyntheticApi(page);
});

test('seleciona, troca e limpa o país mantendo filtros', async ({ page }) => {
  await page.goto('/?view=list');
  await expect(page.getByText('Dados publicados para 2025')).toBeVisible();
  await page.getByRole('button', { name: 'Espanha ESP' }).click();
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeHidden();
  await expect(page.getByText('Dados publicados para 2025')).toBeVisible();
  await page.getByRole('button', { name: 'Alemanha DEU' }).click();
  await expect(page.getByRole('heading', { name: 'Alemanha' })).toBeVisible();
});

test('seleção pela busca atualiza o ISO3 único do globo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const search = page.getByRole('combobox', {
    name: 'Buscar país de destino',
  });
  await search.fill('França');
  await page.getByRole('option', { name: 'França FRA' }).click();
  await expect(page.locator('.globe-map')).toHaveAttribute(
    'data-selected-iso3',
    'FRA',
  );
  await expect(page.getByRole('heading', { name: 'França' })).toBeVisible();
  await expect(
    page.getByText('Sem dado disponível para este recorte'),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.globe-map')).toHaveAttribute(
    'data-selected-iso3',
    '',
  );
});

test('ignora resposta atrasada depois de uma troca rápida de país', async ({
  page,
}) => {
  let markDelayedRequestHandled: () => void = () => undefined;
  const delayedRequestHandled = new Promise<void>((resolve) => {
    markDelayedRequestHandled = resolve;
  });
  await page.route('**/api/v1/countries/ESP**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      json: {
        country: {
          iso3: 'ESP',
          iso2: 'ES',
          name: 'Espanha',
          region: 'Europa',
        },
        statistics: {
          metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
          value: 11,
          dataStatus: 'AVAILABLE',
          freshness: 'CURRENT',
          unit: 'pessoas',
          period: '2025',
          comparisonGroupId: 'eu-work-first-permits',
          source: null,
        },
        classifications: [],
        visaPrograms: [],
        sources: [],
      },
    });
    markDelayedRequestHandled();
  });
  await page.goto('/?view=list');
  await page.getByRole('button', { name: 'Espanha ESP' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Alemanha DEU' }).click();
  await expect(page.getByRole('heading', { name: 'Alemanha' })).toBeVisible();
  await delayedRequestHandled;
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeHidden();
});

test('histórico é lazy e o painel responde ao viewport', async ({
  page,
  isMobile,
}) => {
  let timeseriesRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/timeseries')) timeseriesRequests += 1;
  });
  await page.goto('/?view=list');
  await page.getByRole('button', { name: 'Espanha ESP' }).click();
  const dialog = page.getByRole('dialog', { name: 'Detalhes de Espanha' });
  await expect(dialog).toBeVisible();
  if (isMobile) {
    await expect(
      page.getByRole('button', { name: 'Fechar detalhes e retornar ao globo' }),
    ).toBeFocused();
  }
  expect(timeseriesRequests).toBe(0);
  await page.getByRole('tab', { name: 'Histórico' }).click();
  await expect(
    page.getByRole('img', { name: /Série histórica/ }),
  ).toBeVisible();
  expect(timeseriesRequests).toBeGreaterThan(0);
  if (isMobile) {
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (box !== null && viewport !== null) {
      expect(Math.round(box.y + box.height)).toBe(viewport.height);
    }
  }
});
