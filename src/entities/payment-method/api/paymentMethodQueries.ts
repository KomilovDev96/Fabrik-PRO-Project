import { useQuery } from '@tanstack/react-query'
import { paymentMethodApi } from './paymentMethodApi'

/** Payment-method options for pickers (order payment method, …). Cached 1 min. */
export function usePaymentMethodOptions(search?: string) {
  return useQuery({
    queryKey: ['payment-methods', 'options', search ?? ''],
    queryFn: () => paymentMethodApi.options(search),
    staleTime: 60_000,
  })
}
