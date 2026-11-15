import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  buildComparisonUrl,
  ShareComparison,
  shareComparisonUrl,
} from '../components/share-comparison';

describe('share comparison', () => {
  it('gera URL canônica contendo somente a comparação', () => {
    expect(
      buildComparisonUrl(['deu', 'FRA'], {
        origin: 'https://visa-atlas.example',
        pathname: '/',
      }),
    ).toBe('https://visa-atlas.example/?compare=DEU,FRA');
  });

  it('prefere Web Share e respeita cancelamento', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await expect(
      shareComparisonUrl('https://example.test/?compare=DEU,FRA', { share }),
    ).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://example.test/?compare=DEU,FRA' }),
    );

    await expect(
      shareComparisonUrl('https://example.test/', {
        share: vi
          .fn()
          .mockRejectedValue(new DOMException('cancelled', 'AbortError')),
      }),
    ).resolves.toBe('cancelled');
  });

  it('usa clipboard e depois oferece fallback manual', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(
      shareComparisonUrl('https://example.test/', {
        share: vi.fn().mockRejectedValue(new Error('unavailable')),
        clipboard: { writeText },
      }),
    ).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('https://example.test/');

    const user = userEvent.setup();
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'clipboard',
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    render(<ShareComparison iso3s={['DEU', 'FRA']} />);
    await user.click(screen.getByRole('button', { name: 'Compartilhar' }));
    const input = await screen.findByRole('textbox', { name: 'Copie o link' });
    expect(input).toHaveValue('http://localhost:3000/?compare=DEU,FRA');
    input.focus();
    expect(input).toHaveFocus();
    if (clipboardDescriptor === undefined) {
      Reflect.deleteProperty(navigator, 'clipboard');
    } else Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  });
});
