# Tasks: Frontend Globo 3D e painel por país

**Inputs:** `spec.md`, `plan.md`, OpenAPI compartilhado.
**Bloqueio:** SH-T011 antes do contrato definitivo. Até lá, mocks tipados podem adiantar layout visual.

## Phase 1 — Setup
- [x] FE-T001 [US1] Criar projeto React/Vite TypeScript strict em `apps/web/`.
- [x] FE-T002 [P] [US1] Configurar lint, prettier, Vitest, Testing Library em `apps/web/` e pipeline `.github/workflows/web.yml`.
- [x] FE-T003 [P] [US1] Instalar MapLibre GL JS, TanStack Query e estilos em `apps/web/package.json`.

## Phase 2 — Foundational
- [x] FE-T004 [US1] Importar tipos/cliente gerados de `packages/contracts` em `apps/web/src/services/api/`.
- [x] FE-T005 [US1] Adicionar dataset de fronteiras/licença com ISO3 e MultiPolygon em `packages/geo/`.
- [x] FE-T006 [P] [US1] Criar camadas base e atmosfera visual no mapa em `apps/web/src/features/globe/layers/`.
- [x] FE-T007 [US1] Centralizar filtros BRA/WORK, ano e ISO selecionado em `apps/web/src/app/`.

## Phase 3 — US1: Globo e seleção (P1)
**Independent Test:** pesquisa/seleção/escape/multipolígonos funcionam com API mockada.
- [x] FE-T008 [US1] Construir `GlobeMap` com rotação, zoom e câmera em `apps/web/src/features/globe/components/GlobeMap.tsx`.
- [x] FE-T009 [US1] Implementar expressão/camada de seleção e hover em `apps/web/src/features/globe/layers/country-selection.ts`.
- [x] FE-T010 [US1] Implementar seleção por clique, busca e teclado em `apps/web/src/features/globe/hooks/useCountrySelection.ts`.
- [x] FE-T011 [US1] Implementar cancelar `flyTo`, `prefers-reduced-motion`, Escape e retorno ao globo em `apps/web/src/features/globe/hooks/useGlobeCamera.ts`.
- [x] FE-T012 [P] [US1] Escrever testes de seleção ISO3/MultiPolygon e estado em `apps/web/src/features/globe/__tests__/`.
- [x] FE-T013 [US1] Garantir fallback lista quando WebGL falhar em `apps/web/src/features/globe/components/CountryListFallback.tsx`.

## Phase 4 — US2: Filtros e dados por país (P1)
**Independent Test:** com mock do OpenAPI, BRA/WORK, valores/status/fontes corretos; erro tardio não substitui outro país.
- [x] FE-T014 [US2] Implementar query defaults e estados indisponíveis em `apps/web/src/features/filters/`.
- [x] FE-T015 [US2] Implementar `/countries` e `/stats/map` com TanStack Query em `apps/web/src/services/api/`.
- [x] FE-T016 [US2] Implementar query `countries/:iso3` com `AbortSignal` e cache keyed por filtros em `apps/web/src/features/country-detail/hooks/`.
- [x] FE-T017 [US2] Construir painel desktop por país em `apps/web/src/features/country-detail/components/CountryPanel.tsx`.
- [x] FE-T018 [P] [US2] Criar componentes DataStatus/SourceBadge/MetricHeadline reutilizáveis em `apps/web/src/components/ui/`.
- [x] FE-T019 [US2] Testar null vs zero vs suppressed e resposta desatualizada em `apps/web/src/features/country-detail/__tests__/`.

## Phase 5 — US3: Histórico, modalidades e mobile (P2)
**Independent Test:** aba lazy loading só chama timeseries quando aberta; bottom sheet acessível.
- [x] FE-T020 [US3] Criar `StatisticsTimeseriesChart` com lazy query em `apps/web/src/features/statistics/`.
- [x] FE-T021 [P] [US3] Criar abas para modalidades e fontes incluídas em CountryDetail em `apps/web/src/features/country-detail/components/`.
- [x] FE-T022 [US3] Implementar bottom sheet responsivo e foco acessível em `apps/web/src/features/country-detail/components/MobileBottomSheet.tsx`.
- [x] FE-T023 [US3] Validar estado e navegação mobile/desktop com Playwright em `apps/web/tests/e2e/`.

## Phase 6 — Polish
- [x] FE-T024 [P] Validar licença/atribuições dos tiles e CSP, acessibilidade e performance em `apps/web/README.md`.
- [x] FE-T025 [US1] Rodar fluxo end-to-end país sem dado, país com dado, troca rápida, fallback e reduced motion.
- [x] FE-T026 Documentar validações visuais do Figma (1440×900, 390×844) em `apps/web/docs/visual-qa.md`.

## Dependencies
- SH-T011 → FE-T004; FE-T004/FE-T005/FE-T007 → FE-T008/FE-T009/FE-T010.
- FE-T010 → FE-T011/FE-T012; FE-T014/FE-T015 → FE-T016/FE-T017.
- FE-T016/FE-T017 → FE-T020/FE-T021/FE-T022.
- Frontend e backend podem evoluir independentemente após aprovação dos contratos, com integração final por testes de contrato.
