import { useEffect, useRef } from 'react';
import {
  DATA_SOURCE_AUDIT,
  DATA_SOURCE_AUDIT_VERIFIED_AT,
  type AuditStatus,
} from './data-source-audit';

const STATUS_LABELS: Record<AuditStatus, string> = {
  COMPLIANT: 'Conforme',
  COMPLIANT_WITH_CONDITIONS: 'Conforme com condições',
};

export function AuditDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="audit-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="audit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-title"
        aria-describedby="audit-summary"
      >
        <header className="audit-header">
          <div>
            <span className="eyebrow">Governança de dados</span>
            <h2 id="audit-title">Auditoria de fontes e licenças</h2>
            <p id="audit-summary">
              {DATA_SOURCE_AUDIT.length} fontes verificadas em{' '}
              <time dateTime={DATA_SOURCE_AUDIT_VERIFIED_AT}>31/10/2026</time>.
              Todas permitem uso comercial nas condições descritas abaixo.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="audit-close"
            onClick={onClose}
            aria-label="Fechar auditoria"
          >
            ×
          </button>
        </header>

        <div className="audit-notice">
          O Visa Atlas é um produto independente. Nenhum governo ou órgão citado
          afilia, aprova ou endossa esta aplicação. Os dados são agregados e não
          contêm informações pessoais.
        </div>

        <div className="audit-list">
          {DATA_SOURCE_AUDIT.map((entry) => (
            <article className="audit-entry" key={entry.id}>
              <div className="audit-entry-heading">
                <div>
                  <span>{entry.category}</span>
                  <h3>{entry.organization}</h3>
                  <code>{entry.datasetCode}</code>
                </div>
                <span
                  className={`audit-status audit-status--${entry.status.toLowerCase()}`}
                >
                  {STATUS_LABELS[entry.status]}
                </span>
              </div>
              <dl>
                <div>
                  <dt>Licença</dt>
                  <dd>
                    <a href={entry.licenseUrl} target="_blank" rel="noreferrer">
                      {entry.licenseName} ↗
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Uso comercial</dt>
                  <dd>Permitido</dd>
                </div>
                <div>
                  <dt>Fonte</dt>
                  <dd>
                    <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                      Consultar origem ↗
                    </a>
                  </dd>
                </div>
              </dl>
              <p className="audit-attribution">{entry.attribution}</p>
              <ul>
                {entry.conditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <footer className="audit-legal-note">
          Esta página registra a verificação técnica das licenças e não
          substitui aconselhamento jurídico. Termos externos podem mudar e devem
          ser revalidados antes de incluir novas fontes.
        </footer>
      </section>
    </div>
  );
}
