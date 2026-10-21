# Visa Atlas Web

Frontend React/Vite do globo interativo. Ele consome somente a API REST em
`/api/v1`; nenhuma fonte estatística oficial é chamada pelo navegador.

## Desenvolvimento

```bash
npm install
npm run contracts:generate
npm run dev
```

Por padrão, o Vite encaminha `/api` para `http://localhost:3000`. Para outro
backend de desenvolvimento, defina `VITE_API_PROXY_TARGET`. Em builds
implantados, `VITE_API_BASE_URL` pode definir a base pública; o valor padrão é
`/api/v1`.

## Qualidade

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
# com o backend de teste disponível em http://127.0.0.1:3001
VITE_API_PROXY_TARGET=http://127.0.0.1:3001 npm run test:e2e:real
# com uma release oficial já publicada no backend local da porta 3000
npm run test:e2e:official
```

Os testes de componente usam respostas sintéticas explicitamente rotuladas. O
E2E local também possui uma API sintética no nível do browser para validar os
estados visuais de forma determinística. A suíte `test:e2e:real` não intercepta
rotas e valida os cinco endpoints contra o backend de teste, incluindo zero,
supressão, programa verificado e histórico.

## Cartografia, licença e atribuição

- Renderização: MapLibre GL JS, licença BSD-3-Clause.
- Fronteiras: Natural Earth 1:110m Admin 0 Countries, domínio público. A cópia
  normalizada vive em `packages/geo/data` e mantém ISO3 e MultiPolygon.
- Tiles: nenhum provedor externo é usado nesta versão. O globo usa fundo local e
  o GeoJSON versionado, evitando chaves e requisições cartográficas de terceiros.
- Atribuição: a interface exibe “Feito com Natural Earth” e o controle do mapa
  contém a mesma atribuição.

## CSP recomendada

O MapLibre usa Web Worker e canvas WebGL. Uma política inicial para hosting
same-origin é:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
connect-src 'self';
worker-src 'self' blob:;
font-src 'self';
object-src 'none';
base-uri 'self';
frame-ancestors 'none';
```

Se o host não permitir `blob:` em `worker-src`, publique o worker do MapLibre na
mesma origem e configure seu URL explicitamente. Links oficiais são aceitos
somente com protocolo HTTP(S) e usam `noopener noreferrer`.

## Acessibilidade e performance

- A busca e a lista fallback oferecem seleção por teclado sem depender do canvas.
- Escape limpa somente o país; BRA/WORK e período permanecem.
- O bottom sheet move o foco para o botão de fechar em viewport mobile.
- `prefers-reduced-motion` remove animações e faz a câmera saltar sem voo.
- Meta inicial: LCP < 2,5 s, INP < 200 ms e CLS < 0,1 no percentil 75; medir em
  ambiente publicado antes de declarar o orçamento atendido.
- O bundle do mapa é carregado dinamicamente e a série histórica só é solicitada
  quando a aba Histórico é aberta.
