import type { StyleSpecification } from 'maplibre-gl';

export const GLOBE_STYLE: StyleSpecification = {
  version: 8,
  name: 'Visa Atlas Globe',
  projection: { type: 'globe' },
  sky: {
    'sky-color': '#030609',
    'horizon-color': '#1597d0',
    'fog-color': '#0f3852',
    'sky-horizon-blend': 0.22,
    'horizon-fog-blend': 0.35,
    'atmosphere-blend': 0.86,
  },
  sources: {},
  layers: [
    {
      id: 'ocean-background',
      type: 'background',
      paint: { 'background-color': '#075787' },
    },
  ],
};

export const MAP_COLORS = {
  selected: '#30D883',
  selectedOutline: '#D8FFEA',
  inactive: '#82919a',
  hover: '#e8fff2',
  outline: '#93b5bd',
} as const;
