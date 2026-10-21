# Data Model — Backend Visa Atlas

> Modelo conceitual; converter a Prisma schema durante planejamento/implementação.

| Entidade | Campos principais | Observações |
|---|---|---|
| Country | iso3 PK, iso2, namePt, region | Geometria/ISO3 não deriva de estatísticas |
| Citizenship | iso3 PK, namePt | BRA inicial; extensível |
| VisaPurpose | code PK, label | WORK inicial; enum estável |
| SourceOrganization | id, name, homepageUrl, license | Fonte publicadora |
| SourceDataset | id, organizationId, code, url, methodologyUrl, schemaVersion | Dataset oficial, licença |
| DatasetRelease | id, datasetId, sourcePublishedAt, fetchedAt, checksum, status, qualityReport | `STAGING`, `VERIFIED`, `PUBLISHED`, `REJECTED` |
| MetricObservation | id, releaseId, destinationIso3, citizenshipIso3, purpose, metricType, sourceCategoryCode, period, unit, value, dataStatus, comparisonGroupId | Número `BIGINT` anulável; unicidade por dimensão/release |
| ComparisonGroup | id, datasetId, metricType, citizenshipIso3, purpose, period, unit, methodologyVersion | Só somar/comparar dentro de grupo compatível |
| VisaProgram | id, destinationIso3, purpose, officialTitle, description, sponsorshipRequirement, verifiedAt, officialUrl | Qualitativo, não indicador estatístico |
| OfficialLink | id, countryIso3, sourceOrganizationId, kind, url, verifiedAt | Link oficial verificável |
| IngestionJob | id, sourceDatasetId, startedAt, finishedAt, status, report | Auditoria, retries e falhas |

## Regras de domínio
- `MetricObservation.value == null` exige motivo de indisponibilidade (estado não-AVAILABLE). `value == 0` só se confirmado pela fonte.
- Recurso com `dataStatus=ESTIMATED` pode ter número, mas deve ser explicitamente rotulado e não misturado no ranking sem política aceita.
- Toda observação em API pública deve apontar para `DatasetRelease.status=PUBLISHED`.
- `comparisonGroupId` não é apenas rótulo. Aponta para conjunto com metodologia, unidade e período compatíveis.
- `SourceDataset` e `VisaProgram` são domínios diferentes; não inferir programas pela nomenclatura dos agregados estatísticos.
- Índices candidatos: `(citizenshipIso3, purpose, period, metricType, comparisonGroupId)`, `(destinationIso3, period)`, `(releaseId, sourceCategoryCode)`.
- Persistência de observações deve manter os códigos originais das dimensões da fonte para auditoria e reimportação.
