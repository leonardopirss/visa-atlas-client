import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { FeatureCollection, Geometry } from 'geojson';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider, useAppState } from '../../../app/app-state';
import {
  GlobeMap,
  createCountryLabelFeatures,
  normalizeBoundaryFeatures,
} from '../components/globe-map';
import { MAP_COLORS } from '../layers/base-style';
import {
  COUNTRY_LABEL_PROPERTY,
  countryLabelFieldExpression,
  countryLabelLayer,
} from '../layers/country-labels';
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
      <button type="button" onClick={() => selection.selectCountry('can')}>
        Selecionar Canadá
      </button>
      <button
        type="button"
        onClick={() => replaceFilters({ ...filters, year: 2024 })}
      >
        Definir ano
      </button>
      <output>
        {selection.selectedCountryIso3 ?? 'nenhum'} /{' '}
        {filters.year ?? 'sem ano'} / {filters.metricType}
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
    expect(countryFillExpression('ESP', ['DEU'])).toEqual([
      'case',
      ['==', ['get', 'iso3'], 'ESP'],
      MAP_COLORS.selected,
      [
        'case',
        ['in', ['get', 'iso3'], ['literal', ['DEU']]],
        MAP_COLORS.available,
        MAP_COLORS.unavailable,
      ],
    ]);
  });

  it('usa um cinza neutro quando a cobertura falha', () => {
    expect(countryFillExpression(null, [], true)).toEqual([
      'case',
      ['==', ['get', 'iso3'], ''],
      MAP_COLORS.selected,
      MAP_COLORS.unknown,
    ]);
  });

  it('cria rótulos localizados com colisão controlada e fallback cartográfico', () => {
    const localized = createCountryLabelFeatures(
      normalizeBoundaryFeatures({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { iso3: 'ESP', name: 'Spain' },
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [0, 0],
                    [4, 0],
                    [4, 4],
                    [0, 4],
                    [0, 0],
                  ],
                ],
                [
                  [
                    [10, 10],
                    [11, 10],
                    [11, 11],
                    [10, 11],
                    [10, 10],
                  ],
                ],
              ],
            },
          },
          {
            type: 'Feature',
            properties: { iso3: 'FRA', name: 'France' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [2, 0],
                  [2, 2],
                  [0, 2],
                  [0, 0],
                ],
              ],
            },
          },
          {
            type: 'Feature',
            properties: { iso3: 'ESP', name: 'Spain territory' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [20, 20],
                  [21, 20],
                  [21, 21],
                  [20, 21],
                  [20, 20],
                ],
              ],
            },
          },
        ],
      }),
      { ESP: 'Espanha' },
    );
    expect(localized.features[0]?.properties?.[COUNTRY_LABEL_PROPERTY]).toBe(
      'Espanha',
    );
    expect(localized.features[1]?.properties).not.toHaveProperty(
      COUNTRY_LABEL_PROPERTY,
    );
    expect(localized.features).toHaveLength(2);
    expect(localized.features[0]?.geometry).toEqual({
      type: 'Point',
      coordinates: [2, 2],
    });
    expect(countryLabelFieldExpression()).toEqual([
      'coalesce',
      ['get', 'namePt'],
      ['get', 'name'],
      ['get', 'iso3'],
    ]);
    expect(countryLabelLayer('countries')).toMatchObject({
      type: 'symbol',
      minzoom: 1.35,
      layout: {
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'text-optional': true,
      },
    });
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
    expect(
      screen.getByText('ESP / 2024 / FIRST_RESIDENCE_PERMITS_GRANTED'),
    ).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.getByText('nenhum / 2024 / FIRST_RESIDENCE_PERMITS_GRANTED'),
    ).toBeInTheDocument();
  });

  it('seleciona automaticamente a métrica oficial do Canadá', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider>
        <SelectionHarness />
      </AppStateProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Definir ano' }));
    await user.click(screen.getByRole('button', { name: 'Selecionar Canadá' }));

    expect(
      screen.getByText('CAN / sem ano / VALID_PERMIT_HOLDERS'),
    ).toBeInTheDocument();
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
    const labels = createCountryLabelFeatures(
      normalizeBoundaryFeatures(
        data as FeatureCollection<Geometry, Record<string, unknown>>,
      ),
      {},
    );
    const labelIso3 = labels.features.map(
      (feature) => feature.properties?.iso3,
    );
    expect(new Set(labelIso3).size).toBe(labelIso3.length);
  });

  it('aciona a visualização acessível em lista quando WebGL não está disponível', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const onUnavailable = vi.fn();

    render(
      <GlobeMap
        selectedIso3={null}
        onSelect={vi.fn()}
        onUnavailable={onUnavailable}
        coverageByIso3={{}}
        countryNamesByIso3={{}}
        coverageFailed={false}
      />,
    );

    await waitFor(() => expect(onUnavailable).toHaveBeenCalledOnce());
  });
});
