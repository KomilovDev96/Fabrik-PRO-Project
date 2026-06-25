import { httpClient } from '@/shared/api'

interface RawPaymentMethod {
  id: number
  title?: string | null
}

interface RawList {
  data?: RawPaymentMethod[]
  Data?: RawPaymentMethod[]
  items?: RawPaymentMethod[]
  Items?: RawPaymentMethod[]
  result?: RawPaymentMethod[]
}

export interface PaymentMethodOption {
  value: number
  label: string
}

function pick(data: RawList | RawPaymentMethod[]): RawPaymentMethod[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

export const paymentMethodApi = {
  /** Payment methods as <Select> options (id + title). */
  options: async (search?: string): Promise<PaymentMethodOption[]> => {
    const { data } = await httpClient.get<RawList | RawPaymentMethod[]>('/admin/payment-methods', {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pick(data).map((p) => ({ value: p.id, label: p.title || `#${p.id}` }))
  },
}
