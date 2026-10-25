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
