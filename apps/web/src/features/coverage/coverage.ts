import type { Country, MapStatisticsResponse } from '@visa-atlas/contracts';

export type CoverageStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN_ERROR';

export type CoverageSummary = {
  byIso3: Record<string, CoverageStatus>;
  available: number;
  unavailable: number;
  unknown: number;
  total: number;
};

export type CoverageResponse = {
  data: MapStatisticsResponse | undefined;
  failed: boolean;
};

export function deriveCoverage(
  countries: Country[],
  responses: CoverageResponse[],
): CoverageSummary {
  const observations = responses.map(
    ({ data }) =>
      new Map(data?.countries.map((entry) => [entry.iso3, entry.statistic])),
  );
  const byIso3: Record<string, CoverageStatus> = {};
  let available = 0;
  let unavailable = 0;
  let unknown = 0;

  for (const country of countries) {
    const hasAvailableObservation = observations.some((observed) => {
      const value = observed.get(country.iso3)?.value;
      return value !== null && value !== undefined;
    });
    const status: CoverageStatus = hasAvailableObservation
      ? 'AVAILABLE'
      : responses.some(({ failed }) => failed)
        ? 'UNKNOWN_ERROR'
        : 'UNAVAILABLE';
    byIso3[country.iso3] = status;
    if (status === 'AVAILABLE') available += 1;
    else if (status === 'UNAVAILABLE') unavailable += 1;
    else unknown += 1;
  }

  return { byIso3, available, unavailable, unknown, total: countries.length };
}

export function coverageLabel(status: CoverageStatus | undefined): string {
  if (status === 'AVAILABLE') return 'Dados disponíveis';
  if (status === 'UNAVAILABLE') return 'Ainda sem dados';
  return 'Cobertura não confirmada';
}
