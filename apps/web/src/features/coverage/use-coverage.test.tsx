import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/server';
import { renderApp } from '../../test/render';
import type { FilterState } from '../../services/api/types';
import { useCoverage } from './use-coverage';

const studyFilters: FilterState = {
  citizenship: 'BRA',
  purpose: 'STUDY',
  metricType: 'FIRST_RESIDENCE_PERMITS_GRANTED',
  year: null,
  comparisonGroupId: null,
};

function Probe() {
  const coverage = useCoverage(studyFilters, 'ALL');
  return (
    <output>
      {coverage.statistics.isError
        ? 'erro'
        : JSON.stringify(coverage.summary.byIso3)}
    </output>
  );
}

describe('cobertura por finalidade', () => {
  it('consulta somente métricas de estudo e marca ausência como indisponível', async () => {
    const requestedMetrics: string[] = [];
    server.use(
      http.get('/api/v1/countries', () =>
        HttpResponse.json({
          data: [
            { iso3: 'ESP', iso2: 'ES', name: 'Espanha', region: 'Europa' },
            { iso3: 'JPN', iso2: 'JP', name: 'Japão', region: 'Ásia' },
          ],
          page: 1,
          pageSize: 100,
          total: 2,
        }),
      ),
      http.get('/api/v1/stats/map', ({ request }) => {
        const metricType = new URL(request.url).searchParams.get('metricType');
        if (metricType !== null) requestedMetrics.push(metricType);
        return HttpResponse.json({
          citizenship: 'BRA',
          purpose: 'STUDY',
          year: 2025,
          countries: [
            {
              iso3: 'ESP',
              statistic: {
                metricType,
                value:
                  metricType === 'FIRST_RESIDENCE_PERMITS_GRANTED' ? 24 : null,
                dataStatus:
                  metricType === 'FIRST_RESIDENCE_PERMITS_GRANTED'
                    ? 'AVAILABLE'
                    : 'UNAVAILABLE',
                freshness: 'CURRENT',
                unit: metricType === 'APPLICATIONS_RECEIVED' ? 'APPLICATIONS' : 'PER',
                period: '2025',
                comparisonGroupId: null,
                source: null,
              },
            },
            {
              iso3: 'JPN',
              statistic: {
                metricType,
                value: null,
                dataStatus: 'UNAVAILABLE',
                freshness: 'CURRENT',
                unit: metricType === 'APPLICATIONS_RECEIVED' ? 'APPLICATIONS' : 'PER',
                period: '2025',
                comparisonGroupId: null,
                source: null,
              },
            },
          ],
        });
      }),
    );

    renderApp(<Probe />);

    await waitFor(() =>
      expect(screen.getByText(/"JPN":"UNAVAILABLE"/)).toBeInTheDocument(),
    );
    expect(new Set(requestedMetrics)).toEqual(
      new Set([
        'FIRST_RESIDENCE_PERMITS_GRANTED',
        'APPLICATIONS_RECEIVED',
        'VALID_PERMIT_HOLDERS',
      ]),
    );
    expect(requestedMetrics).not.toContain('WORK_VISAS_ISSUED');
  });
});
