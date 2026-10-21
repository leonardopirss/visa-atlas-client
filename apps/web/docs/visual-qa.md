# QA visual — globo interativo

Data: 2026-10-20

## Referência

O arquivo `NCxqdZmCqBSO0k6uxZVmly`, página `0:1`, foi inspecionado pelo conector
do Figma. Os alvos usados foram os frames atuais `01 · Globe Explorer`,
`02 · Country Details`, `03 · Mobile Globe` e `04 · Mobile / Country Selected`.
O globo vetorial indicado como placeholder foi substituído pelo MapLibre vivo;
o ícone Visa Atlas foi exportado para um asset local. Nenhum ativo da Apple foi
copiado.

## Checklist 1440 × 900

- Header, busca e filtros permanecem legíveis sobre o fundo.
- Globo ocupa a viewport, oceanos ficam neutros e países têm cores cartográficas
  no estado inicial.
- Ao selecionar um ISO3, todos os polígonos do país ficam `#30D883`, os demais
  ficam cinza e o contorno selecionado fica claro.
- Painel lateral não cobre busca/filtros e mantém fonte oficial em até três
  interações desde a seleção.
- Loading, erro, ausência, supressão, revisão e desatualização têm texto além de
  cor.

## Checklist 390 × 844

- Busca e alternância globo/lista permanecem acessíveis.
- Filtros rolam horizontalmente sem quebrar a viewport.
- Detalhe abre ancorado no rodapé como bottom sheet, com foco no botão fechar.
- Abas rolam horizontalmente, o conteúdo permanece alcançável e não há armadilha
  de foco.
- A lista fallback permite a mesma seleção quando WebGL está indisponível.

## Evidências automatizadas

- Testes unitários validam expressão de cor e geometria MultiPolygon.
- Playwright cobre seleção, troca, Escape, filtros preservados, reduced motion,
  fallback/lista, lazy loading e layout mobile.
- Screenshots são capturados automaticamente apenas em falha para evitar baselines
  falsos antes do frame específico do Figma estar disponível.
