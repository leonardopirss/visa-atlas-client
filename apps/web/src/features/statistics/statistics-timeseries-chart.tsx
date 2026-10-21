import { useQuery } from '@tanstack/react-query';
import { timeseriesQueryOptions } from '../../services/api/queries';
import type { TimeseriesQuery } from '../../services/api/types';
import { safeExternalUrl } from '../../components/ui/source-badge';

type StatisticsTimeseriesChartProps = {
  query: TimeseriesQuery;
};

function scaledChartPoints(values: Array<{ year: number; value: number }>) {
  const minimumYear = Math.min(...values.map((point) => point.year));
  const maximumYear = Math.max(...values.map((point) => point.year));
  const maximumValue = Math.max(...values.map((point) => point.value), 1);
  return values.map((point) => {
    const yearRange = Math.max(maximumYear - minimumYear, 1);
    const x = 24 + ((point.year - minimumYear) / yearRange) * 312;
    const y = 142 - (point.value / maximumValue) * 112;
    return { ...point, x, y };
  });
}

export function StatisticsTimeseriesChart({
  query,
}: StatisticsTimeseriesChartProps) {
  const timeseries = useQuery(timeseriesQueryOptions(query));

  if (timeseries.isPending)
    return <p role="status">Carregando série histórica…</p>;
  if (timeseries.isError) {
    return (
      <div className="inline-error" role="alert">
        <p>Não foi possível carregar a série histórica.</p>
        <button type="button" onClick={() => void timeseries.refetch()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  const available = timeseries.data.points.flatMap((point) =>
    point.statistic.value === null
      ? []
      : [{ year: point.year, value: point.statistic.value }],
  );
  if (timeseries.data.points.length === 0 || available.length === 0) {
    return (
      <p className="empty-state">
        Não há série histórica publicada para este recorte.
      </p>
    );
  }
  const first = available[0];
  const last = available.at(-1);
  const plotted = scaledChartPoints(available);

  return (
    <section className="timeseries" aria-labelledby="timeseries-title">
      <div className="chart-heading">
        <div>
          <span className="eyebrow">Evolução publicada</span>
          <h3 id="timeseries-title">
            {first?.year}–{last?.year}
          </h3>
        </div>
        <span>{timeseries.data.points[0]?.statistic.unit}</span>
      </div>
      <svg
        viewBox="0 0 360 170"
        role="img"
        aria-label={`Série histórica com ${available.length} valores disponíveis`}
      >
        <line x1="24" y1="142" x2="336" y2="142" className="chart-axis" />
        <polyline
          points={plotted.map((point) => `${point.x},${point.y}`).join(' ')}
          className="chart-line"
        />
        {plotted.map((point) => (
          <circle
            key={point.year}
            cx={point.x}
            cy={point.y}
            r="3"
            className="chart-point"
          />
        ))}
      </svg>
      <table className="sr-only">
        <caption>Valores da série histórica</caption>
        <thead>
          <tr>
            <th>Ano</th>
            <th>Valor</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          {timeseries.data.points.map((point) => (
            <tr key={point.year}>
              <td>{point.year}</td>
              <td>{point.statistic.value ?? 'Não disponível'}</td>
              <td>{point.statistic.dataStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {timeseries.data.points[0]?.statistic.source !== null &&
        timeseries.data.points[0]?.statistic.source !== undefined && (
          <div className="chart-source">
            <span>
              {timeseries.data.points[0].statistic.source.organization}
            </span>
            {safeExternalUrl(
              timeseries.data.points[0].statistic.source.methodologyUrl,
            ) !== null && (
              <a
                href={
                  safeExternalUrl(
                    timeseries.data.points[0].statistic.source.methodologyUrl,
                  ) ?? undefined
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Metodologia ↗
              </a>
            )}
          </div>
        )}
    </section>
  );
}
