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

- [ ] GC-T007 [US2] Selecionar e documentar fonte/licença do catálogo mundial ISO2/ISO3/nome pt-BR/região em `visa-atlas-server/docs/data-sources.md` e `apps/web/README.md`.
- [ ] GC-T008 [US2] Criar catálogo mundial versionado e sincronizador idempotente em `visa-atlas-server/src/modules/countries/data/` e `visa-atlas-server/src/modules/countries/services/country-catalog.service.ts`.
- [ ] GC-T009 [US2] Integrar a sincronização do catálogo ao bootstrap/migration operacional sem inserir observações sintéticas em `visa-atlas-server/src/modules/countries/`.
- [ ] GC-T010 [P] [US2] Criar testes unitários de unicidade ISO2/ISO3, campos obrigatórios e licença do catálogo em `visa-atlas-server/test/unit/country-catalog.spec.ts`.
- [ ] GC-T011 [P] [US2] Criar teste de consistência entre ISO3 do catálogo backend e GeoJSON em `apps/web/src/features/globe/__tests__/country-catalog-coverage.test.ts`, documentando exceções legítimas.
- [ ] GC-T012 [US2] Ajustar detalhes e timeseries para retornar ausência honesta para país conhecido sem release e manter erro tipado para ISO inexistente em `visa-atlas-server/src/modules/countries/` e `visa-atlas-server/src/modules/statistics/`.
- [ ] GC-T013 [US2] Cobrir `200 + UNAVAILABLE`, zero válido, suprimido, país inexistente e banco sem releases em `visa-atlas-server/test/contract/` e `visa-atlas-server/test/integration/`.

**Independent Test US2:** `RUS`, `CAN` e `AUS` conhecidos sem observação retornam identidade + `UNAVAILABLE`; ISO3 inexistente retorna erro do contrato.

## Phase 3 — US1: descoberta de cobertura no frontend (P1)

- [ ] GC-T014 [US1] Criar derivação tipada de cobertura cruzando `/countries` e `/stats/map` pelos filtros ativos em `apps/web/src/features/coverage/`, distinguindo `AVAILABLE`, `UNAVAILABLE` e `UNKNOWN_ERROR`.
- [ ] GC-T015 [P] [US1] Escrever testes da derivação de cobertura, paginação e falha parcial em `apps/web/src/features/coverage/__tests__/`.
- [ ] GC-T016 [US1] Estender a expressão MapLibre para tons de cinza de cobertura, mantendo verde `#30D883` exclusivamente no ISO3 selecionado, em `apps/web/src/features/globe/layers/country-selection.ts`.
- [ ] GC-T017 [US1] Implementar tooltip/foco acessível com nome e disponibilidade no globo em `apps/web/src/features/globe/components/globe-map.tsx`.
- [ ] GC-T018 [P] [US1] Adicionar legenda de cobertura e mensagem de falha separada em `apps/web/src/features/coverage/components/coverage-legend.tsx` e `apps/web/src/app/app.tsx`.
- [ ] GC-T019 [US1] Adicionar badges de disponibilidade e filtro “somente com dados” na busca e lista fallback em `apps/web/src/features/globe/components/country-search.tsx` e `country-list-fallback.tsx`.
- [ ] GC-T020 [US2] Substituir erro genérico por painel informativo quando o país é válido mas não tem observação, preservando retry apenas para erro real, em `apps/web/src/features/country-detail/components/country-panel.tsx`.
- [ ] GC-T021 [P] [US4] Revisar microcopy de métrica, unidade, fonte e aviso “volume não é probabilidade” em `apps/web/src/features/country-detail/` e `apps/web/src/components/ui/`.
- [ ] GC-T022 [US1] Cobrir hover/foco, legenda, seleção de país sem dado, busca, teclado, touch, multipolígono e fallback sem WebGL em `apps/web/tests/e2e/global-coverage.spec.ts`.

**Independent Test US1:** antes do clique, o usuário identifica cobertura; após clicar num país sem dado, recebe contexto útil e não um erro de rede.

## Phase 4 — Contrato para novas métricas, somente se aprovado

- [ ] GC-T023 [US3] Atualizar enums/descrições no OpenAPI apenas conforme GC-T006 em `specs/001-shared-api-contract/contracts/openapi.yaml`, sem criar novo endpoint.
- [ ] GC-T024 [US3] Regenerar e revisar tipos em `packages/contracts/src/generated/api.ts` e sincronizar o snapshot em `visa-atlas-server/contracts/openapi.yaml`.
- [ ] GC-T025 [P] [US3] Adicionar exemplos semânticos sem números reais em `packages/contracts/examples/` e testes de contrato em `packages/contracts/tests/`.
- [ ] GC-T026 [US3] Validar OpenAPI 3.1, compatibilidade FE/BE e registrar aprovação final em `specs/001-shared-api-contract/decision.md`.

**Checkpoint:** se GC-T006 concluir “sem impacto contratual”, GC-T023–GC-T026 devem ser marcadas `N/A` com justificativa documentada, não executadas artificialmente.

## Phase 5 — US3: primeiro adaptador nacional aceito (P1)

- [ ] GC-T027 [US3] Selecionar a primeira fonte `ACCEPTED` pela estabilidade e completude, registrando a decisão e o mapeamento semântico em `visa-atlas-server/docs/data-sources.md`.
- [ ] GC-T028 [P] [US3] Criar fixture estrutural permitida pela licença, oficial ou sintética claramente rotulada, em `visa-atlas-server/test/fixtures/<source>/`.
- [ ] GC-T029 [US3] Implementar cliente com timeout, limite de resposta, validação de content-type e tratamento de mudança de formato em `visa-atlas-server/src/modules/ingestion/adapters/<source>/<source>.client.ts`.
- [ ] GC-T030 [US3] Implementar configuração e parser explícito de cidadania, categorias, período, unidade e destino em `visa-atlas-server/src/modules/ingestion/adapters/<source>/`.
- [ ] GC-T031 [US3] Implementar validação semântica específica e integração com staging/checksum/publicação existentes em `visa-atlas-server/src/modules/ingestion/validation/` e `visa-atlas-server/src/modules/ingestion/`.
- [ ] GC-T032 [US3] Criar runner/CLI interno protegido, sem rota pública, em `visa-atlas-server/src/cli/` e `visa-atlas-server/package.json`.
- [ ] GC-T033 [US3] Testar parsing, categoria desconhecida, ausência de BRA, valor/status, idempotência, rejeição, promoção atômica e preservação do snapshot em `visa-atlas-server/test/unit/` e `visa-atlas-server/test/integration/`.
- [ ] GC-T034 [US4] Expor observações publicadas pelas cinco rotas existentes com rótulo e fonte corretos, sem ranking incompatível, em `visa-atlas-server/src/modules/statistics/` e `visa-atlas-server/src/modules/countries/`.
- [ ] GC-T035 [US3] Executar ingestão real controlada, conferir contagens contra a publicação oficial e anexar relatório sem dados pessoais em `visa-atlas-server/docs/ingestion-reports/<source>/`.

**Independent Test US3:** uma release válida da primeira fonte é publicada e consultável; repetição não duplica; falha conserva a release anterior; não existe comparação com Eurostat fora de grupo compatível.

## Phase 6 — Fontes adicionais (P2, verticais independentes)

- [ ] GC-T036 [P] [US3] Repetir GC-T027–GC-T035 para a segunda fonte `ACCEPTED`, isolando adaptador, fixture, testes e relatório em caminhos próprios.
- [ ] GC-T037 [P] [US3] Repetir GC-T027–GC-T035 para a terceira fonte `ACCEPTED`, isolando adaptador, fixture, testes e relatório em caminhos próprios.
- [ ] GC-T038 [P] [US3] Repetir GC-T027–GC-T035 para a quarta fonte `ACCEPTED`, isolando adaptador, fixture, testes e relatório em caminhos próprios.

**Regra:** fonte `REJECTED` ou `NEEDS_REVIEW` não bloqueia fontes aceitas e não pode ser substituída por scraping ou estimativa silenciosa.

## Phase 7 — Hardening e release gate

- [ ] GC-T039 [P] Validar índices e planos de consulta com catálogo mundial e múltiplos datasets em `visa-atlas-server/test/performance/`.
- [ ] GC-T040 [P] Revisar cache, rate limit, tamanho de respostas, logs sem dados pessoais e falhas parciais em `visa-atlas-server/src/common/`.
- [ ] GC-T041 [P] Auditar licenças, atribuições, URLs externas, CSP e ausência de segredos/fixtures reais indevidas nos dois repositórios.
- [ ] GC-T042 Executar no backend format check, lint, typecheck, testes unitários/integrados/contrato/performance, build e audit; registrar resultados em `visa-atlas-server/docs/validation/global-coverage.md`.
- [ ] GC-T043 Executar no frontend format check, lint, typecheck, testes unitários/E2E, build e audit; registrar resultados em `apps/web/docs/global-coverage-validation.md`.
- [ ] GC-T044 Validar manualmente desktop/mobile, teclado, leitor de tela, reduced motion e fallback sem WebGL; anexar evidências em `apps/web/docs/visual-qa.md`.
- [ ] GC-T045 Revisar critérios GC-SC-001–GC-SC-006, atualizar este `tasks.md` e registrar pendências/fontes não admitidas em `research.md`.

## Dependencies

- GC-T001 → GC-T007–GC-T013.
- GC-T002–GC-T005 → GC-T006 → GC-T023–GC-T026, quando houver impacto de contrato.
- GC-T007 → GC-T008 → GC-T009/GC-T010 → GC-T012/GC-T013.
- GC-T011 e GC-T013 → GC-T014–GC-T022.
- Uma fonte `ACCEPTED` + eventual GC-T026 → GC-T027–GC-T035.
- GC-T022 e GC-T035 → GC-T039–GC-T045.
- GC-T036–GC-T038 podem ocorrer em paralelo somente após seus próprios admission gates e sem compartilhar arquivos centrais sem coordenação.

## Notas de execução

- Preparar um plano curto por história antes de alterar código, conforme `AGENTS.md`.
- Testes correspondentes devem acompanhar ou preceder cada implementação.
- Não marcar tarefa concluída apenas porque o código compila; validar o cenário independente da fase.
- Não alterar silenciosamente métrica, enum, contrato ou interpretação de fonte.
- Cobertura por cidade permanece fora desta feature até existir fonte e spec próprias.
