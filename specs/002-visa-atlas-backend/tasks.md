# Tasks: Backend de estatísticas e vistos

**Inputs:** `spec.md`, `plan.md`, `data-model.md`, contrato `../001-shared-api-contract/contracts/openapi.yaml`.
**Bloqueio:** SH-T011 (contrato revisado) antes de integrar HTTP com frontend.
**Testes:** obrigatórios conforme Constituição, escritos antes dos handlers e ingestão correspondente.

## Phase 1 — Setup
- [x] BE-T001 [US1] Criar projeto NestJS/TypeScript strict em `apps/api/package.json` e `apps/api/tsconfig.json`.
- [x] BE-T002 [P] [US1] Adicionar lint/format/test scripts em `apps/api/package.json` e configuração de CI em `.github/workflows/api.yml`.
- [x] BE-T003 [P] [US1] Provisionar PostgreSQL local em `docker-compose.yml` e env example em `apps/api/.env.example`.

## Phase 2 — Foundational (bloqueante)
- [x] BE-T004 [US1] Implementar schema Prisma e migrations em `apps/api/prisma/schema.prisma` (ver `data-model.md`).
- [x] BE-T005 [US1] Implementar Prisma provider e configuração segura em `apps/api/src/common/database/`.
- [x] BE-T006 [P] [US1] Implementar erros tipados, filtros de exceção e correlation ID em `apps/api/src/common/errors/`.
- [ ] BE-T007 [US1] Conectar DTOs e OpenAPI à validação NestJS em `apps/api/src/main.ts` e `apps/api/test/contract/`.
- [x] BE-T008 [US2] Criar fixture de release offline **rotulado como teste** em `apps/api/test/fixtures/`, sem números fictícios no fluxo de produção.

## Phase 3 — US1: Consulta BRA/WORK (P1)
**Independent Test:** requisições com release publicado produzem resposta com métrica/fonte/status; sem release produzem dados indisponíveis.
- [ ] BE-T009 [P] [US1] Escrever contrato de filtros/countries/map em `apps/api/test/contract/public-api.spec.ts`.
- [x] BE-T010 [US1] Implementar catálogo e busca em `apps/api/src/modules/countries/`.
- [x] BE-T011 [US1] Implementar resolução de ano padrão a partir de releases comparáveis em `apps/api/src/modules/statistics/services/default-filters.service.ts`.
- [x] BE-T012 [US1] Implementar consulta `stats/map` com disponibilidade e valores em `apps/api/src/modules/statistics/`.
- [x] BE-T013 [US1] Expor GET `/filters/defaults`, `/countries`, `/stats/map` no contrato em `apps/api/src/modules/`.
- [x] BE-T014 [US1] Testar zero oficial vs null/ausência vs dados suprimidos em `apps/api/test/integration/statistics.spec.ts`.

## Phase 4 — US2: Ingestão oficial (P1)
**Independent Test:** executar o mesmo release duas vezes não duplica; falha não remove dados anteriores.
- [x] BE-T015 [US2] Definir adaptador Eurostat e mapeamento de dimensões em `apps/api/src/modules/ingestion/adapters/eurostat/`.
- [x] BE-T016 [US2] Implementar staging, checksum e deduplicação em `apps/api/src/modules/ingestion/`.
- [x] BE-T017 [US2] Implementar validações de unidade, categoria original, período e cidadania em `apps/api/src/modules/ingestion/validation/`.
- [x] BE-T018 [US2] Implementar promoção atômica de release e rollback lógico em `apps/api/src/modules/ingestion/services/publish-release.service.ts`.
- [x] BE-T019 [US2] Cobrir idempotência, source failure, suprimidos, categoria inválida em `apps/api/test/integration/ingestion.spec.ts`.
- [x] BE-T020 [P] [US2] Implementar logs estruturados e health simples de ingestão **interno**, em `apps/api/src/modules/ingestion/observability/`.

## Phase 5 — US3: País e histórico (P2)
**Independent Test:** `GET /countries/ESP` agrega sem falsificar estatísticas e histórico usa mesmo comparabilityGroup.
- [ ] BE-T021 [P] [US3] Escrever testes de contrato de detalhes e timeseries em `apps/api/test/contract/country-detail.spec.ts`.
- [x] BE-T022 [US3] Implementar fontes verificadas e catálogo de modalidades em `apps/api/src/modules/sources/` e `apps/api/src/modules/visa-programs/`.
- [x] BE-T023 [US3] Criar agregador de detalhes em `apps/api/src/modules/countries/services/country-detail.service.ts`.
- [x] BE-T024 [US3] Expor GET `/countries/:iso3` em `apps/api/src/modules/countries/countries.controller.ts`.
- [x] BE-T025 [US3] Implementar histórico com recorte e qualidade em `apps/api/src/modules/statistics/services/timeseries.service.ts`.
- [x] BE-T026 [US3] Expor GET `/countries/:iso3/timeseries` com validação e teste de fontes em `apps/api/src/modules/statistics/`.

## Phase 6 — Hardening
- [x] BE-T027 [P] Revisar rate limits e cache para consultas públicas em `apps/api/src/common/http/`.
- [x] BE-T028 [P] Validar planos de execução/índices para consultas mais usadas em `apps/api/test/performance/`.
- [x] BE-T029 Testar integração, CI, documentação e cobertura de todos os campos em `apps/api/README.md`.

## Dependencies
- SH-T011 → BE-T007, BE-T009, BE-T021.
- BE-T004 → BE-T005 → BE-T010/BE-T011/BE-T012.
- BE-T015 → BE-T016/BE-T017 → BE-T018 → BE-T019.
- BE-T023 → BE-T024; BE-T025 → BE-T026.
- Release real publicado depende da validação de semântica Eurostat (BE-T017).

**Não incluir na V1:** endpoint `/coverage`, `/comparisons` ou rotas próprias de visto/fonte; dados e links verificáveis entram no agregado `/countries/:iso3`.
