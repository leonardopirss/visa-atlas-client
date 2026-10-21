import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider, useAppState } from '../../../app/app-state';
import { GlobeMap } from '../components/globe-map';
import { MAP_COLORS } from '../layers/base-style';
import { countryFillExpression } from '../layers/country-selection';
import { useCountrySelection } from '../hooks/use-country-selection';

function SelectionHarness() {
  const { filters, replaceFilters } = useAppState();
  const selection = useCountrySelection();
  return (
    <>
      <button type="button" onClick={() => selection.selectCountry('esp')}>
        Selecionar Espanha
      </button>
      <button
        type="button"
        onClick={() => replaceFilters({ ...filters, year: 2024 })}
      >
        Definir ano
      </button>
      <output>
        {selection.selectedCountryIso3 ?? 'nenhum'} /{' '}
        {filters.year ?? 'sem ano'}
      </output>
    </>
  );
}

function hasFeatureArray(value: unknown): value is { features: unknown[] } {
  if (typeof value !== 'object' || value === null || !('features' in value))
    return false;
  return Array.isArray(value.features);
}

describe('seleção de países', () => {
  it('mantém apenas o ISO3 selecionado verde e os demais cinza', () => {
    expect(countryFillExpression('ESP')).toEqual([
      'case',
      ['==', ['get', 'iso3'], 'ESP'],
      MAP_COLORS.selected,
      MAP_COLORS.inactive,
    ]);
  });

  it('mantém filtros ao limpar a seleção com Escape', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider>
        <SelectionHarness />
      </AppStateProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Definir ano' }));
    await user.click(
      screen.getByRole('button', { name: 'Selecionar Espanha' }),
    );
    expect(screen.getByText('ESP / 2024')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByText('nenhum / 2024')).toBeInTheDocument();
  });

  it('preserva países MultiPolygon no dataset e identifica todos por um único ISO3', async () => {
    const datasetPath = resolve(
      process.cwd(),
      '../../packages/geo/data/ne_110m_admin_0_countries.geojson',
    );
    const data: unknown = JSON.parse(await readFile(datasetPath, 'utf8'));
    expect(data).toMatchObject({ type: 'FeatureCollection' });
    if (!hasFeatureArray(data)) throw new Error('Dataset inválido');
    const france = data.features.find((feature: unknown) => {
      if (
        typeof feature !== 'object' ||
        feature === null ||
        !('properties' in feature)
      )
        return false;
      const properties = feature.properties;
      return (
        typeof properties === 'object' &&
        properties !== null &&
        'iso3' in properties &&
        properties.iso3 === 'FRA'
      );
    });
    expect(france).toMatchObject({
      geometry: { type: 'MultiPolygon' },
      properties: { iso3: 'FRA' },
    });
  });

  it('aciona a visualização acessível em lista quando WebGL não está disponível', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const onUnavailable = vi.fn();

    render(
      <GlobeMap
        selectedIso3={null}
        onSelect={vi.fn()}
        onUnavailable={onUnavailable}
      />,
    );

    await waitFor(() => expect(onUnavailable).toHaveBeenCalledOnce());
  });
});
