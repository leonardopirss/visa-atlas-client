# Implementation Plan: Cobertura global e novas fontes oficiais

**Feature:** `004-global-coverage-expansion` · **Data:** 2026-10-24 · **Spec:** `spec.md`

## Summary

Separar catálogo mundial de disponibilidade estatística, tornar cobertura compreensível antes e depois do clique e acrescentar adaptadores nacionais somente após validação semântica. A entrega preserva o monólito modular, as cinco rotas públicas e o pipeline de releases existente.

## Technical Context

- **Frontend:** React/Vite/TypeScript strict, MapLibre, TanStack Query, Vitest/Testing Library e Playwright em `apps/web/`.
- **Backend:** NestJS/TypeScript strict, PostgreSQL/Prisma e Jest no repositório irmão `../visa-atlas-server/`.
- **Contrato:** OpenAPI 3.1 em `specs/001-shared-api-contract/contracts/openapi.yaml`, com snapshot sincronizado no backend.
- **Catálogo:** fonte mundial versionada com ISO2, ISO3, nome em português, região e licença documentada.
- **Ingestão:** adaptadores por organização/dataset sobre o pipeline versionado existente.
- **Observabilidade:** jobs estruturados, checksum, relatório de qualidade e retenção do último release publicado.

## Architecture Decisions

### AD-001 — Catálogo não é cobertura

`Country` passa a representar países válidos do produto independentemente de possuir observação. A existência de dados é derivada de releases publicados para os filtros ativos. Assim, um país mundial conhecido retorna detalhe indisponível, e não `404`.

### AD-002 — Cobertura e comparação são experiências diferentes

O modo de cobertura informa presença/ausência e procedência. Valores só recebem escala visual, ordenação ou ranking quando pertencem ao mesmo `comparisonGroupId`. Fontes incompatíveis podem coexistir no produto, mas não em uma comparação numérica enganosa.

### AD-003 — Sem novo endpoint na primeira entrega

O frontend combina `/countries` com `/stats/map` para os filtros ativos. Se a avaliação provar que isso não atende paginação, busca ou acessibilidade, uma extensão aditiva dos DTOs existentes deve passar pelo gate do contrato; não será criado `/coverage` unilateralmente.

### AD-004 — Um adaptador por fonte oficial

Cada fonte possui cliente, configuração, parser e validações próprias. O núcleo de staging, checksum, publicação e rollback é compartilhado. Mapeamentos de categorias são explícitos e cobertos por testes; nomes não são usados para inferir semântica.

## Source Admission Gate

Antes de codificar um adaptador, registrar em `research.md`:

1. órgão publicador e URL primária;
2. licença/regras de reutilização;
3. formato e estabilidade de acesso;
4. cidadania brasileira disponível;
5. evento medido: aplicação, decisão, visto, permissão ou residência;
6. finalidade/categorias de trabalho incluídas e excluídas;
7. unidade estatística e tratamento de revisões/supressões;
8. período e frequência;
9. `MetricType` e `comparisonGroupId` propostos;
10. decisão `ACCEPTED`, `REJECTED` ou `NEEDS_REVIEW` com justificativa.

Ordem candidata de pesquisa: Reino Unido, Estados Unidos, Austrália e Canadá. A ordem de implementação será definida pela qualidade e automatização da fonte, não apenas por prioridade comercial.

## Delivery Slices

### Slice A — Catálogo mundial e ausência honesta

- Sincronizar catálogo mundial no backend sem depender de observações.
- Garantir `200 + UNAVAILABLE` para país conhecido sem release.
- Manter `404` para ISO3 válido na forma, mas ausente do catálogo aprovado.
- Cobrir contratos e integrações antes de alterar a UI.

### Slice B — Descoberta visual de cobertura

- Cruzar catálogo e `/stats/map` para os filtros atuais.
- Usar tons de cinza para disponibilidade, mantendo verde apenas na seleção.
- Adicionar tooltip/foco, legenda, badges na busca/lista e painel vazio orientativo.
- Tratar falha de cobertura separadamente de indisponibilidade estatística.

### Slice C — Novas fontes oficiais

- Executar admission gate e decisão de contrato por fonte.
- Implementar um adaptador por vez como vertical slice testável.
- Publicar somente após fixture oficial anonimizada ou amostra redistribuível, validações e teste de atualização real controlada.
- Não bloquear uma fonte aprovada pela indisponibilidade de outra.

## Contract Impact

- Nenhum endpoint adicional é planejado.
- O contrato atual já representa ausência via `Statistic.value=null` e `DataStatus.UNAVAILABLE`.
- Um novo `MetricType`, se necessário para permissões de trabalho, é breaking semanticamente mesmo que seja uma expansão de enum; exige atualização do OpenAPI, tipos gerados, backend, frontend, fixtures e decisão registrada.
- A inclusão opcional de metadados de cobertura em `Country` só pode ocorrer se o cruzamento `/countries` + `/stats/map` falhar nos critérios da US1.

## Project Structure

```text
visa-atlas-spec-kit/
  specs/004-global-coverage-expansion/
  specs/001-shared-api-contract/contracts/openapi.yaml
  apps/web/src/features/globe/
  apps/web/src/features/country-detail/
  apps/web/src/services/api/
  packages/geo/

visa-atlas-server/
  prisma/
  src/modules/countries/
  src/modules/statistics/
  src/modules/ingestion/adapters/<source>/
  docs/data-sources.md
  test/contract/
  test/integration/
```

## Constitution Check

- [x] Catálogo e ausência não fabricam valores nem transformam `null` em zero.
- [x] Métricas e grupos incompatíveis permanecem separados.
- [x] Fontes e classificações originais continuam auditáveis.
- [x] Frontend consulta somente a API Visa Atlas.
- [x] Cinco endpoints v1 são preservados; mudanças contratuais têm gate explícito.
- [x] País indisponível permanece clicável, com verde exclusivo da seleção.
- [x] Ingestão reutiliza publicação atômica e último snapshot válido.
- [x] Segurança, licenciamento, acessibilidade e testes estão nas condições de aceite.

## Dependencies and Gates

- `001-shared-api-contract` governa qualquer mudança de DTO ou enum.
- `002-visa-atlas-backend` fornece schema e pipeline de ingestão.
- `003-interactive-globe-frontend` fornece seleção, mapa, busca, painel e fallback.
- Slice A bloqueia a experiência completa da Slice B.
- Cada fonte da Slice C depende de admission gate aprovado e pode avançar independentemente das demais.
- Comparação visual de valores depende de prova de compatibilidade; cobertura binária não depende dela.

## Risks and Mitigations

- **Catálogo e GeoJSON divergirem:** teste automático compara ISO3 e documenta exceções territoriais.
- **Fonte mudar planilha/API:** validação de schema, limites de resposta, fixture versionada e falha fechada sem substituir release.
- **“Mais concessões” parecer “mais fácil”:** microcopy obrigatória e ausência de ranking fora de grupo comparável.
- **Enum genérico demais:** criar métrica específica após revisão em vez de encaixar conceito incorreto.
- **Cobertura visual depender de duas requisições:** manter estados independentes e medir; só então considerar extensão aditiva do contrato.
- **Licença impedir redistribuição de fixture:** usar fixture estrutural mínima sintética e teste de smoke controlado sem versionar dados proibidos.

## Validation Strategy

- **Contrato:** validação OpenAPI e testes de conformidade dos cinco endpoints.
- **Backend unitário:** catálogo, normalização ISO, mapeamento e validação de cada adaptador.
- **Backend integração:** país sem dado, idempotência, rejeição, publicação e rollback.
- **Frontend unitário:** derivação de cobertura, tooltip, legenda, busca e estados de erro/ausência.
- **E2E:** país com dado, país sem dado, ISO inválido, troca rápida, teclado, touch, multipolígono e fallback sem WebGL.
- **Qualidade:** lint, format check, typecheck, testes, build e auditoria de dependências em ambos os repositórios.
