import { useDeferredValue, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { countriesQueryOptions } from '../../../services/api/queries';

type CountryListFallbackProps = {
  onSelect: (iso3: string) => void;
  selectedIso3: string | null;
};

export function CountryListFallback({
  onSelect,
  selectedIso3,
}: CountryListFallbackProps) {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const searchId = useId();
  const countries = useQuery(
    countriesQueryOptions({ search: deferredSearch, page: 1, pageSize: 100 }),
  );

  return (
    <section className="country-fallback" aria-labelledby="fallback-title">
      <div className="fallback-heading">
        <span className="eyebrow">Navegação acessível</span>
        <h2 id="fallback-title">Escolha um país</h2>
        <p>
          O globo 3D não está disponível neste dispositivo. A lista oferece a
          mesma consulta.
        </p>
      </div>
      <label htmlFor={searchId}>Buscar país</label>
      <input
        id={searchId}
        type="search"
        value={search}
        placeholder="Digite o nome do país"
        onChange={(event) => setSearch(event.target.value)}
      />
      {countries.isPending && <p role="status">Carregando países…</p>}
      {countries.isError && (
        <div className="inline-error" role="alert">
          <p>Não foi possível carregar a lista de países.</p>
          <button type="button" onClick={() => void countries.refetch()}>
            Tentar novamente
          </button>
        </div>
      )}
      {countries.data?.data.length === 0 && <p>Nenhum país encontrado.</p>}
      {countries.data !== undefined && countries.data.data.length > 0 && (
        <ul className="country-list">
          {countries.data.data.map((country) => (
            <li key={country.iso3}>
              <button
                type="button"
                className={selectedIso3 === country.iso3 ? 'is-selected' : ''}
                aria-pressed={selectedIso3 === country.iso3}
                onClick={() => onSelect(country.iso3)}
              >
                <span>{country.name}</span>
                <small>{country.iso3}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
