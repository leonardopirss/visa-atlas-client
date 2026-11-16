import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { INITIAL_FILTERS } from '../../../app/app-state';
import { countryDetailFixture } from '../../../test/fixtures';
import { CountryTabs } from './country-tabs';

describe('CountryTabs', () => {
  it('shows verified modality details with localized labels', async () => {
    const user = userEvent.setup();
    const detail = countryDetailFixture();
    detail.visaPrograms = [
      {
        id: 'verified-program',
        title: 'Autorização para profissional qualificado',
        purpose: 'WORK',
        sponsorshipRequirement: 'DEPENDS',
        officialUrl: 'https://example.gov/programa',
        verifiedAt: '2026-11-10T12:00:00.000Z',
        summary: 'Informações publicadas pela autoridade migratória.',
      },
    ];

    render(<CountryTabs detail={detail} filters={INITIAL_FILTERS} />);
    await user.click(screen.getByRole('tab', { name: 'Modalidades' }));

    expect(
      screen.getByRole('heading', { name: 'Opções verificadas para Espanha' }),
    ).toBeVisible();
    expect(screen.getByText('Depende da modalidade')).toBeVisible();
    expect(screen.getByText('10 de nov. de 2026')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Consultar página oficial ↗' }),
    ).toHaveAttribute('href', 'https://example.gov/programa');
  });

  it('keeps useful context when no verified modality is available', async () => {
    const user = userEvent.setup();
    render(
      <CountryTabs detail={countryDetailFixture()} filters={INITIAL_FILTERS} />,
    );

    await user.click(screen.getByRole('tab', { name: 'Modalidades' }));

    expect(screen.getByText('Modalidades de trabalho')).toBeVisible();
    expect(
      screen.getByText(/Ainda não há modalidades verificadas publicadas/),
    ).toBeVisible();
  });
});
