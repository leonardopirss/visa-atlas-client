import { useAppState } from '../../app/app-state';
import { FilterDefaults } from './filter-defaults';

export function FilterBar() {
  const { filters, replaceFilters } = useAppState();
  return (
    <section className="filter-bar" aria-label="Filtros da consulta">
      <label className="filter-item filter-select">
        <span>Indicador</span>
        <select
          aria-label="Indicador estatístico"
          value={filters.metricType}
          onChange={(event) =>
            replaceFilters({
              ...filters,
              metricType: event.target.value as typeof filters.metricType,
              year: null,
              comparisonGroupId: null,
            })
          }
        >
          <option value="FIRST_RESIDENCE_PERMITS_GRANTED">
            Europa · residência
          </option>
          <option value="WORK_VISAS_ISSUED">Reino Unido · vistos</option>
          <option value="VALID_PERMIT_HOLDERS">Canadá · titulares IMP</option>
        </select>
      </label>
      <div className="filter-item">
        <span>Nacionalidade</span>
        <strong>Brasil · {filters.citizenship}</strong>
      </div>
      <div className="filter-item">
        <span>Finalidade</span>
        <strong>Trabalho</strong>
      </div>
      <div className="filter-item">
        <span>Período</span>
        <strong>{filters.year ?? 'Mais recente'}</strong>
      </div>
      <FilterDefaults />
    </section>
  );
}
