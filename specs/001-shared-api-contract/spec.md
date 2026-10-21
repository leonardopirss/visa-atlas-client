# Feature Specification: Contrato REST e semântica estatística

**Feature:** `001-shared-api-contract` · **Prioridade:** P1 · **Status:** Draft para revisão · **Data:** 2026-10-19

## User Scenarios & Testing

### US1 — O frontend obtém dados confiáveis por um contrato estável (P1)
**Teste independente:** client tipado compila com 5 endpoints; exemplos de ausência de dados são válidos segundo o schema.

**Aceitação:**
1. **Given** cidadania BRA/finalidade WORK, **When** acesso filtros padrão, **Then** API informa período/grupo compatíveis ou estado sem dados.
2. **Given** um país com indicador indisponível, **When** consulto `/stats/map` ou `/countries/{iso3}`, **Then** obtenho `value: null` e `dataStatus`, nunca zero fabricado.
3. **Given** um ISO3 inválido, **When** envio requisição, **Then** API rejeita com erro documentado.

### US2 — Indicadores não comparáveis nunca parecem equivalentes (P1)
**Teste independente:** contratos documentam métrica, unidade, cidadania, período, grupo comparável, fonte e release.

**Aceitação:**
1. **Given** primeiras autorizações de residência por trabalho, **When** exibo contagem, **Then** o rótulo informa que não representa emissão de visto consular.
2. **Given** fontes com semânticas diferentes, **When** uma comparação é solicitada via cliente, **Then** app não mistura estatísticas.

## Requirements
- **SH-FR-001:** API `v1` com cinco rotas GET: `/filters/defaults`, `/countries`, `/stats/map`, `/countries/{iso3}`, `/countries/{iso3}/timeseries`.
- **SH-FR-002:** Tipos versionados; enum de indicador, dado e frescor; ISO3 nos países; paginar catálogo.
- **SH-FR-003:** `countries/{iso3}` agrega `country`, `statistics`, `classifications`, `visaPrograms`, `sources`, mantendo-os semanticamente isolados.
- **SH-FR-004:** `timeseries` separado e carregável sob demanda.
- **SH-FR-005:** Respostas não devem representar dados faltantes como 0; zero comprovado é permitido.
- **SH-FR-006:** `year` é resolvido pelo backend a partir de releases validados; nunca codificar um ano assumido.
- **SH-FR-007:** Erros tipados e previsíveis (400, 404, 422, 503), com código, mensagem e id de correlação.

## Key Entities
`Country`, `MetricObservation`, `ComparisonGroup`, `SourceDataset`, `VisaProgram`, `DataAvailability`.

## Success Criteria
- **SH-SC-001:** Cada rota documentada possui schema OpenAPI sem campos obrigatórios indefinidos.
- **SH-SC-002:** Testes de contrato impedem drift nos 5 endpoints.
- **SH-SC-003:** FE e BE conseguem compilar isoladamente a partir de contratos versionados.

## Assumptions
- O contrato é proposto e ainda não foi implantado.
- `visaPrograms` e `sources` podem ser coleções vazias quando não houver conteúdo verificado.
