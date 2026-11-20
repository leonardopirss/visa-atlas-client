import { describe, expect, it } from 'vitest';
import { metricForDestination } from './destination-metric';

describe('metricForDestination', () => {
  it('usa métricas específicas para Canadá e Reino Unido', () => {
    expect(metricForDestination('can')).toBe('VALID_PERMIT_HOLDERS');
    expect(metricForDestination('GBR')).toBe('WORK_VISAS_ISSUED');
  });

  it('usa solicitações de estudo no Reino Unido sem chamar pedidos de concessões', () => {
    expect(
      metricForDestination('GBR', 'FIRST_RESIDENCE_PERMITS_GRANTED', 'STUDY'),
    ).toBe('APPLICATIONS_RECEIVED');
  });

  it('restaura a métrica europeia ao sair de um destino específico', () => {
    expect(metricForDestination('DEU', 'VALID_PERMIT_HOLDERS')).toBe(
      'FIRST_RESIDENCE_PERMITS_GRANTED',
    );
  });

  it('restaura a métrica europeia ao sair de solicitações do Reino Unido', () => {
    expect(metricForDestination('DEU', 'APPLICATIONS_RECEIVED')).toBe(
      'FIRST_RESIDENCE_PERMITS_GRANTED',
    );
  });

  it('preserva uma taxa de decisão para explicitar ausência em outros destinos', () => {
    expect(metricForDestination('CAN', 'APPROVAL_RATE')).toBe('APPROVAL_RATE');
  });
});
