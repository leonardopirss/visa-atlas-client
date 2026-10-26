import type { MetricType, Statistic } from '@visa-atlas/contracts';
import { DataStatus } from './data-status';

export const METRIC_LABELS: Record<MetricType, string> = {
  FIRST_RESIDENCE_PERMITS_GRANTED:
    'Primeiras autorizações de residência concedidas',
  WORK_VISAS_ISSUED: 'Vistos de trabalho emitidos',
  APPLICATIONS_RECEIVED: 'Solicitações recebidas',
  APPLICATIONS_REFUSED: 'Solicitações recusadas',
  DECISIONS_GRANTED: 'Decisões favoráveis',
  VALID_PERMIT_HOLDERS: 'Titulares de permissão de trabalho válida',
};

function missingValueLabel(status: Statistic['dataStatus']): string {
  if (status === 'SUPPRESSED') return 'Valor suprimido pela fonte oficial';
  return 'Sem dado disponível para este recorte';
}

export function MetricHeadline({ statistic }: { statistic: Statistic }) {
  return (
    <section className="metric-headline" aria-labelledby="metric-label">
      <p id="metric-label" className="metric-label">
        {METRIC_LABELS[statistic.metricType]}
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
          ' No Canadá, o recorte representa titulares brasileiros do IMP com permissão de trabalho válida em 31 de dezembro; não inclui o TFWP e os valores são arredondados pela fonte.'}
      </p>
    </section>
  );
}
