import { describe, expect, it, vi } from 'vitest';
import {
  RECENT_DESTINATIONS_STORAGE_KEY,
  addRecentDestination,
  createRecentDestinations,
  readRecentDestinations,
  writeRecentDestinations,
} from './recent-destinations';

describe('recent destinations', () => {
  it('normaliza, remove duplicatas e mantém os cinco mais recentes', () => {
    expect(
      createRecentDestinations([
        ' bra ',
        'DEU',
        'bra',
        'FRA',
        'CAN',
        'GBR',
        'PRT',
      ]),
    ).toEqual(['BRA', 'DEU', 'FRA', 'CAN', 'GBR']);
  });

  it('move um destino revisitado para o início', () => {
    expect(addRecentDestination(['BRA', 'DEU', 'FRA'], 'deu')).toEqual([
      'DEU',
      'BRA',
      'FRA',
    ]);
  });

  it('tolera armazenamento inválido ou indisponível', () => {
    expect(readRecentDestinations(null)).toEqual([]);
    expect(
      readRecentDestinations({
        getItem: vi.fn(() => '{invalid'),
        setItem: vi.fn(),
      }),
    ).toEqual([]);
  });

  it('persiste apenas valores válidos', () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    expect(writeRecentDestinations(storage, ['bra', '---', 'CAN'])).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      RECENT_DESTINATIONS_STORAGE_KEY,
      '["BRA","CAN"]',
    );
  });
});
