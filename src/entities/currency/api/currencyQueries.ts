import { useQuery } from '@tanstack/react-query'
import { currencyApi } from './currencyApi'

/** Currency options for pickers (order currency, …). Cached 1 min. */
export function useCurrencyOptions(search?: string) {
  return useQuery({
    queryKey: ['currencies', 'options', search ?? ''],
    queryFn: () => currencyApi.options(search),
    staleTime: 60_000,
  })
}
