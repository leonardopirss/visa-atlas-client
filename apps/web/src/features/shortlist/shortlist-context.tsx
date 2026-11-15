import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  addToShortlist,
  removeFromShortlist,
  type AddToShortlistResult,
  type Shortlist,
} from './shortlist';
import { readShortlist, writeShortlist } from './shortlist-storage';

type ShortlistContextValue = {
  items: Shortlist;
  hydrated: boolean;
  persistenceAvailable: boolean;
  add: (iso3: string) => AddToShortlistResult;
  remove: (iso3: string) => void;
  includes: (iso3: string) => boolean;
};

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => {
    const result = readShortlist(browserStorage());
    return {
      items: result.items,
      persistenceAvailable: result.status !== 'unavailable',
    };
  });
  const itemsRef = useRef<Shortlist>(state.items);

  const commit = useCallback((nextItems: Shortlist) => {
    itemsRef.current = nextItems;
    setState({
      items: nextItems,
      persistenceAvailable: writeShortlist(browserStorage(), nextItems),
    });
  }, []);

  const add = useCallback(
    (iso3: string) => {
      const result = addToShortlist(itemsRef.current, iso3);
      if (result.status === 'added') commit(result.items);
      return result;
    },
    [commit],
  );

  const remove = useCallback(
    (iso3: string) => commit(removeFromShortlist(itemsRef.current, iso3)),
    [commit],
  );

  const includes = useCallback(
    (iso3: string) => state.items.includes(iso3.toUpperCase()),
    [state.items],
  );

  const value = useMemo<ShortlistContextValue>(
    () => ({
      items: state.items,
      hydrated: true,
      persistenceAvailable: state.persistenceAvailable,
      add,
      remove,
      includes,
    }),
    [add, includes, remove, state.items, state.persistenceAvailable],
  );

  return (
    <ShortlistContext.Provider value={value}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist(): ShortlistContextValue {
  const value = useContext(ShortlistContext);
  if (value === null) {
    throw new Error('useShortlist deve ser usado dentro de ShortlistProvider.');
  }
  return value;
}
