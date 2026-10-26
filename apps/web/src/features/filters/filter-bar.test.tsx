import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider, useAppState } from '../../app/app-state';
import { FilterBar } from './filter-bar';

vi.mock('./filter-defaults', () => ({ FilterDefaults: () => null }));

function FilterStateProbe() {
  const { filters } = useAppState();
  return <output>{JSON.stringify(filters)}</output>;
}

describe('FilterBar', () => {
  it('allows selecting Canada and clears dimensions from the previous source', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider>
        <FilterBar />
        <FilterStateProbe />
      </AppStateProvider>,
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Indicador estatístico' }),
      'VALID_PERMIT_HOLDERS',
    );

    expect(
      screen.getByText(/"metricType":"VALID_PERMIT_HOLDERS"/),
    ).toHaveTextContent('"year":null');
    expect(
      screen.getByText(/"metricType":"VALID_PERMIT_HOLDERS"/),
    ).toHaveTextContent('"comparisonGroupId":null');
  });
});
