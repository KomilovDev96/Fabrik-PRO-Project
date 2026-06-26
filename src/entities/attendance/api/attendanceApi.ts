import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type {
  Attendance,
  AttendanceListParams,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from '../model/types'

const RESOURCE = '/admin/attendances'

interface RawList {
  data?: Attendance[]
  Data?: Attendance[]
  items?: Attendance[]
  Items?: Attendance[]
  result?: Attendance[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(p: AttendanceListParams): Record<string, unknown> {
  return {
    Page: p.page,
    Limit: p.pageSize,
    Search: p.search || undefined,
    UserId: p.userId || undefined,
    DateStart: p.dateStart || undefined,
    DateEnd: p.dateEnd || undefined,
  }
}

function pickItems(data: RawList | Attendance[]): Attendance[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

function pickTotal(res: AxiosResponse<RawList | Attendance[]>, items: Attendance[], p: AttendanceListParams): number {
  const header = res.headers['x-total-count']
  const fromHeader = header != null ? Number(header) : NaN
  if (Number.isFinite(fromHeader) && fromHeader >= 0) return fromHeader
  if (!Array.isArray(res.data)) {
    const env = res.data.total ?? res.data.totalCount ?? res.data.TotalCount
    if (typeof env === 'number' && env >= 0) return env
  }
  const page = p.page ?? 1
  const pageSize = p.pageSize ?? items.length
  return items.length < pageSize ? (page - 1) * pageSize + items.length : page * pageSize + 1
}

export const attendanceApi = {
  list: async (params: AttendanceListParams): Promise<Paginated<Attendance>> => {
    const res = await httpClient.get<RawList | Attendance[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },
  getById: async (id: ID): Promise<Attendance> => {
    const { data } = await httpClient.get<Attendance>(`${RESOURCE}/${id}`)
    return data
  },
  create: async (dto: CreateAttendanceDto): Promise<Attendance> => {
    const { data } = await httpClient.post<Attendance>(RESOURCE, dto)
    return data
  },
  update: async (id: ID, dto: UpdateAttendanceDto): Promise<Attendance> => {
    const { data } = await httpClient.patch<Attendance>(`${RESOURCE}/${id}`, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
}
