# Tasks: Contrato REST compartilhado (P1)

**Entrada:** `spec.md`, `plan.md`, `contracts/openapi.yaml`.
**Formato:** `[ID] [P?] [US] Descrição (caminho exato)`.

## Phase 1 — Setup
- [ ] SH-T001 [US1] Validar o arquivo `specs/001-shared-api-contract/contracts/openapi.yaml` com um validador OpenAPI 3.1 no CI.
- [ ] SH-T002 [P] [US1] Documentar regras de versionamento e breaking changes em `packages/contracts/README.md`.

## Phase 2 — Foundational
- [ ] SH-T003 [US1] Definir DTOs e enums `MetricType`, `DataStatus`, `Freshness`, `ComparisonGroupId` em `specs/001-shared-api-contract/contracts/openapi.yaml`.
- [ ] SH-T004 [US1] Formalizar schemas de erros e validação de ISO3/ano/métrica no mesmo contrato.
- [ ] SH-T005 [US2] Definir metadados de origem, release, período, unidade e qualidade na API.

## Phase 3 — User Story US1 (P1)
- [ ] SH-T006 [US1] Fixar exatamente cinco operações REST e schemas de request/response em `specs/001-shared-api-contract/contracts/openapi.yaml`.
- [ ] SH-T007 [P] [US1] Configurar geração de modelos TypeScript em `packages/contracts/package.json` e `packages/contracts/src/`.
- [ ] SH-T008 [US1] Criar exemplos de ausência de dados e zero válido em `packages/contracts/examples/` (apenas exemplos, não dados reais).

## Phase 4 — User Story US2 (P1)
- [ ] SH-T009 [US2] Criar testes de compatibilidade dos exemplos e schemas em `packages/contracts/tests/openapi-contract.test.ts`.
- [ ] SH-T010 [US2] Documentar como frontend e backend verificam o mesmo grupo estatístico em `packages/contracts/README.md`.

## Phase 5 — Gate
- [ ] SH-T011 Validar contrato por ambos responsáveis; registrar aprovação em `specs/001-shared-api-contract/decision.md`.

**Checkpoint:** SH-T011 aprovado antes de integrar tarefas BE/FE. Itens [P] só podem rodar em paralelo se não modificarem os mesmos arquivos.
