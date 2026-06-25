import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError, ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'
import { itemApi } from './itemApi'
import type { CreateItemDto, Item, UpdateItemDto } from '../model/types'

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (params: ListParams & { categoryId?: number }) => [...itemKeys.lists(), params] as const,
  detail: (id: ID) => [...itemKeys.all, 'detail', id] as const,
  categories: () => [...itemKeys.all, 'categories'] as const,
}

export function useItems(params: ListParams & { categoryId?: number }) {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => itemApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useItem(id: ID | undefined) {
  return useQuery({
    queryKey: itemKeys.detail(id ?? 0),
    queryFn: () => itemApi.getById(id as ID),
    enabled: id != null,
  })
}

/** All item categories (cached 5 min). Filter by `meta` in the page. */
export function useItemCategories() {
  return useQuery({
    queryKey: itemKeys.categories(),
    queryFn: () => itemApi.categories(),
    staleTime: 5 * 60_000,
  })
}

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation<Item, ApiError, CreateItemDto>({
    mutationFn: (dto) => itemApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.lists() }),
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation<Item, ApiError, { id: ID; dto: UpdateItemDto }>({
    mutationFn: ({ id, dto }) => itemApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: itemKeys.lists() })
      void qc.invalidateQueries({ queryKey: itemKeys.detail(id) })
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => itemApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.lists() }),
  })
}
