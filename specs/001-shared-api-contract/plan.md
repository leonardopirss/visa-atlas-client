# Implementation Plan: Contrato compartilhado

**Feature:** `001-shared-api-contract` · **Data:** 2026-10-19 · **Spec:** `spec.md`

## Summary
Congelar uma API REST pequena com 5 endpoints; garantir semântica consistente de indicadores e permitir trabalho paralelo de frontend e backend.

## Technical Context
- **API:** HTTP GET / JSON / OpenAPI 3.1.
- **Client:** TypeScript gerado do OpenAPI (ferramenta exata a escolher após ver configuração do repositório).
- **Testes:** validação de schema YAML e verificação de respostas/snapshots de contrato.
- **Storage:** N/A nesta feature.

## Constitution Check
- [x] Categorias estatísticas distintas representadas no contrato.
- [x] Dados indisponíveis como `null` + estado.
- [x] Identificador ISO3 e fonte/release rastreáveis.
- [x] Sem criação de endpoints não aprovados na V1.
- [ ] Confirmar com a equipe os filtros opcionais `metricType` e `comparisonGroupId` no endpoint de país.

## Project Structure
- `specs/001-shared-api-contract/contracts/openapi.yaml`: fonte de verdade.
- `packages/contracts/src/`: clientes e modelos tipados gerados ou mapeados.
- `apps/api/`: handlers e testes de conformidade.
- `apps/web/`: consumers e mocks derivados da API.

## Dependencies
Esta feature desbloqueia `002-visa-atlas-backend` e `003-interactive-globe-frontend`.

## Risks
- Modelar agregado pesado demais: permitir campos opcionais e cache com TTL, sem quebrar contrato.
- Dados reais por recorte ausentes: representar ausência em vez de devolver fixtures como produção.
