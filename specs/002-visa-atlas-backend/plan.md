# Implementation Plan: Backend Visa Atlas

**Feature:** `002-visa-atlas-backend` · **Data:** 2026-10-19 · **Spec:** `spec.md`

## Summary
Monólito modular NestJS/TypeScript com PostgreSQL/Prisma, ingestão de fontes oficiais e cinco rotas REST OpenAPI versionadas.

## Technical Context
- **Linguagem:** TypeScript strict.
- **Runtime:** Node LTS e NestJS compatíveis definidos no bootstrap.
- **DB:** PostgreSQL, Prisma migrations, índices para iso3, período e comparabilityGroup.
- **Testes:** Jest; Prisma integration; contract HTTP; fixture offline de Eurostat.
- **Logs:** estruturados, correlation ID, métricas básicas de ingestão/erro.
- **Infra:** Docker Compose local, CI lint/typecheck/test.

## Project Structure
```
apps/api/
  src/
    modules/countries/
    modules/statistics/
    modules/visa-programs/
    modules/sources/
    modules/ingestion/adapters/eurostat/
    common/errors/
  prisma/schema.prisma
  prisma/migrations/
  test/contract/
  test/integration/
packages/contracts/
```

## API
1. `GET /api/v1/filters/defaults` — recorte e ano comum publicados.
2. `GET /api/v1/countries?search=` — catálogo e busca paginável.
3. `GET /api/v1/stats/map?...` — estatística e disponibilidade na mesma resposta.
4. `GET /api/v1/countries/:iso3?...` — agregado de país com informações normalizadas.
5. `GET /api/v1/countries/:iso3/timeseries?...` — série histórica lazy.

Não criar `/coverage`, `/overview`, `/visa-programs`, `/sources`, `/comparisons` como endpoints separados no MVP.

## Data Pipeline
`ingest -> stage -> validate dimensions/quality -> checksum -> publish atomic release -> invalidate cache`.
Não consultar Eurostat a cada chamada HTTP. Origem `migr_resfirst` é um ponto de partida, cuja disponibilidade e dimensões devem ser verificadas antes de mapear categorias.

## Constitution Check
- [x] Estatísticas diferentes possuem tipos diferentes.
- [x] API somente lê releases publicados.
- [x] Contrato OpenAPI compartilhado governa DTOs.
- [x] Importação idempotente, versionada e testada.
- [x] Semântica oficial confirmada no dataset `migr_resfirst`: `citizen=BR`, `reason=EMP` (employment reasons), `unit=PER`, `duration=TOTAL`, frequência anual e destino na dimensão `geo`.

## Dependency Gate
SH-T011 aprovado; então tarefas backend podem avançar em paralelo às de frontend, sem alterar contrato sem review.
