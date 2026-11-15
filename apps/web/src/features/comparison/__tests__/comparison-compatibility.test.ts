import { describe, expect, it } from 'vitest';
import type { Statistic } from '@visa-atlas/contracts';
import {
  availableStatistic,
  countryDetailFixture,
} from '../../../test/fixtures';
import {
  comparisonKey,
  groupDestinationSnapshots,
} from '../comparison-compatibility';

function statistic(overrides: Partial<Statistic> = {}): Statistic {
  return { ...availableStatistic, ...overrides };
}

describe('comparison compatibility', () => {
  it('exige uma chave completa', () => {
    expect(comparisonKey(statistic())).not.toBeNull();
    expect(comparisonKey(statistic({ comparisonGroupId: null }))).toBeNull();
    expect(comparisonKey(statistic({ unit: '' }))).toBeNull();
    expect(comparisonKey(statistic({ period: '' }))).toBeNull();
  });

  it.each([
    ['metricType', { metricType: 'WORK_VISAS_ISSUED' }],
    ['unit', { unit: 'VISAS' }],
    ['period', { period: '2024' }],
    ['comparisonGroupId', { comparisonGroupId: 'other-group' }],
  ] satisfies Array<[string, Partial<Statistic>]>)(
    'separa destinos quando %s é diferente',
    (_dimension, overrides) => {
      const groups = groupDestinationSnapshots([
        { iso3: 'DEU', detail: countryDetailFixture('DEU', 'Alemanha') },
        {
          iso3: 'FRA',
          detail: countryDetailFixture('FRA', 'França', statistic(overrides)),
        },
      ]);
      expect(groups.comparable).toEqual([]);
      expect(groups.separate.map((item) => item.iso3)).toEqual(['DEU', 'FRA']);
    },
  );

  it('mantém zero e ausência no mesmo grupo quando a semântica coincide', () => {
    const groups = groupDestinationSnapshots([
      { iso3: 'DEU', detail: countryDetailFixture('DEU', 'Alemanha') },
      {
        iso3: 'FRA',
        detail: countryDetailFixture(
          'FRA',
          'França',
          statistic({ value: null, dataStatus: 'SUPPRESSED' }),
        ),
      },
    ]);
    expect(
      groups.comparable.map((group) => group.map((item) => item.iso3)),
    ).toEqual([['DEU', 'FRA']]);
    expect(groups.separate).toEqual([]);
  });
});
