import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../test/render';
import { AuditDialog } from './audit-dialog';

describe('AuditDialog', () => {
  it('publica licenças, condições de uso e ausência de endosso', () => {
    renderApp(<AuditDialog open onClose={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Auditoria de fontes e licenças' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/9 fontes verificadas/)).toBeInTheDocument();
    expect(screen.getByText(/produto independente/)).toBeInTheDocument();
    expect(
      screen.getAllByText(
        'Contains public sector information licensed under the Open Government Licence v3.0.',
      ),
    ).toHaveLength(2);
    expect(
      screen.getAllByText(
        'Contains information licensed under the Open Government Licence – Canada.',
      ),
    ).toHaveLength(2);
    expect(screen.getByText('migr_resedu')).toBeInTheDocument();
    expect(screen.getByText('Edu_D01')).toBeInTheDocument();
    expect(screen.getByText('STUDY_CITZ_YEAR_END')).toBeInTheDocument();
    expect(
      screen.getByText(/Contém informações de mledoze\/countries/),
    ).toBeInTheDocument();
  });

  it('fecha pelo botão e pela tecla Escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderApp(<AuditDialog open onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Fechar auditoria' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
