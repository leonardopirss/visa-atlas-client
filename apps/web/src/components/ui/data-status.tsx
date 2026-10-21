import type {
  DataStatus as DataStatusValue,
  Freshness,
} from '@visa-atlas/contracts';

const STATUS_LABELS: Record<DataStatusValue, string> = {
  AVAILABLE: 'Dado disponível',
  UNAVAILABLE: 'Dado indisponível',
  SUPPRESSED: 'Dado suprimido pela fonte',
  ESTIMATED: 'Valor estimado pela fonte',
  REVISED: 'Valor revisado pela fonte',
};

export function DataStatus({
  status,
  freshness,
}: {
  status: DataStatusValue;
  freshness: Freshness;
}) {
  return (
    <div className="status-row" aria-label="Qualidade do dado">
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {STATUS_LABELS[status]}
      </span>
      {freshness === 'STALE' && (
        <span className="status-badge status-stale">Desatualizado</span>
      )}
    </div>
  );
}
