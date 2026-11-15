import type { CountryDetail } from '@visa-atlas/contracts';
import { MetricHeadline } from '../../../components/ui/metric-headline';
import { safeExternalUrl } from '../../../components/ui/source-badge';
import type { DestinationComparisonState } from '../use-destination-comparison';

export function DestinationComparisonCard({
  state,
}: {
  state: DestinationComparisonState;
}) {
  if (state.status === 'pending') {
    return (
      <article className="comparison-card" aria-label={state.iso3}>
        <p role="status">Carregando {state.iso3}…</p>
      </article>
    );
  }
  if (state.status === 'error') {
    return (
      <article className="comparison-card comparison-card-error">
        <span className="country-code">{state.iso3}</span>
        <h3>Não foi possível carregar este destino</h3>
        <button type="button" onClick={state.retry}>
          Tentar novamente
        </button>
      </article>
    );
  }
  return <LoadedDestinationCard detail={state.detail} />;
}

export function LoadedDestinationCard({ detail }: { detail: CountryDetail }) {
  const headingId = `comparison-metric-${detail.country.iso3}`;
  return (
    <article className="comparison-card">
      <header>
        <span className="country-code">{detail.country.iso3}</span>
        <small>{detail.country.region}</small>
        <h3>{detail.country.name}</h3>
      </header>
      <MetricHeadline statistic={detail.statistics} headingId={headingId} />
      <section
        className="comparison-programs"
        aria-label={`Modalidades verificadas de ${detail.country.name}`}
      >
        <h4>Modalidades verificadas</h4>
        {detail.visaPrograms.length === 0 ? (
          <p>Nenhuma modalidade verificada foi publicada.</p>
        ) : (
          <ul>
            {detail.visaPrograms.map((program) => {
              const url = safeExternalUrl(program.officialUrl);
              return (
                <li key={program.id}>
                  <strong>{program.title}</strong>
                  <span>Patrocínio: {program.sponsorshipRequirement}</span>
                  <span>
                    Verificação: {program.verifiedAt ?? 'Não informada'}
                  </span>
                  {url !== null && (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Página oficial ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </article>
  );
}
