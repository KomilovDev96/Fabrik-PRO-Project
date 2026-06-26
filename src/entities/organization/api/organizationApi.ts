import { httpClient } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { Organization, UpdateOrganizationDto } from '../model/types'

const RESOURCE = '/admin/organizations'

/** Minimal org shape needed to build a <Select> option. */
interface RawOrg {
  id: number
  title?: string | null
  stir?: string | null
}

/** Envelope variants the backend may wrap a list in (it usually returns a bare array). */
interface RawList<T> {
  data?: T[]
  Data?: T[]
  items?: T[]
  Items?: T[]
  result?: T[]
}

export interface OrganizationOption {
  value: number
  label: string
}

function pick<T>(data: RawList<T> | T[]): T[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

export const organizationApi = {
  /** Organizations as <Select> options (id + title). Used by forms that pick an org. */
  options: async (search?: string): Promise<OrganizationOption[]> => {
    const { data } = await httpClient.get<RawList<RawOrg> | RawOrg[]>(RESOURCE, {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pick(data).map((o) => ({ value: o.id, label: o.title || `#${o.id}` }))
  },

  /** Full organizations list (Sozlamalar — current org is the first item). */
  list: async (): Promise<Organization[]> => {
    const { data } = await httpClient.get<RawList<Organization> | Organization[]>(RESOURCE, {
      params: { Page: 1, Limit: 100 },
    })
    return pick(data)
  },

  getById: async (id: ID): Promise<Organization> => {
    const { data } = await httpClient.get<Organization>(`${RESOURCE}/${id}`)
    return data
  },

  update: async (id: ID, dto: UpdateOrganizationDto): Promise<Organization> => {
    const { data } = await httpClient.patch<Organization>(`${RESOURCE}/${id}`, dto)
    return data
  },
}
