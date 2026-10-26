import type {
  ExpressionSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { COUNTRY_ISO3_PROPERTY } from '@visa-atlas/geo';

export const COUNTRY_LABEL_LAYER_ID = 'country-labels';
export const COUNTRY_LABEL_SOURCE_ID = 'country-label-points';
export const COUNTRY_LABEL_PROPERTY = 'namePt';

export function countryLabelFieldExpression(): ExpressionSpecification {
  return [
    'coalesce',
    ['get', COUNTRY_LABEL_PROPERTY],
    ['get', 'name'],
    ['get', COUNTRY_ISO3_PROPERTY],
  ];
}

export function countryLabelLayer(source: string): SymbolLayerSpecification {
  return {
    id: COUNTRY_LABEL_LAYER_ID,
    type: 'symbol',
    source,
    minzoom: 1.35,
    layout: {
      'text-field': countryLabelFieldExpression(),
      'text-font': ['Visa Atlas Sans'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 1.35, 9, 3, 11, 5, 13],
      'text-max-width': 8,
      'text-padding': 7,
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-optional': true,
      'symbol-sort-key': ['case', ['has', COUNTRY_LABEL_PROPERTY], 0, 1],
    },
    paint: {
      'text-color': '#f4fbff',
      'text-halo-color': '#17343f',
      'text-halo-width': 1.25,
      'text-halo-blur': 0.4,
    },
  };
}
