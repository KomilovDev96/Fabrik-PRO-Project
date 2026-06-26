import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

export interface OutcomeOrganization {
  id: number
  title: string | null
}
export interface OutcomeCategoryRef {
  id: number
  title: string | null
}

/** An outcome record (Pul chiqim / Xarajat) — OutcomeAdminList. */
export interface Outcome {
  id: ID
  organization: OutcomeOrganization
  outcomeCategory?: OutcomeCategoryRef | null
  supplier: string | null
  cashBox: string | null
  paymentMethod: string | null
  currency: string | null
  amount: number
  comment: string | null
  date: string
  isDeleted: boolean
}

/** Matches OutcomeAdminCreate. supplierId + outcomeCategoryId are optional. */
export const createOutcomeSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    outcomeCategoryId: z.number().int().optional(),
    supplierId: z.number().int().optional(),
    cashBoxId: z.number().int().positive(t('common.required')),
    paymentMethodId: z.number().int().positive(t('common.required')),
    currencyId: z.number().int().positive(t('common.required')),
    amount: z.number().positive(t('common.required')),
    date: z.string().min(1, t('common.required')),
    comment: z.string().trim().max(500).optional(),
  })

export type OutcomeFormValues = z.infer<ReturnType<typeof createOutcomeSchema>>
export type CreateOutcomeDto = OutcomeFormValues
export type UpdateOutcomeDto = Partial<OutcomeFormValues> & { isDeleted?: boolean }

export interface OutcomeListParams extends ListParams {
  outcomeCategoryId?: number
  supplierId?: number
  cashBoxId?: number
  currencyId?: number
  startDate?: string
  endDate?: string
}
