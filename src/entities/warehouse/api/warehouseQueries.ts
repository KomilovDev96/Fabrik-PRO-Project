import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError, ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'
import { warehouseApi } from './warehouseApi'
import type { CreateWarehouseDto, UpdateWarehouseDto, Warehouse } from '../model/types'

/**
 * Centralized query-key factory. Every cache entry for warehouses derives from
 * here, so invalidation is precise and refactor-safe.
 */
export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (params: ListParams) => [...warehouseKeys.lists(), params] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: ID) => [...warehouseKeys.details(), id] as const,
}

/** Paginated list. `keepPreviousData` keeps the table stable while paging/searching. */
export function useWarehouses(params: ListParams) {
  return useQuery({
    queryKey: warehouseKeys.list(params),
    queryFn: () => warehouseApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Warehouse options for pickers (order warehouse, …). Cached 1 min. */
export function useWarehouseOptions(search?: string) {
  return useQuery({
    queryKey: ['warehouses', 'options', search ?? ''],
    queryFn: () => warehouseApi.options(search),
    staleTime: 60_000,
  })
}

/** Single warehouse (used to prefill the edit form). */
export function useWarehouse(id: ID | undefined) {
  return useQuery({
    queryKey: warehouseKeys.detail(id ?? 0),
    queryFn: () => warehouseApi.getById(id as ID),
    enabled: id != null,
  })
}

export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation<Warehouse, ApiError, CreateWarehouseDto>({
    mutationFn: (dto) => warehouseApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: warehouseKeys.lists() }),
  })
}

export function useUpdateWarehouse() {
  const qc = useQueryClient()
  return useMutation<Warehouse, ApiError, { id: ID; dto: UpdateWarehouseDto }>({
    mutationFn: ({ id, dto }) => warehouseApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: warehouseKeys.lists() })
      void qc.invalidateQueries({ queryKey: warehouseKeys.detail(id) })
    },
  })
}

export function useDeleteWarehouse() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => warehouseApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: warehouseKeys.lists() }),
  })
}
