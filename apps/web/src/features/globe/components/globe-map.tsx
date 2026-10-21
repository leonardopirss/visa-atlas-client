import { useEffect, useRef, useState } from 'react';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import {
  COUNTRY_BOUNDARIES_ATTRIBUTION,
  COUNTRY_BOUNDARIES_URL,
  COUNTRY_ISO3_PROPERTY,
} from '@visa-atlas/geo';
import { featureCenter } from '../lib/geometry';
import { useGlobeCamera } from '../hooks/use-globe-camera';
import { GLOBE_STYLE } from '../layers/base-style';
import {
  applyCountrySelection,
  COUNTRY_FILL_LAYER_ID,
  COUNTRY_OUTLINE_LAYER_ID,
  COUNTRY_SOURCE_ID,
  countryFillExpression,
} from '../layers/country-selection';

type GlobeMapProps = {
  selectedIso3: string | null;
  onSelect: (iso3: string) => void;
  onUnavailable: () => void;
};

function isFeatureCollection(
  value: unknown,
): value is FeatureCollection<Geometry> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'FeatureCollection' &&
    'features' in value &&
    Array.isArray(value.features)
  );
}

export function isWebGlAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2') !== null;
  } catch {
    return false;
  }
}

export function GlobeMap({
  selectedIso3,
  onSelect,
  onUnavailable,
}: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [hoveredIso3, setHoveredIso3] = useState<string | null>(null);
  const [features, setFeatures] = useState<
    Feature<Geometry, GeoJsonProperties>[]
  >([]);
  const selectedFeature = features.find(
    (feature) => feature.properties?.[COUNTRY_ISO3_PROPERTY] === selectedIso3,
  );
  const selectedCoordinates = featureCenter(selectedFeature);

  useGlobeCamera(map, selectedCoordinates);

  useEffect(() => {
    if (containerRef.current === null || !isWebGlAvailable()) {
      onUnavailable();
      return;
    }

    let disposed = false;
    let activeMap: MapLibreMap | null = null;
    void Promise.all([
      import('maplibre-gl'),
      fetch(COUNTRY_BOUNDARIES_URL).then(async (response) => {
        if (!response.ok) throw new Error('Falha ao carregar fronteiras.');
        const value: unknown = await response.json();
        if (!isFeatureCollection(value)) throw new Error('GeoJSON inválido.');
        return value;
      }),
    ])
      .then(([maplibre, boundaries]) => {
        if (disposed || containerRef.current === null) return;
        maplibre.setWorkerUrl(maplibreWorkerUrl);
        setFeatures(boundaries.features);
        const nextMap = new maplibre.Map({
          container: containerRef.current,
          style: GLOBE_STYLE,
          center: [0, 18],
          zoom: 2.05,
          minZoom: 0.7,
          maxZoom: 6,
          attributionControl: false,
          canvasContextAttributes: { antialias: true },
        });
        activeMap = nextMap;
        nextMap.addControl(
          new maplibre.NavigationControl({ showCompass: true }),
          'top-right',
        );
        nextMap.addControl(
          new maplibre.AttributionControl({
            compact: false,
            customAttribution: COUNTRY_BOUNDARIES_ATTRIBUTION,
          }),
          'bottom-right',
        );
        nextMap.on('load', () => {
          nextMap.addSource(COUNTRY_SOURCE_ID, {
            type: 'geojson',
            data: boundaries,
            attribution: COUNTRY_BOUNDARIES_ATTRIBUTION,
          });
          nextMap.addLayer({
            id: COUNTRY_FILL_LAYER_ID,
            type: 'fill',
            source: COUNTRY_SOURCE_ID,
            paint: {
              'fill-color': countryFillExpression(null),
              'fill-opacity': 0.88,
            },
          });
          nextMap.addLayer({
            id: COUNTRY_OUTLINE_LAYER_ID,
            type: 'line',
            source: COUNTRY_SOURCE_ID,
            paint: { 'line-color': '#17392d', 'line-width': 0.55 },
          });
          setMap(nextMap);
        });
        nextMap.on('error', (event) => {
          if (event.error.message.includes('WebGL')) onUnavailable();
        });
      })
      .catch(() => onUnavailable());

    return () => {
      disposed = true;
      activeMap?.remove();
      setMap(null);
    };
  }, [onSelect, onUnavailable]);

  useEffect(() => {
    if (map === null) return;
    const readIso3 = (event: MapMouseEvent): string | null => {
      const feature = map.queryRenderedFeatures(event.point, {
        layers: [COUNTRY_FILL_LAYER_ID],
      })[0];
      const properties: unknown = feature?.properties;
      if (typeof properties !== 'object' || properties === null) return null;
      const iso3 =
        COUNTRY_ISO3_PROPERTY in properties
          ? properties[COUNTRY_ISO3_PROPERTY]
          : null;
      return typeof iso3 === 'string' ? iso3 : null;
    };
    const handleClick = (event: MapMouseEvent) => {
      const iso3 = readIso3(event);
      if (iso3 !== null) onSelect(iso3);
    };
    const handleMove = (event: MapMouseEvent) => {
      const iso3 = readIso3(event);
      setHoveredIso3(iso3);
      map.getCanvas().style.cursor = iso3 === null ? '' : 'pointer';
    };
    const handleLeave = () => {
      setHoveredIso3(null);
      map.getCanvas().style.cursor = '';
    };
    map.on('click', COUNTRY_FILL_LAYER_ID, handleClick);
    map.on('mousemove', COUNTRY_FILL_LAYER_ID, handleMove);
    map.on('mouseleave', COUNTRY_FILL_LAYER_ID, handleLeave);
    return () => {
      map.off('click', COUNTRY_FILL_LAYER_ID, handleClick);
      map.off('mousemove', COUNTRY_FILL_LAYER_ID, handleMove);
      map.off('mouseleave', COUNTRY_FILL_LAYER_ID, handleLeave);
    };
  }, [map, onSelect]);

  useEffect(() => {
    if (map === null) return;
    applyCountrySelection(map, selectedIso3, hoveredIso3);
    map.setPaintProperty(
      COUNTRY_FILL_LAYER_ID,
      'fill-opacity',
      selectedIso3 === null ? 0.88 : 0.93,
    );
  }, [hoveredIso3, map, selectedIso3]);

  return (
    <div
      ref={containerRef}
      className="globe-map"
      data-selected-iso3={selectedIso3 ?? ''}
      aria-label="Globo interativo. Arraste para girar, use os controles para ampliar e clique em um país."
    />
  );
}
