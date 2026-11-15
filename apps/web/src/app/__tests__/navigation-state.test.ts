import { afterEach, describe, expect, it } from 'vitest';
import {
  parseNavigationState,
  serializeNavigationState,
  writeNavigationState,
} from '../navigation-state';

describe('navigation state', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('normaliza país e modo de lista', () => {
    expect(parseNavigationState('?country=deu&view=list')).toEqual({
      countryIso3: 'DEU',
      comparisonIso3s: [],
      view: 'list',
    });
  });

  it('prioriza comparação, remove duplicatas e limita a três países', () => {
    expect(
      parseNavigationState('?country=BRA&compare=deu,FRA,deu,CAN,GBR'),
    ).toEqual({
      countryIso3: null,
      comparisonIso3s: ['DEU', 'FRA', 'CAN'],
      view: 'compare',
    });
  });

  it('ignora valores malformados sem falhar', () => {
    expect(parseNavigationState('?country=12&compare=invalid,--')).toEqual({
      countryIso3: null,
      comparisonIso3s: [],
      view: 'globe',
    });
  });

  it('canonicaliza parâmetros suportados e preserva os demais', () => {
    expect(
      serializeNavigationState(
        {
          countryIso3: null,
          comparisonIso3s: ['deu', 'FRA'],
          view: 'compare',
        },
        '?utm_source=test&country=BRA&view=list',
      ),
    ).toBe('?utm_source=test&compare=DEU,FRA');
  });

  it('escreve navegação no histórico sem mudar o path', () => {
    window.history.replaceState(null, '', '/atlas?view=list#map');
    writeNavigationState(
      { countryIso3: 'CAN', comparisonIso3s: [], view: 'globe' },
      'push',
    );
    expect(window.location.pathname).toBe('/atlas');
    expect(window.location.search).toBe('?country=CAN');
    expect(window.location.hash).toBe('#map');
  });
});
