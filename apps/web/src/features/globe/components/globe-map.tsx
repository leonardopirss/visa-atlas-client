import { useEffect, useRef, useState } from 'react';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Point,
  Polygon,
  Position,
} from 'geojson';
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapMouseEvent,
} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import {
  COUNTRY_BOUNDARIES_URL,
  COUNTRY_BOUNDARY_ISO3_ALIASES,
  COUNTRY_ISO3_PROPERTY,
} from '@visa-atlas/geo';
import { coverageLabel, type CoverageStatus } from '../../coverage/coverage';
import { featureCenter } from '../lib/geometry';
import { useGlobeCamera } from '../hooks/use-globe-camera';
import { GLOBE_STYLE } from '../layers/base-style';
import {
  COUNTRY_LABEL_PROPERTY,
  COUNTRY_LABEL_SOURCE_ID,
  countryLabelLayer,
} from '../layers/country-labels';
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
  coverageByIso3: Record<string, CoverageStatus>;
  countryNamesByIso3: Record<string, string>;
  coverageFailed: boolean;
};

function isFeatureCollection(
  value: unknown,
): value is FeatureCollection<Geometry, Record<string, unknown>> {
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

export function normalizeBoundaryFeatures(
  collection: FeatureCollection<Geometry, Record<string, unknown>>,
): FeatureCollection<Geometry, Record<string, unknown>> {
  return {
    ...collection,
    features: collection.features.map((feature) => {
      const rawIso3 = feature.properties?.[COUNTRY_ISO3_PROPERTY];
      const alias =
        typeof rawIso3 === 'string'
          ? COUNTRY_BOUNDARY_ISO3_ALIASES[rawIso3]
          : undefined;
      const iso3 = alias === undefined ? rawIso3 : alias;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          [COUNTRY_ISO3_PROPERTY]: iso3 ?? '',
        },
      };
    }),
  };
}

function ringArea(ring: Position[]): number {
  let twiceArea = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % ring.length];
    if (current === undefined || next === undefined) continue;
    const [currentLongitude, currentLatitude] = current;
    const [nextLongitude, nextLatitude] = next;
    if (
      currentLongitude === undefined ||
      currentLatitude === undefined ||
      nextLongitude === undefined ||
      nextLatitude === undefined
    )
      continue;
    twiceArea +=
      currentLongitude * nextLatitude - nextLongitude * currentLatitude;
  }
  return twiceArea / 2;
}

function ringCentroid(ring: Position[]): [number, number] | null {
  const area = ringArea(ring);
  if (Math.abs(area) < Number.EPSILON) return null;
  let longitude = 0;
  let latitude = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % ring.length];
    if (current === undefined || next === undefined) continue;
    const [currentLongitude, currentLatitude] = current;
    const [nextLongitude, nextLatitude] = next;
    if (
      currentLongitude === undefined ||
      currentLatitude === undefined ||
      nextLongitude === undefined ||
      nextLatitude === undefined
    )
      continue;
    const cross =
      currentLongitude * nextLatitude - nextLongitude * currentLatitude;
    longitude += (currentLongitude + nextLongitude) * cross;
    latitude += (currentLatitude + nextLatitude) * cross;
  }
  return [longitude / (6 * area), latitude / (6 * area)];
}

function labelAnchor(
  geometry: Polygon | MultiPolygon,
): { coordinates: [number, number]; area: number } | null {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const largestRing = polygons
    .map((polygon) => polygon[0])
    .filter((ring): ring is Position[] => ring !== undefined)
    .sort(
      (left, right) => Math.abs(ringArea(right)) - Math.abs(ringArea(left)),
    )[0];
  if (largestRing === undefined) return null;
  const coordinates = ringCentroid(largestRing);
  return coordinates === null
    ? null
    : { coordinates, area: Math.abs(ringArea(largestRing)) };
}

export function createCountryLabelFeatures(
  collection: FeatureCollection<Geometry, Record<string, unknown>>,
  countryNamesByIso3: Record<string, string>,
): FeatureCollection<Point, Record<string, unknown>> {
  const labelByIso3 = new Map<
    string,
    { feature: Feature<Point, Record<string, unknown>>; area: number }
  >();
  for (const feature of collection.features) {
    if (
      feature.geometry.type !== 'Polygon' &&
      feature.geometry.type !== 'MultiPolygon'
    )
      continue;
    const iso3Value = feature.properties?.[COUNTRY_ISO3_PROPERTY];
    const iso3 = typeof iso3Value === 'string' ? iso3Value : '';
    const anchor = labelAnchor(feature.geometry);
    if (anchor === null || iso3 === '') continue;
    const previous = labelByIso3.get(iso3);
    if (previous !== undefined && previous.area >= anchor.area) continue;
    const localizedName = countryNamesByIso3[iso3];
    labelByIso3.set(iso3, {
      area: anchor.area,
      feature: {
        type: 'Feature',
        properties: {
          ...feature.properties,
          ...(localizedName === undefined
            ? {}
            : { [COUNTRY_LABEL_PROPERTY]: localizedName }),
        },
        geometry: { type: 'Point', coordinates: anchor.coordinates },
      },
    });
  }
  return {
    type: 'FeatureCollection',
    features: [...labelByIso3.values()].map(({ feature }) => feature),
  };
}

export function GlobeMap({
  selectedIso3,
  onSelect,
  onUnavailable,
  coverageByIso3,
  countryNamesByIso3,
  coverageFailed,
}: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [hoveredIso3, setHoveredIso3] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState({ x: 0, y: 0 });
  const [boundaries, setBoundaries] = useState<FeatureCollection<
    Geometry,
    Record<string, unknown>
  > | null>(null);
  const features: Feature<Geometry, Record<string, unknown>>[] =
    boundaries?.features ?? [];
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
        return normalizeBoundaryFeatures(value);
      }),
    ])
      .then(([maplibre, boundaries]) => {
        if (disposed || containerRef.current === null) return;
        maplibre.setWorkerUrl(maplibreWorkerUrl);
        setBoundaries(boundaries);
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
        nextMap.on('load', () => {
          nextMap.addSource(COUNTRY_SOURCE_ID, {
            type: 'geojson',
            data: boundaries,
          });
          nextMap.addSource(COUNTRY_LABEL_SOURCE_ID, {
            type: 'geojson',
            data: createCountryLabelFeatures(boundaries, {}),
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
          nextMap.addLayer(countryLabelLayer(COUNTRY_LABEL_SOURCE_ID));
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
  }, [onUnavailable]);

  useEffect(() => {
    if (map === null || boundaries === null) return;
    const source = map.getSource<GeoJSONSource>(COUNTRY_LABEL_SOURCE_ID);
    void source?.setData(
      createCountryLabelFeatures(boundaries, countryNamesByIso3),
    );
  }, [boundaries, countryNamesByIso3, map]);

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
      setHoverPoint({ x: event.point.x, y: event.point.y });
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
    const availableIso3 = Object.entries(coverageByIso3)
      .filter(([, status]) => status === 'AVAILABLE')
      .map(([iso3]) => iso3);
    applyCountrySelection(
      map,
      selectedIso3,
      hoveredIso3,
      availableIso3,
      coverageFailed,
    );
    map.setPaintProperty(
      COUNTRY_FILL_LAYER_ID,
      'fill-opacity',
      selectedIso3 === null ? 0.88 : 0.93,
    );
  }, [coverageByIso3, coverageFailed, hoveredIso3, map, selectedIso3]);

  return (
    <div className="globe-region">
      <div
        ref={containerRef}
        className="globe-map"
        data-selected-iso3={selectedIso3 ?? ''}
        data-labels-ready={
          boundaries !== null && Object.keys(countryNamesByIso3).length > 0
            ? 'true'
            : 'false'
        }
        aria-label="Globo interativo com nomes localizados dos países. Arraste para girar, use os controles para ampliar e clique em um país. A busca oferece navegação por teclado."
      />
      {hoveredIso3 !== null && (
        <button
          type="button"
          className="map-tooltip"
          style={{ left: hoverPoint.x + 14, top: hoverPoint.y + 14 }}
          onClick={() => onSelect(hoveredIso3)}
        >
          <strong>{countryNamesByIso3[hoveredIso3] ?? hoveredIso3}</strong>
          <span>{coverageLabel(coverageByIso3[hoveredIso3])}</span>
        </button>
      )}
      <p className="sr-only" aria-live="polite">
        {hoveredIso3 === null
          ? ''
          : `${countryNamesByIso3[hoveredIso3] ?? hoveredIso3}: ${coverageLabel(coverageByIso3[hoveredIso3])}`}
      </p>
    </div>
  );
}
