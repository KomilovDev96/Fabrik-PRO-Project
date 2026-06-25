import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

/** Organization as embedded in client responses (OrganizationMini). */
export interface ClientOrganization {
  id: number
  title: string | null
  stir?: string | null
}

/** A client as returned by the admin API (ClientAdminList / ClientAdminDetail). */
export interface Client {
  id: ID
  organization: ClientOrganization
  organizationId?: number
  title: string
  contactPhone: string
  contactName: string
  telegramId?: string | null
  telegramUsername?: string | null
  latitude: number
  longitude: number
  isDeleted: boolean
  created?: string
  updated?: string | null
}

/**
 * Zod schema factory — localized messages via `t`.
 * Matches ClientAdminCreate: { organizationId, title, contactPhone, contactName,
 * telegramUsername?, latitude, longitude }. `telegramId` is bot-managed, not in the form.
 */
export const createClientSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    title: z.string().trim().min(2, t('common.required')).max(150),
    contactPhone: z.string().trim().min(1, t('common.required')).max(50),
    contactName: z.string().trim().min(1, t('common.required')).max(150),
    telegramUsername: z.string().trim().max(100).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })

/** Form values inferred from the schema — single source of truth for the form. */
export type ClientFormValues = z.infer<ReturnType<typeof createClientSchema>>

/** Payloads for the API layer. */
export type CreateClientDto = ClientFormValues
export type UpdateClientDto = Partial<ClientFormValues> & { isDeleted?: boolean }
