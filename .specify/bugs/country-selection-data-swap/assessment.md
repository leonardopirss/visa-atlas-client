# Bug Assessment: Cobertura alterna entre Canadá e Europa

- **Slug**: country-selection-data-swap
- **Created**: 2026-10-26T00:58:00-03:00
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

Ao selecionar países europeus, o Canadá aparece como “sem dados”. Ao selecionar
o Canadá, os dados canadenses aparecem corretamente, mas os países europeus
passam a aparecer como “sem dados”.

## Symptom

A disponibilidade exibida no globo, busca e lista é recalculada somente para o
indicador do último país selecionado. O esperado é que destinos com fontes e
indicadores oficiais distintos continuem identificados como disponíveis ao
mesmo tempo, sem que a seleção de um país apague visualmente a cobertura dos
demais.

## Reproduction

1. Abrir o globo ou a lista com o indicador europeu ativo.
2. Observar que países europeus têm dados e o Canadá aparece sem dados.
3. Selecionar o Canadá; a seleção troca o indicador para
   `VALID_PERMIT_HOLDERS`.
4. Observar que o Canadá passa a ter dados e os países europeus passam a ser
   marcados sem dados.
5. Selecionar novamente um país europeu; o comportamento se inverte.

## Suspected Code Paths

- `apps/web/src/app/app-state.tsx:14` — associa o destino selecionado a um
  `metricType` e substitui o filtro global em `selectCountry`.
- `apps/web/src/features/coverage/use-coverage.ts:10` — consulta uma única
  resposta de `/stats/map`, usando o mesmo filtro global alterado pela seleção.
- `apps/web/src/features/coverage/coverage.ts:13` — deriva disponibilidade a
  partir de somente uma resposta estatística e classifica todas as demais
  métricas como indisponíveis.
- `apps/web/src/app/app.tsx:35` — distribui essa cobertura monométrica ao globo,
  busca e lista.
- `visa-atlas-server/src/modules/statistics/statistics.service.ts:21` — por
  contrato, cada chamada de mapa resolve um único `metricType`/grupo comparável;
  portanto uma resposta isolada não representa a cobertura de fontes
  heterogêneas.

## Root Cause Hypothesis

**Confiança: alta.** A seleção muda corretamente o indicador usado pelo painel
do país, mas esse mesmo estado também alimenta a descoberta de cobertura global.
Como `/stats/map` retorna um único grupo estatístico comparável, a resposta do
Eurostat não contém o Canadá e a resposta do IRCC não contém os países europeus.
O frontend interpreta a ausência na resposta ativa como ausência total de dados,
causando a alternância observada. Os testes atuais confirmam a troca automática
de indicador, mas não verificam que a cobertura das outras fontes permanece
visível.

## Proposed Remediation

**Preferred**: separar a consulta de cobertura agregada do indicador usado no
painel. Consultar os indicadores oficiais suportados (`FIRST_RESIDENCE_PERMITS_GRANTED`,
`WORK_VISAS_ISSUED` e `VALID_PERMIT_HOLDERS`) sem reaproveitar ano ou grupo da
fonte anterior e combinar as respostas somente como presença/ausência. Um país
deve ser `AVAILABLE` quando qualquer resposta compatível possuir observação. Se
nenhuma possuir observação e alguma consulta falhar, o estado deve ser
`UNKNOWN_ERROR`; somente respostas concluídas sem observação devem resultar em
`UNAVAILABLE`. Valores de fontes diferentes não serão somados nem comparados.

Manter a troca automática de indicador por destino para o painel detalhado,
pois ela seleciona a semântica oficial correta de cada país.

**Alternatives**:

- Manter a cobertura presa ao seletor ativo e remover a troca automática ao
  clicar. Evita chamadas adicionais, mas o Canadá continuaria parecendo sem
  dados sob o indicador europeu e não resolve a descoberta global descrita.
- Criar um endpoint de cobertura agregada. Reduz chamadas do frontend, mas
  viola o escopo atual de cinco endpoints e exigiria mudança de contrato.

**Files likely to change**:

- `apps/web/src/features/coverage/use-coverage.ts`
- `apps/web/src/features/coverage/coverage.ts`
- `apps/web/src/features/coverage/__tests__/coverage.test.ts`
- `apps/web/tests/e2e/fixtures.ts`
- `apps/web/tests/e2e/global-coverage.spec.ts`

**Tests to add or update**:

- Combinar respostas europeia e canadense mantendo ambos os destinos como
  `AVAILABLE`.
- Garantir precedência de `AVAILABLE` e tratamento parcial de falhas como
  `UNKNOWN_ERROR` apenas quando nenhuma fonte confirmar dados.
- Reproduzir no Playwright a sequência Europa → Canadá → Europa e verificar que
  os badges/legenda de cobertura não alternam para “sem dados”.

## Risks & Considerations

- A cobertura fará até três consultas cacheáveis a `/stats/map`; monitorar custo
  e manter `staleTime` existente.
- Não combinar valores, períodos ou grupos de comparação entre fontes; a união
  é exclusivamente binária para descoberta de cobertura.
- Falha parcial não pode ser apresentada como ausência confirmada.
- As alterações locais existentes nesses arquivos devem ser preservadas.

## Open Questions

- Nenhuma questão bloqueante. A descrição e o fluxo atual sustentam a correção
  sem alterar o contrato público.
