# Validação — shortlist e comparação de destinos

**Feature:** `006-destination-shortlist-comparison`

**Data:** 2026-11-15

**Estado:** implementação P1 concluída e validada com backend e banco reais de
teste.

## Escopo validado

- shortlist versionada com até três ISO3 e ordem estável;
- storage válido, corrompido e bloqueado;
- salvar/remover, limite e foco por teclado;
- comparação compatível e separação de métricas incompatíveis;
- zero, ausência e supressão sem conversão semântica;
- erro parcial, retry e resposta atrasada por destino;
- URL de detalhe/comparação, canonicalização e Voltar/Avançar;
- validação de ISO3 contra o catálogo mundial;
- Web Share, clipboard e fallback manual;
- desktop Chromium e viewport mobile Chromium.

## Acessibilidade e degradação

- A comparação expõe `h1`, grupos `h2`, países `h3`, botões e regiões por nome
  acessível; o conteúdo estatístico não depende do canvas.
- O fluxo foi executado com `prefers-reduced-motion: reduce` e permaneceu
  funcional sem transição obrigatória.
- `HTMLCanvasElement.getContext` foi desativado no teste; a comparação continuou
  disponível porque não depende de WebGL.
- Os mesmos cenários passaram no projeto mobile Chromium, cobrindo touch e
  viewport 390×844.
- Foco por teclado foi validado ao salvar destino, entrar e sair da comparação;
  o retorno posiciona o foco no launcher da shortlist.
- A árvore de acessibilidade computada expõe os títulos da comparação, grupos e
  nomes de Espanha e Canadá independentemente do canvas.

## Baseline de rede, cache e layout

Com `ESP`, `DEU` e `CAN`, o ambiente dev concluiu exatamente uma resposta de
detalhe por destino. O React `StrictMode` pode iniciar e cancelar a primeira
montagem, resultando em até seis tentativas observadas, mas somente três
respostas são consumidas. O teste unitário de troca rápida confirma que resposta
atrasada não substitui a seleção atual.

Ao fechar a comparação e retornar com o histórico do navegador dentro do
`staleTime` de 60 segundos, nenhuma nova tentativa de detalhe foi emitida. Em
desktop e mobile, `scrollWidth <= clientWidth` na raiz da comparação com três
destinos, sem overflow horizontal da página.

## Resultados automatizados

Ambiente de execução: Node.js 26.11.1, npm 11.20.0 e Playwright 1.64.1.

| Verificação             | Resultado                                                      |
| ----------------------- | -------------------------------------------------------------- |
| `npm run format:check`  | aprovado                                                       |
| `npm run typecheck`     | aprovado                                                       |
| `npm run lint`          | aprovado                                                       |
| `npm test`              | 58 testes aprovados em 15 arquivos                             |
| `npm run build`         | aprovado; aviso preexistente de chunk MapLibre acima de 500 kB |
| `npm run test:e2e`      | 41 aprovados, 1 omitido intencionalmente para hover em touch   |
| `npm run test:e2e:real` | 4 aprovados contra API NestJS e PostgreSQL reais de teste      |
| `npm audit --omit=dev`  | 0 vulnerabilidades de produção encontradas                     |

A suíte E2E principal executa os fluxos da feature em desktop e mobile por meio
do adapter sintético de teste no nível do navegador. A suíte real complementa
esse gate sem interceptar as rotas validadas.

## Segurança e privacidade

- A shortlist contém somente ISO3 e permanece no navegador.
- A URL compartilhada contém somente até três ISO3 reconhecidos.
- Abrir um link não grava automaticamente a shortlist privada.
- URL e storage são tratados como entradas não confiáveis e validados.
- Links de modalidades continuam restritos a HTTP(S) e usam
  `noopener noreferrer`.
- Nenhum HTML externo, PII, token, cookie, segredo ou escrita de backend foi
  introduzido.

## Integração real

Em 2026-11-15, a suíte `npm run test:e2e:real` foi executada contra a API NestJS
em `127.0.0.1:3001` e um PostgreSQL temporário e isolado em
`127.0.0.1:55432/visa_atlas_test`. Redis, cache e rate limit permaneceram
desabilitados. O cluster temporário foi encerrado e removido após a execução.

Foram aprovados quatro cenários sem interceptação das rotas:

- integração dos cinco endpoints, preservando zero e supressão;
- país do catálogo sem observação tratado como indisponível;
- shortlist e comparação real de Espanha/Alemanha;
- separação conservadora de Espanha, Reino Unido e Canadá por métrica, unidade,
  período e grupo de comparação.

Espanha/Alemanha usam o fixture publicado preexistente. Reino Unido e Canadá
usam datasets sintéticos, explicitamente rotulados e exclusivos do banco de
teste (`uk-work-visas-test` e `canada-imp-test`). A execução terminou com
**4 testes aprovados em 8,9 s**.

## Revisão dos critérios de sucesso

| Critério  | Estado   | Evidência                                                            |
| --------- | -------- | -------------------------------------------------------------------- |
| DS-SC-001 | aprovado | persistência, limite, remoção, storage bloqueado e desktop/mobile    |
| DS-SC-002 | aprovado | testes de tabela alteram uma dimensão de compatibilidade por vez     |
| DS-SC-003 | aprovado | URL limpa, inválida, duplicada, excedente, refresh e histórico       |
| DS-SC-004 | aprovado | erro parcial, retry e resposta atrasada isolados por destino         |
| DS-SC-005 | aprovado | microcopy e auditoria sem score, facilidade ou probabilidade pessoal |
| DS-SC-006 | aprovado | 4 cenários Playwright passaram com API e PostgreSQL reais de teste   |

O OpenAPI, seus enums, DTOs e as cinco rotas públicas permanecem inalterados.
