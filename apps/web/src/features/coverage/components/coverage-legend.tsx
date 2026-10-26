import type { CoverageSummary } from '../coverage';

export function CoverageLegend({
  summary,
  isPending,
  hasError,
}: {
  summary: CoverageSummary;
  isPending: boolean;
  hasError: boolean;
}) {
  return (
    <section className="coverage-legend" aria-label="Legenda de cobertura">
      <span className="coverage-key coverage-available" aria-hidden="true" />
      <span>Com dados ({summary.available})</span>
      <span className="coverage-key coverage-unavailable" aria-hidden="true" />
      <span>Sem dados ({summary.unavailable})</span>
      {isPending && <span role="status">Carregando cobertura…</span>}
      {hasError && (
        <span className="coverage-warning" role="alert">
          Cobertura não confirmada; o catálogo continua disponível.
        </span>
      )}
    </section>
  );
}
