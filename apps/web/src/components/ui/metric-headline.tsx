import type { MetricType, Statistic, VisaPurpose } from '@visa-atlas/contracts';
import { DataStatus } from './data-status';

export const METRIC_LABELS: Record<MetricType, string> = {
  FIRST_RESIDENCE_PERMITS_GRANTED:
    'Primeiras autorizações de residência concedidas',
  WORK_VISAS_ISSUED: 'Vistos de trabalho emitidos',
  APPLICATIONS_RECEIVED: 'Solicitações recebidas',
  APPLICATIONS_REFUSED: 'Solicitações recusadas',
  DECISIONS_GRANTED: 'Decisões favoráveis',
  VALID_PERMIT_HOLDERS: 'Titulares de permissão válida',
};

function metricLabel(metricType: MetricType, purpose: VisaPurpose): string {
  if (metricType === 'FIRST_RESIDENCE_PERMITS_GRANTED') {
    return purpose === 'STUDY'
      ? 'Primeiras autorizações de residência por educação'
      : 'Primeiras autorizações de residência por trabalho';
  }
  if (metricType === 'VALID_PERMIT_HOLDERS') {
    return purpose === 'STUDY'
      ? 'Titulares de permissão de estudo válida'
      : 'Titulares de permissão de trabalho válida';
  }
  if (metricType === 'APPLICATIONS_RECEIVED' && purpose === 'STUDY') {
    return 'Solicitações de visto de estudo recebidas';
  }
  return METRIC_LABELS[metricType];
}

function missingValueLabel(status: Statistic['dataStatus']): string {
  if (status === 'SUPPRESSED') return 'Valor suprimido pela fonte oficial';
  return 'Sem dado disponível para este recorte';
}

export function MetricHeadline({
  statistic,
  purpose = 'WORK',
  headingId = 'metric-label',
}: {
  statistic: Statistic;
  purpose?: VisaPurpose;
  headingId?: string;
}) {
  return (
    <section className="metric-headline" aria-labelledby={headingId}>
      <p id={headingId} className="metric-label">
        {metricLabel(statistic.metricType, purpose)}
      </p>
      {statistic.value === null ? (
        <p className="metric-empty">
          {missingValueLabel(statistic.dataStatus)}
        </p>
      ) : (
        <p className="metric-value">
          {new Intl.NumberFormat('pt-BR').format(statistic.value)}
          <span>{statistic.unit}</span>
        </p>
      )}
      <p className="metric-period">
        Período da fonte: {statistic.period} · Unidade: {statistic.unit}
      </p>
      <DataStatus
        status={statistic.dataStatus}
        freshness={statistic.freshness}
      />
      <p className="semantic-note">
        Este número é um volume administrativo publicado pela fonte oficial, não
        uma taxa nem uma probabilidade individual de aprovação.
        {statistic.metricType === 'FIRST_RESIDENCE_PERMITS_GRANTED' &&
          ' Em especial, primeiras autorizações de residência não equivalem a emissões de visto consular.'}
        {statistic.metricType === 'VALID_PERMIT_HOLDERS' &&
          purpose === 'WORK' &&
          ' No Canadá, o recorte representa titulares brasileiros do IMP com permissão de trabalho válida em 31 de dezembro; não inclui o TFWP e os valores são arredondados pela fonte.'}
        {statistic.metricType === 'VALID_PERMIT_HOLDERS' &&
          purpose === 'STUDY' &&
          ' No Canadá, o recorte representa titulares brasileiros com permissão de estudo válida em 31 de dezembro; não mede novas permissões emitidas no ano.'}
        {statistic.metricType === 'APPLICATIONS_RECEIVED' &&
          ' No Reino Unido, o recorte representa solicitações de entrada para estudo patrocinado; solicitações recebidas não equivalem a vistos concedidos.'}
      </p>
    </section>
  );
}
