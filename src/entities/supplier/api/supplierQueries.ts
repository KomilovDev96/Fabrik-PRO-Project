import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError, ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'
import { supplierApi } from './supplierApi'
import type { CreateSupplierDto, Supplier, UpdateSupplierDto } from '../model/types'

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (p: ListParams) => [...supplierKeys.lists(), p] as const,
  detail: (id: ID) => [...supplierKeys.all, 'detail', id] as const,
}

export function useSuppliers(params: ListParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierApi.list(params),
    placeholderData: keepPreviousData,
  })
}
export function useSupplierOptions(search?: string) {
  return useQuery({
    queryKey: ['suppliers', 'options', search ?? ''],
    queryFn: () => supplierApi.options(search),
    staleTime: 60_000,
  })
}
export function useSupplier(id: ID | undefined) {
  return useQuery({
    queryKey: supplierKeys.detail(id ?? 0),
    queryFn: () => supplierApi.getById(id as ID),
    enabled: id != null,
  })
}
export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation<Supplier, ApiError, CreateSupplierDto>({
    mutationFn: (dto) => supplierApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.lists() }),
  })
}
export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation<Supplier, ApiError, { id: ID; dto: UpdateSupplierDto }>({
    mutationFn: ({ id, dto }) => supplierApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: supplierKeys.lists() })
      void qc.invalidateQueries({ queryKey: supplierKeys.detail(id) })
    },
  })
}
export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => supplierApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.lists() }),
  })
}
export function useDeleteSuppliers() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => supplierApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.lists() }),
  })
}
