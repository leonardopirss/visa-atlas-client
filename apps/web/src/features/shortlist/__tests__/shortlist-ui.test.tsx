import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../test/render';
import { ShortlistLauncher } from '../components/shortlist-launcher';
import { useShortlist } from '../shortlist-context';

const names = {
  DEU: 'Alemanha',
  FRA: 'França',
  CAN: 'Canadá',
  GBR: 'Reino Unido',
};

function Harness() {
  const shortlist = useShortlist();
  return (
    <>
      {Object.keys(names).map((iso3) => (
        <button key={iso3} type="button" onClick={() => shortlist.add(iso3)}>
          Adicionar {iso3}
        </button>
      ))}
      <ShortlistLauncher countryNamesByIso3={names} />
    </>
  );
}

describe('shortlist UI', () => {
  it('restaura a shortlist versionada ao iniciar', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'visa-atlas:shortlist:v1',
      '{"version":1,"iso3":["DEU","FRA"]}',
    );
    renderApp(<ShortlistLauncher countryNamesByIso3={names} />);
    await user.click(screen.getByLabelText('Shortlist com 2 destinos'));
    expect(screen.getByText('Alemanha')).toBeInTheDocument();
    expect(screen.getByText('França')).toBeInTheDocument();
  });

  it('mostra contador, nomes e abre comparação com dois destinos', async () => {
    const user = userEvent.setup();
    renderApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Adicionar DEU' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar FRA' }));
    await user.click(screen.getByLabelText('Shortlist com 2 destinos'));

    expect(screen.getByText('Alemanha')).toBeInTheDocument();
    expect(screen.getByText('França')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Comparar destinos' }));
    expect(window.location.search).toBe('?compare=DEU,FRA');
  });

  it('recusa o quarto destino sem substituir os três existentes', async () => {
    const user = userEvent.setup();
    renderApp(<Harness />);
    for (const iso3 of ['DEU', 'FRA', 'CAN', 'GBR']) {
      await user.click(
        screen.getByRole('button', { name: `Adicionar ${iso3}` }),
      );
    }
    await user.click(screen.getByLabelText('Shortlist com 3 destinos'));
    expect(screen.getByText('Alemanha')).toBeInTheDocument();
    expect(screen.getByText('França')).toBeInTheDocument();
    expect(screen.getByText('Canadá')).toBeInTheDocument();
    expect(screen.queryByText('Reino Unido')).not.toBeInTheDocument();
  });
});
