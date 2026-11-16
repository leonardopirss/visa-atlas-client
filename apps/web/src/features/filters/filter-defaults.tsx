import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppState } from '../../app/app-state';
import { defaultsQueryOptions } from '../../services/api/queries';

export function FilterDefaults() {
  const { filters, replaceFilters } = useAppState();
  const defaults = useQuery(
    defaultsQueryOptions({
      citizenship: filters.citizenship,
      purpose: filters.purpose,
      metricType: filters.metricType,
    }),
  );

  useEffect(() => {
    if (defaults.data === undefined) return;
    if (
      filters.citizenship === defaults.data.citizenship &&
      filters.purpose === defaults.data.purpose &&
      filters.year === defaults.data.year &&
      filters.metricType === defaults.data.metricType &&
      filters.comparisonGroupId === defaults.data.comparisonGroupId
    ) {
      return;
    }
    replaceFilters({
      citizenship: defaults.data.citizenship,
      purpose: defaults.data.purpose,
      year: defaults.data.year,
      metricType: defaults.data.metricType,
      comparisonGroupId: defaults.data.comparisonGroupId,
    });
  }, [defaults.data, filters, replaceFilters]);

  if (defaults.isPending)
    return <span role="status">Sincronizando filtros…</span>;
  if (defaults.isError) {
    return (
      <span className="filter-warning" role="alert">
        API indisponível — mantendo os filtros atuais
      </span>
    );
  }
  if (defaults.data.dataAvailable === false) {
    return (
      <span className="filter-warning">Sem período comparável publicado</span>
    );
  }
  if (filters.year === null) {
    return <span className="filter-ok">Período mais recente da fonte</span>;
  }
  return (
    <span className="filter-ok">Dados publicados para {filters.year}</span>
  );
}
