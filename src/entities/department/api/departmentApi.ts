import { httpClient } from '@/shared/api'

interface RawDept {
  id: number
  title?: string | null
}
interface RawList {
  data?: RawDept[]
  Data?: RawDept[]
  items?: RawDept[]
  Items?: RawDept[]
  result?: RawDept[]
}
export interface DepartmentOption {
  value: number
  label: string
}
function pick(data: RawList | RawDept[]): RawDept[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
export const departmentApi = {
  /** Departments as <Select> options (id + title). Used by the user form (Bo'limi). */
  options: async (search?: string): Promise<DepartmentOption[]> => {
    const { data } = await httpClient.get<RawList | RawDept[]>('/admin/departments', {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pick(data).map((d) => ({ value: d.id, label: d.title || `#${d.id}` }))
  },
}
