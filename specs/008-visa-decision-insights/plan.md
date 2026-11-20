# Implementation Plan: Indicadores de decisão e requisitos — frontend

**Feature:** `008-visa-decision-insights` · **Data:** 2026-11-16

O plano integrado está em
`../../../visa-atlas-server/specs/008-visa-decision-insights/plan.md`.

## Frontend slices

1. Atualizar contrato gerado, validação, fixtures e query keys.
2. Exibir taxas em basis points como percentual com fórmula e operandos.
3. Distinguir prazo-alvo vigente e inventário estatístico por texto, unidade,
   scope e arredondamento; mediana/P90 ficam fora da v1 sem fonte admitida.
4. Exibir requisitos tipados, vigência, condição e link oficial seguro.
5. Estender histórico/comparação apenas para grupos semanticamente compatíveis.
6. Validar desktop/mobile/acessibilidade e Playwright contra backend real.

## Gates

- Contrato aprovado e sincronizado antes de implementação.
- Dados nacionais nunca rotulados como cidadania brasileira.
- Ausência nunca convertida em zero, `NO` ou estimativa.
- Sem conversão de moeda, ranking, score ou recomendação.
- E2E real obrigatório para concluir cada slice integrado.
