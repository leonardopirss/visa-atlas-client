import { describe, expect, it } from 'vitest';
import {
  parseCountryDetail,
  parseFilterDefaults,
  parseMapStatistics,
  parseTimeseries,
} from './validation';

const source = {
  organization: 'Synthetic official source',
  datasetCode: 'visa-insights-contract-test',
  releaseId: 'release-2026-01',
  url: 'https://example.gov/visa-insights',
};

function decisionStatistic(overrides: Record<string, unknown> = {}) {
  return {
    metricType: 'APPROVAL_RATE',
    value: 8750,
    dataStatus: 'AVAILABLE',
    freshness: 'CURRENT',
    unit: 'BASIS_POINTS',
    period: '2026',
    comparisonGroupId: 'decision-rate-2026',
    populationScope: {
      basis: 'CITIZENSHIP',
      populationKey: 'BRA',
      citizenshipIso3: 'BRA',
      programKey: 'home-office:entry-clearance:work',
      label: 'Cidadãos brasileiros · trabalho',
    },
    derivation: {
      formula: 'APPROVAL_RATE',
      numerator: [
        {
          observationId: 'granted-2026',
          metricType: 'DECISIONS_GRANTED',
          value: 7,
          unit: 'COUNT',
          period: '2026',
          releaseId: 'release-2026-01',
          comparisonGroupId: 'decision-rate-2026',
          sourceCategoryCode: 'GRANTED',
          coefficient: 1,
        },
      ],
      denominator: [
        {
          observationId: 'granted-2026',
          metricType: 'DECISIONS_GRANTED',
          value: 7,
          unit: 'COUNT',
          period: '2026',
          releaseId: 'release-2026-01',
          comparisonGroupId: 'decision-rate-2026',
          sourceCategoryCode: 'GRANTED',
          coefficient: 1,
        },
        {
          observationId: 'refused-2026',
          metricType: 'DECISIONS_REFUSED',
          value: 1,
          unit: 'COUNT',
          period: '2026',
          releaseId: 'release-2026-01',
          comparisonGroupId: 'decision-rate-2026',
          sourceCategoryCode: 'REFUSED',
          coefficient: 1,
        },
      ],
      precision: 2,
    },
    measurement: {
      approximate: true,
      roundingIncrement: 5,
      precision: 0,
    },
    source,
    ...overrides,
  };
}

function extendedCountryDetail(overrides: Record<string, unknown> = {}) {
  return {
    country: {
      iso3: 'GBR',
      iso2: 'GB',
      name: 'Reino Unido',
      region: 'Europa',
    },
    statistics: decisionStatistic(),
    classifications: [],
    visaPrograms: [
      {
        id: 'skilled-worker',
        title: 'Skilled Worker',
        purpose: 'WORK',
        sponsorshipRequirement: 'REQUIRED',
        officialUrl: 'https://www.gov.uk/skilled-worker-visa',
        verifiedAt: '2026-11-16T12:00:00.000Z',
        requirements: [
          {
            type: 'APPLICATION_FEE',
            value: {
              kind: 'MONEY',
              amount: '819.00',
              currency: 'GBP',
              basis: 'PER_PERSON',
            },
            conditions: [
              {
                kind: 'APPLICATION_LOCATION',
                operator: 'EQ',
                value: 'OUTSIDE_DESTINATION',
              },
              {
                kind: 'DURATION_MONTHS',
                operator: 'LTE',
                value: 36,
              },
            ],
            conditionSchemaVersion: 'v1',
            conditionSummary: 'Pedido externo por até três anos.',
            effectiveAt: '2026-01-01',
            effectiveUntil: null,
            verifiedAt: '2026-11-16T12:00:00.000Z',
            officialUrl:
              'https://www.gov.uk/skilled-worker-visa/how-much-it-costs',
            source,
          },
          {
            type: 'RENEWABLE',
            value: { kind: 'STATE', state: 'DEPENDS' },
            conditions: [
              {
                kind: 'APPLICATION_CONTEXT',
                operator: 'EQ',
                value: 'EXTENSION',
              },
            ],
            conditionSchemaVersion: 'v1',
            conditionSummary: null,
            effectiveAt: '2026-01-01',
            effectiveUntil: null,
            verifiedAt: '2026-11-16T12:00:00.000Z',
            officialUrl:
              'https://www.gov.uk/skilled-worker-visa/extend-your-visa',
            source,
          },
          {
            type: 'PROCESSING_TIME_TARGET',
            value: {
              kind: 'DURATION',
              amount: 3,
              unit: 'WEEKS',
            },
            conditions: [],
            conditionSchemaVersion: 'v1',
            conditionSummary: null,
            effectiveAt: '2026-01-01',
            effectiveUntil: null,
            verifiedAt: '2026-11-16T12:00:00.000Z',
            officialUrl: 'https://www.gov.uk/skilled-worker-visa',
            source,
          },
        ],
        pathways: [
          {
            targetRouteCode: 'uk:settlement:skilled-worker',
            pathwayType: 'PERMANENT_RESIDENCE',
            state: 'DEPENDS',
            qualifyingPeriodMonths: 60,
            conditions: [
              {
                kind: 'OCCUPATION_CLASS',
                operator: 'IN',
                value: ['ELIGIBLE_CURRENT_RULES'],
              },
            ],
            conditionSchemaVersion: 'v1',
            effectiveAt: '2026-01-01',
            effectiveUntil: null,
            verifiedAt: '2026-11-16T12:00:00.000Z',
            officialUrl:
              'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker',
            source,
          },
        ],
      },
    ],
    sources: [source],
    ...overrides,
  };
}

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

describe('visa decision insights contract validation', () => {
  it('accepts the previous country detail payload without additive insight fields', () => {
    expect(() =>
      parseCountryDetail({
        country: {
          iso3: 'ESP',
          iso2: 'ES',
          name: 'Espanha',
          region: 'Europa',
        },
        statistics: {
          metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
          value: 4,
          dataStatus: 'AVAILABLE',
          freshness: 'CURRENT',
          unit: 'COUNT',
          period: '2025',
          comparisonGroupId: 'legacy-2025',
          source,
        },
        classifications: [],
        visaPrograms: [],
        sources: [source],
      }),
    ).not.toThrow();
  });

  it('accepts composable population scope, derivation, measurement, requirements, conditions and pathways', () => {
    expect(() => parseCountryDetail(extendedCountryDetail())).not.toThrow();
  });

  it('accepts an explicit NATIONAL timeseries without citizenship', () => {
    expect(() =>
      parseTimeseries({
        iso3: 'GBR',
        citizenship: null,
        populationBasis: 'NATIONAL',
        programKey: 'home-office:entry-clearance:work',
        purpose: 'WORK',
        metricType: 'PENDING_APPLICATIONS',
        comparisonGroupId: 'national-pending-2026',
        points: [
          {
            year: 2026,
            statistic: decisionStatistic({
              metricType: 'PENDING_APPLICATIONS',
              value: 120,
              unit: 'COUNT',
              derivation: undefined,
              populationScope: {
                basis: 'NATIONAL',
                populationKey: 'ALL',
                programKey: 'home-office:entry-clearance:work',
                label: 'Todos os requerentes · trabalho',
              },
            }),
          },
        ],
      }),
    ).not.toThrow();
  });

  it('rejects NATIONAL payloads that also claim a citizenship', () => {
    expect(() =>
      parseTimeseries({
        iso3: 'GBR',
        citizenship: 'BRA',
        populationBasis: 'NATIONAL',
        programKey: 'ALL',
        purpose: 'WORK',
        metricType: 'PENDING_APPLICATIONS',
        comparisonGroupId: null,
        points: [],
      }),
    ).toThrow('payload inválido');
  });

  it('rejects a derivation operand without a release id', () => {
    const statistic = decisionStatistic();
    const derivation = statistic.derivation;
    const numerator = derivation.numerator[0]!;
    const { releaseId: _releaseId, ...operandWithoutRelease } = numerator;
    void _releaseId;

    expect(() =>
      parseCountryDetail(
        extendedCountryDetail({
          statistics: decisionStatistic({
            derivation: {
              ...derivation,
              numerator: [operandWithoutRelease],
            },
          }),
        }),
      ),
    ).toThrow('payload inválido');
  });

  it('rejects invalid measurement precision metadata', () => {
    expect(() =>
      parseCountryDetail(
        extendedCountryDetail({
          statistics: decisionStatistic({
            measurement: {
              approximate: 'yes',
              roundingIncrement: 0,
              precision: -1,
            },
          }),
        }),
      ),
    ).toThrow('payload inválido');
  });

  it('rejects a requirement whose value discriminator conflicts with its type', () => {
    const detail = extendedCountryDetail();
    const visaProgram = detail.visaPrograms[0]!;
    const requirements = visaProgram.requirements;

    expect(() =>
      parseCountryDetail(
        extendedCountryDetail({
          visaPrograms: [
            {
              ...visaProgram,
              requirements: [
                {
                  ...requirements[0],
                  value: { kind: 'STATE', state: 'YES' },
                },
              ],
            },
          ],
        }),
      ),
    ).toThrow('payload inválido');
  });

  it('rejects a condition with an operator/value incompatible with its kind', () => {
    const detail = extendedCountryDetail();
    const visaProgram = detail.visaPrograms[0]!;
    const requirement = visaProgram.requirements[0]!;

    expect(() =>
      parseCountryDetail(
        extendedCountryDetail({
          visaPrograms: [
            {
              ...visaProgram,
              requirements: [
                {
                  ...requirement,
                  conditions: [
                    {
                      kind: 'FAMILY_SIZE',
                      operator: 'IN',
                      value: 'two',
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    ).toThrow('payload inválido');
  });

  it.each([
    ['requirement official URL', 'ftp://example.gov/fee', 'officialUrl'],
    ['requirement source URL', 'javascript:alert(1)', 'source'],
    ['pathway official URL', 'file:///etc/passwd', 'pathway'],
  ])('rejects a non-HTTP(S) %s', (_label, invalidUrl, target) => {
    const detail = extendedCountryDetail();
    const visaProgram = detail.visaPrograms[0]!;
    const requirement = visaProgram.requirements[0]!;
    const pathway = visaProgram.pathways[0]!;

    const invalidProgram =
      target === 'pathway'
        ? {
            ...visaProgram,
            pathways: [{ ...pathway, officialUrl: invalidUrl }],
          }
        : {
            ...visaProgram,
            requirements: [
              target === 'source'
                ? {
                    ...requirement,
                    source: { ...requirement.source, url: invalidUrl },
                  }
                : { ...requirement, officialUrl: invalidUrl },
            ],
          };

    expect(() =>
      parseCountryDetail(
        extendedCountryDetail({ visaPrograms: [invalidProgram] }),
      ),
    ).toThrow('payload inválido');
  });

  it('requires releaseId in requirement and pathway provenance', () => {
    const detail = extendedCountryDetail();
    const visaProgram = detail.visaPrograms[0]!;
    const requirement = visaProgram.requirements[0]!;
    const pathway = visaProgram.pathways[0]!;
    const { releaseId: _requirementReleaseId, ...requirementSource } =
      requirement.source;
    const { releaseId: _pathwayReleaseId, ...pathwaySource } = pathway.source;
    void _requirementReleaseId;
    void _pathwayReleaseId;

    expect(() =>
      parseCountryDetail(
        extendedCountryDetail({
          visaPrograms: [
            {
              ...visaProgram,
              requirements: [{ ...requirement, source: requirementSource }],
              pathways: [{ ...pathway, source: pathwaySource }],
            },
          ],
        }),
      ),
    ).toThrow('payload inválido');
  });
});
