import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  Country,
  MapStatisticsResponse,
  Statistic,
} from '@visa-atlas/contracts';
import { listAllCountries } from '../../../services/api/client';
import { deriveCoverage } from '../coverage';

const countries: Country[] = [
  { iso3: 'ESP', iso2: 'ES', name: 'Espanha', region: 'Europa' },
  { iso3: 'CAN', iso2: 'CA', name: 'Canadá', region: 'Américas' },
];

const statistic = (value: number | null): Statistic => ({
  metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
  value,
  dataStatus: value === null ? 'UNAVAILABLE' : 'AVAILABLE',
  freshness: 'CURRENT',
  unit: 'pessoas',
  period: '2025',
  comparisonGroupId: 'test',
  source: null,
});

const mapResponse: MapStatisticsResponse = {
  citizenship: 'BRA',
  purpose: 'WORK',
  year: 2025,
  countries: [
    { iso3: 'ESP', statistic: statistic(12) },
    { iso3: 'CAN', statistic: statistic(null) },
  ],
};

const canadaMapResponse: MapStatisticsResponse = {
  ...mapResponse,
  countries: [
    { iso3: 'ESP', statistic: statistic(null) },
    {
      iso3: 'CAN',
      statistic: {
        ...statistic(15_655),
        metricType: 'VALID_PERMIT_HOLDERS',
      },
    },
  ],
};

describe('cobertura global', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('distingue observação disponível de país ainda sem dado', () => {
    expect(
      deriveCoverage(countries, [{ data: mapResponse, failed: false }]),
    ).toEqual({
      byIso3: { ESP: 'AVAILABLE', CAN: 'UNAVAILABLE' },
      available: 1,
      unavailable: 1,
      unknown: 0,
      total: 2,
    });
  });

  it('mantém Europa e Canadá disponíveis ao combinar indicadores oficiais', () => {
    expect(
      deriveCoverage(countries, [
        { data: mapResponse, failed: false },
        { data: canadaMapResponse, failed: false },
      ]),
    ).toMatchObject({
      byIso3: { ESP: 'AVAILABLE', CAN: 'AVAILABLE' },
      available: 2,
      unavailable: 0,
    });
  });

  it('não converte falha parcial das estatísticas em ausência de dados', () => {
    expect(
      deriveCoverage(countries, [
        { data: mapResponse, failed: false },
        { data: undefined, failed: true },
      ]),
    ).toMatchObject({
      byIso3: { ESP: 'AVAILABLE', CAN: 'UNKNOWN_ERROR' },
      available: 1,
      unavailable: 0,
      unknown: 1,
    });
  });

  it('pagina o catálogo até o total informado pela API', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      iso3: `A${String.fromCharCode(65 + Math.floor(index / 26))}${String.fromCharCode(65 + (index % 26))}`,
      iso2: 'AA',
      name: `País ${index}`,
      region: 'Teste',
    }));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: firstPage,
            page: 1,
            pageSize: 100,
            total: 101,
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [countries[0]],
            page: 2,
            pageSize: 100,
            total: 101,
          }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(listAllCountries()).resolves.toHaveLength(101);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('page=2');
  });
});
