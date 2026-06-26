import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { supplyApi } from './supplyApi'
import type { CreateSupplyDto, Supply, SupplyListParams } from '../model/types'

export const supplyKeys = {
  all: ['supplies'] as const,
  lists: () => [...supplyKeys.all, 'list'] as const,
  list: (p: SupplyListParams) => [...supplyKeys.lists(), p] as const,
}

export function useSupplies(params: SupplyListParams) {
  return useQuery({ queryKey: supplyKeys.list(params), queryFn: () => supplyApi.list(params), placeholderData: keepPreviousData })
}
export function useCreateSupply() {
  const qc = useQueryClient()
  return useMutation<Supply, ApiError, CreateSupplyDto>({ mutationFn: (dto) => supplyApi.create(dto), onSuccess: () => qc.invalidateQueries({ queryKey: supplyKeys.lists() }) })
}
export function useDeleteSupply() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({ mutationFn: (id) => supplyApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: supplyKeys.lists() }) })
}
export function useDeleteSupplies() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({ mutationFn: (ids) => supplyApi.removeMany(ids), onSuccess: () => qc.invalidateQueries({ queryKey: supplyKeys.lists() }) })
}
