import { delay, http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Statistic } from '@visa-atlas/contracts';
import { useAppState } from '../../../app/app-state';
import { renderApp } from '../../../test/render';
import { server } from '../../../test/server';
import {
  availableStatistic,
  countryDetailFixture,
  timeseriesFixture,
} from '../../../test/fixtures';
import { CountryPanel } from '../components/country-panel';

const detailUrl = '*/api/v1/countries/:iso3';
const timeseriesUrl = '*/api/v1/countries/:iso3/timeseries';

describe('CountryPanel', () => {
  it('distingue zero oficial de ausência de dados', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(detailUrl, () => HttpResponse.json(countryDetailFixture())),
    );
    renderApp(<CountryPanel iso3="ESP" />);
    expect(await screen.findByText('0')).toBeInTheDocument();
    expect(screen.getByText('pessoas')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Fontes' }));
    expect(screen.getByRole('link', { name: /Fonte oficial/ })).toHaveAttribute(
      'href',
      'https://ec.europa.eu/eurostat/',
    );
  });

  it('explica dado suprimido e desatualizado sem inventar valor', async () => {
    const suppressed: Statistic = {
      ...availableStatistic,
      value: null,
      dataStatus: 'SUPPRESSED',
      freshness: 'STALE',
    };
    server.use(
      http.get(detailUrl, () =>
        HttpResponse.json(countryDetailFixture('ESP', 'Espanha', suppressed)),
      ),
    );
    renderApp(<CountryPanel iso3="ESP" />);
    expect(
      await screen.findByText('Valor suprimido pela fonte oficial'),
    ).toBeInTheDocument();
    expect(screen.getByText('Dado suprimido pela fonte')).toBeInTheDocument();
    expect(screen.getByText('Desatualizado')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('carrega a série histórica somente quando a aba é aberta', async () => {
    const user = userEvent.setup();
    const timeseriesRequest = vi.fn();
    server.use(
      http.get(detailUrl, () => HttpResponse.json(countryDetailFixture())),
      http.get(timeseriesUrl, () => {
        timeseriesRequest();
        return HttpResponse.json(timeseriesFixture);
      }),
    );
    renderApp(<CountryPanel iso3="ESP" />);
    await screen.findByRole('heading', { name: 'Espanha' });
    expect(timeseriesRequest).not.toHaveBeenCalled();
    await user.click(screen.getByRole('tab', { name: 'Histórico' }));
    expect(
      await screen.findByRole('img', { name: /Série histórica/ }),
    ).toBeInTheDocument();
    expect(timeseriesRequest).toHaveBeenCalledTimes(1);
  });

  it('não deixa uma resposta antiga substituir o país atual', async () => {
    function Harness() {
      const { selectedCountryIso3, selectCountry } = useAppState();
      return (
        <>
          <button type="button" onClick={() => selectCountry('ESP')}>
            Espanha
          </button>
          <button type="button" onClick={() => selectCountry('DEU')}>
            Alemanha
          </button>
          {selectedCountryIso3 !== null && (
            <CountryPanel iso3={selectedCountryIso3} />
          )}
        </>
      );
    }
    server.use(
      http.get(detailUrl, async ({ params }) => {
        if (params.iso3 === 'ESP') {
          await delay(120);
          return HttpResponse.json(countryDetailFixture('ESP', 'Espanha'));
        }
        return HttpResponse.json(countryDetailFixture('DEU', 'Alemanha'));
      }),
    );
    const user = userEvent.setup();
    renderApp(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Espanha' }));
    await user.click(screen.getByRole('button', { name: 'Alemanha' }));
    expect(
      await screen.findByRole('heading', { name: 'Alemanha' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Espanha' }),
      ).not.toBeInTheDocument(),
    );
  });
});
