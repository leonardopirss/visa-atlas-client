import type { Feature, GeoJsonProperties, Geometry, Position } from 'geojson';

function visitCoordinates(value: unknown, points: Position[]): void {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    points.push(value as Position);
    return;
  }
  for (const child of value) visitCoordinates(child, points);
}

export function featureCenter(
  feature: Feature<Geometry, GeoJsonProperties> | undefined,
): readonly [number, number] | null {
  if (feature === undefined || feature.geometry === null) return null;
  const points: Position[] = [];
  if ('coordinates' in feature.geometry) {
    visitCoordinates(feature.geometry.coordinates, points);
  } else {
    for (const geometry of feature.geometry.geometries) {
      if ('coordinates' in geometry)
        visitCoordinates(geometry.coordinates, points);
    }
  }
  if (points.length === 0) return null;

  let west = 180;
  let east = -180;
  let south = 90;
  let north = -90;
  for (const point of points) {
    const [longitude, latitude] = point;
    if (longitude === undefined || latitude === undefined) continue;
    west = Math.min(west, longitude);
    east = Math.max(east, longitude);
    south = Math.min(south, latitude);
    north = Math.max(north, latitude);
  }
  return [(west + east) / 2, (south + north) / 2];
}
