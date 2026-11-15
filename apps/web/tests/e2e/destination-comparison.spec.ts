import { expect, test } from '@playwright/test';
import { installSyntheticApi } from './fixtures';

test.beforeEach(async ({ page }) => {
  await installSyntheticApi(page);
});

test('salva, persiste e compara dois destinos compatíveis', async ({
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
  await expect(page).toHaveURL(/compare=ESP(?:%2C|,)DEU/);
  await expect(
    page.getByRole('region', { name: 'Destinos comparáveis entre si' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alemanha' })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/country=DEU/);
  await expect(page.getByRole('heading', { name: 'Alemanha' })).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole('region', { name: 'Destinos comparáveis entre si' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Voltar à exploração' }).click();
  await expect(page.getByLabel('Shortlist com 2 destinos')).toBeFocused();
  await page.getByLabel('Shortlist com 2 destinos').click();
  await page.getByRole('button', { name: 'Comparar destinos' }).click();

  await page.reload();
  await expect(page.getByLabel('Shortlist com 2 destinos')).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Destinos comparáveis entre si' }),
  ).toBeVisible();
});

test('remove ISO3 desconhecido e canonicaliza a URL', async ({ page }) => {
  await page.goto('/?compare=ESP,ZZZ,CAN');
  await expect(
    page.getByText('Um destino inválido ou desconhecido foi ignorado.'),
  ).toBeVisible();
  await expect(page).toHaveURL(/compare=ESP(?:%2C|,)CAN$/);
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Canadá' })).toBeVisible();
  await expect(page.getByText('ZZZ:error')).toHaveCount(0);
});

test('remove país desconhecido da URL de detalhe', async ({ page }) => {
  await page.goto('/?country=ZZZ&view=list');
  await expect(
    page.getByText('Um destino inválido ou desconhecido foi ignorado.'),
  ).toBeVisible();
  await expect(page).toHaveURL(/\?view=list$/);
  await expect(page.getByText('Não foi possível carregar o país')).toHaveCount(
    0,
  );
});

test('compartilha uma URL canônica da comparação', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: (data: ShareData) => {
        sessionStorage.setItem('shared-url', data.url ?? '');
        return Promise.resolve();
      },
    });
  });
  await page.goto('/?compare=ESP,CAN&utm_source=synthetic');
  await page.getByRole('button', { name: 'Compartilhar' }).click();
  await expect(page.getByText('Comparação compartilhada.')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('shared-url'))).toBe(
    'http://127.0.0.1:4173/?compare=ESP,CAN',
  );
});

test('URL compartilhada não grava shortlist e separa métricas', async ({
  page,
}) => {
  await page.goto('/?compare=ESP,CAN');
  await expect(
    page.getByRole('heading', { name: 'Contextos diferentes' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Canadá' })).toBeVisible();
  await expect(page.getByLabel('Shortlist com 0 destinos')).toBeVisible();
  await expect(page.getByText(/ranking ou probabilidade/)).toBeVisible();
});

test('continua utilizável quando o navegador bloqueia storage', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/?view=list');
  await page.getByRole('button', { name: 'Espanha ESP' }).click();
  await page.getByRole('button', { name: 'Salvar destino' }).click();
  await page.getByLabel('Shortlist com 1 destinos').click();
  await expect(
    page.getByText(/A shortlist vale apenas nesta sessão/),
  ).toBeVisible();
  await expect(
    page.locator('.shortlist-menu').getByText('Espanha', { exact: true }),
  ).toBeVisible();
});

test('permite salvar um destino somente com teclado', async ({ page }) => {
  await page.goto('/?view=list');
  const spain = page.getByRole('button', { name: 'Espanha ESP' });
  await spain.focus();
  await page.keyboard.press('Enter');
  const save = page.getByRole('button', { name: 'Salvar destino' });
  await save.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Shortlist com 1 destinos')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Remover da shortlist' }),
  ).toBeFocused();
});

test('mantém semântica e conteúdo com reduced motion e sem WebGL', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/?compare=ESP,CAN');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Comparar destinos' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Contextos diferentes' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'Espanha' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'Canadá' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Compartilhar' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Voltar à exploração' }),
  ).toBeVisible();
  const accessibilityTree = await page
    .locator('.comparison-view')
    .ariaSnapshot();
  expect(accessibilityTree).toContain('Comparar destinos');
  expect(accessibilityTree).toContain('Contextos diferentes');
  expect(accessibilityTree).toContain('Espanha');
  expect(accessibilityTree).toContain('Canadá');
  await expect(page.locator('.globe-map')).toHaveCount(0);
});

test('limita chamadas, reutiliza cache e mantém layout com três destinos', async ({
  page,
}) => {
  const detailRequests: string[] = [];
  const successfulDetails: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (/^\/api\/v1\/countries\/[A-Z]{3}$/.test(path)) {
      detailRequests.push(path);
    }
  });
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname;
    if (response.ok() && /^\/api\/v1\/countries\/[A-Z]{3}$/.test(path)) {
      successfulDetails.push(path);
    }
  });

  await page.goto('/?compare=ESP,DEU,CAN');
  await expect(page.getByRole('heading', { name: 'Espanha' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alemanha' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Canadá' })).toBeVisible();
  await expect
    .poll(() => [...new Set(successfulDetails)].sort())
    .toEqual([
      '/api/v1/countries/CAN',
      '/api/v1/countries/DEU',
      '/api/v1/countries/ESP',
    ]);
  expect(detailRequests.length).toBeLessThanOrEqual(6);
  const attemptsBeforeReopen = detailRequests.length;

  const layoutFits = await page
    .locator('.comparison-view')
    .evaluate((element) => element.scrollWidth <= element.clientWidth);
  expect(layoutFits).toBe(true);

  await page.getByRole('button', { name: 'Voltar à exploração' }).click();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Canadá' })).toBeVisible();
  expect(detailRequests).toHaveLength(attemptsBeforeReopen);
});
