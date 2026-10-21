import { useRef, useState, type KeyboardEvent } from 'react';
import type { CountryDetail } from '@visa-atlas/contracts';
import type { FilterState } from '../../../services/api/types';
import { MetricHeadline } from '../../../components/ui/metric-headline';
import {
  safeExternalUrl,
  SourceBadge,
} from '../../../components/ui/source-badge';
import { StatisticsTimeseriesChart } from '../../statistics/statistics-timeseries-chart';

type TabId = 'statistics' | 'programs' | 'sources' | 'history';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'statistics', label: 'Estatísticas' },
  { id: 'programs', label: 'Modalidades' },
  { id: 'sources', label: 'Fontes' },
  { id: 'history', label: 'Histórico' },
];

export function CountryTabs({
  detail,
  filters,
}: {
  detail: CountryDetail;
  filters: FilterState;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('statistics');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % TABS.length
        : (index - 1 + TABS.length) % TABS.length;
    const tab = TABS[next];
    if (tab !== undefined) setActiveTab(tab.id);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Informações do país">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'statistics' && (
          <div className="statistics-content">
            <MetricHeadline statistic={detail.statistics} />
            {detail.classifications.length > 0 && (
              <section
                className="classification-list"
                aria-labelledby="classification-title"
              >
                <h3 id="classification-title">Categorias da fonte</h3>
                {detail.classifications.map((classification) => (
                  <div key={classification.sourceCategoryCode}>
                    <span>{classification.label}</span>
                    <strong>
                      {classification.statistic.value === null
                        ? 'Não disponível'
                        : new Intl.NumberFormat('pt-BR').format(
                            classification.statistic.value,
                          )}
                    </strong>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
        {activeTab === 'programs' &&
          (detail.visaPrograms.length === 0 ? (
            <p className="empty-state">
              Nenhuma modalidade verificada foi publicada para este país.
            </p>
          ) : (
            <div className="program-list">
              {detail.visaPrograms.map((program) => (
                <article key={program.id}>
                  <h3>{program.title}</h3>
                  {program.summary !== null && <p>{program.summary}</p>}
                  <dl>
                    <div>
                      <dt>Patrocínio</dt>
                      <dd>{program.sponsorshipRequirement}</dd>
                    </div>
                    <div>
                      <dt>Verificação</dt>
                      <dd>{program.verifiedAt ?? 'Não informada'}</dd>
                    </div>
                  </dl>
                  {safeExternalUrl(program.officialUrl) !== null && (
                    <a
                      href={safeExternalUrl(program.officialUrl) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Página oficial ↗
                    </a>
                  )}
                </article>
              ))}
            </div>
          ))}
        {activeTab === 'sources' &&
          (detail.sources.length === 0 ? (
            <p className="empty-state">
              Nenhuma fonte adicional foi publicada.
            </p>
          ) : (
            <div className="source-list">
              {detail.sources.map((source) => (
                <SourceBadge
                  key={`${source.organization}-${source.datasetCode}`}
                  source={source}
                />
              ))}
            </div>
          ))}
        {activeTab === 'history' && (
          <StatisticsTimeseriesChart
            query={{
              iso3: detail.country.iso3,
              citizenship: filters.citizenship,
              purpose: filters.purpose,
              metricType: filters.metricType,
              comparisonGroupId: filters.comparisonGroupId,
            }}
          />
        )}
      </div>
    </>
  );
}
