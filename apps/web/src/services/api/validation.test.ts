import { describe, expect, it } from 'vitest';
import {
  parseFilterDefaults,
  parseMapStatistics,
  parseTimeseries,
} from './validation';

describe('API purpose validation', () => {
  it.each(['WORK', 'STUDY'] as const)(
    'accepts %s in filter defaults',
    (purpose) => {
      expect(
        parseFilterDefaults({
          citizenship: 'BRA',
          purpose,
          year: null,
          metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
          comparisonGroupId: null,
          dataAvailable: false,
        }).purpose,
      ).toBe(purpose);
    },
  );

  it('accepts study map and timeseries payloads', () => {
    expect(
      parseMapStatistics({
        citizenship: 'BRA',
        purpose: 'STUDY',
        year: null,
        countries: [],
      }).purpose,
    ).toBe('STUDY');
    expect(
      parseTimeseries({
        iso3: 'ESP',
        citizenship: 'BRA',
        purpose: 'STUDY',
        metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
        comparisonGroupId: null,
        points: [],
      }).purpose,
    ).toBe('STUDY');
  });

  it('rejects an unknown purpose', () => {
    expect(() =>
      parseMapStatistics({
        citizenship: 'BRA',
        purpose: 'TOURISM',
        year: null,
        countries: [],
      }),
    ).toThrow('payload inválido');
  });
});
