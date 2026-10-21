import { useQuery } from '@tanstack/react-query';
import { countryDetailQueryOptions } from '../../../services/api/queries';
import type { FilterState } from '../../../services/api/types';

export function useCountryDetail(iso3: string, filters: FilterState) {
  return useQuery(countryDetailQueryOptions({ iso3, ...filters }));
}
