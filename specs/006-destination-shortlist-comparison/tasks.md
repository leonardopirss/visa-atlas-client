# Tasks: Shortlist e comparação segura de destinos

**Inputs:** `spec.md`, `plan.md`, `research.md`, Constituição,
`../001-shared-api-contract/contracts/openapi.yaml`.
**Formato:** `[ID] [P?] [US] Descrição (caminho exato)`.
**Regra de conclusão:** marcar `[x]` somente após implementação, testes da tarefa
e evidência de validação. Itens `[P]` não podem editar o mesmo arquivo
simultaneamente.

## Phase 1 — Discovery e gates (bloqueante)

- [x] DS-T001 [US2] Confirmar nos DTOs gerados os campos exatos usados na chave
      de compatibilidade e registrar qualquer lacuna em
      `specs/006-destination-shortlist-comparison/research.md`.
- [x] DS-T002 [US2] Construir uma matriz de cenários reais para pelo menos dois
      países europeus compatíveis, Reino Unido, Canadá e um país sem dado, sem
      registrar números de produção como fixture, em
      `specs/006-destination-shortlist-comparison/research.md`.
- [x] DS-T003 [US3] Verificar no ambiente de hosting que query strings e refresh
      de SPA preservam `country`, `compare` e `view`; registrar a decisão de URL em
      `apps/web/README.md`.
- [x] DS-T004 [US1] Revisar limite, privacidade, modelo de storage e separação
      shortlist/URL; registrar a decisão final neste `plan.md` antes de implementar.
- [x] DS-T005 [US2] Registrar “sem impacto contratual” em
      `specs/001-shared-api-contract/decision.md`; se algum campo estiver ausente,
      interromper as fases seguintes e abrir revisão de contrato.

**Checkpoint:** DS-T001–DS-T005 aprovadas; nenhum `/compare`, enum ou DTO novo
pode ser criado silenciosamente.

## Phase 2 — Foundational: estado, storage e navegação

- [x] DS-T006 [US1] Criar tipos, invariantes e operações puras da shortlist
      (ISO3 único, ordem estável, máximo três) em
      `apps/web/src/features/shortlist/shortlist.ts`.
- [x] DS-T007 [P] [US1] Implementar parser/serializer versionado e adapter de
      `localStorage` com fallback seguro em
      `apps/web/src/features/shortlist/shortlist-storage.ts`.
- [x] DS-T008 [P] [US3] Implementar parser, canonicalização e comandos de
      histórico para `country`, `compare` e `view` em
      `apps/web/src/app/navigation-state.ts`.
- [x] DS-T009 [P] [US2] Extrair resolução de métrica por destino de
      `apps/web/src/app/app-state.tsx` para função pura reutilizável em
      `apps/web/src/features/comparison/destination-metric.ts`.
- [x] DS-T010 [US1] Criar `ShortlistProvider`/hook com hidratação segura na
      inicialização CSR, operações tipadas e resultado explícito para limite/storage em
      `apps/web/src/features/shortlist/shortlist-context.tsx` e integrá-lo em
      `apps/web/src/main.tsx`.
- [x] DS-T011 [US3] Integrar estado de navegação ao `AppStateProvider`, incluindo
      `popstate`, identidade validada e preservação de `view=list`, em
      `apps/web/src/app/app-state.tsx` e `apps/web/src/app/app.tsx`.
- [x] DS-T012 [P] [US1] Testar duplicata, quarto item, ordem, versão inválida,
      JSON corrompido, storage indisponível e hidratação em
      `apps/web/src/features/shortlist/__tests__/`.
- [x] DS-T013 [P] [US3] Testar canonicalização, ISO3 malformado/duplicado,
      limite, parâmetros preservados e Voltar/Avançar em
      `apps/web/src/app/__tests__/navigation-state.test.ts`.

**Independent Test foundational:** estado local e URL podem ser exercitados sem
mapa ou backend; entradas inválidas nunca provocam erro fatal nem escrita
silenciosa na shortlist.

## Phase 3 — US1: montar e rever shortlist (P1)

- [x] DS-T014 [US1] Adicionar ação “Salvar destino”/“Remover da shortlist” ao
      detalhe, com estado selecionado, limite e anúncio acessível, em
      `apps/web/src/features/country-detail/components/country-panel.tsx`.
- [x] DS-T015 [US1] Criar launcher global com contador, nomes resolvidos pelo
      catálogo, remover item e abrir comparação em
      `apps/web/src/features/shortlist/components/shortlist-launcher.tsx`.
- [x] DS-T016 [US1] Integrar launcher ao header desktop/mobile sem encobrir busca
      ou controles existentes em `apps/web/src/app/app.tsx` e
      `apps/web/src/styles.css`.
- [x] DS-T017 [P] [US1] Cobrir adicionar, remover, contador, limite, anúncio e
      foco com Testing Library em
      `apps/web/src/features/shortlist/__tests__/shortlist-ui.test.tsx`.
- [x] DS-T018 [US1] Cobrir persistência após reload, storage bloqueado e fluxo
      mobile/teclado em `apps/web/tests/e2e/destination-comparison.spec.ts`.

**Independent Test US1:** três países persistem em ordem; o quarto é recusado
com feedback; remover um libera vaga; storage falho não quebra o explorador.

## Phase 4 — US2: comparação segura (P1)

- [x] DS-T019 [US2] Criar tipo discriminado por destino (`pending`, `success`,
      `unavailable`, `error`) e montar queries independentes com `AbortSignal` e
      identidade verificada em
      `apps/web/src/features/comparison/use-destination-comparison.ts`.
- [x] DS-T020 [US2] Implementar chave e agrupamento conservador por métrica,
      unidade, período e `comparisonGroupId` em
      `apps/web/src/features/comparison/comparison-compatibility.ts`.
- [x] DS-T021 [P] [US2] Criar testes de tabela cobrindo igualdade, uma dimensão
      diferente por vez, chave ausente, zero, null, supressão e ordem estável em
      `apps/web/src/features/comparison/__tests__/comparison-compatibility.test.ts`.
- [x] DS-T022 [US2] Criar cartão por destino com identidade, indicador, valor ou
      estado, fonte e retry isolado em
      `apps/web/src/features/comparison/components/destination-comparison-card.tsx`.
- [x] DS-T023 [US2] Criar `ComparisonView` com grupos comparáveis e blocos
      incompatíveis, sem ordenação por valor, score, vencedor ou eixo compartilhado,
      em `apps/web/src/features/comparison/components/comparison-view.tsx`.
- [x] DS-T024 [US2] Exibir modalidades verificadas, patrocínio, data e URL
      oficial segura por destino reutilizando componentes existentes em
      `apps/web/src/features/comparison/components/`.
- [x] DS-T025 [US2] Integrar entrada/saída da comparação ao app, restaurar foco e
      manter globo/lista funcional em `apps/web/src/app/app.tsx`.
- [x] DS-T026 [P] [US2] Testar grupo compatível, grupo misto, ausência, zero,
      supressão, falha parcial, retry e resposta tardia em
      `apps/web/src/features/comparison/__tests__/comparison-view.test.tsx`.
- [x] DS-T027 [US2] Cobrir comparação real Europa/Europa e comparação mista
      Europa/Reino Unido/Canadá sem mocks das rotas em
      `apps/web/tests/real-e2e/api-integration.spec.ts`.

**Independent Test US2:** alterar qualquer dimensão da chave separa os destinos;
falha de um cartão não afeta os demais; nenhuma tela declara “melhor” destino.

## Phase 5 — US3: URL, compartilhamento e restauração (P1)

- [x] DS-T028 [US3] Validar ISO3 de `country`/`compare` contra o catálogo após
      carregamento, limitar a três e comunicar itens ignorados em
      `apps/web/src/app/app.tsx` e `navigation-state.ts`.
- [x] DS-T029 [US3] Sincronizar seleção, comparação e modo de lista com History
      API, distinguindo `pushState` de `replaceState`, em
      `apps/web/src/app/navigation-state.ts`.
- [x] DS-T030 [US3] Implementar gerador de URL canônica e compartilhar via Web
      Share, Clipboard e fallback manual em
      `apps/web/src/features/comparison/components/share-comparison.tsx`.
- [x] DS-T031 [P] [US3] Testar feature detection, cancelamento de share, falha
      de clipboard e fallback selecionável em
      `apps/web/src/features/comparison/__tests__/share-comparison.test.tsx`.
- [x] DS-T032 [US3] Cobrir sessão limpa, URL inválida, duplicata, excesso,
      refresh e Voltar/Avançar em desktop/mobile em
      `apps/web/tests/e2e/destination-comparison.spec.ts`.

**Independent Test US3:** a URL restaura a comparação sem storage e nunca salva
automaticamente seus itens na shortlist local.

## Phase 6 — US4: compreensão e acessibilidade (P2)

- [x] DS-T033 [US4] Revisar microcopy por `MetricType`, incluindo evento medido,
      unidade e aviso “volume não é probabilidade”, em
      `apps/web/src/components/ui/metric-headline.tsx` e componentes de comparação.
- [x] DS-T034 [P] [US4] Garantir estrutura semântica de títulos, listas, grupos,
      status e links sem depender de cor ou posição em
      `apps/web/src/features/comparison/components/`.
- [x] DS-T035 [US4] Validar foco ao abrir/fechar comparação, roving/tab order
      natural, anúncios e conteúdo alcançável em 390×844 em
      `apps/web/tests/e2e/destination-comparison.spec.ts`.
- [x] DS-T036 [US4] Validar reduced motion, touch, leitor de tela e fallback sem
      WebGL; registrar evidências em
      `apps/web/docs/destination-comparison-validation.md`.

## Phase 7 — Hardening e release gate

- [x] DS-T037 [P] Medir chamadas de rede, reaproveitamento de cache, cancelamento
      e layout com três destinos; registrar baseline em
      `apps/web/docs/destination-comparison-validation.md`.
- [x] DS-T038 [P] Auditar storage/URL como entrada não confiável, links externos,
      ausência de PII/segredos, XSS, dependências e CSP em
      `apps/web/docs/destination-comparison-validation.md`.
- [x] DS-T039 Executar `npm run format:check`, `npm run lint`,
      `npm run typecheck`, `npm test`, `npm run build` e audit no workspace frontend;
      registrar comandos, versões e resultados em
      `apps/web/docs/destination-comparison-validation.md`.
- [x] DS-T040 Executar Playwright contra backend e banco reais de teste, sem
      interceptar as rotas validadas; registrar países/datasets e resultados em
      `apps/web/docs/destination-comparison-validation.md`.
- [x] DS-T041 Revisar DS-SC-001–DS-SC-006, confirmar ausência de mudança
      contratual e atualizar este checklist somente com evidências verificáveis.

## Dependencies

- DS-T001–DS-T005 → todas as tarefas de implementação.
- DS-T006/DS-T007 → DS-T010 → DS-T014–DS-T018.
- DS-T008 → DS-T011 → DS-T028–DS-T032.
- DS-T009 + DS-T019/DS-T020 → DS-T022–DS-T027.
- DS-T015 + DS-T023 → DS-T025 → DS-T030.
- DS-T018 + DS-T027 + DS-T032 → DS-T033–DS-T040.
- DS-T039/DS-T040 → DS-T041.

## Parallel Execution Notes

- Após o gate, storage (DS-T007), navegação (DS-T008) e resolução de métrica
  (DS-T009) podem avançar em paralelo porque não editam os mesmos arquivos.
- Testes marcados `[P]` podem acompanhar suas unidades, mas não devem inventar
  DTOs nem números oficiais.
- `app.tsx`, `app-state.tsx` e `styles.css` são pontos de integração; mudanças
  neles devem ser serializadas para evitar conflito e regressão visual.

## Notes

- Preparar um plano curto por história antes de alterar código, conforme
  `AGENTS.md`.
- Não marcar tarefa concluída apenas porque compila; validar seu cenário
  independente e anexar evidência.
- Fixtures sintéticas permanecem rotuladas e exclusivas de testes.
- Se surgir necessidade de contrato, analytics externo, login ou score, parar e
  abrir feature/decisão própria em vez de expandir silenciosamente este escopo.
