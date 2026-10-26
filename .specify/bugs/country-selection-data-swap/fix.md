# Bug Fix: Cobertura simultânea de Europa e Canadá

- **Slug**: country-selection-data-swap
- **Fixed**: 2026-10-26T01:03:00-03:00
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

A descoberta de cobertura deixou de depender do indicador do último país
selecionado. O frontend consulta os três indicadores oficiais, combina somente
a presença de observações e mantém a métrica específica do destino no painel.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `apps/web/src/features/coverage/use-coverage.ts` | modified | Executa consultas cacheáveis para Europa, Reino Unido e Canadá sem herdar ano/grupo da fonte anterior. |
| `apps/web/src/features/coverage/coverage.ts` | modified | Combina respostas com precedência para dado disponível e preserva erro parcial como cobertura desconhecida. |
| `apps/web/src/app/app.tsx` | modified | Diferencia falha total de erro parcial ao alimentar mapa e legenda. |
| `apps/web/src/features/coverage/__tests__/coverage.test.ts` | updated test | Cobre união Europa/Canadá e falha parcial. |
| `apps/web/tests/e2e/fixtures.ts` | modified | Modela indicadores europeus e canadenses separadamente na API sintética. |
| `apps/web/tests/e2e/global-coverage.spec.ts` | updated test | Reproduz a alternância Espanha → Canadá em desktop e mobile. |
| `apps/web/tests/real-e2e/official-api-integration.spec.ts` | updated test | Confirma com backend e PostgreSQL reais que Espanha e Canadá continuam disponíveis após selecionar o Canadá. |

## Diff Highlights

- A cobertura usa `FIRST_RESIDENCE_PERMITS_GRANTED`, `WORK_VISAS_ISSUED` e
  `VALID_PERMIT_HOLDERS` como consultas independentes.
- Um destino é `AVAILABLE` quando qualquer fonte oficial confirma uma
  observação; valores e grupos de comparação nunca são agregados.
- Sem observação confirmada, uma falha parcial produz `UNKNOWN_ERROR`, não
  `UNAVAILABLE`.

## Tests Added or Updated

- `coverage.test.ts` — mantém Espanha e Canadá disponíveis em respostas de
  indicadores diferentes.
- `coverage.test.ts` — dado confirmado prevalece sobre falha parcial; destino
  não confirmado permanece desconhecido.
- `global-coverage.spec.ts` — alterna Espanha/Canadá e verifica os badges e a
  legenda em desktop e mobile.
- `official-api-integration.spec.ts` — executa a regressão contra dados oficiais
  publicados no backend real de teste.

## Local Verification

- `npm run format:check` → passou.
- `npm run lint` → passou, zero warnings.
- `npm run typecheck` → passou.
- `npm test` → 6 arquivos e 19 testes passaram.
- `npm run build` → passou; permaneceu apenas o aviso conhecido de chunk do
  MapLibre acima de 500 kB.
- `npm run test:e2e -- tests/e2e/global-coverage.spec.ts` → 13 passaram e 1
  skip esperado para hover em mobile.
- `npm run test:e2e:official` → 2 passaram contra API e PostgreSQL reais.

## Deviations from Assessment

- `apps/web/src/app/app.tsx` foi incluído para distinguir erro parcial de falha
  total ao exibir a legenda e a cor neutra do mapa.
- `apps/web/tests/real-e2e/official-api-integration.spec.ts` foi incluído para
  cumprir a validação obrigatória contra o backend real, não apenas a fixture
  Playwright.

## Follow-ups

- Monitorar o custo das três chamadas cacheáveis a `/stats/map`. Um endpoint
  adicional não é necessário no volume atual e continuaria fora do contrato de
  cinco rotas.
