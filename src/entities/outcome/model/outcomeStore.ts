import { create } from 'zustand'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import type { ID, SortOrder } from '@/shared/types'

/** Which create form is open on the Pul chiqim page. */
export type OutcomeFormKind = 'outcome' | 'supplierPayment' | null

interface OutcomeUiState {
  page: number
  pageSize: number
  search: string
  sortBy?: string
  sortOrder?: SortOrder
  formKind: OutcomeFormKind
  editingId: ID | null
  setSearch: (s: string) => void
  setPage: (page: number, pageSize?: number) => void
  setSort: (sortBy?: string, sortOrder?: SortOrder) => void
  openOutcome: () => void
  openSupplierPayment: () => void
  openEditOutcome: (id: ID) => void
  closeForm: () => void
}

export const useOutcomeStore = create<OutcomeUiState>((set) => ({
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  search: '',
  sortBy: undefined,
  sortOrder: undefined,
  formKind: null,
  editingId: null,
  setSearch: (search) => set({ search, page: DEFAULT_PAGE }),
  setPage: (page, pageSize) => set((s) => ({ page, pageSize: pageSize ?? s.pageSize })),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  openOutcome: () => set({ formKind: 'outcome', editingId: null }),
  openSupplierPayment: () => set({ formKind: 'supplierPayment', editingId: null }),
  openEditOutcome: (id) => set({ formKind: 'outcome', editingId: id }),
  closeForm: () => set({ formKind: null, editingId: null }),
}))
