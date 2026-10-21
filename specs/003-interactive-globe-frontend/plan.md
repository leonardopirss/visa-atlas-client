# Implementation Plan: Frontend Visa Atlas

**Feature:** `003-interactive-globe-frontend` · **Data:** 2026-10-19 · **Spec:** `spec.md`

## Summary
Globo cartográfico 3D MapLibre em React/Vite, estado global controlado, painel contextual, filtros BRA/WORK, fallback sem WebGL e dados oficiais consumidos exclusivamente da API.

## Technical Context
- **Frontend:** React, Vite, TypeScript strict, MapLibre GL JS com Globe projection.
- **State:** seleção e filtros em estado de aplicação; TanStack Query para cache/requisições.
- **UI:** componentes acessíveis, CSS/Tailwind se disponível no projeto, animação reduzida preferencial.
- **Testing:** Vitest, Testing Library, Playwright e mocks do contrato.
- **Visual Reference:** Figma Visa Atlas.

## Structure
```
apps/web/src/
  app/
  features/globe/components/
  features/globe/hooks/
  features/globe/layers/
  features/country-detail/components/
  features/filters/
  features/statistics/
  services/api/
  components/ui/
apps/web/tests/e2e/
packages/contracts/
packages/geo/
```

## Map state machine
- `IDLE`: cores cartográficas naturais; BRA/WORK ativos.
- `HOVER`: contorno temporário sem remover selected.
- `SELECTING`: muda `selectedCountryIso3`, remove highlight anterior, `flyTo` cancelável.
- `SELECTED`: selected verde, outros países cinza; tela de detalhe usa ISO3 para consulta.
- `EMPTY`: seleção persiste, painel mostra indisponível em vez de zero.
- `EXIT`: limpa selected, restaura cores e mantém filtros.

Usar camada estilizada por expressões e filter ISO3, inclusive multipolígonos. Nunca implementar seleção com contorno pintado de uma imagem única.

## API
`filters/defaults` → inicialização; `countries` → busca; `stats/map` → valores/status; `countries/:iso3` → detalhe agregado; `countries/:iso3/timeseries` → lazy load ao abrir histórico.

## Constitution Check
- [x] Renderização não inventa valores/estatísticas.
- [x] Dados seguem OpenAPI e não usam modelos Prisma.
- [x] Seleção independente da cobertura e respeita MultiPolygon.
- [x] Fallback acessível e redução de movimento especificados.
- [ ] Confirmar licença/tile style e orçamento WebGL antes da entrega.

## Dependency Gate
SH-T011 aprovado, com mocks gerados do OpenAPI; frontend pode iniciar antes da API real estar pronta.
