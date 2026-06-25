// Public API of the client entity. Import from '@/entities/client' only.
export type {
  Client,
  ClientOrganization,
  ClientFormValues,
  CreateClientDto,
  UpdateClientDto,
} from './model/types'
export { createClientSchema } from './model/types'
export { useClientStore } from './model/clientStore'
export { getClientColumns } from './ui/clientColumns'
export {
  clientKeys,
  useClients,
  useClientOptions,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useDeleteClients,
} from './api/clientQueries'
export { clientApi } from './api/clientApi'
