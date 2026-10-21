import { useEffect, useRef } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

type Coordinates = readonly [number, number];

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useGlobeCamera(
  map: MapLibreMap | null,
  selectedCoordinates: Coordinates | null,
): void {
  const previousAnimation = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (map === null) return;
    previousAnimation.current?.stop();
    previousAnimation.current = map;

    if (selectedCoordinates === null) {
      map.easeTo({
        center: [0, 18],
        zoom: 2.05,
        duration: prefersReducedMotion() ? 0 : 700,
      });
    } else {
      map.flyTo({
        center: [selectedCoordinates[0], selectedCoordinates[1]],
        zoom: 2.8,
        duration: prefersReducedMotion() ? 0 : 900,
        essential: false,
      });
    }

    return () => {
      map.stop();
    };
  }, [map, selectedCoordinates]);
}
