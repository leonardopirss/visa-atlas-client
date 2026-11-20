import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TimeseriesResponse } from '@visa-atlas/contracts';
import { renderApp } from '../../../test/render';
import { server } from '../../../test/server';
import { decisionRateStatistic } from '../../../test/fixtures';
import { StatisticsTimeseriesChart } from '../statistics-timeseries-chart';

const url = '*/api/v1/countries/:iso3/timeseries';
const query = {
  iso3: 'GBR',
  citizenship: 'BRA',
  populationBasis: 'CITIZENSHIP' as const,
  programKey: 'home-office:entry-clearance:work',
  purpose: 'WORK' as const,
  metricType: 'APPROVAL_RATE' as const,
  comparisonGroupId: null,
};

function response(programKey = query.programKey): TimeseriesResponse {
  return {
    iso3: 'GBR',
    citizenship: 'BRA',
    populationBasis: 'CITIZENSHIP',
    programKey: query.programKey,
    purpose: 'WORK',
    metricType: 'APPROVAL_RATE',
    comparisonGroupId: null,
    points: [
      {
        year: 2025,
        statistic: {
          ...decisionRateStatistic,
          period: '2025',
          value: 8750,
          populationScope: {
            ...decisionRateStatistic.populationScope!,
            programKey,
          },
        },
      },
    ],
  };
}

describe('StatisticsTimeseriesChart visa decision rates', () => {
  it('formats basis points as a percentage in the chart and accessible table', async () => {
    server.use(http.get(url, () => HttpResponse.json(response())));
    renderApp(<StatisticsTimeseriesChart query={query} />);

    expect(
      await screen.findByRole('img', { name: '2025: 87,50%' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '87,50%' })).toBeInTheDocument();
  });

  it('refuses to group a point from another program', async () => {
    server.use(
      http.get(url, () =>
        HttpResponse.json(response('home-office:entry-clearance:study')),
      ),
    );
    renderApp(<StatisticsTimeseriesChart query={query} />);

    expect(
      await screen.findByText(/populações ou programas incompatíveis/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Série histórica/ })).toBeNull();
  });
});
