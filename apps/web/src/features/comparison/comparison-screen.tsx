import { useAppState } from '../../app/app-state';
import { ComparisonView } from './components/comparison-view';
import { useDestinationComparison } from './use-destination-comparison';

export function ComparisonScreen({ iso3s }: { iso3s: readonly string[] }) {
  const { filters, closeComparison } = useAppState();
  const states = useDestinationComparison(iso3s, filters);
  const handleClose = () => {
    closeComparison();
    window.requestAnimationFrame(() => {
      document.getElementById('shortlist-launcher-summary')?.focus();
    });
  };
  return <ComparisonView states={states} onClose={handleClose} />;
}
