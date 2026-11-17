import { useDeferredValue, useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Country } from '@visa-atlas/contracts';
import { countriesQueryOptions } from '../../../services/api/queries';
import { coverageLabel, type CoverageStatus } from '../../coverage/coverage';

type CountrySearchProps = {
  onSelect: (iso3: string) => void;
  coverageByIso3: Record<string, CoverageStatus>;
  recentCountries: readonly Country[];
  onClearRecent: () => void;
};

export function CountrySearch({
  onSelect,
  coverageByIso3,
  recentCountries,
  onClearRecent,
}: CountrySearchProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const countries = useQuery(
    countriesQueryOptions({ search: deferredSearch, page: 1, pageSize: 20 }),
  );
  const results =
    countries.data?.data.filter(
      (country) =>
        !onlyAvailable || coverageByIso3[country.iso3] === 'AVAILABLE',
    ) ?? [];

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (
        event.key !== '/' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditing
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
      setIsOpen(true);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <div className="country-search">
      <label htmlFor={inputId} className="sr-only">
        Buscar país de destino
      </label>
      <span aria-hidden="true" className="search-icon">
        ⌕
      </span>
      <input
        ref={inputRef}
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
      <kbd className="search-shortcut" aria-hidden="true">
        /
      </kbd>
      {isOpen && search.trim() === '' && recentCountries.length > 0 && (
        <div className="search-results recent-results">
          <div className="recent-results-heading">
            <strong>Vistos recentemente</strong>
            <button type="button" onClick={onClearRecent}>
              Limpar
            </button>
          </div>
          <div id={`${inputId}-results`} role="listbox">
            {recentCountries.map((country) => (
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
                <small>{country.iso3}</small>
              </button>
            ))}
          </div>
        </div>
      )}
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
