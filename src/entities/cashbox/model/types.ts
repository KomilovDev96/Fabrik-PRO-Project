import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

/** Organization as embedded in cash-box responses (OrganizationMini). */
export interface CashBoxOrganization {
  id: number
  title: string | null
  stir?: string | null
}

/** A cash box as returned by the admin API (CashBoxAdminList / CashBoxAdminDetail). */
export interface CashBox {
  id: ID
  organization: CashBoxOrganization
  organizationId?: number
  title: string
  isDeleted: boolean
  created?: string
  updated?: string | null
}

/**
 * Zod schema factory — localized messages via `t`.
 * Matches CashBoxAdminCreate: { organizationId, title }. A cash box is just a
 * named register tied to an organization — no balance/currency on the entity
 * itself (those are derived from finance movements, not exposed here).
 */
export const createCashBoxSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    title: z.string().trim().min(2, t('common.required')).max(150),
  })

/** Form values inferred from the schema — single source of truth for the form. */
export type CashBoxFormValues = z.infer<ReturnType<typeof createCashBoxSchema>>

/** Payloads for the API layer. */
export type CreateCashBoxDto = CashBoxFormValues
export type UpdateCashBoxDto = Partial<CashBoxFormValues> & { isDeleted?: boolean }
