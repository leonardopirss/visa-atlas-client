import { useCallback, useMemo, useState } from 'react';
import { useAppState } from './app-state';
import { FilterBar } from '../features/filters/filter-bar';
import { CountryPanel } from '../features/country-detail/components/country-panel';
import { CountryListFallback } from '../features/globe/components/country-list-fallback';
import { CountrySearch } from '../features/globe/components/country-search';
import { GlobeMap } from '../features/globe/components/globe-map';
import { useCountrySelection } from '../features/globe/hooks/use-country-selection';
import { CoverageLegend } from '../features/coverage/components/coverage-legend';
import { useCoverage } from '../features/coverage/use-coverage';
import visaAtlasIcon from '../assets/visa-atlas-icon.svg';

function Brand() {
  return (
    <a className="brand" href="/" aria-label="Visa Atlas — início">
      <span className="brand-icon" aria-hidden="true">
        <img src={visaAtlasIcon} alt="" width="39" height="39" />
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
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const handleUnavailable = useCallback(() => setListMode(true), []);
  const coverage = useCoverage(filters);
  const countryNamesByIso3 = useMemo(
    () =>
      Object.fromEntries(
        (coverage.catalog.data ?? []).map((country) => [
          country.iso3,
          country.name,
        ]),
      ),
    [coverage.catalog.data],
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        <CountrySearch
          onSelect={selectCountry}
          coverageByIso3={coverage.summary.byIso3}
        />
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
              countries={coverage.catalog.data ?? []}
              coverageByIso3={coverage.summary.byIso3}
              isPending={coverage.catalog.isPending}
              isError={coverage.catalog.isError}
              onRetry={() => void coverage.catalog.refetch()}
            />
          </>
        ) : (
          <GlobeMap
            selectedIso3={selectedCountryIso3}
            onSelect={selectCountry}
            onUnavailable={handleUnavailable}
            coverageByIso3={coverage.summary.byIso3}
            countryNamesByIso3={countryNamesByIso3}
            coverageFailed={coverage.statistics.isError}
          />
        )}

        {!listMode && selectedCountryIso3 === null && (
          <section
            id="map-filter-panel"
            className={`map-intro${filtersCollapsed ? ' is-collapsed' : ''}`}
            aria-label="Exploração e filtros"
          >
            <div className="map-intro-header">
              <div className="map-intro-heading">
                <span className="eyebrow">Explore destinos</span>
                <span className="map-intro-title">Filtros do mapa</span>
              </div>
              <button
                type="button"
                className="map-intro-toggle"
                aria-controls="map-filter-content"
                aria-expanded={!filtersCollapsed}
                aria-label={
                  filtersCollapsed ? 'Mostrar filtros' : 'Ocultar filtros'
                }
                onClick={() => setFiltersCollapsed((current) => !current)}
              >
                <span className="map-intro-toggle-label">
                  {filtersCollapsed ? 'Filtros' : 'Recolher'}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  width="16"
                  height="16"
                >
                  <path d="m12.5 4.75-5 5.25 5 5.25" />
                </svg>
              </button>
            </div>
            <div id="map-filter-content" hidden={filtersCollapsed}>
              <h1>Explorar o mundo</h1>
              <p>Descubra vistos e oportunidades por país.</p>
              <FilterBar />
              <small>Arraste para girar o planeta</small>
            </div>
          </section>
        )}

        <div className="map-data-state" aria-live="polite">
          <CoverageLegend
            summary={coverage.summary}
            isPending={
              coverage.catalog.isPending || coverage.statistics.isPending
            }
            hasError={coverage.statistics.hasError}
          />
        </div>

        {selectedCountryIso3 !== null && (
          <CountryPanel iso3={selectedCountryIso3} />
        )}
      </main>

      <footer className="app-footer">
        <span>
          Dados estatísticos fornecidos exclusivamente pela API Visa Atlas.
        </span>
      </footer>
    </div>
  );
}
