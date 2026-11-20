import { afterEach, describe, expect, it, vi } from 'vitest';
import { timeseriesFixture } from '../../test/fixtures';
import { getCountryTimeseries } from './client';

describe('VisaAtlas API client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('não limita a série ao comparisonGroupId do ano selecionado', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(timeseriesFixture), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await getCountryTimeseries({
      iso3: 'ESP',
      citizenship: 'BRA',
      purpose: 'WORK',
      metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
      comparisonGroupId: 'group-for-selected-year',
      fromYear: 2020,
      toYear: 2025,
    });

    const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestedUrl).toContain('/countries/ESP/timeseries?');
    expect(requestedUrl).toContain('fromYear=2020');
    expect(requestedUrl).toContain('toYear=2025');
    expect(requestedUrl).not.toContain('comparisonGroupId');
  });

  it('envia scope nacional sem rotulá-lo como cidadania brasileira', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(timeseriesFixture), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await getCountryTimeseries({
      iso3: 'CAN',
      citizenship: 'BRA',
      populationBasis: 'NATIONAL',
      programKey: 'ALL',
      purpose: 'STUDY',
      metricType: 'PENDING_APPLICATIONS',
      comparisonGroupId: null,
    });

    const requestedUrl = new URL(
      String(fetchMock.mock.calls[0]?.[0]),
      'http://localhost',
    );
    expect(requestedUrl.searchParams.get('populationBasis')).toBe('NATIONAL');
    expect(requestedUrl.searchParams.get('programKey')).toBe('ALL');
    expect(requestedUrl.searchParams.has('citizenship')).toBe(false);
  });
});
