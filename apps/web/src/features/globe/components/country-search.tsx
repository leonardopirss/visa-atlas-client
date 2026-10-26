import { useDeferredValue, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { countriesQueryOptions } from '../../../services/api/queries';
import { coverageLabel, type CoverageStatus } from '../../coverage/coverage';

type CountrySearchProps = {
  onSelect: (iso3: string) => void;
  coverageByIso3: Record<string, CoverageStatus>;
};

export function CountrySearch({
  onSelect,
  coverageByIso3,
}: CountrySearchProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const inputId = useId();
  const countries = useQuery(
    countriesQueryOptions({ search: deferredSearch, page: 1, pageSize: 20 }),
  );
  const results =
    countries.data?.data.filter(
      (country) =>
        !onlyAvailable || coverageByIso3[country.iso3] === 'AVAILABLE',
    ) ?? [];

  return (
    <div className="country-search">
      <label htmlFor={inputId} className="sr-only">
        Buscar país de destino
      </label>
      <span aria-hidden="true" className="search-icon">
        ⌕
      </span>
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        value={search}
        placeholder="Buscar destino"
        autoComplete="off"
        aria-expanded={isOpen}
        aria-controls={`${inputId}-results`}
        onChange={(event) => {
          setSearch(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false);
        }}
      />
      {isOpen && search.trim() !== '' && (
        <div className="search-results">
          <label className="availability-filter">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
            />
            Somente com dados
          </label>
          <div id={`${inputId}-results`} role="listbox">
            {countries.isPending && <p role="status">Buscando países…</p>}
            {countries.isError && (
              <p role="alert">Não foi possível buscar países.</p>
            )}
            {countries.data !== undefined && results.length === 0 && (
              <p>Nenhum país encontrado.</p>
            )}
            {results.map((country) => (
              <button
                type="button"
                role="option"
                aria-selected="false"
                key={country.iso3}
                onClick={() => {
                  onSelect(country.iso3);
                  setSearch(country.name);
                  setIsOpen(false);
                }}
              >
                <span>{country.name}</span>
                <span className="country-result-meta">
                  <small>{country.iso3}</small>
                  <small
                    className={`availability-badge availability-${coverageByIso3[country.iso3]?.toLowerCase() ?? 'unknown_error'}`}
                  >
                    {coverageLabel(coverageByIso3[country.iso3])}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
