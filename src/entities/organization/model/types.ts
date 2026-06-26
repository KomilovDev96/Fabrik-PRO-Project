import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

export interface CurrencyMini {
  id: number
  title?: string | null
  shortCode?: string | null
}

/** Organization (Korxona) as returned by the admin API (detail/list). */
export interface Organization {
  id: ID
  title: string
  stir: string
  category?: string | null
  mainCurrency?: CurrencyMini | null
  isDeleted?: boolean
  created?: string
}

/**
 * Settings (Account tab) form schema. The org API only stores title, stir,
 * categoryId and mainCurrencyId — email/phone/address/etc. from the design are
 * not part of the contract.
 */
export const organizationSettingsSchema = (t: TFunction) =>
  z.object({
    title: z.string().trim().min(2, t('common.required')).max(200),
    stir: z.string().trim().min(1, t('common.required')).max(50),
    categoryId: z.number().int().optional(),
    mainCurrencyId: z.number().int().optional(),
  })

export type OrganizationSettingsValues = z.infer<ReturnType<typeof organizationSettingsSchema>>
export type UpdateOrganizationDto = Partial<OrganizationSettingsValues> & { isDeleted?: boolean }
