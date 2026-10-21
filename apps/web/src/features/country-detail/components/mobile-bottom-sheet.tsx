import { useEffect, useRef, type ReactNode } from 'react';

type MobileBottomSheetProps = {
  countryName: string;
  onClose: () => void;
  children: ReactNode;
};

export function MobileBottomSheet({
  countryName,
  onClose,
  children,
}: MobileBottomSheetProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeButton =
      panelRef.current?.querySelector<HTMLButtonElement>('[data-close-panel]');
    if (window.matchMedia('(max-width: 720px)').matches) closeButton?.focus();
  }, [countryName]);

  return (
    <aside
      ref={panelRef}
      className="country-sheet"
      role="dialog"
      aria-modal="false"
      aria-label={`Detalhes de ${countryName}`}
    >
      <div className="sheet-handle" aria-hidden="true" />
      <button
        type="button"
        className="close-button"
        data-close-panel
        onClick={onClose}
        aria-label="Fechar detalhes e retornar ao globo"
      >
        ×
      </button>
      {children}
    </aside>
  );
}
