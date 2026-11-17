import { normalizeIso3 } from '../shortlist/shortlist';

export const RECENT_DESTINATIONS_LIMIT = 5;
export const RECENT_DESTINATIONS_STORAGE_KEY =
  'visa-atlas:recent-destinations:v1';

export type RecentDestinations = readonly string[];
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

export function createRecentDestinations(
  values: readonly unknown[],
): RecentDestinations {
  const destinations: string[] = [];
  for (const value of values) {
    const iso3 = normalizeIso3(value);
    if (iso3 === null || destinations.includes(iso3)) continue;
    destinations.push(iso3);
    if (destinations.length === RECENT_DESTINATIONS_LIMIT) break;
  }
  return destinations;
}

export function addRecentDestination(
  current: RecentDestinations,
  candidate: unknown,
): RecentDestinations {
  const iso3 = normalizeIso3(candidate);
  if (iso3 === null) return current;
  return createRecentDestinations([iso3, ...current]);
}

export function readRecentDestinations(
  storage: StoragePort | null,
): RecentDestinations {
  if (storage === null) return [];
  try {
    const raw = storage.getItem(RECENT_DESTINATIONS_STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? createRecentDestinations(parsed) : [];
  } catch {
    return [];
  }
}

export function writeRecentDestinations(
  storage: StoragePort | null,
  destinations: RecentDestinations,
): boolean {
  if (storage === null) return false;
  try {
    storage.setItem(
      RECENT_DESTINATIONS_STORAGE_KEY,
      JSON.stringify(createRecentDestinations(destinations)),
    );
    return true;
  } catch {
    return false;
  }
}
