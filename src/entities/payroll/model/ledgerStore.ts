import { create } from 'zustand'
import type { StoreApi, UseBoundStore } from 'zustand'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import type { ID, SortOrder } from '@/shared/types'
import type { PayrollKind } from './types'

/** Applied (committed) filters from the filter bar — drive the React Query key. */
export interface LedgerFilters {
  userId?: number
  forDateStart?: string
  forDateEnd?: string
}

interface LedgerUiState {
  page: number
  pageSize: number
  search: string
  sortBy?: string
  sortOrder?: SortOrder
  filters: LedgerFilters

  formOpen: boolean
  editingId: ID | null

  setSearch: (search: string) => void
  setPage: (page: number, pageSize?: number) => void
  setSort: (sortBy?: string, sortOrder?: SortOrder) => void
  setFilters: (filters: LedgerFilters) => void
  clearFilters: () => void

  openCreate: () => void
  openEdit: (id: ID) => void
  closeForm: () => void
}

export type LedgerStore = UseBoundStore<StoreApi<LedgerUiState>>

/** One independent UI store per payroll kind (no shared state between pages). */
function createLedgerStore(): LedgerStore {
  return create<LedgerUiState>((set) => ({
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
    setFilters: (filters) => set({ filters, page: DEFAULT_PAGE }),
    clearFilters: () => set({ filters: {}, page: DEFAULT_PAGE }),

    openCreate: () => set({ formOpen: true, editingId: null }),
    openEdit: (id) => set({ formOpen: true, editingId: id }),
    closeForm: () => set({ formOpen: false, editingId: null }),
  }))
}

export const LEDGER_STORES: Record<PayrollKind, LedgerStore> = {
  salary: createLedgerStore(),
  advance: createLedgerStore(),
  penalty: createLedgerStore(),
  bonus: createLedgerStore(),
}
