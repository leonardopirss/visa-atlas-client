# Tasks: Cobertura global e novas fontes oficiais

**Inputs:** `spec.md`, `plan.md`, `research.md`, Constituição, `../001-shared-api-contract/contracts/openapi.yaml`.
**Formato:** `[ID] [P?] [US] Descrição (caminho exato)`.
**Regra de conclusão:** marcar `[x]` somente após implementação, testes da tarefa e evidência de validação. Itens `[P]` não podem editar o mesmo arquivo simultaneamente.

## Phase 1 — Discovery e gates (bloqueante)

- [x] GC-T001 [US1] Inventariar ISO3 da cartografia, catálogo atual e exceções territoriais; registrar diferenças e política de inclusão em `specs/004-global-coverage-expansion/research.md`.
- [x] GC-T002 [P] [US3] Completar o admission gate do Reino Unido com tabela, licença, evento, categorias, unidade, período e decisão em `specs/004-global-coverage-expansion/research.md`.
- [x] GC-T003 [P] [US3] Completar o admission gate dos Estados Unidos, incluindo lista explícita de classes de trabalho incluídas/excluídas, em `specs/004-global-coverage-expansion/research.md`.
- [x] GC-T004 [P] [US3] Completar o admission gate da Austrália, verificando formato automatizável e semântica das categorias, em `specs/004-global-coverage-expansion/research.md`.
- [x] GC-T005 [P] [US3] Completar o admission gate do Canadá e decidir se é necessário `WORK_PERMITS_ISSUED` ou outro `MetricType` em `specs/004-global-coverage-expansion/research.md`.
- [x] GC-T006 [US3] Registrar decisão FE/BE para qualquer mudança de enum ou DTO em `specs/001-shared-api-contract/decision.md`; se não houver mudança, registrar explicitamente “sem impacto contratual”.

**Checkpoint:** não implementar adaptador nacional antes de sua decisão `ACCEPTED`; GC-T006 bloqueia mudanças no OpenAPI.

## Phase 2 — Foundational: catálogo mundial (bloqueante para US1/US2)

- [x] GC-T007 [US2] Selecionar e documentar fonte/licença do catálogo mundial ISO2/ISO3/nome pt-BR/região em `visa-atlas-server/docs/data-sources.md` e `apps/web/README.md`.
- [x] GC-T008 [US2] Criar catálogo mundial versionado e sincronizador idempotente em `visa-atlas-server/src/modules/countries/data/` e `visa-atlas-server/src/modules/countries/services/country-catalog.service.ts`.
- [x] GC-T009 [US2] Integrar a sincronização do catálogo ao bootstrap/migration operacional sem inserir observações sintéticas em `visa-atlas-server/src/modules/countries/`.
- [x] GC-T010 [P] [US2] Criar testes unitários de unicidade ISO2/ISO3, campos obrigatórios e licença do catálogo em `visa-atlas-server/test/unit/country-catalog.spec.ts`.
- [x] GC-T011 [P] [US2] Criar teste de consistência entre ISO3 do catálogo backend e GeoJSON em `apps/web/src/features/globe/__tests__/country-catalog-coverage.test.ts`, documentando exceções legítimas.
- [x] GC-T012 [US2] Ajustar detalhes e timeseries para retornar ausência honesta para país conhecido sem release e manter erro tipado para ISO inexistente em `visa-atlas-server/src/modules/countries/` e `visa-atlas-server/src/modules/statistics/`.
- [x] GC-T013 [US2] Cobrir `200 + UNAVAILABLE`, zero válido, suprimido, país inexistente e banco sem releases em `visa-atlas-server/test/contract/` e `visa-atlas-server/test/integration/`.

**Independent Test US2:** `RUS`, `CAN` e `AUS` conhecidos sem observação retornam identidade + `UNAVAILABLE`; ISO3 inexistente retorna erro do contrato.

## Phase 3 — US1: descoberta de cobertura no frontend (P1)

- [x] GC-T014 [US1] Criar derivação tipada de cobertura cruzando `/countries` e `/stats/map` pelos filtros ativos em `apps/web/src/features/coverage/`, distinguindo `AVAILABLE`, `UNAVAILABLE` e `UNKNOWN_ERROR`.
- [x] GC-T015 [P] [US1] Escrever testes da derivação de cobertura, paginação e falha parcial em `apps/web/src/features/coverage/__tests__/`.
- [x] GC-T016 [US1] Estender a expressão MapLibre para tons de cinza de cobertura, mantendo verde `#30D883` exclusivamente no ISO3 selecionado, em `apps/web/src/features/globe/layers/country-selection.ts`.
- [x] GC-T017 [US1] Implementar tooltip/foco acessível com nome e disponibilidade no globo em `apps/web/src/features/globe/components/globe-map.tsx`.
- [x] GC-T018 [P] [US1] Adicionar legenda de cobertura e mensagem de falha separada em `apps/web/src/features/coverage/components/coverage-legend.tsx` e `apps/web/src/app/app.tsx`.
- [x] GC-T019 [US1] Adicionar badges de disponibilidade e filtro “somente com dados” na busca e lista fallback em `apps/web/src/features/globe/components/country-search.tsx` e `country-list-fallback.tsx`.
- [x] GC-T020 [US2] Substituir erro genérico por painel informativo quando o país é válido mas não tem observação, preservando retry apenas para erro real, em `apps/web/src/features/country-detail/components/country-panel.tsx`.
- [x] GC-T021 [P] [US4] Revisar microcopy de métrica, unidade, fonte e aviso “volume não é probabilidade” em `apps/web/src/features/country-detail/` e `apps/web/src/components/ui/`.
- [x] GC-T022 [US1] Cobrir hover/foco, legenda, seleção de país sem dado, busca, teclado, touch, multipolígono e fallback sem WebGL em `apps/web/tests/e2e/global-coverage.spec.ts`.

**Independent Test US1:** antes do clique, o usuário identifica cobertura; após clicar num país sem dado, recebe contexto útil e não um erro de rede.

## Phase 4 — Contrato para novas métricas, somente se aprovado

- [x] GC-T023 [US3] N/A — GC-D001 concluiu que o catálogo, a cobertura e UK `WORK_VISAS_ISSUED` não alteram enums/DTOs/OpenAPI; nenhum endpoint foi criado.
- [x] GC-T024 [US3] N/A — sem mudança contratual, não há tipos ou snapshot a regenerar; os artefatos permanecem byte a byte inalterados.
- [x] GC-T025 [P] [US3] N/A — exemplos e testes artificiais foram evitados porque a semântica UK já é representada pelo enum existente.
- [x] GC-T026 [US3] N/A — compatibilidade FE/BE confirmada pelo uso das cinco rotas existentes e encerramento registrado em `decision.md`; Canadá segue bloqueado.

**Checkpoint:** se GC-T006 concluir “sem impacto contratual”, GC-T023–GC-T026 devem ser marcadas `N/A` com justificativa documentada, não executadas artificialmente.

## Phase 5 — US3: primeiro adaptador nacional aceito (P1)

- [x] GC-T027 [US3] Selecionar a primeira fonte `ACCEPTED` pela estabilidade e completude, registrando a decisão e o mapeamento semântico em `visa-atlas-server/docs/data-sources.md`.
- [x] GC-T028 [P] [US3] Criar fixture estrutural permitida pela licença, oficial ou sintética claramente rotulada, em `visa-atlas-server/test/fixtures/<source>/`.
- [x] GC-T029 [US3] Implementar cliente com timeout, limite de resposta, validação de content-type e tratamento de mudança de formato em `visa-atlas-server/src/modules/ingestion/adapters/<source>/<source>.client.ts`.
- [x] GC-T030 [US3] Implementar configuração e parser explícito de cidadania, categorias, período, unidade e destino em `visa-atlas-server/src/modules/ingestion/adapters/<source>/`.
- [x] GC-T031 [US3] Implementar validação semântica específica e integração com staging/checksum/publicação existentes em `visa-atlas-server/src/modules/ingestion/validation/` e `visa-atlas-server/src/modules/ingestion/`.
- [x] GC-T032 [US3] Criar runner/CLI interno protegido, sem rota pública, em `visa-atlas-server/src/cli/` e `visa-atlas-server/package.json`.
- [x] GC-T033 [US3] Testar parsing, categoria desconhecida, ausência de BRA, valor/status, idempotência, rejeição, promoção atômica e preservação do snapshot em `visa-atlas-server/test/unit/` e `visa-atlas-server/test/integration/`.
- [x] GC-T034 [US4] Expor observações publicadas pelas cinco rotas existentes com rótulo e fonte corretos, sem ranking incompatível, em `visa-atlas-server/src/modules/statistics/` e `visa-atlas-server/src/modules/countries/`.
- [x] GC-T035 [US3] Executar ingestão real controlada, conferir contagens contra a publicação oficial e anexar relatório sem dados pessoais em `visa-atlas-server/docs/ingestion-reports/<source>/`.

**Independent Test US3:** uma release válida da primeira fonte é publicada e consultável; repetição não duplica; falha conserva a release anterior; não existe comparação com Eurostat fora de grupo compatível.

## Phase 6 — Fontes adicionais (P2, verticais independentes)

- [x] GC-T036 [P] [US3] N/A — não há segunda fonte `ACCEPTED`; Canadá permanece `NEEDS_REVIEW` por semântica/contrato.
- [x] GC-T037 [P] [US3] N/A — não há terceira fonte `ACCEPTED`; Estados Unidos permanece `NEEDS_REVIEW` por automação instável.
- [x] GC-T038 [P] [US3] N/A — não há quarta fonte `ACCEPTED`; Austrália permanece `NEEDS_REVIEW` por formato/universo.

**Regra:** fonte `REJECTED` ou `NEEDS_REVIEW` não bloqueia fontes aceitas e não pode ser substituída por scraping ou estimativa silenciosa.

## Phase 7 — Hardening e release gate

- [x] GC-T039 [P] Validar índices e planos de consulta com catálogo mundial e múltiplos datasets em `visa-atlas-server/test/performance/`.
- [x] GC-T040 [P] Revisar cache, rate limit, tamanho de respostas, logs sem dados pessoais e falhas parciais em `visa-atlas-server/src/common/`.
- [x] GC-T041 [P] Auditar licenças, atribuições, URLs externas, CSP e ausência de segredos/fixtures reais indevidas nos dois repositórios.
- [x] GC-T042 Executar no backend format check, lint, typecheck, testes unitários/integrados/contrato/performance, build e audit; registrar resultados em `visa-atlas-server/docs/validation/global-coverage.md`.
- [x] GC-T043 Executar no frontend format check, lint, typecheck, testes unitários/E2E, build e audit; registrar resultados em `apps/web/docs/global-coverage-validation.md`.
- [x] GC-T044 Validar manualmente desktop/mobile, teclado, leitor de tela, reduced motion e fallback sem WebGL; anexar evidências em `apps/web/docs/visual-qa.md`.
- [x] GC-T045 Revisar critérios GC-SC-001–GC-SC-006, atualizar este `tasks.md` e registrar pendências/fontes não admitidas em `research.md`.

## Phase 8 — Rotulagem cartográfica (follow-up)

- [x] GC-T046 [US1] Exibir no globo os nomes localizados dos países por meio de uma camada `symbol` do MapLibre, reutilizando o catálogo/GeoJSON existente, com controle de colisão e densidade por zoom para manter a legibilidade em desktop e mobile; preservar seleção, tooltip e navegação acessível, e cobrir o comportamento com testes unitários, E2E e validação visual em `apps/web/src/features/globe/`, `apps/web/tests/e2e/` e `apps/web/docs/visual-qa.md`.

**Estado GC-T046:** concluída após separar a fonte de rótulos da fonte de
polígonos e gerar um único ponto por ISO3. A validação conectada desktop/mobile
confirmou legibilidade, seleção e ausência das duplicatas observadas; evidências
e regressão final estão registradas em `visual-qa.md`.

## Phase 9 — Canadá anual (follow-up)

- [x] GC-T047 [US3] Admitir o recurso anual IMP em 31 de dezembro, registrar GC-D002 e documentar exclusão do TFWP.
- [x] GC-T048 [US3] Implementar cliente, leitor XLSX, adapter, validação semântica, referência, runner e CLI do IRCC no backend.
- [x] GC-T049 [US3] Cobrir parsing, supressão, mudança estrutural, idempotência, rejeição e preservação do snapshot com testes unitários e integrados.
- [x] GC-T050 [US4] Expor `VALID_PERMIT_HOLDERS` nas cinco rotas existentes e permitir seleção explícita do Canadá na interface, com microcopy de estoque/arredondamento.
- [x] GC-T051 [US3] Executar ingestão oficial controlada, validar o valor brasileiro de 2024 e registrar o relatório de ingestão e os gates finais.

## Dependencies

- GC-T001 → GC-T007–GC-T013.
- GC-T002–GC-T005 → GC-T006 → GC-T023–GC-T026, quando houver impacto de contrato.
- GC-T007 → GC-T008 → GC-T009/GC-T010 → GC-T012/GC-T013.
- GC-T011 e GC-T013 → GC-T014–GC-T022.
- Uma fonte `ACCEPTED` + eventual GC-T026 → GC-T027–GC-T035.
- GC-T022 e GC-T035 → GC-T039–GC-T045.
- GC-T011 e GC-T016–GC-T017 → GC-T046.
- GC-T036–GC-T038 podem ocorrer em paralelo somente após seus próprios admission gates e sem compartilhar arquivos centrais sem coordenação.

## Notas de execução

- Preparar um plano curto por história antes de alterar código, conforme `AGENTS.md`.
- Testes correspondentes devem acompanhar ou preceder cada implementação.
- Não marcar tarefa concluída apenas porque o código compila; validar o cenário independente da fase.
- Não alterar silenciosamente métrica, enum, contrato ou interpretação de fonte.
- Cobertura por cidade permanece fora desta feature até existir fonte e spec próprias.
