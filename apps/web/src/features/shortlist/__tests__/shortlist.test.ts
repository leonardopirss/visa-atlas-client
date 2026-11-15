import { describe, expect, it } from 'vitest';
import {
  addToShortlist,
  createShortlist,
  removeFromShortlist,
} from '../shortlist';
import {
  parseStoredShortlist,
  readShortlist,
  serializeShortlist,
  writeShortlist,
} from '../shortlist-storage';

describe('shortlist', () => {
  it('normaliza, remove duplicatas e limita a três destinos', () => {
    expect(
      createShortlist([' bra ', 'CAN', 'bra', 'invalid', 'GBR', 'DEU']),
    ).toEqual(['BRA', 'CAN', 'GBR']);
  });

  it('preserva a ordem e nunca substitui o terceiro item silenciosamente', () => {
    const initial = ['DEU', 'FRA', 'CAN'];
    expect(addToShortlist(initial, 'GBR')).toEqual({
      status: 'limit-reached',
      items: initial,
    });
    expect(addToShortlist(initial, 'FRA')).toEqual({
      status: 'duplicate',
      items: initial,
    });
    expect(removeFromShortlist(initial, 'FRA')).toEqual(['DEU', 'CAN']);
  });

  it('serializa uma estrutura mínima e versionada', () => {
    const serialized = serializeShortlist(['DEU', 'FRA']);
    expect(serialized).toBe('{"version":1,"iso3":["DEU","FRA"]}');
    expect(parseStoredShortlist(serialized)).toEqual({
      status: 'ok',
      items: ['DEU', 'FRA'],
    });
  });

  it.each([
    'not-json',
    '{}',
    '{"version":2,"iso3":["DEU"]}',
    '{"version":1,"iso3":"DEU"}',
    '{"version":1,"iso3":["DEU","DEU"]}',
    '{"version":1,"iso3":["INVALID"]}',
  ])('degrada storage inválido sem lançar: %s', (raw) => {
    expect(parseStoredShortlist(raw).status).toBe('invalid');
  });

  it('degrada leitura e escrita quando o storage está bloqueado', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readShortlist(blocked)).toEqual({
      status: 'unavailable',
      items: [],
    });
    expect(writeShortlist(blocked, ['DEU'])).toBe(false);
  });
});
