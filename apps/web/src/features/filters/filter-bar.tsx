import { useAppState } from '../../app/app-state';
import { FilterDefaults } from './filter-defaults';

export function FilterBar() {
  const { filters, coverageMetric, selectCoverageMetric, selectPurpose } =
    useAppState();
  return (
    <section className="filter-bar" aria-label="Filtros da consulta">
      <label className="filter-item filter-select">
        <span>Indicador</span>
        <select
          aria-label="Indicador estatístico"
          value={coverageMetric}
          onChange={(event) =>
            selectCoverageMetric(
              event.target.value as Parameters<typeof selectCoverageMetric>[0],
            )
          }
        >
          <option value="ALL">Todos os países</option>
          <option value="FIRST_RESIDENCE_PERMITS_GRANTED">
            Europa · residência
          </option>
          <option value="WORK_VISAS_ISSUED">Reino Unido · vistos</option>
          <option value="DECISIONS_GRANTED">
            Reino Unido · decisões favoráveis
          </option>
          <option value="DECISIONS_REFUSED">
            Reino Unido · decisões recusadas
          </option>
          <option value="DECISIONS_WITHDRAWN">
            Reino Unido · solicitações retiradas
          </option>
          <option value="DECISIONS_LAPSED">
            Reino Unido · solicitações expiradas
          </option>
          <option value="APPROVAL_RATE">Reino Unido · taxa de aprovação</option>
          <option value="REFUSAL_RATE">Reino Unido · taxa de recusa</option>
          <option value="PENDING_APPLICATIONS">Solicitações pendentes</option>
          <option value="VALID_PERMIT_HOLDERS">
            Canadá · titulares de permissão
          </option>
        </select>
      </label>
      <div className="filter-item">
        <span>
          {filters.populationBasis === 'NATIONAL'
            ? 'População'
            : 'Nacionalidade'}
        </span>
        <strong>
          {filters.populationBasis === 'NATIONAL'
            ? 'Todos os requerentes'
            : `Brasil · ${filters.citizenship}`}
        </strong>
      </div>
      <label className="filter-item filter-select">
        <span>Finalidade</span>
        <select
          aria-label="Finalidade"
          value={filters.purpose}
          onChange={(event) =>
            selectPurpose(
              event.target.value as Parameters<typeof selectPurpose>[0],
            )
          }
        >
          <option value="WORK">Trabalho</option>
          <option value="STUDY">Estudo</option>
        </select>
      </label>
      <div className="filter-item">
        <span>Período</span>
        <strong>{filters.year ?? 'Mais recente'}</strong>
      </div>
      <FilterDefaults />
    </section>
  );
}
