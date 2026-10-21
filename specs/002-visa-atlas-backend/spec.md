# Feature Specification: Backend de dados migratórios

**Feature:** `002-visa-atlas-backend` · **Prioridade:** P1 · **Status:** Draft · **Data:** 2026-10-19

## User Scenarios & Testing

### US1 — Consultar recorte BRA/WORK com integridade (P1)
**Teste independente:** os cinco endpoints respondem a fixtures validadas sem exigir frontend.

**Aceitação:**
1. **Given** dados publicados para BRA/WORK, **When** chamo `/stats/map`, **Then** recebo indicador e cobertura em única resposta.
2. **Given** um país sem observação, **When** consulto `/countries/{iso3}`, **Then** o catálogo continua visível e estatística reporta indisponibilidade.
3. **Given** filtro incompleto, **When** carrego defaults, **Then** só recebo ano comum de um grupo comparável publicado ou estado de ausência.

### US2 — Importar, validar e versionar publicação oficial (P1)
**Teste independente:** executar job com arquivo fixtures oficial/sintético isolado; rejeitar release inválida, repetir sem duplicar.

**Aceitação:**
1. **Given** um release importado duas vezes, **When** job repete, **Then** nenhuma observação é duplicada.
2. **Given** falha da fonte, **When** ingestão falha, **Then** release publicada anterior permanece servível.
3. **Given** unidade/semântica divergentes, **When** validação executa, **Then** release é bloqueada de publicação.

### US3 — Consultar detalhes, fontes e séries (P2)
**Teste independente:** `countries/ESP` agrega seções sem misturar métricas; timeseries traz anos com mesma unidade e grupo.

**Aceitação:**
1. **Given** programa de visto sem fonte verificada, **When** consulto detalhes, **Then** o programa não é apresentado como validado.
2. **Given** métricas incomparáveis, **When** consulto timeseries, **Then** não há série única enganosa.

## Requirements
- **BE-FR-001:** API NestJS v1 implementa EXATAMENTE operações declaradas no OpenAPI compartilhado.
- **BE-FR-002:** Dados públicos em PostgreSQL/Prisma com integridade referencial, índices e migrations.
- **BE-FR-003:** Importação por adaptador Eurostat, staging, checksum, verificação, promoção atômica, rollback lógico e idempotência.
- **BE-FR-004:** Dados diferenciam métricas; `dataStatus` separa `AVAILABLE`, `UNAVAILABLE`, `SUPPRESSED`, `ESTIMATED` e `REVISED`.
- **BE-FR-005:** Valor indisponível nunca é zero; zero oficial é válido.
- **BE-FR-006:** Séries, ranking e comparação devem preservar grupo, período, finalidade, cidadania e unidade.
- **BE-FR-007:** Agregação de país reúne `country`, `statistics`, `classifications`, `visaPrograms`, `sources`.
- **BE-FR-008:** Rotas públicas não permitem acionar jobs internos, publicar releases ou modificar dados.
- **BE-FR-009:** Registrar `fetchedAt`, `publishedAt`, `validatedAt`, metodologias e qualidade quando disponíveis.
- **BE-FR-010:** Não retornar estatísticas ou regras de visto não verificadas como dados oficiais.

## Key Entities
Country, Citizenship, VisaPurpose, SourceOrganization, SourceDataset, DatasetRelease, MetricObservation, ComparisonGroup, VisaProgram, OfficialLink, IngestionJob.

## Success Criteria
- **BE-SC-001:** 100% das observações expostas rastreáveis a fonte e release publicados.
- **BE-SC-002:** Execução duplicada do mesmo release resulta em 0 registros duplicados.
- **BE-SC-003:** Teste de contrato aprova as cinco rotas.
- **BE-SC-004:** Falha de ingestão não substitui snapshot válido.

## Out of Scope
Auth/contas, análise individual de elegibilidade, taxas de aprovação sem numerador e denominador válidos, refresh ao vivo em cada carregamento e API pública de comparações na V1.
