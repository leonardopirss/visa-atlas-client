# Bug Verification: Cobertura simultânea de Europa e Canadá

- **Slug**: country-selection-data-swap
- **Tested**: 2026-10-26T01:05:00-03:00
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

O comportamento de alternância não se reproduz após a correção. Espanha e
Canadá permanecem como “Dados disponíveis” antes e depois da seleção do Canadá,
tanto na API sintética em desktop/mobile quanto no ambiente real com API,
PostgreSQL e releases oficiais.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Playwright: Espanha → fechar → Canadá → fechar → conferir ambos os badges | pass | A cobertura permaneceu disponível para as duas fontes. |
| New / updated tests | `npm run test:e2e -- tests/e2e/global-coverage.spec.ts` | pass | 13 passaram; 1 skip esperado para hover em mobile. |
| Real integration | `npm run test:e2e:official` | pass | 2 passaram contra API e PostgreSQL reais; a regressão Europa/Canadá está no teste oficial. |
| Regression suite | `npm test` | pass | 6 arquivos e 19 testes passaram. |
| Lint / type-check | `npm run format:check && npm run lint && npm run typecheck` | pass | Formatação válida, zero warnings de lint e tipos válidos. |
| Production build | `npm run build` | pass | Build concluído; apenas aviso conhecido do chunk MapLibre. |
| Diff integrity | `git diff --check` | pass | Nenhum erro de whitespace. |

## Output Excerpts

```text
Test Files  6 passed (6)
Tests       19 passed (19)
```

```text
global-coverage.spec.ts: 13 passed, 1 skipped
official-api-integration.spec.ts: 2 passed
```

## Residual Risks

- A descoberta de cobertura realiza três chamadas cacheáveis a `/stats/map`,
  uma por indicador oficial. O custo é pequeno no cenário atual, mas deve ser
  acompanhado se novos indicadores forem adicionados.
- O aviso de bundle acima de 500 kB pertence ao chunk dinâmico do MapLibre e não
  foi introduzido por esta correção.

## Recommendation

Fechar o bug — a causa foi corrigida e o cenário original foi verificado em
desktop, mobile e integração real, sem regressões nos gates locais.
