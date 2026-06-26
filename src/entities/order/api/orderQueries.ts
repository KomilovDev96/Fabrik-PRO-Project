import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { orderApi } from './orderApi'
import type { CreateOrderDto, Order, OrderDetail, OrderListParams, UpdateOrderDto } from '../model/types'

/** Centralized query-key factory — precise, refactor-safe cache invalidation. */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: ID) => [...orderKeys.details(), id] as const,
}

/** Paginated list. `keepPreviousData` keeps the table stable while paging/filtering. */
export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Order options for the client-payment picker. Cached 1 min. */
export function useOrderOptions(search?: string) {
  return useQuery({
    queryKey: ['orders', 'options', search ?? ''],
    queryFn: () => orderApi.options(search),
    staleTime: 60_000,
  })
}

/** Single order detail (used to prefill the edit form). */
export function useOrder(id: ID | undefined) {
  return useQuery<OrderDetail, ApiError>({
    queryKey: orderKeys.detail(id ?? 0),
    queryFn: () => orderApi.getById(id as ID),
    enabled: id != null,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation<Order, ApiError, CreateOrderDto>({
    mutationFn: (dto) => orderApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.lists() }),
  })
}

export function useUpdateOrder() {
  const qc = useQueryClient()
  return useMutation<Order, ApiError, { id: ID; dto: UpdateOrderDto }>({
    mutationFn: ({ id, dto }) => orderApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: orderKeys.lists() })
      void qc.invalidateQueries({ queryKey: orderKeys.detail(id) })
    },
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => orderApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.lists() }),
  })
}

/** Bulk delete selected orders ("O'chirish"). */
export function useDeleteOrders() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => orderApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.lists() }),
  })
}
