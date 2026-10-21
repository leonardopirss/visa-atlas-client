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
});
