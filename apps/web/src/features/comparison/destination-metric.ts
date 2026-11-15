import type { MetricType } from '@visa-atlas/contracts';

export const INITIAL_METRIC: MetricType = 'FIRST_RESIDENCE_PERMITS_GRANTED';

const DESTINATION_METRICS: Readonly<Partial<Record<string, MetricType>>> = {
  CAN: 'VALID_PERMIT_HOLDERS',
  GBR: 'WORK_VISAS_ISSUED',
};

export function metricForDestination(
  iso3: string,
  current: MetricType = INITIAL_METRIC,
): MetricType {
  const destinationMetric = DESTINATION_METRICS[iso3.toUpperCase()];
  if (destinationMetric !== undefined) return destinationMetric;
  return current === 'VALID_PERMIT_HOLDERS' || current === 'WORK_VISAS_ISSUED'
    ? INITIAL_METRIC
    : current;
}
