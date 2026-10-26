# QA visual — globo interativo

Data: 2026-10-25

## Referência

O arquivo `NCxqdZmCqBSO0k6uxZVmly`, página `0:1`, foi inspecionado pelo conector
do Figma. Os alvos usados foram os frames atuais `01 · Globe Explorer`,
`02 · Country Details`, `03 · Mobile Globe` e `04 · Mobile / Country Selected`.
O globo vetorial indicado como placeholder foi substituído pelo MapLibre vivo;
o ícone Visa Atlas foi exportado para um asset local. Nenhum ativo da Apple foi
copiado.

## Checklist 1440 × 900

- Header, busca e filtros permanecem legíveis sobre o fundo.
- Globo ocupa a viewport, oceanos ficam neutros e países usam dois tons de
  cinza para cobertura no estado inicial.
- Ao selecionar um ISO3, todos os polígonos do país ficam `#30D883`, os demais
  ficam cinza e o contorno selecionado fica claro.
- Painel lateral não cobre busca/filtros e mantém fonte oficial em até três
  interações desde a seleção.
- Loading, erro, ausência, supressão, revisão e desatualização têm texto além de
  cor.
- Legenda de cobertura permanece compacta, translúcida e consistente com o
  frame `01 · iOS Maps-inspired · Globe Explorer` do Figma.
- Nomes localizados usam camada `symbol`, halo de contraste e colisão automática;
  a densidade cresce entre os níveis de zoom 1,35 e 5.

## Checklist 390 × 844

- Busca e alternância globo/lista permanecem acessíveis.
- Filtros rolam horizontalmente sem quebrar a viewport.
- Detalhe abre ancorado no rodapé como bottom sheet, com foco no botão fechar.
- Abas rolam horizontalmente, o conteúdo permanece alcançável e não há armadilha
  de foco.
- A lista fallback permite a mesma seleção quando WebGL está indisponível.
- A legenda foi reposicionada abaixo do header no mobile e permanece visível
  sem competir com o bottom sheet.
- Rótulos mantêm colisão ativa e nomes de países pequenos podem ser omitidos no
  zoom global, reaparecendo ao aproximar, em vez de sobrepor a interface.

## Evidências automatizadas

- Testes unitários validam expressão de cor, geometria MultiPolygon, nomes
  pt-BR, fallback de rótulo e configuração de colisão/densidade.
- Playwright cobre seleção, troca, Escape, filtros preservados, reduced motion,
  tooltip/foco, legenda, badges, filtro, falha parcial, touch, fallback/lista,
  lazy loading e layout mobile.
- A árvore semântica foi exercitada por roles/names reais (`combobox`,
  `listbox`, `option`, `dialog`, `tab`, `alert` e `status`); foco por teclado e
  anúncio `aria-live` não dependem do canvas.
- Desktop Chromium e Pixel 7 passaram (19 testes); hover é omitido somente no projeto touch,
  onde busca e lista oferecem a interação equivalente.
- Screenshots são capturados automaticamente apenas em falha para evitar baselines
  falsos antes do frame específico do Figma estar disponível.

## Validação manual concluída — 2026-10-25

O Chrome conectado foi exercitado contra o frontend local em janela desktop
ampla e, depois, redimensionado até cruzar o breakpoint mobile. A validação foi
complementada pelos projetos Playwright Desktop Chrome e Pixel 7 para os
tamanhos reproduzíveis da matriz.

### Desktop e rótulos do mapa

- Header, busca, filtros, globo, atribuição e legenda permaneceram legíveis; o
  mapa expôs `data-labels-ready="true"` e a cobertura mostrou `Com dados (2)` e
  `Sem dados (247)`.
- A causa dos rótulos duplicados foi confirmada: uma camada `symbol` ligada
  diretamente a um `MultiPolygon` posicionava texto em mais de uma parte da
  geometria. A camada agora usa uma fonte de pontos separada, com exatamente um
  ponto por ISO3, ancorado no maior polígono do país.
- Após a correção, `França` apareceu uma única vez no enquadramento inspecionado;
  halo, colisão, seleção verde e tooltip permaneceram preservados. A geração
  também foi conferida para os antigos casos problemáticos: Canadá
  `(-101.57, 57.75)`, Rússia `(99.22, 61.69)` e França `(2.34, 46.61)`.

### Mobile, teclado e leitor de tela

- Na janela estreita, busca, controle globo/lista, legenda e rótulos mantiveram
  o layout mobile. A lista exibiu nome, ISO3 e disponibilidade sem depender do
  canvas.
- A seleção foi feita somente por teclado com `Tab` e `Enter`; o painel abriu
  para França e `Escape` devolveu ao globo. No bottom sheet mobile, o foco
  inicial ficou no botão “Fechar detalhes e retornar ao globo”.
- A árvore de acessibilidade usada pelo leitor de tela expôs nomes e papéis para
  `combobox`, `listbox`, países, `tablist`, abas, títulos, status de dado e botão
  de fechamento. O conteúdo útil não depende dos textos desenhados no canvas.

### Reduced motion e fallback sem WebGL

- `prefers-reduced-motion: reduce` foi ativado no documento conectado e
  confirmado pela própria página antes da seleção; o detalhe abriu sem a
  transição de câmera de 900 ms, preservando foco, seleção e conteúdo.
- Para o fallback, `HTMLCanvasElement.getContext` foi substituído por `null` na
  sessão e “Ver globo” foi acionado. O app permaneceu automaticamente na lista
  acessível, com busca, filtro “Somente com dados” e botões de países presentes.

### Regressão automatizada final

- `npm run typecheck`, `npm run lint`, testes unitários e build passaram.
- A suíte unitária terminou com 16 testes aprovados.
- O Playwright terminou com 19 testes aprovados e 1 omitido intencionalmente: o
  teste de hover no projeto touch. Desktop Chromium e Pixel 7 cobriram seleção,
  teclado, reduced motion, bottom sheet, fallback sem WebGL e carregamento de
  rótulos.

Resultado: não restam bloqueios visuais ou de acessibilidade conhecidos para
`GC-T044` e `GC-T046`.
