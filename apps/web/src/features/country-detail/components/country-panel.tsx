import { useAppState } from '../../../app/app-state';
import { useCountryDetail } from '../hooks/use-country-detail';
import { CountryTabs } from './country-tabs';
import { MobileBottomSheet } from './mobile-bottom-sheet';

export function CountryPanel({ iso3 }: { iso3: string }) {
  const { filters, clearSelection } = useAppState();
  const detail = useCountryDetail(iso3, filters);

  if (detail.isPending) {
    return (
      <MobileBottomSheet countryName={iso3} onClose={clearSelection}>
        <div className="panel-loading" role="status">
          <span className="loading-orbit" aria-hidden="true" />
          <p>Consultando dados oficiais de {iso3}…</p>
        </div>
      </MobileBottomSheet>
    );
  }

  if (detail.isError) {
    return (
      <MobileBottomSheet countryName={iso3} onClose={clearSelection}>
        <div className="panel-error" role="alert">
          <span aria-hidden="true">!</span>
          <h2>Não foi possível carregar o país</h2>
          <p>A seleção foi mantida. Verifique sua conexão e tente novamente.</p>
          <button type="button" onClick={() => void detail.refetch()}>
            Tentar novamente
          </button>
        </div>
      </MobileBottomSheet>
    );
  }

  if (detail.data.country.iso3 !== iso3) {
    return (
      <MobileBottomSheet countryName={iso3} onClose={clearSelection}>
        <p role="status">Atualizando o país selecionado…</p>
      </MobileBottomSheet>
    );
  }

  return (
    <MobileBottomSheet
      countryName={detail.data.country.name}
      onClose={clearSelection}
    >
      <header className="country-heading">
        <span className="country-code">{detail.data.country.iso3}</span>
        <p>{detail.data.country.region}</p>
        <h2>{detail.data.country.name}</h2>
      </header>
      {detail.data.statistics.value === null && (
        <section className="availability-empty" aria-labelledby="no-data-title">
          <h3 id="no-data-title">País disponível, dado ainda não publicado</h3>
          <p>
            {detail.data.country.name} faz parte do catálogo mundial, mas não há
            observação oficial para os filtros atuais. Ajuste o recorte ou use
            “Somente com dados” para explorar outros destinos.
          </p>
        </section>
      )}
      <CountryTabs detail={detail.data} filters={filters} />
    </MobileBottomSheet>
  );
}
