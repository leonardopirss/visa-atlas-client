import type { MetricType, VisaPurpose } from '@visa-atlas/contracts';

export const INITIAL_METRIC: MetricType = 'FIRST_RESIDENCE_PERMITS_GRANTED';

const DESTINATION_METRICS: Readonly<Partial<Record<string, MetricType>>> = {
  CAN: 'VALID_PERMIT_HOLDERS',
  GBR: 'WORK_VISAS_ISSUED',
};

const UK_DECISION_METRICS = new Set<MetricType>([
  'DECISIONS_GRANTED',
  'DECISIONS_REFUSED',
  'DECISIONS_WITHDRAWN',
  'DECISIONS_LAPSED',
  'APPROVAL_RATE',
  'REFUSAL_RATE',
]);

export function metricForDestination(
  iso3: string,
  current: MetricType = INITIAL_METRIC,
  purpose: VisaPurpose = 'WORK',
): MetricType {
  const normalizedIso3 = iso3.toUpperCase();
  if (UK_DECISION_METRICS.has(current)) {
    return current;
  }
  if (normalizedIso3 === 'GBR' && purpose === 'STUDY') {
    return 'APPLICATIONS_RECEIVED';
  }
  const destinationMetric = DESTINATION_METRICS[normalizedIso3];
  if (destinationMetric !== undefined) return destinationMetric;
  return current === 'VALID_PERMIT_HOLDERS' ||
    current === 'WORK_VISAS_ISSUED' ||
    current === 'APPLICATIONS_RECEIVED'
    ? INITIAL_METRIC
    : current;
}
