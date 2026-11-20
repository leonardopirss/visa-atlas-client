# Feature Specification: Indicadores de decisão e requisitos de vistos

**Feature:** `008-visa-decision-insights` · **Status:** Draft · **Data:** 2026-11-16

A especificação integrada e os critérios de aceitação estão em
`../../../visa-atlas-server/specs/008-visa-decision-insights/spec.md`.

O frontend deve permitir explorar resultados de decisão e taxas auditáveis
(P1), tempo/processos pendentes com semântica explícita (P2) e requisitos
versionados das modalidades (P3). Deve preservar fonte, período, scope, unidade,
status e ausência honesta; não pode apresentar score, ranking, elegibilidade ou
probabilidade pessoal.

O OpenAPI canônico continua em
`../001-shared-api-contract/contracts/openapi.yaml`. Qualquer divergência entre
esta síntese e a especificação integrada deve bloquear a implementação até a
revisão conjunta FE/BE.
