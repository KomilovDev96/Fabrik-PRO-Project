import { httpClient } from '@/shared/api'

interface RawUser {
  id: number
  fullName?: string
  phoneNumber?: string
}

interface RawUserList {
  data?: RawUser[]
  Data?: RawUser[]
  items?: RawUser[]
  Items?: RawUser[]
  result?: RawUser[]
}

export interface UserOption {
  value: number
  label: string
}

function pickUsers(data: RawUserList | RawUser[]): RawUser[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

export const userApi = {
  /** Users as <Select> options (id + display name). Used by forms that pick a user. */
  options: async (search?: string): Promise<UserOption[]> => {
    const { data } = await httpClient.get<RawUserList | RawUser[]>('/User/GetAll', {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pickUsers(data).map((u) => ({
      value: u.id,
      label: u.fullName || u.phoneNumber || `#${u.id}`,
    }))
  },
}
