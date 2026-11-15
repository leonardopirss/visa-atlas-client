import { useState } from 'react';
import { delay, http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { INITIAL_FILTERS } from '../../../app/app-state';
import { renderApp } from '../../../test/render';
import { server } from '../../../test/server';
import { countryDetailFixture } from '../../../test/fixtures';
import { useDestinationComparison } from '../use-destination-comparison';

const detailUrl = '*/api/v1/countries/:iso3';

function Harness() {
  const [iso3s, setIso3s] = useState<readonly string[]>(['ESP']);
  const states = useDestinationComparison(iso3s, INITIAL_FILTERS);
  return (
    <>
      <button type="button" onClick={() => setIso3s(['CAN'])}>
        Trocar
      </button>
      {states.map((state) => (
        <span key={state.iso3}>
          {state.status === 'success' || state.status === 'unavailable'
            ? state.detail.country.name
            : `${state.iso3}:${state.status}`}
        </span>
      ))}
    </>
  );
}

describe('useDestinationComparison', () => {
  it('não deixa resposta atrasada substituir a seleção atual', async () => {
    server.use(
      http.get(detailUrl, async ({ params }) => {
        if (params.iso3 === 'ESP') {
          await delay(120);
          return HttpResponse.json(countryDetailFixture('ESP', 'Espanha'));
        }
        return HttpResponse.json(countryDetailFixture('CAN', 'Canadá'));
      }),
    );
    const user = userEvent.setup();
    renderApp(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Trocar' }));
    expect(await screen.findByText('Canadá')).toBeInTheDocument();
    expect(screen.queryByText('Espanha')).not.toBeInTheDocument();
  });

  it('mantém sucesso e erro independentes', async () => {
    function PartialHarness() {
      const states = useDestinationComparison(['ESP', 'DEU'], INITIAL_FILTERS);
      return (
        <>
          {states.map((state) => (
            <span key={state.iso3}>{`${state.iso3}:${state.status}`}</span>
          ))}
        </>
      );
    }
    server.use(
      http.get(detailUrl, ({ params }) =>
        params.iso3 === 'ESP'
          ? HttpResponse.json({ message: 'synthetic failure' }, { status: 503 })
          : HttpResponse.json(countryDetailFixture('DEU', 'Alemanha')),
      ),
    );
    renderApp(<PartialHarness />);
    expect(await screen.findByText('ESP:error')).toBeInTheDocument();
    expect(await screen.findByText('DEU:success')).toBeInTheDocument();
  });
});
