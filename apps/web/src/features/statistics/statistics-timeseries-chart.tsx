import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timeseriesQueryOptions } from '../../services/api/queries';
import type { TimeseriesQuery } from '../../services/api/types';
import { safeExternalUrl } from '../../components/ui/source-badge';
import type { TimeseriesResponse } from '@visa-atlas/contracts';

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

function formatValue(value: number, unit: string): string {
  if (unit === 'BASIS_POINTS') {
    return `${new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)}%`;
  }
  return `${new Intl.NumberFormat('pt-BR').format(value)} ${unit}`.trim();
}

export function hasCompatibleTimeseriesScope(
  data: TimeseriesResponse,
): boolean {
  const scopes = data.points.map(({ statistic }) => statistic.populationScope);
  const hasExplicitScope = scopes.some((scope) => scope !== undefined);
  if (hasExplicitScope && scopes.some((scope) => scope === undefined))
    return false;
  const firstUnit = data.points[0]?.statistic.unit;
  return data.points.every(({ year, statistic }) => {
    const scope = statistic.populationScope;
    return (
      statistic.metricType === data.metricType &&
      statistic.period === String(year) &&
      statistic.unit === firstUnit &&
      (scope === undefined ||
        (scope.basis === data.populationBasis &&
          scope.programKey === data.programKey &&
          (data.populationBasis === 'NATIONAL'
            ? scope.basis === 'NATIONAL'
            : scope.basis === 'CITIZENSHIP' &&
              scope.citizenshipIso3 === data.citizenship)))
    );
  });
}

export function StatisticsTimeseriesChart({
  query,
}: StatisticsTimeseriesChartProps) {
  const [activeYear, setActiveYear] = useState<number | null>(null);
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
  if (!hasCompatibleTimeseriesScope(timeseries.data)) {
    return (
      <p className="empty-state">
        A série contém períodos, populações ou programas incompatíveis e não
        pode ser agrupada.
      </p>
    );
  }
  const first = available[0];
  const last = available.at(-1);
  const plotted = scaledChartPoints(available);
  const activePoint = plotted.find((point) => point.year === activeYear);
  const unit = timeseries.data.points[0]?.statistic.unit ?? '';
  const displayUnit = unit === 'BASIS_POINTS' ? '%' : unit;

  return (
    <section className="timeseries" aria-labelledby="timeseries-title">
      <div className="chart-heading">
        <div>
          <span className="eyebrow">Evolução publicada</span>
          <h3 id="timeseries-title">
            {first?.year}–{last?.year}
          </h3>
        </div>
        <span>{displayUnit}</span>
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
        {plotted.map((point) => {
          const label = `${point.year}: ${formatValue(point.value, unit)}`;

          return (
            <g
              key={point.year}
              className="chart-point-target"
              role="img"
              tabIndex={0}
              aria-label={label}
              onMouseEnter={() => setActiveYear(point.year)}
              onMouseLeave={() => setActiveYear(null)}
              onFocus={() => setActiveYear(point.year)}
              onBlur={() => setActiveYear(null)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r="10"
                className="chart-point-hitbox"
              />
              <circle cx={point.x} cy={point.y} r="3" className="chart-point" />
            </g>
          );
        })}
        {activePoint !== undefined && (
          <g
            className="chart-tooltip"
            transform={`translate(${Math.min(Math.max(activePoint.x, 70), 290)} ${activePoint.y})`}
            role="tooltip"
          >
            <rect
              x="-66"
              y={activePoint.y >= 66 ? -62 : 12}
              width="132"
              height="50"
              rx="8"
            />
            <text
              y={activePoint.y >= 66 ? -42 : 31}
              className="chart-tooltip-year"
            >
              {activePoint.year}
            </text>
            <text y={activePoint.y >= 66 ? -24 : 49}>
              {formatValue(activePoint.value, unit)}
            </text>
          </g>
        )}
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
              <td>
                {point.statistic.value === null
                  ? 'Não disponível'
                  : formatValue(point.statistic.value, point.statistic.unit)}
              </td>
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
