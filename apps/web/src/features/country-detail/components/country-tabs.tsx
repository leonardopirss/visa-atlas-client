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

const SPONSORSHIP_LABELS = {
  REQUIRED: 'Obrigatório',
  NOT_REQUIRED: 'Não obrigatório',
  DEPENDS: 'Depende da modalidade',
  UNKNOWN: 'Não informado',
} as const;

function formatVerificationDate(value: string | null): string {
  if (value === null) return 'Não informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informada';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date);
}

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
            <MetricHeadline
              statistic={detail.statistics}
              purpose={filters.purpose}
            />
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
        {activeTab === 'programs' && (
          <div className="program-content">
            <header className="program-intro">
              <span className="eyebrow">
                Modalidades de{' '}
                {filters.purpose === 'STUDY' ? 'estudo' : 'trabalho'}
              </span>
              <h3>Opções verificadas para {detail.country.name}</h3>
              <p>
                Esta área reúne somente modalidades publicadas com referência
                oficial. Patrocínio e data de verificação são exibidos sem
                estimar elegibilidade ou chance de aprovação.
              </p>
            </header>
            {detail.visaPrograms.length === 0 ? (
              <p className="empty-state">
                Ainda não há modalidades verificadas publicadas para este país.
                Consulte a aba Fontes para conferir os dados oficiais
                disponíveis.
              </p>
            ) : (
              <div className="program-list">
                {detail.visaPrograms.map((program) => {
                  const officialUrl = safeExternalUrl(program.officialUrl);
                  return (
                    <article key={program.id}>
                      <span className="program-purpose">
                        {program.purpose === 'STUDY' ? 'Estudo' : 'Trabalho'}
                      </span>
                      <h3>{program.title}</h3>
                      {program.summary !== null &&
                        program.summary !== undefined && (
                          <p>{program.summary}</p>
                        )}
                      <dl>
                        <div>
                          <dt>Patrocínio</dt>
                          <dd>
                            {SPONSORSHIP_LABELS[program.sponsorshipRequirement]}
                          </dd>
                        </div>
                        <div>
                          <dt>Verificado em</dt>
                          <dd>{formatVerificationDate(program.verifiedAt)}</dd>
                        </div>
                      </dl>
                      {officialUrl !== null && (
                        <a
                          href={officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Consultar página oficial ↗
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
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
