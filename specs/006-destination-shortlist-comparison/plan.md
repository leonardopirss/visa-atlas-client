# Implementation Plan: Shortlist e comparação segura de destinos

**Feature:** `006-destination-shortlist-comparison` · **Data:** 2026-11-15 · **Spec:** `spec.md`

## Summary

Adicionar uma shortlist local de até três destinos, uma visão comparativa que
agrupa somente estatísticas semanticamente compatíveis e URLs restauráveis. A
entrega é frontend-only, reutiliza o contrato atual, degrada sem storage/WebGL e
mantém estado de URL separado das preferências locais.

## Technical Context

- **Frontend:** React 19, TypeScript strict, Vite, TanStack Query, MapLibre,
  Vitest/Testing Library e Playwright em `apps/web/`.
- **Backend:** NestJS disponível no repositório irmão para E2E real; nenhuma
  mudança planejada.
- **Contrato:** OpenAPI e tipos gerados em `packages/contracts`; cinco operações
  REST v1 preservadas.
- **Persistência:** `localStorage` versionado, pequeno e validado, com fallback
  em memória para a sessão quando indisponível.
- **Navegação:** `URLSearchParams`, History API e listener de `popstate`, sem nova
  dependência de roteamento.
- **Acessibilidade:** regiões `aria-live`, foco explícito entre launcher,
  comparação e retorno, layout responsivo e conteúdo útil fora do canvas.

## Architecture Decisions

### AD-001 — Shortlist privada e comparação compartilhada são estados distintos

A shortlist é preferência local. `compare=` representa somente a sessão aberta
pela URL. A pessoa pode salvar ou remover itens explicitamente, mas abrir um
link nunca grava os países recebidos no storage.

### AD-002 — Compatibilidade é derivada dos DTOs retornados

O frontend pode escolher a métrica correta para consultar cada destino, mas só
o snapshot retornado fornece a chave final. A função de agrupamento será pura,
exaustivamente testada e conservadora diante de campo ausente.

### AD-003 — Consultas isoladas, apresentação coordenada

Cada destino mantém query, retry e erro próprios. Um container coordena a
seleção e entrega estados discriminados para componentes de apresentação. Não
há `Promise.all` nem payload agregado inventado no cliente.

### AD-004 — URL nativa antes de roteador

O produto possui uma única superfície principal e poucos estados navegáveis.
APIs nativas atendem `country`, `compare`, `view` e histórico com menor custo.
A decisão será revista se surgirem páginas independentes ou rotas aninhadas.

## Delivery Slices

### Slice A — Modelo local e ações de shortlist

- Criar parser/serializer versionado e adapter seguro de storage.
- Adicionar Provider/hook com operações pequenas e limite explícito.
- Expor ação no detalhe e launcher global com contador.
- Cobrir storage bloqueado/corrompido, duplicata e quarto item.

### Slice B — Comparação segura

- Extrair resolução de métrica por destino para módulo de domínio do frontend.
- Consultar até três detalhes com estados independentes.
- Derivar chaves/grupos de comparabilidade por função pura.
- Renderizar cartões, grupos incompatíveis, estados sem dado e modalidades.

### Slice C — URL, compartilhamento e histórico

- Interpretar e canonicalizar `country`, `compare` e `view`.
- Sincronizar ações de navegação e `popstate` sem loop de efeitos.
- Implementar Web Share, clipboard e fallback manual.
- Validar ISO3 contra o catálogo antes de restaurar a sessão.

### Slice D — Hardening integrado

- Validar desktop/mobile, teclado, leitor de tela, touch, reduced motion e lista
  sem WebGL.
- Rodar E2E contra backend real com países compatíveis, incompatíveis, sem dado
  e falha isolada controlada no ambiente de teste.
- Medir número de chamadas e estabilidade de layout antes do release gate.

## Proposed Project Structure

```text
apps/web/src/
  app/
    app-state.tsx
    navigation-state.ts
  features/
    shortlist/
      shortlist-context.tsx
      shortlist-storage.ts
      components/shortlist-launcher.tsx
      __tests__/
    comparison/
      comparison-compatibility.ts
      destination-query.ts
      components/comparison-view.tsx
      components/destination-comparison-card.tsx
      __tests__/
  features/country-detail/components/country-panel.tsx
  services/api/queries.ts
apps/web/tests/e2e/destination-comparison.spec.ts
apps/web/docs/destination-comparison-validation.md
```

Os nomes podem ser ajustados às convenções encontradas durante implementação,
mas responsabilidades de storage, navegação, regra de compatibilidade e
apresentação não devem ser misturadas em um único componente.

## Data Flow

```text
catálogo ── valida ISO3 ──► ComparisonSelection
                                 │
shortlist local ────────────────┤
URL compare= ─ estado da sessão ┤
                                 ▼
                    métrica aplicável por destino
                                 ▼
                 até 3 queries de detalhe independentes
                                 ▼
                    snapshots + estados por destino
                                 ▼
                chave de compatibilidade derivada
                    ├── grupo comparável
                    └── grupo separado + explicação
```

## Contract Impact

- Nenhum endpoint, enum, DTO ou tipo gerado será alterado.
- A comparação consome o detalhe existente e não cria um modelo de domínio
  paralelo.
- Qualquer necessidade de `/compare`, filtros novos ou campos adicionais deve
  interromper a implementação e abrir decisão em
  `specs/001-shared-api-contract/decision.md`.

## Constitution Check

- [x] Zero, ausência, supressão, revisão e erro permanecem distintos.
- [x] Métrica, unidade, período e grupo governam a comparabilidade.
- [x] Não há taxa, score, ranking ou recomendação pessoal inferida.
- [x] Cinco endpoints e tipos OpenAPI existentes são preservados.
- [x] Frontend não consulta fontes governamentais diretamente.
- [x] Não há login, PII, cookie ou segredo novo.
- [x] Links externos continuam sanitizados; storage e URL são entradas não
      confiáveis e validadas.
- [x] Mapa, lista, teclado, mobile e fallback sem WebGL continuam equivalentes.
- [x] E2E integrado ao backend real permanece gate de conclusão.

## Dependencies and Gates

- `001-shared-api-contract` governa DTOs e semântica.
- `003-interactive-globe-frontend` fornece seleção, detalhe e acessibilidade.
- `004-global-coverage-expansion` fornece catálogo mundial e ausência honesta.
- Slice A pode avançar antes da comparação; Slice B depende do resolver de
  métrica e DTOs atuais; Slice C depende do modelo de seleção estabilizado.
- Alteração de contrato bloqueia a feature até decisão FE/BE explícita.

## Risks and Mitigations

- **URL sobrescrever preferência:** manter estados distintos e exigir ação para
  salvar destinos compartilhados.
- **Métrica global errada em comparação mista:** query por destino e teste com
  Canadá/Reino Unido/Europa.
- **Comparação visual sugerir ranking:** grupos separados, sem ordenação por
  valor, eixo comum, cor de vencedor ou linguagem superlativa.
- **Storage lançar exceção:** adapter com `try/catch` restrito à fronteira e
  fallback em memória.
- **Resposta tardia trocar países:** query key por ISO3/filtros, `AbortSignal` e
  renderização que verifica identidade do snapshot.
- **Histórico entrar em loop:** uma única camada de navegação separa parsing de
  eventos de escrita e testa Voltar/Avançar.
- **Três detalhes aumentarem carga:** limite fixo, cache TanStack existente e
  medição; mudança de API somente após evidência.

## Validation Strategy

- **Unitário:** parser/storage, limite, canonicalização de URL, resolução de
  métrica, matriz de compatibilidade e estados discriminados.
- **Componente:** adicionar/remover, contador, feedback, grupos, falha parcial,
  retry, sharing fallbacks e foco.
- **E2E mockado:** storage corrompido/bloqueado, clipboard e falhas difíceis de
  provocar com serviços reais.
- **E2E real:** resposta dos endpoints, dados compatíveis/incompatíveis,
  ausência, navegação, refresh e layout mobile/desktop sem mock das rotas sob
  validação.
- **Qualidade:** format check, lint, typecheck, testes, build e audit de
  dependências; documentar comandos e resultados.

## Definition of Done

Todos os cenários P1 passam, nenhum dado incompatível é apresentado como um
ranking, URL e storage degradam com segurança, E2E real é aprovado e a matriz
DS-SC-001–DS-SC-006 possui evidência registrada.

## Gate Record — 2026-11-15

- Limite de três destinos: confirmado.
- Storage local versionado e sem PII: confirmado.
- Estado compartilhado separado da shortlist privada: confirmado.
- Query string somente na raiz, sem requisito novo de rewrite: confirmado.
- Campos de comparabilidade presentes no DTO atual: confirmado.
- Impacto no OpenAPI: nenhum.
