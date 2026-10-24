# Research: Catálogo e fontes para expansão global

**Feature:** `004-global-coverage-expansion` · **Status:** Fase 1 em andamento · **Data da verificação:** 2026-10-24

## 1. Inventário ISO3 e política territorial — GC-T001

### Estado encontrado

| Conjunto | Quantidade | Resultado |
|---|---:|---|
| Features no GeoJSON Natural Earth 1:110m | 177 | 177 códigos únicos, todos no formato de três letras |
| Destinos configurados no backend Eurostat | 33 | Catálogo atual é regional e nasce da ingestão, não de uma fonte mundial |
| Destinos backend com geometria direta | 31 | Malta (`MLT`) e Liechtenstein (`LIE`) não aparecem nessa escala cartográfica |
| Features sem cadastro no backend | 146 | Incluem 140 códigos ISO utilizáveis e 6 códigos territoriais Natural Earth que exigem política explícita |

O inventário comparou:

- `packages/geo/data/ne_110m_admin_0_countries.geojson`;
- `EUROSTAT_DESTINATIONS` em `visa-atlas-server/src/modules/ingestion/adapters/eurostat/eurostat.config.ts`.

O GeoJSON não contém duplicatas, mas o campo chamado `iso3` deriva do código administrativo do Natural Earth e não é sempre ISO 3166-1 alpha-3. O formato de três letras, isoladamente, não comprova conformidade ISO.

### Exceções cartográficas

| Código no GeoJSON | Território | Política para o catálogo/API | Motivo |
|---|---|---|---|
| `SAH` | Saara Ocidental | Normalizar para `ESH` | `ESH` é o alpha-3 ISO correspondente |
| `PSX` | Estado da Palestina | Normalizar para `PSE` | `PSE` é o alpha-3 ISO correspondente |
| `SDS` | Sudão do Sul | Normalizar para `SSD` | `SSD` é o alpha-3 ISO correspondente |
| `CYN` | Chipre do Norte | Associar a geometria a `CYP`, sem criar país adicional | Não existe entrada ISO 3166-1 separada; evita pseudo-país na API |
| `SOL` | Somalilândia | Associar a geometria a `SOM`, sem criar país adicional | Não existe entrada ISO 3166-1 separada; evita pseudo-país na API |
| `KOS` | Kosovo | Manter geometria não selecionável até decisão específica | Não há alpha-3 ISO 3166-1 oficial; não introduzir `XKX` silenciosamente |

### Política aprovada para a implementação

1. O catálogo backend deve vir de uma referência ISO versionada e licenciada; não será gerado diretamente dos 177 códigos do Natural Earth.
2. O join cartográfico deve aplicar uma tabela explícita de aliases, coberta por teste, antes de cruzar geometria e catálogo.
3. Duas geometrias podem apontar ao mesmo ISO oficial (`CYN -> CYP`, `SOL -> SOM`); a seleção deve tratar todos os polígonos desse ISO como uma unidade.
4. Feature sem ISO oficial aprovado permanece visível como cartografia, mas não dispara consulta de país.
5. País ISO sem geometria na escala 1:110m, como Malta e Liechtenstein, continua disponível por busca e lista. Não será inventado polígono.
6. A Fase 2 deve escolher a referência mundial e definir o conjunto final de países/territórios ISO; os 177 polígonos não equivalem ao catálogo ISO mundial completo.

## 2. Baseline aprovado

| Destino | Fonte | Evento | Recorte | Métrica | Estado |
|---|---|---|---|---|---|
| Países cobertos pelo Eurostat | Eurostat `migr_resfirst` | Primeira autorização de residência | `BRA`, motivo `EMP`, unidade `PER`, anual | `FIRST_RESIDENCE_PERMITS_GRANTED` | `ACCEPTED` |

## 3. Admission gates de novas fontes

### 3.1 Reino Unido — GC-T002

| Campo | Evidência/decisão |
|---|---|
| Órgão | UK Home Office |
| Fonte primária | [Immigration system statistics data tables](https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables), tabela `Occ_D02` |
| Dataset | “Sponsored work entry clearance visas by occupation and industry (SOC 2020)” |
| Evento | Concessões de entry clearance visas de trabalho patrocinado |
| População | Requerentes principais, pedidos feitos fora do Reino Unido; registros associados a Certificate of Sponsorship |
| Cidadania | Campo `Nationality`; `Brazil` confirmado no arquivo oficial |
| Finalidade/categorias | `Worker` e `Temporary Worker`, preservando `Visa type subgroup`; não incluir dependentes, estudo, visita ou família |
| Unidade | Contagem de concessões; não pessoas únicas nem taxa de aprovação |
| Período | Trimestral e ano-calendário. Nacionalidade brasileira disponível no arquivo SOC 2020 a partir de 2024; dados de Q1 2026 em diante são provisórios no release verificado |
| Formato/acesso | XLSX publicado trimestralmente; abas descritivas, notas e dados normalizados. URL do arquivo muda por release, então o cliente deve descobrir o link a partir da página oficial ou usar configuração versionada |
| Qualidade | Pequena parcela de vistos não vinculados a CoS fica fora do dataset; resultado deve carregar essa limitação. Um outcome pode corresponder a aplicação de período anterior |
| Licença | [UK Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), com atribuição ao Home Office; o catálogo oficial identifica OGL |
| Métrica | `WORK_VISAS_ISSUED` existente; grupo próprio `uk-home-office-sponsored-work`, sem comparação com Eurostat |
| Atualização | Trimestral, por snapshot/checksum; não consultar a planilha em requisição pública |
| Decisão | **ACCEPTED** como primeiro adaptador nacional |

### 3.2 Estados Unidos — GC-T003

| Campo | Evidência/decisão |
|---|---|
| Órgão | U.S. Department of State, Bureau of Consular Affairs |
| Fonte primária | [Nonimmigrant Visa Statistics](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics/nonimmigrant-visa-statistics.html), tabelas anuais e [emissões mensais](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics/nonimmigrant-visa-statistics/monthly-nonimmigrant-visa-issuances.html) |
| Evento | Vistos não imigrantes emitidos por nacionalidade e classe |
| Cidadania | `Brazil` está presente nos relatórios oficiais |
| Finalidade/categorias candidatas | Primários `E1`, `E2`, `H1B`, `H1B1`, `H2A`, `H2B`, `L1`, `O1`, `P1`, `P2`, `P3`, `Q1` e `R1`; preservar exatamente o código da fonte. Excluir turismo/negócios `B`, estudo `F/M`, intercâmbio `J`, tripulação/trânsito `C/D`, diplomáticos `A/G/NATO`, trainees `H3`, pessoal de apoio `O2` e dependentes `E3D/H4/L2/O3/P4/R2` |
| Unidade | Emissões de visto, não pessoas únicas, admissões, petições ou aprovações do USCIS |
| Período | Ano fiscal nas tabelas anuais; mês/ano fiscal nos arquivos mensais |
| Formato/acesso | Índice HTML estável, XLSX/PDF por release. O download XLSX anual retornou `403` na verificação automatizada, embora a página e PDFs sejam públicos; não usar bypass ou scraping frágil |
| Qualidade | A metodologia do relatório mudou a partir do FY2019; releases e versão metodológica precisam permanecer separados |
| Licença | [Conteúdo do Department of State é domínio público salvo indicação contrária](https://2021-2025.state.gov/copyright-information/); atribuição recomendada, sem reutilizar selos/logos |
| Métrica | `WORK_VISAS_ISSUED`, com grupo próprio por conjunto de classes e ano fiscal |
| Decisão | **NEEDS_REVIEW** — sem adaptador até existir acesso automatizado oficial e estável ao arquivo estruturado |

### 3.3 Austrália — GC-T004

| Campo | Evidência/decisão |
|---|---|
| Órgão | Australian Government Department of Home Affairs |
| Fonte primária | [Country profile — Brazil](https://www.homeaffairs.gov.au/research-and-statistics/statistics/country-profiles/profiles/brazil) e [Work visa statistics](https://www.homeaffairs.gov.au/research-and-statistics/statistics/visa-statistics/work) |
| Evento | Concessões de visto; candidato inicial restrito a `Temporary Resident (Skilled Employment)` |
| Cidadania | Perfil específico do Brasil; relatórios detalhados também possuem país de cidadania |
| Finalidade/categorias | Não agregar Visitor, Student, Other ou permanent family. `Working Holiday Maker` deve permanecer categoria separada e não entrar automaticamente no total de skilled employment |
| Unidade | Concessões de visto. Relatórios detalhados distinguem requerente principal/secundário e arredondam valores; perfil agrega categorias anuais |
| Período | Ano financeiro australiano; perfil verificado cobre 2021–22 a 2024–25 |
| Formato/acesso | Perfil HTML legível, mas sem arquivo tabular estável; relatórios detalhados são PDFs periódicos. Valores pequenos podem ser mascarados (`<5`) e números detalhados arredondados |
| Qualidade | A série deve registrar supressão/arredondamento e mudanças de subclasses, como a substituição de TSS por Skills in Demand em dezembro de 2024 |
| Licença | [Creative Commons Attribution 3.0 Australia](https://www.homeaffairs.gov.au/access-and-accountability/using-our-website/copyright-and-disclaimer), com atribuição ao Department of Home Affairs e exceções para material de terceiros/logos |
| Métrica | `WORK_VISAS_ISSUED`, somente se o universo de requerentes e categorias for fixado por release |
| Decisão | **NEEDS_REVIEW** — falta fonte tabular automatizável e definição estável do universo principal/secundário |
