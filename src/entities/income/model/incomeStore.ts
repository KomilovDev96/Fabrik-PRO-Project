import { create } from 'zustand'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import type { ID, SortOrder } from '@/shared/types'

/** Which create form is open on the Pul kirim page. */
export type IncomeFormKind = 'income' | 'clientPayment' | null

interface IncomeUiState {
  page: number
  pageSize: number
  search: string
  sortBy?: string
  sortOrder?: SortOrder
  formKind: IncomeFormKind
  editingId: ID | null
  setSearch: (s: string) => void
  setPage: (page: number, pageSize?: number) => void
  setSort: (sortBy?: string, sortOrder?: SortOrder) => void
  openIncome: () => void
  openClientPayment: () => void
  openEditIncome: (id: ID) => void
  closeForm: () => void
}

export const useIncomeStore = create<IncomeUiState>((set) => ({
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
  openIncome: () => set({ formKind: 'income', editingId: null }),
  openClientPayment: () => set({ formKind: 'clientPayment', editingId: null }),
  openEditIncome: (id) => set({ formKind: 'income', editingId: id }),
  closeForm: () => set({ formKind: null, editingId: null }),
}))
