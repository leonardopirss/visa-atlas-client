import { useState } from 'react';

type ShareStatus = 'idle' | 'shared' | 'copied' | 'unavailable';

export async function sharePage(
  navigatorPort: Pick<Navigator, 'clipboard'> &
    Partial<Pick<Navigator, 'share'>>,
  url: string,
): Promise<ShareStatus> {
  if (navigatorPort.share !== undefined) {
    try {
      await navigatorPort.share({
        title: 'Visa Atlas',
        text: 'Veja esta exploração no Visa Atlas.',
        url,
      });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'idle';
      }
    }
  }

  try {
    await navigatorPort.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'unavailable';
  }
}

const STATUS_LABEL: Record<ShareStatus, string> = {
  idle: '',
  shared: 'Exploração compartilhada.',
  copied: 'Link copiado.',
  unavailable: 'Não foi possível copiar o link.',
};

export function ShareButton() {
  const [status, setStatus] = useState<ShareStatus>('idle');

  return (
    <div className="share-action">
      <button
        type="button"
        className="share-button"
        aria-label="Compartilhar esta exploração"
        onClick={() => {
          void sharePage(window.navigator, window.location.href).then(
            setStatus,
          );
        }}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" width="15" height="15">
          <path d="M10 13V2m0 0L6 6m4-4 4 4M4 9v7h12V9" />
        </svg>
        <span>Compartilhar</span>
      </button>
      <span className="share-feedback" role="status" aria-live="polite">
        {STATUS_LABEL[status]}
      </span>
    </div>
  );
}
