import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Statistic } from '@visa-atlas/contracts';
import { MetricHeadline } from '../../../components/ui/metric-headline';
import { decisionRateStatistic } from '../../../test/fixtures';

function renderRate(statistic: Statistic = decisionRateStatistic) {
  return render(<MetricHeadline statistic={statistic} purpose="WORK" />);
}

function rateWithoutDerivation(overrides: Partial<Statistic>): Statistic {
  const statistic: Statistic = { ...decisionRateStatistic, ...overrides };
  delete statistic.derivation;
  return statistic;
}

describe('Visa decision insights', () => {
  it('formats integer basis points as a percentage with two decimal places', () => {
    renderRate();

    expect(screen.getByText('87,50%')).toBeVisible();
    expect(screen.queryByText('8.750')).not.toBeInTheDocument();
  });

  it('shows the auditable formula and its substantive operands', () => {
    renderRate();

    expect(screen.getByText('7 ÷ (7 + 1) × 100')).toBeVisible();
    expect(screen.getByText('Numerador: 7 decisões favoráveis')).toBeVisible();
    expect(
      screen.getByText('Denominador: 8 decisões favoráveis ou recusadas'),
    ).toBeVisible();
  });

  it('keeps a confirmed zero distinct from missing data', () => {
    renderRate({ ...decisionRateStatistic, value: 0 });

    expect(screen.getByText('0,00%')).toBeVisible();
    expect(
      screen.queryByText('Taxa indisponível para este recorte'),
    ).not.toBeInTheDocument();
  });

  it('renders typed absence without manufacturing a percentage', () => {
    renderRate(
      rateWithoutDerivation({
        value: null,
        dataStatus: 'UNAVAILABLE',
        source: null,
      }),
    );

    expect(
      screen.getByText('Taxa indisponível para este recorte'),
    ).toBeVisible();
    expect(screen.getByText('Dado indisponível')).toBeVisible();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('preserves the source status when a rate is suppressed', () => {
    renderRate(
      rateWithoutDerivation({
        value: null,
        dataStatus: 'SUPPRESSED',
      }),
    );

    expect(
      screen.getByText('Valor suprimido pela fonte oficial'),
    ).toBeVisible();
    expect(screen.getByText('Dado suprimido pela fonte')).toBeVisible();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('warns that the aggregate rate is not an individual approval chance', () => {
    renderRate();

    expect(
      screen.getByText(
        'Esta taxa agregada não representa sua chance individual de aprovação.',
      ),
    ).toBeVisible();
  });
});
