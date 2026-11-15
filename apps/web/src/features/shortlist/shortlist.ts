export const SHORTLIST_LIMIT = 3;

export type Shortlist = readonly string[];

export type AddToShortlistResult =
  | { status: 'added'; items: Shortlist }
  | { status: 'duplicate'; items: Shortlist }
  | { status: 'invalid'; items: Shortlist }
  | { status: 'limit-reached'; items: Shortlist };

export function normalizeIso3(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
}

export function createShortlist(values: readonly unknown[]): Shortlist {
  const items: string[] = [];
  for (const value of values) {
    const iso3 = normalizeIso3(value);
    if (iso3 === null || items.includes(iso3)) continue;
    items.push(iso3);
    if (items.length === SHORTLIST_LIMIT) break;
  }
  return items;
}

export function addToShortlist(
  current: Shortlist,
  candidate: unknown,
): AddToShortlistResult {
  const iso3 = normalizeIso3(candidate);
  if (iso3 === null) return { status: 'invalid', items: current };
  if (current.includes(iso3)) return { status: 'duplicate', items: current };
  if (current.length >= SHORTLIST_LIMIT) {
    return { status: 'limit-reached', items: current };
  }
  return { status: 'added', items: [...current, iso3] };
}

export function removeFromShortlist(
  current: Shortlist,
  candidate: unknown,
): Shortlist {
  const iso3 = normalizeIso3(candidate);
  if (iso3 === null || !current.includes(iso3)) return current;
  return current.filter((item) => item !== iso3);
}
