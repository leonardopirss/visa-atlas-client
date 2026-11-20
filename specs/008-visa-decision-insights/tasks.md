# Tasks: Indicadores de decisão e requisitos de vistos — frontend

**Fonte de verdade:**
`../../../visa-atlas-server/specs/008-visa-decision-insights/tasks.md` no workspace
irmão. Este checklist resume somente a trilha frontend; IDs preservam
rastreabilidade com o plano integrado.

## Contrato e fundação

- [ ] VDI-T010 Escrever testes RED de validação dos payloads aditivos.
- [ ] VDI-T012 Revisar o OpenAPI canônico com backend.
- [ ] VDI-T013 Regenerar contratos e comprovar sincronização.
- [ ] VDI-T017 Atualizar fixtures sintéticas tipadas.
- [ ] VDI-T018 Executar validação de contrato e typecheck.

## US1 — decisões e taxas

- [ ] VDI-T022 Escrever testes RED de taxa, operandos e ausência.
- [ ] VDI-T023 Escrever cenário Playwright real RED.
- [ ] VDI-T029 Implementar filtros, opções e query keys.
- [ ] VDI-T030 Exibir percentual, fórmula, scope, fonte e aviso.
- [ ] VDI-T031 Estender histórico e comparação com compatibilidade estrita.
- [ ] VDI-T032 Validar o MVP contra backend e banco reais de teste.

## US2 — prazo-alvo e inventário

- [ ] VDI-T035 Escrever testes RED de duração, arredondamento, vigência e scope.
- [ ] VDI-T036 Escrever cenário Playwright real RED.
- [ ] VDI-T040 Implementar rótulos, unidades originais e aproximação distintas.
- [ ] VDI-T041 Integrar filtro, detalhe, histórico e comparação.
- [ ] VDI-T042 Validar US2 contra backend real.

## US3 — requisitos práticos

- [ ] VDI-T045 Escrever testes RED de requisitos e condições.
- [ ] VDI-T046 Escrever cenário Playwright real RED.
- [ ] VDI-T050 Implementar cards acessíveis e links seguros.
- [ ] VDI-T051 Estender comparação sem câmbio ou ranking.
- [ ] VDI-T052 Validar US3 contra backend real.

## Release gate

- [ ] VDI-T053 Atualizar documentação frontend.
- [ ] VDI-T054 Auditar entradas, URLs, XSS, PII e dependências.
- [ ] VDI-T056 Validar acessibilidade e estados de erro/ausência.
- [ ] VDI-T058 Executar todos os gates frontend e Playwright real.
- [ ] VDI-T059 Confirmar contrato sincronizado e ausência de fixture em produção.
- [ ] VDI-T060 Revisar diffs sem incluir mudanças locais fora do escopo.
