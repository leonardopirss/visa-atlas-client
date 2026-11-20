import type { CountryDetail, Statistic } from '@visa-atlas/contracts';

export type DestinationSnapshot = {
  iso3: string;
  detail: CountryDetail;
};

export type ComparisonGroups = {
  comparable: DestinationSnapshot[][];
  separate: DestinationSnapshot[];
};

export function comparisonKey(statistic: Statistic): string | null {
  if (
    statistic.comparisonGroupId === null ||
    statistic.comparisonGroupId.length === 0 ||
    statistic.unit.length === 0 ||
    statistic.period.length === 0
  ) {
    return null;
  }
  const populationScope = statistic.populationScope;
  return JSON.stringify([
    statistic.metricType,
    statistic.unit,
    statistic.period,
    statistic.comparisonGroupId,
    populationScope?.basis ?? null,
    populationScope?.populationKey ?? null,
    populationScope?.basis === 'CITIZENSHIP'
      ? populationScope.citizenshipIso3
      : null,
    populationScope?.programKey ?? null,
  ]);
}

export function groupDestinationSnapshots(
  snapshots: readonly DestinationSnapshot[],
): ComparisonGroups {
  const keyed = new Map<string, DestinationSnapshot[]>();
  const separate: DestinationSnapshot[] = [];

  for (const snapshot of snapshots) {
    const key = comparisonKey(snapshot.detail.statistics);
    if (key === null) {
      separate.push(snapshot);
      continue;
    }
    const group = keyed.get(key);
    if (group === undefined) keyed.set(key, [snapshot]);
    else group.push(snapshot);
  }

  const comparable: DestinationSnapshot[][] = [];
  for (const group of keyed.values()) {
    if (group.length > 1) comparable.push(group);
    else {
      const snapshot = group[0];
      if (snapshot !== undefined) separate.push(snapshot);
    }
  }

  return { comparable, separate };
}
