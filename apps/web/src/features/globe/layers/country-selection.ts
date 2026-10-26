import type { ExpressionSpecification, Map as MapLibreMap } from 'maplibre-gl';
import { COUNTRY_ISO3_PROPERTY } from '@visa-atlas/geo';
import { MAP_COLORS } from './base-style';

export const COUNTRY_SOURCE_ID = 'country-boundaries';
export const COUNTRY_FILL_LAYER_ID = 'country-fill';
export const COUNTRY_OUTLINE_LAYER_ID = 'country-outline';

export function countryFillExpression(
  selectedIso3: string | null,
  availableIso3: string[] = [],
  coverageFailed = false,
): ExpressionSpecification {
  return [
    'case',
    ['==', ['get', COUNTRY_ISO3_PROPERTY], selectedIso3 ?? ''],
    MAP_COLORS.selected,
    coverageFailed
      ? MAP_COLORS.unknown
      : [
          'case',
          ['in', ['get', COUNTRY_ISO3_PROPERTY], ['literal', availableIso3]],
          MAP_COLORS.available,
          MAP_COLORS.unavailable,
        ],
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
  availableIso3: string[] = [],
  coverageFailed = false,
): void {
  if (!map.getLayer(COUNTRY_FILL_LAYER_ID)) return;
  map.setPaintProperty(
    COUNTRY_FILL_LAYER_ID,
    'fill-color',
    countryFillExpression(selectedIso3, availableIso3, coverageFailed),
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
