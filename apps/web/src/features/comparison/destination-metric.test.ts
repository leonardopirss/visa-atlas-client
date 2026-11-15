import { describe, expect, it } from 'vitest';
import { metricForDestination } from './destination-metric';

describe('metricForDestination', () => {
  it('usa métricas específicas para Canadá e Reino Unido', () => {
    expect(metricForDestination('can')).toBe('VALID_PERMIT_HOLDERS');
    expect(metricForDestination('GBR')).toBe('WORK_VISAS_ISSUED');
  });

  it('restaura a métrica europeia ao sair de um destino específico', () => {
    expect(metricForDestination('DEU', 'VALID_PERMIT_HOLDERS')).toBe(
      'FIRST_RESIDENCE_PERMITS_GRANTED',
    );
  });

  it('preserva outras métricas explicitamente selecionadas', () => {
    expect(metricForDestination('DEU', 'APPLICATIONS_RECEIVED')).toBe(
      'APPLICATIONS_RECEIVED',
    );
  });
});
