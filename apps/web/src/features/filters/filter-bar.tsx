import { useAppState } from '../../app/app-state';
import { FilterDefaults } from './filter-defaults';

export function FilterBar() {
  const { filters } = useAppState();
  return (
    <section className="filter-bar" aria-label="Filtros da consulta">
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
        <strong>{filters.year ?? 'Definido pela API'}</strong>
      </div>
      <FilterDefaults />
    </section>
  );
}
