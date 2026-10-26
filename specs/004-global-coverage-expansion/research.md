# Research: Catálogo e fontes para expansão global

**Feature:** `004-global-coverage-expansion` · **Status:** implementação concluída com fontes não admitidas registradas · **Data da verificação:** 2026-10-24

## 1. Inventário ISO3 e política territorial — GC-T001

### Estado encontrado

| Conjunto                                  | Quantidade | Resultado                                                                                                |
| ----------------------------------------- | ---------: | -------------------------------------------------------------------------------------------------------- |
| Features no GeoJSON Natural Earth 1:110m  |        177 | 177 códigos únicos, todos no formato de três letras                                                      |
| Destinos configurados no backend Eurostat |         33 | Catálogo atual é regional e nasce da ingestão, não de uma fonte mundial                                  |
| Destinos backend com geometria direta     |         31 | Malta (`MLT`) e Liechtenstein (`LIE`) não aparecem nessa escala cartográfica                             |
| Features sem cadastro no backend          |        146 | Incluem 140 códigos ISO utilizáveis e 6 códigos territoriais Natural Earth que exigem política explícita |

O inventário comparou:

- `packages/geo/data/ne_110m_admin_0_countries.geojson`;
- `EUROSTAT_DESTINATIONS` em `visa-atlas-server/src/modules/ingestion/adapters/eurostat/eurostat.config.ts`.

O GeoJSON não contém duplicatas, mas o campo chamado `iso3` deriva do código administrativo do Natural Earth e não é sempre ISO 3166-1 alpha-3. O formato de três letras, isoladamente, não comprova conformidade ISO.

### Exceções cartográficas

| Código no GeoJSON | Território          | Política para o catálogo/API                             | Motivo                                                                  |
| ----------------- | ------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `SAH`             | Saara Ocidental     | Normalizar para `ESH`                                    | `ESH` é o alpha-3 ISO correspondente                                    |
| `PSX`             | Estado da Palestina | Normalizar para `PSE`                                    | `PSE` é o alpha-3 ISO correspondente                                    |
| `SDS`             | Sudão do Sul        | Normalizar para `SSD`                                    | `SSD` é o alpha-3 ISO correspondente                                    |
| `CYN`             | Chipre do Norte     | Associar a geometria a `CYP`, sem criar país adicional   | Não existe entrada ISO 3166-1 separada; evita pseudo-país na API        |
| `SOL`             | Somalilândia        | Associar a geometria a `SOM`, sem criar país adicional   | Não existe entrada ISO 3166-1 separada; evita pseudo-país na API        |
| `KOS`             | Kosovo              | Manter geometria não selecionável até decisão específica | Não há alpha-3 ISO 3166-1 oficial; não introduzir `XKX` silenciosamente |

### Política aprovada para a implementação

1. O catálogo backend deve vir de uma referência ISO versionada e licenciada; não será gerado diretamente dos 177 códigos do Natural Earth.
2. O join cartográfico deve aplicar uma tabela explícita de aliases, coberta por teste, antes de cruzar geometria e catálogo.
3. Duas geometrias podem apontar ao mesmo ISO oficial (`CYN -> CYP`, `SOL -> SOM`); a seleção deve tratar todos os polígonos desse ISO como uma unidade.
4. Feature sem ISO oficial aprovado permanece visível como cartografia, mas não dispara consulta de país.
5. País ISO sem geometria na escala 1:110m, como Malta e Liechtenstein, continua disponível por busca e lista. Não será inventado polígono.
6. A Fase 2 deve escolher a referência mundial e definir o conjunto final de países/territórios ISO; os 177 polígonos não equivalem ao catálogo ISO mundial completo.

## 2. Baseline aprovado

| Destino                       | Fonte                    | Evento                             | Recorte                                   | Métrica                           | Estado     |
| ----------------------------- | ------------------------ | ---------------------------------- | ----------------------------------------- | --------------------------------- | ---------- |
| Países cobertos pelo Eurostat | Eurostat `migr_resfirst` | Primeira autorização de residência | `BRA`, motivo `EMP`, unidade `PER`, anual | `FIRST_RESIDENCE_PERMITS_GRANTED` | `ACCEPTED` |

## 3. Admission gates de novas fontes

### 3.1 Reino Unido — GC-T002

| Campo                 | Evidência/decisão                                                                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Órgão                 | UK Home Office                                                                                                                                                                                                  |
| Fonte primária        | [Immigration system statistics data tables](https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables), tabela `Occ_D02`                                                    |
| Dataset               | “Sponsored work entry clearance visas by occupation and industry (SOC 2020)”                                                                                                                                    |
| Evento                | Concessões de entry clearance visas de trabalho patrocinado                                                                                                                                                     |
| População             | Requerentes principais, pedidos feitos fora do Reino Unido; registros associados a Certificate of Sponsorship                                                                                                   |
| Cidadania             | Campo `Nationality`; `Brazil` confirmado no arquivo oficial                                                                                                                                                     |
| Finalidade/categorias | `Worker` e `Temporary Worker`, preservando `Visa type subgroup`; não incluir dependentes, estudo, visita ou família                                                                                             |
| Unidade               | Contagem de concessões; não pessoas únicas nem taxa de aprovação                                                                                                                                                |
| Período               | Trimestral e ano-calendário. Nacionalidade brasileira disponível no arquivo SOC 2020 a partir de 2024; dados de Q1 2026 em diante são provisórios no release verificado                                         |
| Formato/acesso        | XLSX publicado trimestralmente; abas descritivas, notas e dados normalizados. URL do arquivo muda por release, então o cliente deve descobrir o link a partir da página oficial ou usar configuração versionada |
| Qualidade             | Pequena parcela de vistos não vinculados a CoS fica fora do dataset; resultado deve carregar essa limitação. Um outcome pode corresponder a aplicação de período anterior                                       |
| Licença               | [UK Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), com atribuição ao Home Office; o catálogo oficial identifica OGL                                      |
| Métrica               | `WORK_VISAS_ISSUED` existente; grupo próprio `uk-home-office-sponsored-work`, sem comparação com Eurostat                                                                                                       |
| Atualização           | Trimestral, por snapshot/checksum; não consultar a planilha em requisição pública                                                                                                                               |
| Decisão               | **ACCEPTED** como primeiro adaptador nacional                                                                                                                                                                   |

### 3.2 Estados Unidos — GC-T003

| Campo                            | Evidência/decisão                                                                                                                                                                                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Órgão                            | U.S. Department of State, Bureau of Consular Affairs                                                                                                                                                                                                                                                                                |
| Fonte primária                   | [Nonimmigrant Visa Statistics](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics/nonimmigrant-visa-statistics.html), tabelas anuais e [emissões mensais](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics/nonimmigrant-visa-statistics/monthly-nonimmigrant-visa-issuances.html) |
| Evento                           | Vistos não imigrantes emitidos por nacionalidade e classe                                                                                                                                                                                                                                                                           |
| Cidadania                        | `Brazil` está presente nos relatórios oficiais                                                                                                                                                                                                                                                                                      |
| Finalidade/categorias candidatas | Primários `E1`, `E2`, `H1B`, `H1B1`, `H2A`, `H2B`, `L1`, `O1`, `P1`, `P2`, `P3`, `Q1` e `R1`; preservar exatamente o código da fonte. Excluir turismo/negócios `B`, estudo `F/M`, intercâmbio `J`, tripulação/trânsito `C/D`, diplomáticos `A/G/NATO`, trainees `H3`, pessoal de apoio `O2` e dependentes `E3D/H4/L2/O3/P4/R2`      |
| Unidade                          | Emissões de visto, não pessoas únicas, admissões, petições ou aprovações do USCIS                                                                                                                                                                                                                                                   |
| Período                          | Ano fiscal nas tabelas anuais; mês/ano fiscal nos arquivos mensais                                                                                                                                                                                                                                                                  |
| Formato/acesso                   | Índice HTML estável, XLSX/PDF por release. O download XLSX anual retornou `403` na verificação automatizada, embora a página e PDFs sejam públicos; não usar bypass ou scraping frágil                                                                                                                                              |
| Qualidade                        | A metodologia do relatório mudou a partir do FY2019; releases e versão metodológica precisam permanecer separados                                                                                                                                                                                                                   |
| Licença                          | [Conteúdo do Department of State é domínio público salvo indicação contrária](https://2021-2025.state.gov/copyright-information/); atribuição recomendada, sem reutilizar selos/logos                                                                                                                                               |
| Métrica                          | `WORK_VISAS_ISSUED`, com grupo próprio por conjunto de classes e ano fiscal                                                                                                                                                                                                                                                         |
| Decisão                          | **NEEDS_REVIEW** — sem adaptador até existir acesso automatizado oficial e estável ao arquivo estruturado                                                                                                                                                                                                                           |

### 3.3 Austrália — GC-T004

| Campo                 | Evidência/decisão                                                                                                                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Órgão                 | Australian Government Department of Home Affairs                                                                                                                                                                                                |
| Fonte primária        | [Country profile — Brazil](https://www.homeaffairs.gov.au/research-and-statistics/statistics/country-profiles/profiles/brazil) e [Work visa statistics](https://www.homeaffairs.gov.au/research-and-statistics/statistics/visa-statistics/work) |
| Evento                | Concessões de visto; candidato inicial restrito a `Temporary Resident (Skilled Employment)`                                                                                                                                                     |
| Cidadania             | Perfil específico do Brasil; relatórios detalhados também possuem país de cidadania                                                                                                                                                             |
| Finalidade/categorias | Não agregar Visitor, Student, Other ou permanent family. `Working Holiday Maker` deve permanecer categoria separada e não entrar automaticamente no total de skilled employment                                                                 |
| Unidade               | Concessões de visto. Relatórios detalhados distinguem requerente principal/secundário e arredondam valores; perfil agrega categorias anuais                                                                                                     |
| Período               | Ano financeiro australiano; perfil verificado cobre 2021–22 a 2024–25                                                                                                                                                                           |
| Formato/acesso        | Perfil HTML legível, mas sem arquivo tabular estável; relatórios detalhados são PDFs periódicos. Valores pequenos podem ser mascarados (`<5`) e números detalhados arredondados                                                                 |
| Qualidade             | A série deve registrar supressão/arredondamento e mudanças de subclasses, como a substituição de TSS por Skills in Demand em dezembro de 2024                                                                                                   |
| Licença               | [Creative Commons Attribution 3.0 Australia](https://www.homeaffairs.gov.au/access-and-accountability/using-our-website/copyright-and-disclaimer), com atribuição ao Department of Home Affairs e exceções para material de terceiros/logos     |
| Métrica               | `WORK_VISAS_ISSUED`, somente se o universo de requerentes e categorias for fixado por release                                                                                                                                                   |
| Decisão               | **NEEDS_REVIEW** — falta fonte tabular automatizável e definição estável do universo principal/secundário                                                                                                                                       |

### 3.4 Canadá — GC-T005

| Campo                 | Evidência/decisão                                                                                                                                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Órgão                 | Immigration, Refugees and Citizenship Canada (IRCC)                                                                                                                                                                                                                               |
| Fonte primária        | [Temporary Foreign Worker Program e International Mobility Program Work Permit Holders](https://open.canada.ca/data/en/dataset/360024f2-17e9-4558-bfc1-3616485d65b9), recurso anual “IMP work permit holders (for work purposes only) on December 31st by country of citizenship” |
| Evento                | Estoque de titulares do International Mobility Program (IMP) com permissão de trabalho válida em 31 de dezembro; não “vistos emitidos” nem soma mensal                                                                                                                            |
| Cidadania             | Linha `Brazil` na dimensão “Country of Citizenship”, confirmada no XLSX oficial anual                                                                                                                                                                                             |
| Finalidade/categorias | Importar somente IMP, finalidade explícita de trabalho, preservando `IMP` como categoria. TFWP permanece excluído e não é somado                                                                                                                                                  |
| Unidade               | Titulares (`HOLDERS`), com valores arredondados ao múltiplo de cinco e `--` para valores suprimidos; nunca converter `--` em zero                                                                                                                                                 |
| Período               | Posição em 31 de dezembro de cada ano, série 2000–2024 no release verificado em 2026-10-25                                                                                                                                                                                        |
| Formato/acesso        | XLSX oficial anual com URL estável, validado diretamente; título, cabeçalhos, cidadania e anos são verificados antes do staging                                                                                                                                                   |
| Qualidade             | É estoque em uma data e apenas do IMP. Não representa todos os trabalhadores estrangeiros, permissões emitidas no ano, TFWP, taxa ou probabilidade                                                                                                                                |
| Licença               | [Open Government Licence — Canada 2.0](https://open.canada.ca/en/open-government-licence-canada), com atribuição e sem uso de símbolos oficiais                                                                                                                                   |
| Métrica               | `VALID_PERMIT_HOLDERS` existente descreve exatamente o estoque anual escolhido; dataset e `comparisonGroupId` próprios impedem comparação com Eurostat/Home Office                                                                                                                |
| Decisão               | **ACCEPTED** para o recurso anual IMP em 31 de dezembro. A aceitação não se estende ao arquivo mensal nem ao TFWP                                                                                                                                                                 |

## 4. Matriz consolidada

| Prioridade | Destino        | Automação                                         | Semântica                                       | Licença                       | Contrato               | Estado         |
| ---------: | -------------- | ------------------------------------------------- | ----------------------------------------------- | ----------------------------- | ---------------------- | -------------- |
|          1 | Reino Unido    | XLSX trimestral validado                          | Concessões patrocinadas, requerentes principais | OGL                           | Enum existente         | `ACCEPTED`     |
|          2 | Canadá         | XLSX anual estável validado                       | Estoque IMP válido em 31 de dezembro            | OGL Canada                    | `VALID_PERMIT_HOLDERS` | `ACCEPTED`     |
|          3 | Estados Unidos | XLSX/PDF público, XLSX bloqueou automação testada | Emissões por classe                             | Domínio público salvo exceção | Enum existente         | `NEEDS_REVIEW` |
|          4 | Austrália      | HTML/PDF, sem tabela estável confirmada           | Concessões skilled employment                   | CC BY 3.0 AU                  | Enum existente         | `NEEDS_REVIEW` |

## 5. Regras de decisão

- `ACCEPTED`: todos os campos do admission gate foram comprovados e a semântica cabe em métrica existente ou em mudança contratual já aprovada.
- `REJECTED`: fonte não oficial, sem cidadania `BRA`, sem evento identificável, sem licença compatível ou com granularidade insuficiente.
- `NEEDS_REVIEW`: evidência promissora, mas existe bloqueio de semântica, contrato, licença ou automação.

## 6. Proibições confirmadas

- Não somar vistos, permissões e residências em um total global.
- Não inferir aprovação a partir de estoque, entradas, patrocínios ou certificados.
- Não derivar probabilidade sem aplicações e decisões do mesmo universo.
- Não inferir cidade a partir do país, consulado emissor ou local da organização patrocinadora.
- Não interpretar valor arredondado, mascarado ou suprimido como zero.

## 7. Resultado da implementação e reavaliação da Fase 6

O Reino Unido foi implementado como a única fonte `ACCEPTED`. A execução
controlada do release `year ending June 2026` publicou 12 categorias originais
do ano-calendário completo de 2025, total 819, sob
`WORK_VISAS_ISSUED` e dataset/grupo próprios. 2024 e 2026 foram excluídos por
serem anos parciais no recorte brasileiro.

Não existe segunda, terceira ou quarta fonte admitida nesta rodada:

- Canadá foi posteriormente admitido apenas no recorte anual IMP em 31 de
  dezembro, que usa `VALID_PERMIT_HOLDERS`; TFWP e totalização IMP+TFWP
  continuam fora do escopo;
- Estados Unidos continua `NEEDS_REVIEW` por acesso automatizado instável ao
  arquivo estruturado;
- Austrália continua `NEEDS_REVIEW` por ausência de fonte tabular estável e
  universo principal/secundário ainda ambíguo.

Por isso GC-T036–GC-T038 são `N/A`, e nenhum adaptador, número ilustrativo ou
enum foi criado para contornar os admission gates.

## 8. Revisão dos critérios de sucesso

- **GC-SC-001:** coberto por catálogo de 249 países, aliases cartográficos e
  Playwright real para país sem release.
- **GC-SC-002:** coberto por tooltip, tons de cinza, legenda, busca e lista.
- **GC-SC-003:** observações UK possuem fonte, release, período, unidade,
  cidadania, finalidade, categoria, métrica e grupo.
- **GC-SC-004:** nenhuma escala/ranking mistura grupos; microcopy declara que
  volume não é taxa ou probabilidade.
- **GC-SC-005:** testes UK cobrem mudança de formato, categoria desconhecida,
  ausência de BRA, idempotência, rejeição e preservação do snapshot.
- **GC-SC-006:** format, lint, typecheck, testes, builds, E2E e validação OpenAPI
  passaram nos dois repositórios. O critério ainda não está integralmente verde:
  o audit backend mantém quatro alertas high transitivos em `multer`, cuja
  correção automática exige downgrade incompatível do Nest 12.

Pendências de release: revisão manual com leitor de tela e inspeção visual dos
rótulos cartográficos em rotações variadas; acompanhamento do advisory
transitivo de `multer`; Estados Unidos e Austrália permanecem não admitidos
conforme a matriz acima. O follow-up canadense está registrado na Fase 9.
