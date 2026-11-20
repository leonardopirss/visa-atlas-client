import type { MetricType, Statistic, VisaPurpose } from '@visa-atlas/contracts';
import { DataStatus } from './data-status';
import { SourceBadge } from './source-badge';

export const METRIC_LABELS: Record<MetricType, string> = {
  FIRST_RESIDENCE_PERMITS_GRANTED:
    'Primeiras autorizações de residência concedidas',
  WORK_VISAS_ISSUED: 'Vistos de trabalho emitidos',
  APPLICATIONS_RECEIVED: 'Solicitações recebidas',
  APPLICATIONS_REFUSED: 'Solicitações recusadas',
  DECISIONS_GRANTED: 'Decisões favoráveis',
  VALID_PERMIT_HOLDERS: 'Titulares de permissão válida',
  DECISIONS_REFUSED: 'Decisões recusadas',
  DECISIONS_WITHDRAWN: 'Solicitações retiradas',
  DECISIONS_LAPSED: 'Solicitações expiradas',
  APPROVAL_RATE: 'Taxa derivada de decisões favoráveis',
  REFUSAL_RATE: 'Taxa derivada de decisões recusadas',
  PENDING_APPLICATIONS: 'Solicitações pendentes',
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

function isDecisionRate(metricType: MetricType): boolean {
  return metricType === 'APPROVAL_RATE' || metricType === 'REFUSAL_RATE';
}

export function formatMetricValue(statistic: Statistic): string | null {
  if (statistic.value === null) return null;
  if (isDecisionRate(statistic.metricType)) {
    return `${new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(statistic.value / 100)}%`;
  }
  return new Intl.NumberFormat('pt-BR').format(statistic.value);
}

function RateDerivation({ statistic }: { statistic: Statistic }) {
  const derivation = statistic.derivation;
  if (derivation === undefined) return null;
  const numerator = derivation.numerator.reduce(
    (total, operand) => total + operand.value * operand.coefficient,
    0,
  );
  const denominator = derivation.denominator.reduce(
    (total, operand) => total + operand.value * operand.coefficient,
    0,
  );
  const numeratorLabel =
    statistic.metricType === 'REFUSAL_RATE'
      ? 'decisões recusadas'
      : 'decisões favoráveis';
  const denominatorExpression = derivation.denominator
    .map((operand) => String(operand.value * operand.coefficient))
    .join(' + ');

  return (
    <div className="metric-derivation" aria-label="Cálculo auditável da taxa">
      <p className="metric-formula">
        {numerator} ÷ ({denominatorExpression}) × 100
      </p>
      <p>
        Numerador: {numerator} {numeratorLabel}
      </p>
      <p>Denominador: {denominator} decisões favoráveis ou recusadas</p>
    </div>
  );
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
  const decisionRate = isDecisionRate(statistic.metricType);
  const formattedValue = formatMetricValue(statistic);
  return (
    <section className="metric-headline" aria-labelledby={headingId}>
      <p id={headingId} className="metric-label">
        {metricLabel(statistic.metricType, purpose)}
      </p>
      {statistic.value === null ? (
        <p className="metric-empty">
          {decisionRate && statistic.dataStatus !== 'SUPPRESSED'
            ? 'Taxa indisponível para este recorte'
            : missingValueLabel(statistic.dataStatus)}
        </p>
      ) : (
        <p className="metric-value">
          {formattedValue}
          {!decisionRate && <span>{statistic.unit}</span>}
        </p>
      )}
      <p className="metric-period">
        Período da fonte: {statistic.period} · Unidade:{' '}
        {decisionRate ? 'pontos-base' : statistic.unit}
      </p>
      {statistic.populationScope !== undefined && (
        <p className="metric-scope">
          Escopo: {statistic.populationScope.label}
        </p>
      )}
      {decisionRate && <RateDerivation statistic={statistic} />}
      <DataStatus
        status={statistic.dataStatus}
        freshness={statistic.freshness}
      />
      {decisionRate ? (
        <p className="semantic-note">
          Esta taxa agregada não representa sua chance individual de aprovação.
        </p>
      ) : (
        <p className="semantic-note">
          Este número é um volume administrativo publicado pela fonte oficial,
          não uma taxa nem uma probabilidade individual de aprovação.
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
      )}
      {statistic.source !== null && <SourceBadge source={statistic.source} />}
    </section>
  );
}
