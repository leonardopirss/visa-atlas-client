import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  availableStatistic,
  countryDetailFixture,
} from '../../../test/fixtures';
import { ComparisonView } from '../components/comparison-view';
import type { DestinationComparisonState } from '../use-destination-comparison';

describe('ComparisonView', () => {
  it('apresenta destinos compatíveis no mesmo grupo sem ranking', () => {
    const states: DestinationComparisonState[] = [
      {
        status: 'success',
        iso3: 'DEU',
        detail: countryDetailFixture('DEU', 'Alemanha'),
      },
      {
        status: 'success',
        iso3: 'FRA',
        detail: countryDetailFixture('FRA', 'França'),
      },
    ];
    render(<ComparisonView states={states} onClose={() => undefined} />);
    expect(
      screen.getByRole('region', { name: 'Destinos comparáveis entre si' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/melhor destino/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Alemanha' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'França' })).toBeInTheDocument();
  });

  it('separa eventos incompatíveis e preserva erro isolado com retry', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    const states: DestinationComparisonState[] = [
      {
        status: 'success',
        iso3: 'DEU',
        detail: countryDetailFixture('DEU', 'Alemanha'),
      },
      {
        status: 'success',
        iso3: 'GBR',
        detail: countryDetailFixture('GBR', 'Reino Unido', {
          ...availableStatistic,
          metricType: 'WORK_VISAS_ISSUED',
          unit: 'VISAS',
          comparisonGroupId: 'uk-work-visas',
        }),
      },
      { status: 'error', iso3: 'CAN', retry },
    ];
    render(<ComparisonView states={states} onClose={() => undefined} />);
    expect(
      screen.getByRole('heading', { name: 'Contextos diferentes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Alemanha' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Reino Unido' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('preserva ausência e supressão sem fabricar zero', () => {
    const states: DestinationComparisonState[] = [
      {
        status: 'unavailable',
        iso3: 'DEU',
        detail: countryDetailFixture('DEU', 'Alemanha', {
          ...availableStatistic,
          value: null,
          dataStatus: 'UNAVAILABLE',
        }),
      },
      {
        status: 'unavailable',
        iso3: 'FRA',
        detail: countryDetailFixture('FRA', 'França', {
          ...availableStatistic,
          value: null,
          dataStatus: 'SUPPRESSED',
        }),
      },
    ];
    render(<ComparisonView states={states} onClose={() => undefined} />);
    expect(
      screen.getByText('Sem dado disponível para este recorte'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Valor suprimido pela fonte oficial'),
    ).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
