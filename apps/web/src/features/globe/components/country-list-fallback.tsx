import { useDeferredValue, useId, useMemo, useState } from 'react';
import type { Country } from '@visa-atlas/contracts';
import { coverageLabel, type CoverageStatus } from '../../coverage/coverage';

type CountryListFallbackProps = {
  onSelect: (iso3: string) => void;
  selectedIso3: string | null;
  countries: Country[];
  coverageByIso3: Record<string, CoverageStatus>;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function CountryListFallback({
  onSelect,
  selectedIso3,
  countries,
  coverageByIso3,
  isPending,
  isError,
  onRetry,
}: CountryListFallbackProps) {
  const [search, setSearch] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const searchId = useId();
  const visibleCountries = useMemo(
    () =>
      countries.filter((country) => {
        const matchesSearch = country.name
          .toLocaleLowerCase('pt-BR')
          .includes(deferredSearch.trim().toLocaleLowerCase('pt-BR'));
        return (
          matchesSearch &&
          (!onlyAvailable || coverageByIso3[country.iso3] === 'AVAILABLE')
        );
      }),
    [countries, coverageByIso3, deferredSearch, onlyAvailable],
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
      <label className="availability-filter fallback-availability-filter">
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(event) => setOnlyAvailable(event.target.checked)}
        />
        Somente com dados
      </label>
      {isPending && <p role="status">Carregando países…</p>}
      {isError && (
        <div className="inline-error" role="alert">
          <p>Não foi possível carregar a lista de países.</p>
          <button type="button" onClick={onRetry}>
            Tentar novamente
          </button>
        </div>
      )}
      {!isPending && !isError && visibleCountries.length === 0 && (
        <p>Nenhum país encontrado.</p>
      )}
      {visibleCountries.length > 0 && (
        <ul className="country-list">
          {visibleCountries.map((country) => (
            <li key={country.iso3}>
              <button
                type="button"
                className={selectedIso3 === country.iso3 ? 'is-selected' : ''}
                aria-pressed={selectedIso3 === country.iso3}
                onClick={() => onSelect(country.iso3)}
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
