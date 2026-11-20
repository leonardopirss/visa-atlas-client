# Contract Decisions

## GC-D001 — Cobertura global e novas fontes

**Feature:** `004-global-coverage-expansion`

**Data:** 2026-10-24

**Status:** Aprovado para Fases 2 e 3 sem alteração de contrato; mudanças de enum permanecem bloqueadas até revisão da Fase 4.

### Contexto

O globo possui cartografia mundial, mas o backend cadastra países durante a ingestão Eurostat. Isso faz um país válido sem observação parecer inexistente. A expansão também encontrou três eventos diferentes: primeira autorização de residência, visto de trabalho emitido e titular de permissão de trabalho com permissão que entrou em vigor.

### Decisões

1. **Manter exatamente cinco endpoints v1.** Não criar `/coverage`, `/sources` ou endpoint específico por país/fonte.
2. **Separar catálogo de disponibilidade.** `/countries` lista países conhecidos independentemente de observação. `/countries/{iso3}` e `/countries/{iso3}/timeseries` retornam `200` e ausência tipada para país conhecido sem release; `404` permanece para país inexistente no catálogo.
3. **Sem mudança de DTO para a primeira entrega de UX.** O frontend cruza `/countries` e `/stats/map` para os filtros ativos. Uma extensão de DTO só será proposta após medição demonstrar necessidade.
4. **Reino Unido usa `WORK_VISAS_ISSUED`.** As concessões de vistos de trabalho patrocinado do Home Office cabem no enum existente, preservando subcategoria original e `comparisonGroupId` exclusivo.
5. **Não reutilizar `WORK_VISAS_ISSUED` para o Canadá.** O IRCC mede titulares com permissão que entrou em vigor. A proposta `WORK_PERMIT_HOLDERS_WITH_EFFECTIVE_PERMIT` exige revisão do OpenAPI, tipos gerados, Prisma, testes e microcopy antes de ingestão.
6. **Enums são semanticamente fechados.** Mesmo uma expansão aditiva de `MetricType` pode quebrar consumidores e deve passar pelo gate SH-T011/GC-T026.
7. **Nenhuma comparação global implícita.** Cobertura pode combinar presença/ausência de fontes; escala, ranking e soma continuam restritos ao mesmo `comparisonGroupId`.

### Impacto imediato no contrato

Nenhuma alteração no OpenAPI é necessária para:

- catálogo mundial;
- país conhecido sem dado;
- tooltip/legenda/badge de cobertura;
- primeiro adaptador do Reino Unido.

O contrato já declara `200` para detalhe sem estatística e representa ausência com `value: null` + `UNAVAILABLE`. A implementação atual é que ainda não possui catálogo mundial.

### Mudança futura candidata

Antes do adaptador canadense, a Fase 4 deve decidir a inclusão de:

```text
WORK_PERMIT_HOLDERS_WITH_EFFECTIVE_PERMIT
```

Definição proposta: número de pessoas de uma cidadania com uma ou mais permissões de trabalho que entraram em vigor no período reportado. Não é contagem de vistos, estoque em uma data, aplicações ou taxa de aprovação.

### Gate

- Fases 2 e 3 podem prosseguir sem modificar o contrato.
- Adaptador do Reino Unido pode prosseguir com `WORK_VISAS_ISSUED` após catálogo/UX.
- Canadá permanece `NEEDS_REVIEW` até aprovação explícita da mudança contratual.
- Estados Unidos e Austrália permanecem `NEEDS_REVIEW` por automação/formato, não por falta de enum.

### Encerramento da Fase 4 — N/A

GC-T023–GC-T026 foram revisadas e encerradas como `N/A` em 2026-10-24. A
decisão GC-D001 confirmou que catálogo mundial, estados de cobertura e a fonte
UK `Occ_D02` já cabem nos DTOs e enums existentes. Portanto, não houve edição
artificial do OpenAPI, regeneração de tipos ou alteração do snapshot backend.
O contrato continua com exatamente cinco operações. A proposta canadense
permanece bloqueada e deverá abrir uma revisão contratual própria antes de
qualquer implementação.

## GC-D002 — Canadá anual (IMP)

**Data:** 2026-10-25
**Status:** Aprovado sem alteração de contrato

A revisão selecionou um recurso diferente do arquivo mensal avaliado em
GC-D001: o estoque anual de titulares do International Mobility Program (IMP),
para finalidade de trabalho, com permissão válida em 31 de dezembro e
desagregação por cidadania. Esse evento cabe semanticamente no enum já existente
`VALID_PERMIT_HOLDERS`.

Não há novo enum, DTO, endpoint ou campo OpenAPI. O Canadá usa dataset,
release, unidade `HOLDERS`, categoria `IMP` e `comparisonGroupId` próprios. O
TFWP não é ingerido nem somado; portanto, o valor não pode ser apresentado como
total de permissões de trabalho do Canadá. Valores `--` permanecem
`SUPPRESSED/null` e os demais conservam o arredondamento oficial.

Esta decisão substitui somente o bloqueio canadense de GC-D001. A interpretação
do arquivo mensal como permissões que entraram em vigor continua fora do escopo
e exigiria nova decisão.

Em 2026-10-25, a descrição de `YearOptional` foi delimitada por aspas para
corrigir a sintaxe YAML que fazia a vírgula do texto ser interpretada como uma
propriedade OpenAPI. A correção foi replicada no snapshot backend e não altera
rotas, parâmetros, schemas, enums, tipos gerados ou semântica do contrato.

## DS-D001 — Shortlist e comparação segura de destinos

**Feature:** `006-destination-shortlist-comparison`

**Data:** 2026-11-15

**Status:** Aprovado sem alteração de contrato

A shortlist e a comparação reutilizam o catálogo e o detalhe de país das cinco
rotas REST v1. Não será criado endpoint `/compare`, nem campo, enum ou DTO novo.

O frontend consulta cada destino com sua métrica aplicável e deriva a
compatibilidade exclusivamente de `Statistic.metricType`, `unit`, `period` e
`comparisonGroupId`. Apenas chaves completas e idênticas podem formar um grupo
numérico. Chave ausente ou diferente mantém os destinos separados, sem ranking,
score, soma, vencedor ou probabilidade pessoal.

A shortlist permanece local ao navegador e `compare=` representa apenas estado
compartilhável da sessão. Nenhum desses estados é persistido pela API.

## VDI-D001 — Indicadores de decisão, scope e requisitos versionados

**Feature:** `008-visa-decision-insights`

**Data:** 2026-11-16

**Status:** Aprovado para merge contratual e testes RED; migration e ingestão
continuam bloqueadas até o OpenAPI canônico ser atualizado, sincronizado e
regenerado nos dois repositórios.

### Decisões

1. **Preservar cinco endpoints REST v1.** Não criar `/compare`, `/rates`,
   `/requirements` ou rota de ingestão pública.
2. **Adicionar somente métricas com fonte/semântica admitida na v1:**
   `DECISIONS_REFUSED`, `DECISIONS_WITHDRAWN`, `DECISIONS_LAPSED`,
   `APPROVAL_RATE`, `REFUSAL_RATE` e `PENDING_APPLICATIONS`. Mediana, P90, P80,
   projeção e backlog share ficam fora até nova decisão.
3. **Taxa é derivada e auditável.** Para o MVP UK `Vis_D02`, aprovação usa
   issued/(issued+refused) e recusa usa refused/(issued+refused). Withdrawn e
   lapsed permanecem outcomes brutos fora do denominador. O payload expõe
   operandos com observation, release, comparison group, source category,
   período e coefficient; nunca chama o denominador de total oficial de outcomes.
4. **População e programa são ortogonais.** `PopulationBasis` é
   `CITIZENSHIP|NATIONAL`; `programKey` é `ALL` ou chave namespaced. Requests
   legados resolvem `CITIZENSHIP:<citizenship>/ALL`. NATIONAL exige seleção
   explícita, omissão de `citizenship` e nunca é fallback para BRA.
5. **Contexto resolvido aparece nos envelopes.** Filter defaults, mapa e
   timeseries retornam `populationBasis` e `programKey`. `citizenship` torna-se
   nullable somente para NATIONAL; respostas legadas continuam retornando ISO3.
6. **Medição aproximada é explícita.** `Statistic.measurement` opcional carrega
   aproximação, incremento de arredondamento e precisão quando a fonte não
   publica contagem exata.
7. **Requisitos são uniões discriminadas.** Fee/funds usam dinheiro decimal como
   string e moeda/base; direitos/renovação usam estado; prazo-alvo usa duração e
   unidade original. Condições seguem schema fechado/versionado. Texto curto é
   apresentação e nunca regra de cálculo/comparação.
8. **Requisitos e pathways têm release.** Cada fato/transição expõe source com
   `releaseId` obrigatório, vigência em data civil, verificação e URL HTTP(S).
   `VisaProgram.requirements`/`pathways` são opcionais na primeira versão e
   retornam somente registros vigentes; histórico permanece auditável no banco.
9. **Ausência não é UNKNOWN.** Ausência de registro significa não
   publicado/disponível. `UNKNOWN` só é persistido quando a própria fonte afirma
   indeterminação; `DEPENDS` exige condição tipada.

### Compatibilidade e rollout

A forma JSON das consultas legadas permanece igual, exceto pelos campos aditivos
nos envelopes. Porém ampliar enum fechado e tornar `citizenship` nullable para a
nova consulta NATIONAL pode quebrar consumidores TypeScript exaustivos. Portanto
a mudança não é declarada incondicionalmente retrocompatível: backend, OpenAPI,
pacote gerado, frontend, fixtures e testes devem ser entregues de forma
coordenada. Consumidores antigos não devem solicitar NATIONAL antes de atualizar.

O artefato de merge revisado está em
`visa-atlas-server/specs/008-visa-decision-insights/contracts/openapi-visa-insights-delta.yaml`.
T012 deve aplicar essas decisões ao OpenAPI canônico; o delta isolado não é
contrato de produção.
