import type { ExpressionSpecification, Map as MapLibreMap } from 'maplibre-gl';
import { COUNTRY_ISO3_PROPERTY } from '@visa-atlas/geo';
import { MAP_COLORS } from './base-style';

export const COUNTRY_SOURCE_ID = 'country-boundaries';
export const COUNTRY_FILL_LAYER_ID = 'country-fill';
export const COUNTRY_OUTLINE_LAYER_ID = 'country-outline';

export function countryFillExpression(
  selectedIso3: string | null,
): ExpressionSpecification {
  if (selectedIso3 !== null) {
    return [
      'case',
      ['==', ['get', COUNTRY_ISO3_PROPERTY], selectedIso3],
      MAP_COLORS.selected,
      MAP_COLORS.inactive,
    ];
  }

  return [
    'match',
    ['get', 'continent'],
    'Africa',
    '#94b791',
    'Asia',
    '#9bbc95',
    'Europe',
    '#a6c58f',
    'North America',
    '#86aa91',
    'Oceania',
    '#a5c482',
    'Seven seas (open ocean)',
    '#81989c',
    'South America',
    '#8caf8e',
    '#91a79a',
  ];
}

export function countryOutlineExpression(
  selectedIso3: string | null,
  hoveredIso3: string | null,
): ExpressionSpecification {
  return [
    'case',
    [
      'any',
      ['==', ['get', COUNTRY_ISO3_PROPERTY], selectedIso3 ?? ''],
      ['==', ['get', COUNTRY_ISO3_PROPERTY], hoveredIso3 ?? ''],
    ],
    MAP_COLORS.selectedOutline,
    MAP_COLORS.outline,
  ];
}

export function applyCountrySelection(
  map: MapLibreMap,
  selectedIso3: string | null,
  hoveredIso3: string | null,
): void {
  if (!map.getLayer(COUNTRY_FILL_LAYER_ID)) return;
  map.setPaintProperty(
    COUNTRY_FILL_LAYER_ID,
    'fill-color',
    countryFillExpression(selectedIso3),
  );
  map.setPaintProperty(
    COUNTRY_OUTLINE_LAYER_ID,
    'line-color',
    countryOutlineExpression(selectedIso3, hoveredIso3),
  );
  map.setPaintProperty(COUNTRY_OUTLINE_LAYER_ID, 'line-width', [
    'case',
    [
      'any',
      ['==', ['get', COUNTRY_ISO3_PROPERTY], selectedIso3 ?? ''],
      ['==', ['get', COUNTRY_ISO3_PROPERTY], hoveredIso3 ?? ''],
    ],
    1.8,
    0.55,
  ]);
}
