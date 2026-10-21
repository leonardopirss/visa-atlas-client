# Feature Specification: Globo interativo Visa Atlas

**Feature:** `003-interactive-globe-frontend` · **Prioridade:** P1 · **Status:** Draft · **Data:** 2026-10-19

## User Scenarios & Testing

### US1 — Explorar o globo e escolher país (P1)
**Teste independente:** com mocks de contrato, selecionar Espanha deixa outros países cinza, ESP verde e abre detalhe.

**Aceitação:**
1. **Given** globo colorido, **When** seleciono ESP, **Then** todos os polígonos (incluindo ilhas) de ESP tornam-se verde `#30D883`, outros países cinza, oceanos permanecem neutros.
2. **Given** ESP selecionada, **When** seleciono DEU, **Then** ESP perde destaque e DEU é o único verde.
3. **Given** seleção, **When** pressiono Escape, **Then** cores globais retornam e filtros BRA/WORK permanecem.
4. **Given** ausência de WebGL, **When** abro o app, **Then** lista pesquisável oferece a mesma consulta por país.

### US2 — Consultar informações de trabalho por nacionalidade brasileira (P1)
**Teste independente:** uso de mocks com null mostra ausência, com zero oficial mostra zero e fonte; sem misturar indicadores.

**Aceitação:**
1. **Given** Brasil/Trabalho e ano disponível, **When** seleciono país, **Then** painel mostra título e unidade exatos do indicador.
2. **Given** país com `value=null`, **When** abro detalhes, **Then** informo ausência/supressão sem inventar contagens.
3. **Given** transição de país antes da resposta chegar, **When** resposta antiga retorna, **Then** não sobrescreve o país atual.

### US3 — Explorar histórico e fontes (P2)
**Teste independente:** aba de histórico chama timeseries sob demanda e modalidades/fontes já estão no detalhe agregado.

**Aceitação:**
1. **Given** painel de país, **When** abro série histórica, **Then** faz lazy load e apresenta evolução com fonte/metodologia.
2. **Given** mobile, **When** toco país, **Then** abre bottom sheet acessível e funcional.

## Requirements
- **FE-FR-001:** React/Vite + globo MapLibre/Globe com geometria territorial independente de estatísticas.
- **FE-FR-002:** Estado de seleção `selectedCountryIso3` com hover independente; cinza para outros países e verde para seleção, com outline claro.
- **FE-FR-003:** Busca/seleção com mouse, teclado, touch e suporte MultiPolygon.
- **FE-FR-004:** Estados loading/error/empty/suppressed/revised/stale e fallback sem WebGL.
- **FE-FR-005:** Filtros padrão BRA, WORK e ano da API; controles não suportados desativados/rotulados.
- **FE-FR-006:** Painel flutuante desktop e bottom sheet mobile; abas estatísticas, modalidades e fontes oficiais.
- **FE-FR-007:** Série histórica carregada somente na aba correspondente.
- **FE-FR-008:** Respeito a preferência reduzir movimento; cancelamento de câmera e requisições obsoletas.
- **FE-FR-009:** Atribuições cartográficas e fontes visíveis e URLs externas seguras.
- **FE-FR-010:** Nenhum número ilustrativo do Figma em produção.

## Key Entities
CountrySelection, FilterState, CountryDetail, MapObservation, MetricSeries, VisaProgram, SourceLink.

## Success Criteria
- **FE-SC-001:** 100% dos testes E2E cobrem troca e limpeza de seleção, inclusive multipolígono.
- **FE-SC-002:** O usuário chega à fonte oficial em no máximo 3 interações após clicar no país.
- **FE-SC-003:** Frontend não chama fontes oficiais, apenas a API.
- **FE-SC-004:** Experiência funcional em mobile e com WebGL indisponível.

## Assumptions
Figma visual de referência: https://www.figma.com/design/NCxqdZmCqBSO0k6uxZVmly ; cartografia/tiles devem ter licença adequada. Não copiar ativos da Apple.
