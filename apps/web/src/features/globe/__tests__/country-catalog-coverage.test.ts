import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COUNTRY_BOUNDARY_ISO3_ALIASES } from '@visa-atlas/geo';

type Catalog = {
  countries: Array<{
    iso2: string;
    iso3: string;
    namePt: string;
    region: string;
  }>;
};

type Boundaries = {
  features: Array<{ properties: { iso3: string } }>;
};

const EXPECTED_WITHOUT_110M_GEOMETRY = [
  'ABW',
  'AIA',
  'ALA',
  'AND',
  'ASM',
  'ATG',
  'BES',
  'BHR',
  'BLM',
  'BMU',
  'BRB',
  'BVT',
  'CCK',
  'COK',
  'COM',
  'CPV',
  'CUW',
  'CXR',
  'CYM',
  'DMA',
  'FRO',
  'FSM',
  'GGY',
  'GIB',
  'GLP',
  'GRD',
  'GUF',
  'GUM',
  'HKG',
  'HMD',
  'IMN',
  'IOT',
  'JEY',
  'KIR',
  'KNA',
  'LCA',
  'LIE',
  'MAC',
  'MAF',
  'MCO',
  'MDV',
  'MHL',
  'MLT',
  'MNP',
  'MSR',
  'MTQ',
  'MUS',
  'MYT',
  'NFK',
  'NIU',
  'NRU',
  'PCN',
  'PLW',
  'PYF',
  'REU',
  'SGP',
  'SGS',
  'SHN',
  'SJM',
  'SMR',
  'SPM',
  'STP',
  'SXM',
  'SYC',
  'TCA',
  'TKL',
  'TON',
  'TUV',
  'UMI',
  'VAT',
  'VCT',
  'VGB',
  'VIR',
  'WLF',
  'WSM',
];

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(
    await readFile(resolve(process.cwd(), relativePath), 'utf8'),
  ) as T;
}

describe('consistência entre catálogo mundial e cartografia', () => {
  it('maps every selectable Natural Earth geometry to an official catalog ISO3', async () => {
    const catalog = await readJson<Catalog>(
      '../../packages/geo/data/world-country-catalog.v1.json',
    );
    const boundaries = await readJson<Boundaries>(
      '../../packages/geo/data/ne_110m_admin_0_countries.geojson',
    );
    const catalogIso3 = new Set(
      catalog.countries.map((country) => country.iso3),
    );
    const normalized = boundaries.features.flatMap(({ properties }) => {
      const alias = COUNTRY_BOUNDARY_ISO3_ALIASES[properties.iso3];
      const iso3 = alias === undefined ? properties.iso3 : alias;
      return iso3 === null ? [] : [iso3];
    });

    expect(normalized.filter((iso3) => !catalogIso3.has(iso3))).toEqual([]);
    expect(COUNTRY_BOUNDARY_ISO3_ALIASES.KOS).toBeNull();
  });

  it('documents all catalog entries omitted by the 1:110m geometry', async () => {
    const catalog = await readJson<Catalog>(
      '../../packages/geo/data/world-country-catalog.v1.json',
    );
    const boundaries = await readJson<Boundaries>(
      '../../packages/geo/data/ne_110m_admin_0_countries.geojson',
    );
    const mappedIso3 = new Set(
      boundaries.features.flatMap(({ properties }) => {
        const alias = COUNTRY_BOUNDARY_ISO3_ALIASES[properties.iso3];
        const iso3 = alias === undefined ? properties.iso3 : alias;
        return iso3 === null ? [] : [iso3];
      }),
    );
    const withoutGeometry = catalog.countries
      .map((country) => country.iso3)
      .filter((iso3) => !mappedIso3.has(iso3))
      .sort();

    expect(withoutGeometry).toEqual(EXPECTED_WITHOUT_110M_GEOMETRY);
  });
});
