export type AuditStatus = 'COMPLIANT' | 'COMPLIANT_WITH_CONDITIONS';

export interface DataSourceAuditEntry {
  id: string;
  category: 'Estatística oficial' | 'Geografia e catálogo';
  organization: string;
  datasetCode: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  commercialUse: true;
  status: AuditStatus;
  verifiedAt: string;
  attribution: string;
  conditions: readonly string[];
}

export const DATA_SOURCE_AUDIT_VERIFIED_AT = '2026-10-31';

export const DATA_SOURCE_AUDIT: readonly DataSourceAuditEntry[] = [
  {
    id: 'eurostat-migr-resfirst',
    category: 'Estatística oficial',
    organization: 'Eurostat',
    datasetCode: 'migr_resfirst',
    sourceUrl:
      'https://ec.europa.eu/eurostat/databrowser/view/migr_resfirst/default/table',
    licenseName: 'Política de reutilização da Comissão Europeia',
    licenseUrl: 'https://ec.europa.eu/eurostat/help/copyright-notice',
    commercialUse: true,
    status: 'COMPLIANT_WITH_CONDITIONS',
    verifiedAt: DATA_SOURCE_AUDIT_VERIFIED_AT,
    attribution:
      'Fonte: Eurostat, migr_resfirst. Dados filtrados e normalizados pelo Visa Atlas; o Eurostat não se responsabiliza por esta adaptação.',
    conditions: [
      'Informar a fonte, o código do dataset, a data de acesso e as alterações realizadas.',
      'O recorte comercial exclui o Reino Unido da extração Eurostat; o país usa dados próprios do UK Home Office.',
      'Não apresentar autorizações de residência como vistos consulares ou probabilidade individual de aprovação.',
    ],
  },
  {
    id: 'uk-home-office-occ-d02',
    category: 'Estatística oficial',
    organization: 'UK Home Office',
    datasetCode: 'Occ_D02',
    sourceUrl:
      'https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables',
    licenseName: 'Open Government Licence v3.0',
    licenseUrl:
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
    commercialUse: true,
    status: 'COMPLIANT_WITH_CONDITIONS',
    verifiedAt: DATA_SOURCE_AUDIT_VERIFIED_AT,
    attribution:
      'Contains public sector information licensed under the Open Government Licence v3.0.',
    conditions: [
      'Manter a atribuição OGL associada aos dados publicados.',
      'Não sugerir afiliação, aprovação ou endosso pelo UK Home Office.',
    ],
  },
  {
    id: 'ircc-imp-year-end',
    category: 'Estatística oficial',
    organization: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    datasetCode: 'IMP_CITZ_YEAR_END_WORK',
    sourceUrl:
      'https://open.canada.ca/data/en/dataset/360024f2-17e9-4558-bfc1-3616485d65b9',
    licenseName: 'Open Government Licence — Canada 2.0',
    licenseUrl: 'https://open.canada.ca/en/open-government-licence-canada',
    commercialUse: true,
    status: 'COMPLIANT_WITH_CONDITIONS',
    verifiedAt: DATA_SOURCE_AUDIT_VERIFIED_AT,
    attribution:
      'Contains information licensed under the Open Government Licence – Canada.',
    conditions: [
      'Manter a atribuição canadense associada aos dados publicados.',
      'Não usar símbolos oficiais nem sugerir endosso pelo Governo do Canadá.',
      'Os valores são agregados e não contêm dados pessoais.',
    ],
  },
  {
    id: 'natural-earth',
    category: 'Geografia e catálogo',
    organization: 'Natural Earth',
    datasetCode: 'Admin 0 Countries 1:110m',
    sourceUrl:
      'https://www.naturalearthdata.com/downloads/110m-cultural-vectors/',
    licenseName: 'Domínio público',
    licenseUrl: 'https://www.naturalearthdata.com/about/terms-of-use/',
    commercialUse: true,
    status: 'COMPLIANT',
    verifiedAt: DATA_SOURCE_AUDIT_VERIFIED_AT,
    attribution: 'Made with Natural Earth.',
    conditions: ['Atribuição é opcional, mas mantida para rastreabilidade.'],
  },
  {
    id: 'mledoze-countries',
    category: 'Geografia e catálogo',
    organization: 'mledoze/countries',
    datasetCode: 'world-countries 5.1.0',
    sourceUrl: 'https://github.com/mledoze/countries',
    licenseName: 'Open Database License (ODbL) v1.0',
    licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
    commercialUse: true,
    status: 'COMPLIANT_WITH_CONDITIONS',
    verifiedAt: DATA_SOURCE_AUDIT_VERIFIED_AT,
    attribution:
      'Contém informações de mledoze/countries, disponibilizadas sob a Open Database License (ODbL) v1.0.',
    conditions: [
      'Atribuir o uso público e manter a base derivada sob ODbL.',
      'O catálogo derivado está disponível em formato legível por máquina no pacote geográfico do Visa Atlas.',
    ],
  },
  {
    id: 'unicode-cldr',
    category: 'Geografia e catálogo',
    organization: 'Unicode Consortium',
    datasetCode: 'CLDR 48 / ICU 78.3',
    sourceUrl: 'https://cldr.unicode.org/',
    licenseName: 'Unicode License v3',
    licenseUrl: 'https://www.unicode.org/license.txt',
    commercialUse: true,
    status: 'COMPLIANT',
    verifiedAt: DATA_SOURCE_AUDIT_VERIFIED_AT,
    attribution:
      'Copyright © 2004–2026 Unicode, Inc. Material derivado de dados Unicode CLDR sob a Unicode License v3.',
    conditions: ['Preservar o aviso de copyright e a referência à licença.'],
  },
];

export function findStatisticalAuditEntry(
  datasetCode: string,
): DataSourceAuditEntry | null {
  return (
    DATA_SOURCE_AUDIT.find(
      (entry) =>
        entry.category === 'Estatística oficial' &&
        entry.datasetCode === datasetCode,
    ) ?? null
  );
}
