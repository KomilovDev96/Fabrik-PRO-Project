import { httpClient } from '@/shared/api'

interface RawCurrency {
  id: number
  title?: string | null
  shortCode?: string | null
}

interface RawList {
  data?: RawCurrency[]
  Data?: RawCurrency[]
  items?: RawCurrency[]
  Items?: RawCurrency[]
  result?: RawCurrency[]
}

export interface CurrencyOption {
  value: number
  label: string
}

function pick(data: RawList | RawCurrency[]): RawCurrency[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

export const currencyApi = {
  /** Currencies as <Select> options (id + "Title (CODE)"). */
  options: async (search?: string): Promise<CurrencyOption[]> => {
    const { data } = await httpClient.get<RawList | RawCurrency[]>('/admin/currencies', {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pick(data).map((c) => ({
      value: c.id,
      label: c.shortCode ? `${c.title ?? c.shortCode} (${c.shortCode})` : c.title || `#${c.id}`,
    }))
  },
}
