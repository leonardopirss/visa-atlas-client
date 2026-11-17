import { describe, expect, it, vi } from 'vitest';
import { sharePage } from './share-button';

describe('sharePage', () => {
  it('usa o compartilhamento nativo quando disponível', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    await expect(
      sharePage(
        { share, clipboard: { writeText } } as never,
        'https://atlas.test/?country=CAN',
      ),
    ).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://atlas.test/?country=CAN' }),
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copia o link quando o compartilhamento nativo falha', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(
      sharePage(
        {
          share: vi.fn().mockRejectedValue(new Error('fail')),
          clipboard: { writeText },
        } as never,
        'https://atlas.test/?compare=CAN,GBR',
      ),
    ).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith(
      'https://atlas.test/?compare=CAN,GBR',
    );
  });
});
