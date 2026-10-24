# Geographic data

`data/ne_110m_admin_0_countries.geojson` is derived from Natural Earth's
1:110m Admin 0 Countries dataset. Natural Earth places its vector and raster
data in the public domain. The checked-in copy retains only `iso3`, `name` and
`continent` properties; geometry is not joined to statistics.

- Source: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
- Terms: https://www.naturalearthdata.com/about/terms-of-use/
- Retrieved: 2026-10-20

The application displays the optional attribution “Made with Natural Earth”.

## Consistência com o catálogo mundial

`data/world-country-catalog.v1.json` é o snapshot de consistência do catálogo
backend `world-countries 5.1.0 + CLDR 48 pt-BR`, com 249 códigos atribuídos e
licença ODbL-1.0. Ele não substitui o GeoJSON: países e territórios pequenos
podem existir apenas na busca/lista na escala 1:110m.

Os aliases cartográficos aprovados são `SAH → ESH`, `PSX → PSE`, `SDS → SSD`,
`CYN → CYP` e `SOL → SOM`. `KOS` permanece visível, mas não selecionável, pois
não possui alpha-3 ISO 3166-1 oficial aprovado. Após os aliases, toda geometria
selecionável corresponde ao catálogo. Os 75 códigos sem geometria direta —
principalmente ilhas e territórios, incluindo `MLT` e `LIE` — continuam
disponíveis pela busca e lista acessível.
