import type { SourceRef } from '@visa-atlas/contracts';
import { findStatisticalAuditEntry } from '../../features/audit/data-source-audit';

export function safeExternalUrl(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function SourceBadge({ source }: { source: SourceRef }) {
  const url = safeExternalUrl(source.url);
  const audit = findStatisticalAuditEntry(source.datasetCode);
  return (
    <div className="source-badge">
      <div>
        <strong>{source.organization}</strong>
        <span>{source.datasetCode}</span>
        {audit !== null && (
          <p className="source-attribution">{audit.attribution}</p>
        )}
      </div>
      <div className="source-links">
        {audit !== null && (
          <a href={audit.licenseUrl} target="_blank" rel="noopener noreferrer">
            {audit.licenseName} <span aria-hidden="true">↗</span>
          </a>
        )}
        {url === null ? (
          <span>Link indisponível</span>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Fonte oficial <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
