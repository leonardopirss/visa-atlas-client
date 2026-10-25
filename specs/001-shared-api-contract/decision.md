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
