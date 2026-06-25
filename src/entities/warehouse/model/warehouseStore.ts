import { create } from 'zustand'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import type { ID, SortOrder } from '@/shared/types'

/**
 * Client-side UI state for the warehouses screen.
 *
 * Rule of thumb:
 *  - server data (the warehouse rows)  → React Query  (warehouseQueries.ts)
 *  - UI/interaction state (this store) → Zustand      (filters, paging, modal)
 *
 * Keeping them apart means the table never goes stale and the modal state never
 * forces a refetch.
 */
interface WarehouseUiState {
  // --- list controls (feed into the React Query key) ---
  page: number
  pageSize: number
  search: string
  sortBy?: string
  sortOrder?: SortOrder

  // --- form modal ---
  formOpen: boolean
  editingId: ID | null

  setSearch: (search: string) => void
  setPage: (page: number, pageSize?: number) => void
  setSort: (sortBy?: string, sortOrder?: SortOrder) => void

  openCreate: () => void
  openEdit: (id: ID) => void
  closeForm: () => void
}

export const useWarehouseStore = create<WarehouseUiState>((set) => ({
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  search: '',
  sortBy: undefined,
  sortOrder: undefined,

  formOpen: false,
  editingId: null,

  // Reset to page 1 whenever the search term changes.
  setSearch: (search) => set({ search, page: DEFAULT_PAGE }),
  setPage: (page, pageSize) => set((s) => ({ page, pageSize: pageSize ?? s.pageSize })),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  openCreate: () => set({ formOpen: true, editingId: null }),
  openEdit: (id) => set({ formOpen: true, editingId: id }),
  closeForm: () => set({ formOpen: false, editingId: null }),
}))
