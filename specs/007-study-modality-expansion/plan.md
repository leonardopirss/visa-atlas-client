# Implementation Plan: Modalidade Estudo no frontend

## Phases

1. Expandir OpenAPI e regenerar contratos.
2. Tipar `FilterState.purpose` como `WORK | STUDY` e validar payloads.
3. Transformar Finalidade em seletor acessível e implementar transição atômica.
4. Entregar Europa com mapa, detalhe, histórico e E2E real.
5. Acrescentar rótulos e cobertura do Reino Unido após admission gate.
6. Acrescentar rótulos e cobertura do Canadá após admission gate.

## Constitution check

- Contrato antes da UI.
- Sem valores ilustrativos em produção.
- Fonte, evento, período e unidade sempre visíveis.
- Verde continua exclusivo da seleção no mapa.
- Testes Vitest e Playwright real obrigatórios.
