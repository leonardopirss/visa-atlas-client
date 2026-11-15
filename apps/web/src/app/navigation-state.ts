import {
  createShortlist,
  normalizeIso3,
} from '../features/shortlist/shortlist';

export type AppView = 'globe' | 'list' | 'compare';

export type NavigationState = {
  countryIso3: string | null;
  comparisonIso3s: readonly string[];
  view: AppView;
};

export function parseNavigationState(search: string): NavigationState {
  const params = new URLSearchParams(search);
  const comparisonIso3s = createShortlist(
    (params.get('compare') ?? '').split(',').filter(Boolean),
  );
  if (comparisonIso3s.length > 0) {
    return { countryIso3: null, comparisonIso3s, view: 'compare' };
  }

  return {
    countryIso3: normalizeIso3(params.get('country')),
    comparisonIso3s: [],
    view: params.get('view') === 'list' ? 'list' : 'globe',
  };
}

export function serializeNavigationState(
  state: NavigationState,
  currentSearch = '',
): string {
  const params = new URLSearchParams(currentSearch);
  params.delete('country');
  params.delete('compare');
  params.delete('view');

  if (state.view === 'compare' && state.comparisonIso3s.length > 0) {
    params.set('compare', createShortlist(state.comparisonIso3s).join(','));
  } else {
    const countryIso3 = normalizeIso3(state.countryIso3);
    if (countryIso3 !== null) params.set('country', countryIso3);
    if (state.view === 'list') params.set('view', 'list');
  }

  const query = params.toString().replaceAll('%2C', ',');
  return query.length === 0 ? '' : `?${query}`;
}

export function writeNavigationState(
  state: NavigationState,
  mode: 'push' | 'replace',
): void {
  const search = serializeNavigationState(state, window.location.search);
  const url = `${window.location.pathname}${search}${window.location.hash}`;
  if (mode === 'push') window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}
