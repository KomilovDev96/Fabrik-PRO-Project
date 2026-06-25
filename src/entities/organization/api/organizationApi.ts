import { httpClient } from '@/shared/api'

/** Minimal org shape needed to build a <Select> option. */
interface RawOrg {
  id: number
  title?: string | null
  stir?: string | null
}

/** Envelope variants the backend may wrap a list in (it usually returns a bare array). */
interface RawOrgList {
  data?: RawOrg[]
  Data?: RawOrg[]
  items?: RawOrg[]
  Items?: RawOrg[]
  result?: RawOrg[]
}

export interface OrganizationOption {
  value: number
  label: string
}

function pickOrgs(data: RawOrgList | RawOrg[]): RawOrg[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

export const organizationApi = {
  /** Organizations as <Select> options (id + title). Used by forms that pick an org. */
  options: async (search?: string): Promise<OrganizationOption[]> => {
    const { data } = await httpClient.get<RawOrgList | RawOrg[]>('/admin/organizations', {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pickOrgs(data).map((o) => ({
      value: o.id,
      label: o.title || `#${o.id}`,
    }))
  },
}
