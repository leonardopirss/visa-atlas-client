# Visa Atlas — Pacote Spec Kit (frontend + backend + contratos)

**Versão:** 2.0 · **Data:** 2026-10-19 · **Status:** Especificações e tarefas propostas, prontas para revisão pelo agente.

> Este pacote foi **elaborado para o Visa Atlas** seguindo a estrutura dos templates oficiais do [GitHub Spec Kit](https://github.com/github/spec-kit). NÃO é uma cópia do CLI instalado nem foi executado por `specify init`/`speckit-tasks`. Instale o CLI oficial no repositório e faça o agente validar/reconciliar os arquivos antes de implementar. Não existem dados estatísticos fictícios prontos para produção.

## Decisões aprovadas
- Público, sem login no MVP. Filtros iniciais: cidadania `BRA`, finalidade `WORK`.
- Globo 3D MapLibre GL JS: seleção colore **somente o país escolhido de verde #30D883**; demais países cinza; painel flutuante/bottom sheet; retornar restaura cores.
- Estatísticas oficiais com período, unidade, fonte, grupo de comparabilidade, status e linhagem; distinguir primeira autorização de residência de visto consular.
- Uma API NestJS com **5 endpoints**, sem GET `/coverage` ou `/comparisons` na V1.
- Backend agrega `country`, `statistics`, `classifications`, `visaPrograms`, `sources` em `GET /countries/{iso3}`. Série histórica separada para lazy loading.
- Monorepo com responsabilidades e artefatos de Spec Kit **independentes** para shared, backend, frontend.

## Arquivos

```text
.specify/memory/constitution.md                Princípios e governança
specs/001-shared-api-contract/spec.md          Requisitos dos contratos
specs/001-shared-api-contract/plan.md          Plano e decisões compartilhadas
specs/001-shared-api-contract/tasks.md         Checklist SH (primeira fase)
specs/001-shared-api-contract/contracts/openapi.yaml   Contrato REST proposto
specs/002-visa-atlas-backend/spec.md           Jornadas e aceites backend
specs/002-visa-atlas-backend/plan.md           Plano NestJS + Prisma
specs/002-visa-atlas-backend/data-model.md     Domínio estatístico
specs/002-visa-atlas-backend/tasks.md          Checklist BE
specs/003-interactive-globe-frontend/spec.md  Jornadas e aceites frontend
specs/003-interactive-globe-frontend/plan.md  Plano React + MapLibre
specs/003-interactive-globe-frontend/tasks.md Checklist FE
AGENTS.md                                    Guardrails para agentes
PROMPTS_CURSOR.md                           Comandos e handoff
```

## Instalar o CLI oficial no SEU repositório

Para projeto **novo** (diretório vazio):

```bash
uv tool install specify-cli
mkdir visa-atlas && cd visa-atlas
specify init --here --integration cursor-agent
```

Para projeto **existente**, preserve seu trabalho em um commit antes de inicializar; depois confirme os arquivos que a CLI pretende gerar:

```bash
specify init --here --force --integration cursor-agent
```

O `--force` **pode substituir arquivos gerenciados com nomes conflitantes**. Faça backup/commit e revise o diff. Depois copie este pacote para o repositório, preservando a árvore `.specify/` instalada pela CLI. Não substitua os comandos/skills instalados da CLI pelos arquivos deste pacote.

As invocações de Spec Kit dependem da integração e da versão: podem aparecer como `/speckit.specify` ou `/speckit-specify`. Confira o comando que foi realmente instalado no Cursor.

## Sequência correta

1. Revise a constituição proposta e valide no agente via `speckit-constitution` **uma vez**.
2. **Primeiro** alinhe e congele `specs/001-shared-api-contract/contracts/openapi.yaml`.
3. Faça revisão de `spec.md` → `speckit-clarify` → `plan.md` → `speckit-checklist` → `tasks.md` → `speckit-analyze` para cada feature, em seus contextos.
4. Organize agentes em **worktrees separadas** se quiser desenvolvimento em paralelo. A conclusão do SH-001 é um pré-requisito para ambos.
5. Implemente tarefas por fase e execute testes/contratos, CI, revisão e `speckit-converge`.

A árvore `specs/001-*`, `002-*`, `003-*` organiza features. Se a CLI gerenciar feature ativa em `.specify/feature.json`, selecione a feature correspondente no fluxo da sua versão. Trocar só de branch Git não garante seleção da feature ativa.

**Integração com GitHub:** o pacote é local. Nenhum commit, branch ou issue foi criado automaticamente na sua conta.
