import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { INITIAL_FILTERS, useAppState } from '../../app/app-state';
import { defaultsQueryOptions } from '../../services/api/queries';

export function FilterDefaults() {
  const { filters, replaceFilters } = useAppState();
  const defaults = useQuery(defaultsQueryOptions());

  useEffect(() => {
    if (defaults.data === undefined) return;
    if (
      filters.metricType !== INITIAL_FILTERS.metricType ||
      filters.year !== INITIAL_FILTERS.year ||
      filters.comparisonGroupId !== INITIAL_FILTERS.comparisonGroupId
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
        API indisponível — usando BRA / Trabalho
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
