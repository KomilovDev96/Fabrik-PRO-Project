import { create } from 'zustand'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import type { SortOrder } from '@/shared/types'

interface SupplyUiState {
  page: number
  pageSize: number
  search: string
  sortBy?: string
  sortOrder?: SortOrder
  formOpen: boolean
  setSearch: (s: string) => void
  setPage: (page: number, pageSize?: number) => void
  setSort: (sortBy?: string, sortOrder?: SortOrder) => void
  openCreate: () => void
  closeForm: () => void
}

export const useSupplyStore = create<SupplyUiState>((set) => ({
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  search: '',
  sortBy: undefined,
  sortOrder: undefined,
  formOpen: false,
  setSearch: (search) => set({ search, page: DEFAULT_PAGE }),
  setPage: (page, pageSize) => set((s) => ({ page, pageSize: pageSize ?? s.pageSize })),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  openCreate: () => set({ formOpen: true }),
  closeForm: () => set({ formOpen: false }),
}))
