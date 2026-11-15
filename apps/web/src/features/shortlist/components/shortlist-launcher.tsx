import { useRef } from 'react';
import { useAppState } from '../../../app/app-state';
import { SHORTLIST_LIMIT } from '../shortlist';
import { useShortlist } from '../shortlist-context';

export function ShortlistLauncher({
  countryNamesByIso3,
}: {
  countryNamesByIso3: Readonly<Record<string, string>>;
}) {
  const shortlist = useShortlist();
  const { openComparison } = useAppState();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={detailsRef} className="shortlist-launcher">
      <summary
        id="shortlist-launcher-summary"
        aria-label={`Shortlist com ${shortlist.items.length} destinos`}
      >
        Shortlist
        <span aria-hidden="true">
          {shortlist.items.length}/{SHORTLIST_LIMIT}
        </span>
      </summary>
      <div className="shortlist-menu">
        <div>
          <strong>Seus destinos</strong>
          <small>Salvos somente neste navegador</small>
        </div>
        {shortlist.items.length === 0 ? (
          <p>Abra um país e escolha “Salvar destino”.</p>
        ) : (
          <ul>
            {shortlist.items.map((iso3) => (
              <li key={iso3}>
                <span>
                  <strong>{countryNamesByIso3[iso3] ?? iso3}</strong>
                  <small>{iso3}</small>
                </span>
                <button
                  type="button"
                  onClick={() => shortlist.remove(iso3)}
                  aria-label={`Remover ${countryNamesByIso3[iso3] ?? iso3} da shortlist`}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="compare-button"
          disabled={shortlist.items.length < 2}
          onClick={() => {
            if (detailsRef.current !== null) detailsRef.current.open = false;
            openComparison(shortlist.items);
          }}
        >
          Comparar destinos
        </button>
        {shortlist.items.length < 2 && (
          <small>Salve pelo menos dois destinos para comparar.</small>
        )}
        {!shortlist.persistenceAvailable && (
          <p role="status">
            O navegador bloqueou o armazenamento. A shortlist vale apenas nesta
            sessão.
          </p>
        )}
      </div>
    </details>
  );
}
