import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

/** Organization as embedded in supplier responses (OrganizationMini). */
export interface SupplierOrganization {
  id: number
  title: string | null
  stir?: string | null
}

/** A supplier (Ta'minotchi) — same shape as a client. */
export interface Supplier {
  id: ID
  organization: SupplierOrganization
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

/** Matches SupplierAdminCreate (identical to ClientAdminCreate). */
export const createSupplierSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    title: z.string().trim().min(2, t('common.required')).max(150),
    contactPhone: z.string().trim().min(1, t('common.required')).max(50),
    contactName: z.string().trim().min(1, t('common.required')).max(150),
    telegramUsername: z.string().trim().max(100).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })

export type SupplierFormValues = z.infer<ReturnType<typeof createSupplierSchema>>
export type CreateSupplierDto = SupplierFormValues
export type UpdateSupplierDto = Partial<SupplierFormValues> & { isDeleted?: boolean }
