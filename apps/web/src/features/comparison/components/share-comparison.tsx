import { useState } from 'react';
import { serializeNavigationState } from '../../../app/navigation-state';

type ShareCapabilities = {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

export type ShareResult = 'shared' | 'copied' | 'manual' | 'cancelled';

export function buildComparisonUrl(
  iso3s: readonly string[],
  location: Pick<Location, 'origin' | 'pathname'> = window.location,
): string {
  const search = serializeNavigationState(
    { countryIso3: null, comparisonIso3s: iso3s, view: 'compare' },
    '',
  );
  return `${location.origin}${location.pathname}${search}`;
}

export async function shareComparisonUrl(
  url: string,
  capabilities: ShareCapabilities,
): Promise<ShareResult> {
  if (capabilities.share !== undefined) {
    try {
      await capabilities.share({
        title: 'Comparação de destinos — Visa Atlas',
        text: 'Compare destinos usando dados oficiais no Visa Atlas.',
        url,
      });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  if (capabilities.clipboard !== undefined) {
    try {
      await capabilities.clipboard.writeText(url);
      return 'copied';
    } catch {
      // O campo manual abaixo é o fallback seguro quando a permissão é negada.
    }
  }
  return 'manual';
}

export function ShareComparison({ iso3s }: { iso3s: readonly string[] }) {
  const [result, setResult] = useState<ShareResult | null>(null);
  const url = buildComparisonUrl(iso3s);

  const handleShare = async () => {
    setResult(
      await shareComparisonUrl(url, {
        ...(navigator.share === undefined
          ? {}
          : { share: navigator.share.bind(navigator) }),
        ...(navigator.clipboard === undefined
          ? {}
          : { clipboard: navigator.clipboard }),
      }),
    );
  };

  return (
    <div className="share-comparison">
      <button type="button" onClick={() => void handleShare()}>
        Compartilhar
      </button>
      <span role="status" aria-live="polite">
        {result === 'shared' && 'Comparação compartilhada.'}
        {result === 'copied' && 'Link copiado.'}
        {result === 'cancelled' && 'Compartilhamento cancelado.'}
      </span>
      {result === 'manual' && (
        <label>
          Copie o link
          <input
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
    </div>
  );
}
