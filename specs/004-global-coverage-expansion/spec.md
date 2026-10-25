# Feature Specification: Cobertura global e descoberta de dados

**Feature:** `004-global-coverage-expansion` · **Prioridade:** P1 · **Status:** Draft para revisão · **Data:** 2026-10-24

## Problema

O globo possui geometria mundial, mas o catálogo persistido contém somente os destinos sincronizados pelo Eurostat. O usuário consegue clicar em qualquer território sem saber antecipadamente onde há informação; países fora do catálogo retornam erro, embora sejam países válidos. Além disso, ampliar a cobertura com fontes nacionais exige preservar diferenças entre vistos, autorizações de residência e permissões de trabalho.

## User Scenarios & Testing

### US1 — Identificar cobertura antes de escolher um país (P1)

**Teste independente:** com catálogo mundial e uma resposta de mapa contendo países disponíveis e indisponíveis, o usuário identifica a cobertura por tonalidade cinza, legenda e tooltip sem abrir o painel.

**Aceitação:**

1. **Given** o globo carregado, **When** passo o cursor ou foco um país, **Then** vejo nome e estado “dados disponíveis” ou “ainda sem dados” para os filtros ativos.
2. **Given** nenhum país selecionado, **When** observo o mapa, **Then** países com e sem cobertura usam tons de cinza distinguíveis e somente o país selecionado pode usar verde `#30D883`.
3. **Given** busca ou lista acessível, **When** procuro um país, **Then** vejo o mesmo estado de cobertura apresentado no globo.
4. **Given** falha ao consultar cobertura, **When** o catálogo ainda está disponível, **Then** países permanecem selecionáveis e a interface informa que a cobertura não pôde ser confirmada.

### US2 — Consultar um país válido ainda sem estatística (P1)

**Teste independente:** selecionar `RUS`, `CAN` ou outro ISO3 válido sem observação retorna detalhe do país com `value=null` e `dataStatus=UNAVAILABLE`, sem `404` e sem número inventado.

**Aceitação:**

1. **Given** um país presente no catálogo mundial mas sem observação publicada, **When** consulto `/countries/{iso3}`, **Then** recebo `200`, identidade do país, estatística indisponível e listas verificadas vazias quando aplicável.
2. **Given** um ISO3 inexistente ou malformado, **When** consulto o detalhe, **Then** continuo recebendo erro tipado conforme o contrato.
3. **Given** um país sem cobertura, **When** abro o painel, **Then** vejo uma explicação clara e acesso a destinos que possuem dados, sem tratar indisponibilidade como falha de rede.
4. **Given** ausência de WebGL, **When** uso a lista, **Then** obtenho o mesmo catálogo e comportamento de indisponibilidade.

### US3 — Ampliar destinos com fontes oficiais nacionais (P1)

**Teste independente:** cada adaptador aceita uma fixture oficial versionada, rejeita dimensões incompatíveis, reimporta de forma idempotente e publica apenas observações rastreáveis.

**Aceitação:**

1. **Given** uma fonte oficial candidata, **When** ela não distingue cidadania brasileira, concessão, finalidade de trabalho, período e unidade, **Then** ela não é promovida para produção.
2. **Given** dados de vistos emitidos, permissões de trabalho ou primeiras autorizações de residência, **When** são ingeridos, **Then** mantêm `metricType`, categoria original, fonte, release e grupo de comparação próprios.
3. **Given** fontes nacionais semanticamente diferentes, **When** o mapa mostra cobertura global, **Then** ele não soma, ranqueia ou colore valores como se fossem diretamente comparáveis.
4. **Given** falha ou mudança de formato da fonte, **When** a atualização roda, **Then** o último snapshot publicado permanece disponível e o job falho é auditável.

### US4 — Entender o significado do indicador (P2)

**Teste independente:** rótulos e fontes deixam claro se o valor representa visto emitido, permissão de trabalho ou autorização de residência e nunca o apresentam como probabilidade individual.

**Aceitação:**

1. **Given** um valor do Eurostat, **When** consulto o país, **Then** o rótulo usa “primeiras autorizações de residência por motivo de trabalho”.
2. **Given** um valor de fonte consular, **When** consulto o país, **Then** o rótulo usa a modalidade oficial correspondente e não reutiliza o rótulo do Eurostat.
3. **Given** apenas contagens de concessões, **When** a interface explica o indicador, **Then** informa que volume não é taxa nem chance pessoal de aprovação.

## Requirements

- **GC-FR-001:** O catálogo de países DEVE ser mundial, versionado, identificado por ISO 3166-1 alpha-2/alpha-3 e independente da existência de observações estatísticas.
- **GC-FR-002:** País válido sem dados DEVE permanecer clicável e retornar `200` com `value=null` e `dataStatus=UNAVAILABLE`; `404` é reservado a recurso realmente inexistente.
- **GC-FR-003:** A cobertura exibida no globo, busca e lista DEVE refletir os filtros ativos e diferenciar indisponibilidade de erro de rede.
- **GC-FR-004:** Todos os países não selecionados permanecem cinza; tons, contorno, legenda e texto podem comunicar cobertura. Verde `#30D883` é exclusivo da seleção.
- **GC-FR-005:** A solução DEVE reutilizar as cinco rotas REST v1. Qualquer campo ou enum adicional exige alteração documentada no OpenAPI, regeneração de tipos e aprovação do gate compartilhado.
- **GC-FR-006:** Cada nova fonte DEVE passar por avaliação registrada de autoridade, licença, estabilidade, granularidade, cidadania, finalidade, evento medido, período e unidade antes da implementação do adaptador.
- **GC-FR-007:** Adaptadores nacionais DEVEM reutilizar o pipeline `fetch -> adapt -> validate -> stage -> checksum/deduplicate -> publish` e preservar o último snapshot válido em falhas.
- **GC-FR-008:** `FIRST_RESIDENCE_PERMITS_GRANTED`, `WORK_VISAS_ISSUED`, permissões de trabalho e decisões de aplicação não podem ser tratados como sinônimos. Novo conceito exige `MetricType` próprio quando nenhum enum existente for semanticamente exato.
- **GC-FR-009:** Comparação ou ranking numérico só pode ocorrer dentro do mesmo `comparisonGroupId`, com universo, período, unidade, finalidade e metodologia compatíveis.
- **GC-FR-010:** A interface DEVE exibir fonte primária, período, unidade, métrica e situação do dado; volume de concessões não pode ser rotulado como probabilidade ou facilidade.
- **GC-FR-011:** Fixtures sintéticas permanecem exclusivas de testes e explicitamente rotuladas; builds de produção não podem conter números ilustrativos.
- **GC-FR-012:** Busca, tooltip, legenda, painel vazio e fallback sem WebGL DEVEM ser acessíveis por teclado e leitores de tela e respeitar movimento reduzido.
- **GC-FR-013:** Cobertura por cidade NÃO DEVE ser inferida de dados nacionais. Localização subnacional só entra em feature futura mediante fonte oficial, modelo e contrato próprios.

## Key Entities

- `Country`: catálogo mundial independente das estatísticas.
- `DataAvailability`: estado derivado para os filtros ativos, sem fabricar valor.
- `SourceOrganization`, `SourceDataset`, `DatasetRelease`: procedência e versão por fonte.
- `MetricObservation`: observação normalizada sem perder categoria original.
- `ComparisonGroup`: fronteira obrigatória de comparabilidade.
- `IngestionJob`: auditoria de importações e falhas.

## Success Criteria

- **GC-SC-001:** 100% dos ISO3 suportados pela cartografia e reconhecidos pelo catálogo abrem painel sem erro técnico, ainda que sem estatística.
- **GC-SC-002:** Em teste de usabilidade, o estado de cobertura de um país é identificável antes do clique por globo, busca e lista.
- **GC-SC-003:** 100% das novas observações publicadas possuem fonte, release, período, unidade, cidadania, finalidade, categoria original, métrica e grupo de comparação.
- **GC-SC-004:** Nenhum teste permite ranking entre grupos incompatíveis ou exibição de contagem como taxa de aprovação.
- **GC-SC-005:** Cada adaptador novo comprova idempotência, rejeição semântica e preservação do snapshot anterior.
- **GC-SC-006:** Lint, typecheck, testes unitários, integração, contrato, E2E e build passam nos dois repositórios.

## Assumptions

- O recorte inicial continua sendo cidadania `BRA` e finalidade `WORK`.
- O Eurostat permanece responsável pela métrica europeia existente.
- Reino Unido, Estados Unidos, Austrália e Canadá são candidatos, não fontes aprovadas automaticamente; a matriz semântica e a licença determinam a inclusão.
- Cobertura global significa descoberta honesta de disponibilidade, não comparabilidade global automática.

## Out of Scope

- Probabilidade pessoal, aconselhamento jurídico ou recomendação automática de elegibilidade.
- Ranking global que misture métricas ou metodologias incompatíveis.
- Estatísticas por cidade sem fonte oficial subnacional.
- Novos endpoints públicos, autenticação, formulários de visto ou scraping de páginas sem autorização/licença verificada.
