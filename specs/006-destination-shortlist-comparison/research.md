# Research: Shortlist e comparação segura de destinos

**Feature:** `006-destination-shortlist-comparison` · **Data:** 2026-11-15

## R-001 — Estado local da shortlist

**Decision:** persistir somente uma estrutura versionada `{ version: 1,
iso3: string[] }` em `localStorage`, validando tipo, formato, unicidade, catálogo
e limite ao carregar.

**Rationale:** a feature não contém dados pessoais, não exige conta e precisa
funcionar sem mudança de backend. Uma estrutura mínima reduz migração e risco de
estado obsoleto.

**Alternatives considered:**

- IndexedDB: complexidade sem volume de dados que a justifique.
- Query string como shortlist permanente: compartilhar uma URL passaria a
  modificar preferências locais e confundiria estado privado com sessão.
- Backend/login: fora do MVP e incompatível com a constituição atual.

## R-002 — URL e histórico

**Decision:** usar parâmetros canônicos `country=<ISO3>` para detalhe,
`compare=<ISO3>,<ISO3>[,<ISO3>]` para comparação e preservar `view=list` quando
aplicável. O modo de comparação da URL é estado da sessão, não uma escrita na
shortlist.

**Rationale:** links permanecem legíveis, curtos, inspecionáveis e compatíveis
com hosting de SPA. O histórico do navegador pode ser controlado com APIs
nativas, sem roteador adicional nesta entrega.

**Alternatives considered:**

- Hash routing: pior semântica de URL e não é necessário para o host atual.
- Adicionar React Router: dependência nova sem necessidade comprovada.
- Serializar filtros completos: o recorte atual é fixo e valores resolvidos
  pelo backend não devem ser congelados em links obsoletos.

## R-003 — Métrica por destino

**Decision:** extrair o mapeamento existente de destino para métrica para uma
função pura e compartilhada. Cada consulta de detalhe recebe sua métrica
aplicável; o resultado, e não o mapeamento de UI, determina a compatibilidade.

**Rationale:** Canadá, Reino Unido e países europeus usam eventos diferentes. Um
único `FilterState` global não representa corretamente uma comparação mista.

**Alternatives considered:**

- Reutilizar o filtro global para todos: produziria ausência enganosa e poderia
  consultar o dataset errado.
- Buscar todas as métricas por país: multiplica chamadas sem endpoint ou
  necessidade comprovada.
- Criar `/compare`: viola o escopo contratual e não é necessário para três
  destinos.

## R-004 — Regra de agrupamento

**Decision:** derivar grupos por igualdade exata de `metricType`, `unit`,
período reportado e `comparisonGroupId`. Qualquer chave ausente ou diferente
impede comparação numérica compartilhada.

**Rationale:** aplica o limite estatístico já aprovado e falha de modo
conservador. Países incompatíveis ainda podem ser vistos lado a lado em grupos
explicativos, sem ranking.

**Alternatives considered:**

- Agrupar apenas por métrica: ignora metodologia, universo, unidade e release.
- Normalizar por população: exigiria outra fonte, metodologia e contrato.
- Score composto: não auditável com o domínio atual e induz recomendação.

## R-005 — Concorrência e falhas parciais

**Decision:** executar queries independentes, com chave e `AbortSignal` próprios,
mantendo loading, sucesso e erro por destino. A tela deriva grupos somente dos
snapshots válidos e mantém placeholders explícitos para os demais.

**Rationale:** a falha de um país não deve inutilizar a comparação e a troca
rápida não pode exibir resposta atrasada sob outro ISO3.

**Alternatives considered:**

- `Promise.all`: falha total desnecessária.
- Agregação manual fora do TanStack Query: duplicaria cache e cancelamento.

## R-006 — Compartilhamento

**Decision:** preferir Web Share API quando suportada, depois Clipboard API e,
por fim, campo somente leitura selecionável com a URL. Todas as alternativas
usam a mesma URL canônica construída localmente.

**Rationale:** oferece boa experiência em mobile e fallback determinístico sem
serviço externo.

## Contract Decision

**Status:** sem impacto contratual proposto.

A feature reutiliza `/countries`, `/countries/{iso3}` e, quando já acionado pela
interface, `/countries/{iso3}/timeseries`. Não adiciona endpoint, campo, enum ou
tipo gerado. Se a implementação provar que três consultas independentes não
atendem o orçamento de performance, a medição deverá abrir uma nova decisão de
contrato; não autoriza criar `/compare` dentro desta feature.

## Gate de implementação — 2026-11-15

### Campos de compatibilidade confirmados

O tipo gerado `Statistic` já expõe `metricType`, `unit`, `period`,
`comparisonGroupId`, `value` e `dataStatus`. A chave de comparação pode ser
derivada integralmente do DTO atual. `comparisonGroupId=null` falha de modo
conservador e não participa de grupo numérico compartilhado.

### Matriz de cenários

| Cenário                                            | Métrica esperada                  | Resultado de apresentação                                          |
| -------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| Dois destinos europeus no mesmo release comparável | `FIRST_RESIDENCE_PERMITS_GRANTED` | Mesmo grupo somente se unidade, período e grupo também coincidirem |
| Europa + Reino Unido                               | residência + vistos emitidos      | Grupos separados, sem ranking                                      |
| Europa + Canadá                                    | residência + titulares IMP        | Grupos separados, sem ranking                                      |
| Reino Unido + Canadá                               | vistos emitidos + titulares IMP   | Grupos separados, sem ranking                                      |
| País mundial sem observação                        | métrica aplicável + `UNAVAILABLE` | Cartão preservado sem zero fabricado                               |
| Erro isolado de um destino                         | sem snapshot confiável            | Erro e retry somente no cartão afetado                             |

A matriz descreve semântica e não incorpora números oficiais em fixtures.

### URL e hosting

Os estados usam somente query string na raiz da SPA: `/?country=DEU`,
`/?compare=DEU,FRA` e `/?view=list`. Como não há path virtual, refresh e acesso
direto continuam solicitando o mesmo `index.html`; não é necessária regra
adicional de rewrite. Vite dev/preview preservam a query string.

### Decisão final do gate

O limite permanece em três destinos. A shortlist é preferência privada em
storage local versionado; `compare=` é estado temporário da sessão. Nenhum deles
contém PII. Abrir URL compartilhada não grava storage. O gate está aprovado sem
mudança de OpenAPI.
