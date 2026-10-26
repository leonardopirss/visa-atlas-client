import { expect, test } from '@playwright/test';
import { installSyntheticApi } from './fixtures';

test.beforeEach(async ({ page }) => {
  await installSyntheticApi(page);
});

test('expõe legenda, badges e filtro de países com dados', async ({ page }) => {
  await page.goto('/?view=list');

  await expect(page.getByText('Com dados (3)')).toBeVisible();
  await expect(page.getByText('Sem dados (1)')).toBeVisible();
  await expect(page.getByText('Ainda sem dados')).toBeVisible();

  await page
    .getByRole('checkbox', { name: 'Somente com dados' })
    .last()
    .check();
  await expect(page.getByRole('button', { name: /Espanha ESP/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /França FRA/ })).toBeHidden();
});

test('preserva a cobertura de Europa e Canadá ao alternar a seleção', async ({
  page,
}) => {
  await page.goto('/?view=list');

  const spain = page.getByRole('button', { name: /Espanha ESP/ });
  const canada = page.getByRole('button', { name: /Canadá CAN/ });
  await expect(spain).toContainText('Dados disponíveis');
  await expect(canada).toContainText('Dados disponíveis');

  await spain.click();
  await expect(
    page.getByRole('dialog', { name: 'Detalhes de Espanha' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Fechar detalhes e retornar ao globo' })
    .click();
  await canada.click();
  await expect(
    page.getByRole('dialog', { name: 'Detalhes de Canadá' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Fechar detalhes e retornar ao globo' })
    .click();

  await expect(spain).toContainText('Dados disponíveis');
  await expect(canada).toContainText('Dados disponíveis');
  await expect(page.getByText('Com dados (3)')).toBeVisible();
});

test('explica ausência legítima sem oferecer retry de rede', async ({
  page,
}) => {
  await page.goto('/?view=list');
  await page.getByRole('button', { name: /França FRA/ }).click();

  const dialog = page.getByRole('dialog', { name: 'Detalhes de França' });
  await expect(
    dialog.getByRole('heading', {
      name: 'País disponível, dado ainda não publicado',
    }),
  ).toBeVisible();
  await expect(dialog.getByText(/volume administrativo/)).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Tentar novamente' }),
  ).toHaveCount(0);
});

test('mantém catálogo e seleção por teclado quando a cobertura falha', async ({
  page,
}) => {
  await page.route('**/api/v1/stats/map**', (route) =>
    route.fulfill({
      status: 503,
      json: {
        code: 'SOURCE_UNAVAILABLE',
        message: 'Fonte indisponível',
        correlationId: 'coverage-e2e',
      },
    }),
  );
  await page.goto('/?view=list');

  await expect(
    page.getByText('Cobertura não confirmada; o catálogo continua disponível.'),
  ).toBeVisible();
  const france = page.getByRole('button', { name: /França FRA/ });
  await france.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'França' })).toBeVisible();
});

test('fallback sem WebGL preserva busca e seleção por toque', async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Escolha um país' }),
  ).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Buscar país' });
  await search.fill('Alemanha');
  const germany = page.getByRole('button', { name: /Alemanha DEU/ });
  if (isMobile) await germany.tap();
  else await germany.click();
  await expect(page.getByRole('heading', { name: 'Alemanha' })).toBeVisible();
});

test('tooltip do globo comunica país e disponibilidade e recebe foco', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'hover não se aplica');
  await page.goto('/');
  const canvas = page.locator('.maplibregl-canvas');
  await expect(canvas).toBeVisible();
  const tooltip = page.locator('.map-tooltip');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box === null) return;
  for (let y = box.height * 0.2; y < box.height * 0.75; y += 60) {
    for (let x = box.width * 0.22; x < box.width * 0.78; x += 70) {
      await canvas.hover({ position: { x, y } });
      if ((await tooltip.count()) > 0) break;
    }
    if ((await tooltip.count()) > 0) break;
  }
  await expect(tooltip).toBeVisible();
  await tooltip.focus();
  await expect(tooltip).toBeFocused();
  await expect(tooltip).toContainText(
    /Dados disponíveis|Ainda sem dados|Cobertura não confirmada/,
  );
});

test('carrega nomes localizados sem interferir na seleção do país', async ({
  page,
}) => {
  await page.goto('/');
  const map = page.getByLabel(
    'Globo interativo com nomes localizados dos países. Arraste para girar, use os controles para ampliar e clique em um país. A busca oferece navegação por teclado.',
  );
  await expect(map).toHaveAttribute('data-labels-ready', 'true');

  const search = page.getByRole('combobox', {
    name: 'Buscar país de destino',
  });
  await search.fill('Espanha');
  await page.getByRole('option', { name: 'Espanha ESP' }).click();
  await expect(map).toHaveAttribute('data-selected-iso3', 'ESP');
});
