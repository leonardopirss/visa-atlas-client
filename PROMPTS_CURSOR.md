# Sequência sugerida para o Cursor Agent + Spec Kit

> As invocações exatas dependem da integração. Use `/speckit-...` quando instalado nesse modo, ou `/speckit....` se esse for o comando exposto pelo seu Cursor.

## 1. Constituição (uma vez no projeto)

```text
/speckit-constitution
Adote e valide os princípios descritos em .specify/memory/constitution.md: integridade estatística, uso de fontes oficiais e licenças, contratos OpenAPI antes da implementação, separação React/NestJS, segurança e testes de integração/E2E. Preserve o escopo BRA/WORK, países selecionados verdes e demais cinza. Registre inconsistências em vez de substituí-las silenciosamente.
```

## 2. Shared API primeiro

```text
/speckit-specify
Crie/valide a feature 001-shared-api-contract a partir de specs/001-shared-api-contract/spec.md. API pública v1 com EXATAMENTE cinco endpoints GET, status de ausência sem zero inventado e semântica de fonte/release/indicador/grupo comparável. Sem escolher frameworks nessa fase.
```

```text
/speckit-plan
Use como referência specs/001-shared-api-contract/contracts/openapi.yaml e specs/001-shared-api-contract/plan.md. Planeje integração OpenAPI com cliente TypeScript e contract tests; mantenha contrato como fonte da verdade.
```

```text
/speckit-tasks
Gere/valide tarefas SH usando specs/001-shared-api-contract/tasks.md como checklist de cobertura. Associe cada tarefa a história, dependência, teste e caminho de arquivo. Não execute implementação.
```

## 3. Backend (feature independente)

```text
/speckit-specify
Especifique o backend Visa Atlas segundo specs/002-visa-atlas-backend/spec.md. BRA/WORK, ingestão validada Eurostat, fontes e rastreabilidade, exatamente cinco endpoints; detalhe agregado por país e timeseries separado. Não fazer autenticação ou outros endpoints na v1.
```

```text
/speckit-plan
Planeje NestJS + TypeScript strict + Prisma + PostgreSQL, módulos de domínio e ingestão idempotente versionada. Leia specs/002-visa-atlas-backend/data-model.md e o OpenAPI compartilhado.
```

```text
/speckit-tasks
Reconcile o plano e as tarefas BE em specs/002-visa-atlas-backend/tasks.md. Ordene migrations, adaptador oficial, validações, endpoints e testes; não modifique OpenAPI sem aprovação.
```

## 4. Frontend (feature independente)

```text
/speckit-specify
Especifique frontend do Visa Atlas conforme specs/003-interactive-globe-frontend/spec.md. Globo 3D, seleção verde #30D883 e demais países cinza, volta restaura cores; BRA/WORK; detalhes agregado, histórico lazy, fontes e mobile bottom sheet; fallback sem WebGL.
```

```text
/speckit-plan
Planeje React + Vite + TypeScript strict + MapLibre GL JS + TanStack Query, componentes reutilizáveis, mocks derivados de OpenAPI, Playwright e suporte multipolígono. Use Figma como referência visual.
```

```text
/speckit-tasks
Gere/valide tasks FE em specs/003-interactive-globe-frontend/tasks.md, separadas das BE e rastreáveis a histórias. Não criar novos endpoints.
```

## 5. Gates antes de implementar

Rodar `speckit-clarify` após specify, `speckit-checklist` após plan, `speckit-analyze` após tasks, e revisar os conflitos encontrados. Somente depois autorizar `speckit-implement`. Após implementação, `speckit-converge` valida aderência e pode propor tarefas adicionais.

**Importante:** Spec Kit pode criar sua própria pasta de feature ativa. Não assuma que branch = feature ativa; confira `.specify/feature.json` na sua versão ou variável `SPECIFY_FEATURE_DIRECTORY`.
