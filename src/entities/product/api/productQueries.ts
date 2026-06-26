import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError, ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'
import { productApi } from './productApi'
import type { CreateProductDto, Product, UpdateProductDto } from '../model/types'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (p: ListParams) => [...productKeys.lists(), p] as const,
  detail: (id: ID) => [...productKeys.all, 'detail', id] as const,
}

export function useProducts(params: ListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.list(params),
    placeholderData: keepPreviousData,
  })
}
export function useProductOptions(search?: string) {
  return useQuery({
    queryKey: ['products', 'options', search ?? ''],
    queryFn: () => productApi.options(search),
    staleTime: 60_000,
  })
}
export function useProduct(id: ID | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? 0),
    queryFn: () => productApi.getById(id as ID),
    enabled: id != null,
  })
}
export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation<Product, ApiError, CreateProductDto>({
    mutationFn: (dto) => productApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}
export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation<Product, ApiError, { id: ID; dto: UpdateProductDto }>({
    mutationFn: ({ id, dto }) => productApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: productKeys.lists() })
      void qc.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
  })
}
export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => productApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}
export function useDeleteProducts() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => productApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}
