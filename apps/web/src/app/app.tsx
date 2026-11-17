import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { AuditDialog } from '../features/audit/audit-dialog';
import { ShortlistLauncher } from '../features/shortlist/components/shortlist-launcher';
import { ComparisonScreen } from '../features/comparison/comparison-screen';
import { ShareButton } from '../features/share/share-button';

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
  const {
    filters,
    coverageMetric,
    view,
    setView,
    comparisonIso3s,
    navigationNotice,
    recentIso3s,
    clearRecentDestinations,
    reconcileCatalog,
  } = useAppState();
  const { selectedCountryIso3, selectCountry } = useCountrySelection();
  const [auditOpen, setAuditOpen] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const listMode = view === 'list';
  const handleUnavailable = useCallback(() => setView('list'), [setView]);
  const coverage = useCoverage(filters, coverageMetric);
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
  const catalogIso3s = useMemo(
    () => new Set((coverage.catalog.data ?? []).map((country) => country.iso3)),
    [coverage.catalog.data],
  );
  const validatedComparisonIso3s = coverage.catalog.data
    ? comparisonIso3s.filter((iso3) => catalogIso3s.has(iso3))
    : comparisonIso3s;
  const recentCountries = useMemo(() => {
    const byIso3 = new Map(
      (coverage.catalog.data ?? []).map((country) => [country.iso3, country]),
    );
    return recentIso3s.flatMap((iso3) => {
      const country = byIso3.get(iso3);
      return country === undefined ? [] : [country];
    });
  }, [coverage.catalog.data, recentIso3s]);
  const suggestedIso3s = useMemo(
    () =>
      (coverage.catalog.data ?? [])
        .filter(
          (country) => coverage.summary.byIso3[country.iso3] === 'AVAILABLE',
        )
        .map((country) => country.iso3),
    [coverage.catalog.data, coverage.summary.byIso3],
  );
  const suggestDestination = useCallback(() => {
    if (suggestedIso3s.length === 0) return;
    const index = Math.floor(Math.random() * suggestedIso3s.length);
    const iso3 = suggestedIso3s[index];
    if (iso3 !== undefined) selectCountry(iso3);
  }, [selectCountry, suggestedIso3s]);

  useEffect(() => {
    if (coverage.catalog.data !== undefined) reconcileCatalog(catalogIso3s);
  }, [catalogIso3s, coverage.catalog.data, reconcileCatalog]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        <CountrySearch
          onSelect={selectCountry}
          coverageByIso3={coverage.summary.byIso3}
          recentCountries={recentCountries}
          onClearRecent={clearRecentDestinations}
        />
        <div className="topbar-actions">
          {view !== 'compare' && <ShareButton />}
          <ShortlistLauncher countryNamesByIso3={countryNamesByIso3} />
          <button
            type="button"
            className="view-toggle"
            onClick={() => setView(listMode ? 'globe' : 'list')}
          >
            {listMode ? 'Ver globo' : 'Ver lista'}
          </button>
        </div>
      </header>

      <main>
        {navigationNotice.length > 0 && (
          <p className="navigation-notice" role="status">
            {navigationNotice}
          </p>
        )}
        {view === 'compare' ? (
          coverage.catalog.isPending ? (
            <p className="comparison-catalog-loading" role="status">
              Validando destinos da comparação…
            </p>
          ) : (
            <ComparisonScreen iso3s={validatedComparisonIso3s} />
          )
        ) : listMode ? (
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

        {view !== 'compare' && !listMode && selectedCountryIso3 === null && (
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
              <button
                type="button"
                className="suggest-destination"
                disabled={suggestedIso3s.length === 0}
                onClick={suggestDestination}
              >
                <span aria-hidden="true">✦</span>
                Sugerir um destino com dados
              </button>
              <small>Arraste para girar o planeta</small>
            </div>
          </section>
        )}

        {view !== 'compare' && (
          <div className="map-data-state" aria-live="polite">
            <CoverageLegend
              summary={coverage.summary}
              isPending={
                coverage.catalog.isPending || coverage.statistics.isPending
              }
              hasError={coverage.statistics.hasError}
            />
          </div>
        )}

        {view !== 'compare' && selectedCountryIso3 !== null && (
          <CountryPanel iso3={selectedCountryIso3} />
        )}
      </main>

      <footer className="app-footer">
        <a
          href="https://www.naturalearthdata.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Feito com Natural Earth ↗
        </a>
        <button type="button" onClick={() => setAuditOpen(true)}>
          Auditoria de fontes e licenças
        </button>
      </footer>
      <AuditDialog open={auditOpen} onClose={() => setAuditOpen(false)} />
    </div>
  );
}
