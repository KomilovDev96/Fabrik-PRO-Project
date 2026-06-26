import { create } from 'zustand'
import type { StoreApi, UseBoundStore } from 'zustand'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import type { ID, SortOrder } from '@/shared/types'

/** Two user list pages share the same data but need independent UI state. */
export type UserVariant = 'foydalanuvchilar' | 'xodimlar'

interface UserUiState {
  page: number
  pageSize: number
  search: string
  sortBy?: string
  sortOrder?: SortOrder

  formOpen: boolean
  editingId: ID | null

  setSearch: (search: string) => void
  setPage: (page: number, pageSize?: number) => void
  setSort: (sortBy?: string, sortOrder?: SortOrder) => void

  openCreate: () => void
  openEdit: (id: ID) => void
  closeForm: () => void
}

export type UserStore = UseBoundStore<StoreApi<UserUiState>>

function createUserStore(): UserStore {
  return create<UserUiState>((set) => ({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    search: '',
    sortBy: undefined,
    sortOrder: undefined,

    formOpen: false,
    editingId: null,

    setSearch: (search) => set({ search, page: DEFAULT_PAGE }),
    setPage: (page, pageSize) => set((s) => ({ page, pageSize: pageSize ?? s.pageSize })),
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

    openCreate: () => set({ formOpen: true, editingId: null }),
    openEdit: (id) => set({ formOpen: true, editingId: id }),
    closeForm: () => set({ formOpen: false, editingId: null }),
  }))
}

export const USER_STORES: Record<UserVariant, UserStore> = {
  foydalanuvchilar: createUserStore(),
  xodimlar: createUserStore(),
}
