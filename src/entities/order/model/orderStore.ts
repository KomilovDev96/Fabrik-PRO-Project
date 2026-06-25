import { create } from 'zustand'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import type { ID, SortOrder } from '@/shared/types'
import type { OrderStatus } from './types'

/** Applied (committed) server filters from the filter bar — drive the React Query key. */
export interface OrderFilters {
  status?: OrderStatus
  warehouseId?: number
  clientId?: number
  createdStart?: string
  createdEnd?: string
}

/**
 * Client-side UI state for the sales (Sotuvlar) screen.
 * The filter bar holds a local draft and commits it here via `setFilters`
 * ("Saqlash"); `clearFilters` resets it ("Tozalash").
 */
interface OrderUiState {
  page: number
  pageSize: number
  search: string
  sortBy?: string
  sortOrder?: SortOrder
  filters: OrderFilters

  formOpen: boolean
  editingId: ID | null

  setSearch: (search: string) => void
  setPage: (page: number, pageSize?: number) => void
  setSort: (sortBy?: string, sortOrder?: SortOrder) => void
  setFilters: (filters: OrderFilters) => void
  clearFilters: () => void

  openCreate: () => void
  openEdit: (id: ID) => void
  closeForm: () => void
}

export const useOrderStore = create<OrderUiState>((set) => ({
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  search: '',
  sortBy: undefined,
  sortOrder: undefined,
  filters: {},

  formOpen: false,
  editingId: null,

  setSearch: (search) => set({ search, page: DEFAULT_PAGE }),
  setPage: (page, pageSize) => set((s) => ({ page, pageSize: pageSize ?? s.pageSize })),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  // Applying or clearing filters resets to page 1 so results aren't on a stale page.
  setFilters: (filters) => set({ filters, page: DEFAULT_PAGE }),
  clearFilters: () => set({ filters: {}, page: DEFAULT_PAGE }),

  openCreate: () => set({ formOpen: true, editingId: null }),
  openEdit: (id) => set({ formOpen: true, editingId: id }),
  closeForm: () => set({ formOpen: false, editingId: null }),
}))
