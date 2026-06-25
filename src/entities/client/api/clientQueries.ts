import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError, ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'
import { clientApi } from './clientApi'
import type { Client, CreateClientDto, UpdateClientDto } from '../model/types'

/** Centralized query-key factory — precise, refactor-safe cache invalidation. */
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: ListParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: ID) => [...clientKeys.details(), id] as const,
}

/** Paginated list. `keepPreviousData` keeps the table stable while paging/searching. */
export function useClients(params: ListParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Client options for pickers (order client, …). Cached 1 min. */
export function useClientOptions(search?: string) {
  return useQuery({
    queryKey: ['clients', 'options', search ?? ''],
    queryFn: () => clientApi.options(search),
    staleTime: 60_000,
  })
}

/** Single client (used to prefill the edit form). */
export function useClient(id: ID | undefined) {
  return useQuery({
    queryKey: clientKeys.detail(id ?? 0),
    queryFn: () => clientApi.getById(id as ID),
    enabled: id != null,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation<Client, ApiError, CreateClientDto>({
    mutationFn: (dto) => clientApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.lists() }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation<Client, ApiError, { id: ID; dto: UpdateClientDto }>({
    mutationFn: ({ id, dto }) => clientApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: clientKeys.lists() })
      void qc.invalidateQueries({ queryKey: clientKeys.detail(id) })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => clientApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.lists() }),
  })
}

/** Bulk delete the given client ids (table multi-select → "O'chirish"). */
export function useDeleteClients() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => clientApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.lists() }),
  })
}
