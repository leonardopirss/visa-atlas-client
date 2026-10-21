import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppState } from './app-state';
import { FilterBar } from '../features/filters/filter-bar';
import { CountryPanel } from '../features/country-detail/components/country-panel';
import { CountryListFallback } from '../features/globe/components/country-list-fallback';
import { CountrySearch } from '../features/globe/components/country-search';
import { GlobeMap } from '../features/globe/components/globe-map';
import { useCountrySelection } from '../features/globe/hooks/use-country-selection';
import { mapStatisticsQueryOptions } from '../services/api/queries';
import visaAtlasIcon from '../assets/visa-atlas-icon.svg';

function Brand() {
  return (
    <a className="brand" href="/" aria-label="Visa Atlas — início">
      <span className="brand-icon" aria-hidden="true">
        <img src={visaAtlasIcon} alt="" width="39" height="39" />
        <span>✦</span>
      </span>
      <span className="brand-copy">
        <strong>visa atlas</strong>
        <small>Explore o mundo</small>
      </span>
    </a>
  );
}

export function App() {
  const { filters } = useAppState();
  const { selectedCountryIso3, selectCountry } = useCountrySelection();
  const [listMode, setListMode] = useState(
    () => new URLSearchParams(window.location.search).get('view') === 'list',
  );
  const handleUnavailable = useCallback(() => setListMode(true), []);
  const mapStatistics = useQuery(mapStatisticsQueryOptions(filters));
  const availableCount = mapStatistics.data?.countries.filter(
    (country) => country.statistic.value !== null,
  ).length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        <CountrySearch onSelect={selectCountry} />
        <button
          type="button"
          className="view-toggle"
          onClick={() => setListMode((current) => !current)}
        >
          {listMode ? 'Ver globo' : 'Ver lista'}
        </button>
      </header>

      <main>
        {listMode ? (
          <>
            <div className="fallback-filters">
              <FilterBar />
            </div>
            <CountryListFallback
              onSelect={selectCountry}
              selectedIso3={selectedCountryIso3}
            />
          </>
        ) : (
          <GlobeMap
            selectedIso3={selectedCountryIso3}
            onSelect={selectCountry}
            onUnavailable={handleUnavailable}
          />
        )}

        {!listMode && (
          <section className="map-intro" aria-label="Introdução">
            <span className="eyebrow">Explore destinos</span>
            <h1>Explorar o mundo</h1>
            <p>Descubra vistos e oportunidades por país.</p>
            <FilterBar />
            <small>Arraste para girar o planeta</small>
          </section>
        )}

        <div className="map-data-state" aria-live="polite">
          {mapStatistics.isPending && <span>Carregando cobertura…</span>}
          {mapStatistics.isError && (
            <span>Estatísticas do mapa indisponíveis</span>
          )}
          {mapStatistics.data !== undefined && (
            <span>
              {mapStatistics.data.legendLabel ?? 'Cobertura oficial'} ·{' '}
              {availableCount ?? 0} países com dado
            </span>
          )}
        </div>

        {selectedCountryIso3 !== null && (
          <CountryPanel iso3={selectedCountryIso3} />
        )}
      </main>

      <footer className="app-footer">
        <span>
          Dados estatísticos fornecidos exclusivamente pela API Visa Atlas.
        </span>
        <a
          href="https://www.naturalearthdata.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Feito com Natural Earth ↗
        </a>
      </footer>
    </div>
  );
}
