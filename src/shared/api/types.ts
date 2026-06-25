import type { SortOrder } from '@/shared/types'

/** Query params shared by every paginated list endpoint. */
export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: SortOrder
}

/** Standard shape returned by list endpoints. Adapt the mapper in each entity API
 *  if your backend wraps things differently (e.g. `{ data, meta }`). */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Normalized error surfaced to the UI by the axios interceptor. */
export interface ApiError {
  status: number
  message: string
  /** Field-level validation errors, keyed by field name. */
  fields?: Record<string, string[]>
}
