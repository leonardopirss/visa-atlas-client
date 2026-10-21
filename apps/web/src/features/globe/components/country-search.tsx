import { useDeferredValue, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { countriesQueryOptions } from '../../../services/api/queries';

type CountrySearchProps = {
  onSelect: (iso3: string) => void;
};

export function CountrySearch({ onSelect }: CountrySearchProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const inputId = useId();
  const countries = useQuery(
    countriesQueryOptions({ search: deferredSearch, page: 1, pageSize: 20 }),
  );

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
        <div
          className="search-results"
          id={`${inputId}-results`}
          role="listbox"
        >
          {countries.isPending && <p role="status">Buscando países…</p>}
          {countries.isError && (
            <p role="alert">Não foi possível buscar países.</p>
          )}
          {countries.data?.data.length === 0 && <p>Nenhum país encontrado.</p>}
          {countries.data?.data.map((country) => (
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
      )}
    </div>
  );
}
