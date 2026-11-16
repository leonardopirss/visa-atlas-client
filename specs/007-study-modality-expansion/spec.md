# Feature Specification: Modalidade Estudo no frontend

**Branch:** `007-study-modality-expansion`
**Date:** 2026-11-16
**Canonical cross-repository spec:** `../../visa-atlas-server/specs/007-study-modality-expansion/spec.md`

## Scope

Permitir selecionar `Trabalho` ou `Estudo` e propagar a finalidade pelas cinco rotas existentes. A entrega segue Europa (Eurostat), Reino Unido (Home Office) e Canadá (IRCC), sem comparar numericamente eventos incompatíveis.

## Acceptance

1. Trocar a finalidade limpa ano, métrica incompatível e grupo de comparação.
2. Mapa, lista, busca, detalhe, histórico e comparação usam a finalidade ativa.
3. Europa/Estudo mostra primeiras autorizações de residência por educação.
4. Reino Unido e Canadá mostram o evento exato publicado pela fonte.
5. O modo global combina somente disponibilidade; valores incompatíveis não recebem ranking.
6. Trabalho permanece retrocompatível.

## Contract gate

`specs/001-shared-api-contract/contracts/openapi.yaml` é a fonte de verdade. `STUDY` deve ser adicionado antes de tipos, validadores ou UI.
