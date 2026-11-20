import type { DestinationComparisonState } from '../use-destination-comparison';
import { groupDestinationSnapshots } from '../comparison-compatibility';
import {
  DestinationComparisonCard,
  LoadedDestinationCard,
} from './destination-comparison-card';
import { ShareComparison } from './share-comparison';

export function ComparisonView({
  states,
  onClose,
}: {
  states: DestinationComparisonState[];
  onClose: () => void;
}) {
  const loaded = states.flatMap((state) =>
    state.status === 'success' || state.status === 'unavailable'
      ? [{ iso3: state.iso3, detail: state.detail }]
      : [],
  );
  const groups = groupDestinationSnapshots(loaded);
  const unresolved = states.filter(
    (state) => state.status === 'pending' || state.status === 'error',
  );

  return (
    <section className="comparison-view" aria-labelledby="comparison-title">
      <header className="comparison-header">
        <div>
          <span className="eyebrow">Shortlist</span>
          <h1 id="comparison-title">Comparar destinos</h1>
          <p>
            Valores só aparecem juntos quando métrica, unidade, período,
            população, programa e metodologia são compatíveis.
          </p>
        </div>
        <div className="comparison-header-actions">
          <ShareComparison iso3s={states.map((state) => state.iso3)} />
          <button type="button" onClick={onClose}>
            Voltar à exploração
          </button>
        </div>
      </header>

      {groups.comparable.map((group) => (
        <section
          className="comparison-group"
          key={`comparable-${group.map((item) => item.iso3).join('-')}`}
          aria-label="Destinos comparáveis entre si"
        >
          <div className="comparison-group-heading">
            <h2>Comparáveis entre si</h2>
            <p>
              Mesmo indicador, unidade, período, população, programa e grupo
              metodológico.
            </p>
          </div>
          <div className="comparison-grid">
            {group.map((snapshot) => (
              <LoadedDestinationCard
                key={snapshot.iso3}
                detail={snapshot.detail}
              />
            ))}
          </div>
        </section>
      ))}

      {groups.separate.length > 0 && (
        <section
          className="comparison-group comparison-group-separated"
          aria-labelledby="separate-comparison-title"
        >
          <div className="comparison-group-heading">
            <h2 id="separate-comparison-title">Contextos diferentes</h2>
            <p>
              Estes números medem eventos distintos e não devem ser usados como
              ranking ou probabilidade de aprovação.
            </p>
          </div>
          <div className="comparison-grid">
            {groups.separate.map((snapshot) => (
              <LoadedDestinationCard
                key={snapshot.iso3}
                detail={snapshot.detail}
              />
            ))}
          </div>
        </section>
      )}

      {unresolved.length > 0 && (
        <section className="comparison-group" aria-label="Consultas pendentes">
          <div className="comparison-grid">
            {unresolved.map((state) => (
              <DestinationComparisonCard key={state.iso3} state={state} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
