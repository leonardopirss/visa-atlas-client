import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppState } from '../../app/app-state';
import { defaultsQueryOptions } from '../../services/api/queries';

export function FilterDefaults() {
  const { filters, replaceFilters } = useAppState();
  const defaults = useQuery(defaultsQueryOptions());

  useEffect(() => {
    if (defaults.data === undefined) return;
    replaceFilters({
      citizenship: defaults.data.citizenship,
      purpose: defaults.data.purpose,
      year: defaults.data.year,
      metricType: defaults.data.metricType,
      comparisonGroupId: defaults.data.comparisonGroupId,
    });
  }, [defaults.data, replaceFilters]);

  if (defaults.isPending)
    return <span role="status">Sincronizando filtros…</span>;
  if (defaults.isError) {
    return (
      <span className="filter-warning" role="alert">
        API indisponível — usando BRA / Trabalho
      </span>
    );
  }
  if (defaults.data.dataAvailable === false || filters.year === null) {
    return (
      <span className="filter-warning">Sem período comparável publicado</span>
    );
  }
  return (
    <span className="filter-ok">Dados publicados para {filters.year}</span>
  );
}
