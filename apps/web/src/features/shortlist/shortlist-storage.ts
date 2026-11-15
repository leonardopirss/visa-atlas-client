import { createShortlist, type Shortlist } from './shortlist';

export const SHORTLIST_STORAGE_KEY = 'visa-atlas:shortlist:v1';

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

type StoredShortlist = {
  version: 1;
  iso3: string[];
};

export type ReadShortlistResult =
  | { status: 'ok'; items: Shortlist }
  | { status: 'empty'; items: Shortlist }
  | { status: 'invalid'; items: Shortlist }
  | { status: 'unavailable'; items: Shortlist };

export function parseStoredShortlist(raw: string): ReadShortlistResult {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      parsed.version !== 1 ||
      !('iso3' in parsed) ||
      !Array.isArray(parsed.iso3)
    ) {
      return { status: 'invalid', items: [] };
    }
    const items = createShortlist(parsed.iso3);
    if (items.length !== parsed.iso3.length) {
      return { status: 'invalid', items };
    }
    return { status: 'ok', items };
  } catch {
    return { status: 'invalid', items: [] };
  }
}

export function serializeShortlist(items: Shortlist): string {
  const payload: StoredShortlist = { version: 1, iso3: [...items] };
  return JSON.stringify(payload);
}

export function readShortlist(
  storage: StoragePort | null,
): ReadShortlistResult {
  if (storage === null) return { status: 'unavailable', items: [] };
  try {
    const raw = storage.getItem(SHORTLIST_STORAGE_KEY);
    return raw === null
      ? { status: 'empty', items: [] }
      : parseStoredShortlist(raw);
  } catch {
    return { status: 'unavailable', items: [] };
  }
}

export function writeShortlist(
  storage: StoragePort | null,
  items: Shortlist,
): boolean {
  if (storage === null) return false;
  try {
    storage.setItem(SHORTLIST_STORAGE_KEY, serializeShortlist(items));
    return true;
  } catch {
    return false;
  }
}
