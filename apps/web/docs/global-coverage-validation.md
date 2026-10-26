# Validação — cobertura global

Data: 2026-10-26

## Gates executados

- `npm run format:check`: passou.
- `npm run lint`: passou, zero warnings.
- `npm run typecheck`: passou.
- `npm test`: 6 arquivos e 17 testes passaram.
- `npm run build`: passou. O aviso de chunk grande permanece restrito ao
  MapLibre, que já é carregado dinamicamente.
- `npm run test:e2e`: 19 testes passaram; 1 skip esperado para hover em projeto
  touch/mobile.
- Playwright oficial: 2/2 passaram contra o backend e PostgreSQL reais,
  incluindo seleção do Canadá, valor 15.655, microcopy IMP/TFWP e fonte IRCC.
- `npm audit`: zero vulnerabilidades.

## Cobertura funcional

Os testes cobrem paginação integral do catálogo, derivação
`AVAILABLE/UNAVAILABLE/UNKNOWN_ERROR`, legenda, badges, filtro “Somente com
dados”, seleção de país sem observação, falha parcial de `/stats/map`, teclado,
touch, tooltip/foco, MultiPolygon, reduced motion e fallback sem WebGL.

A camada `symbol` de nomes de países usa o catálogo pt-BR, fallback para o nome
cartográfico/ISO3, colisão do MapLibre, densidade progressiva por zoom e fonte
local. Testes unitários verificam a expressão e a configuração da camada; E2E
desktop/mobile confirma que os nomes foram associados à cartografia sem quebrar
a seleção.

O catálogo permaneceu utilizável durante falha de cobertura e o painel de país
válido sem observação não exibiu retry de rede. A integração real confirmou os
cinco endpoints, zero oficial, supressão e país mundial sem release.

O seletor de indicador separa Europa, Reino Unido e Canadá e limpa ano/grupo ao
trocar de fonte. A inicialização dos filtros não sobrescreve uma escolha feita
enquanto os defaults ainda carregam. Para o Canadá, a interface explicita que o
valor é estoque anual IMP, arredondado pela fonte e sem TFWP.

## Segurança e licenças

Não foram encontrados segredos no código. O frontend chama apenas a API
same-origin Visa Atlas e usa GeoJSON/worker locais. Natural Earth e o catálogo
ODbL mantêm atribuição documentada; links externos usam `noopener noreferrer`.
A CSP recomendada permanece documentada em `apps/web/README.md`.
