# Guardrails de agentes — Visa Atlas

1. Leia `.specify/memory/constitution.md` antes de alterar código.
2. Siga **primeiro** `specs/001-shared-api-contract/contracts/openapi.yaml`; não crie endpoints alternativos unilateralmente.
3. Respeite divisão de responsabilidade: `apps/web` é somente frontend, `apps/api` somente backend, `packages/contracts` é gerado/revisado a partir do OpenAPI.
4. Não misture eurostat first residence permits com vistos consulares; não invente números, taxas de aprovação, classificação ou requisitos legais.
5. Use fixtures sintéticas apenas em testes, claramente rotuladas; não incluí-las em deploy de produção.
6. Em seleção de país, cinza para os demais, verde `#30D883` só no ISO3 selecionado; país indisponível continua clicável.
7. Código TypeScript strict, rotas validadas, testes adequados e documentação de mudança de contrato.
8. Os agentes FE/BE podem usar worktrees, mas alterações em `packages/contracts` só após acordo explícito.
9. Faça um plano pequeno por história antes de implementar; execute checklist e relatório de testes ao final de cada tarefa.
10. Não executar comandos destrutivos, criar releases ou publicar serviços sem aprovação explícita.
