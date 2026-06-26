import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

export interface IncomeOrganization {
  id: number
  title: string | null
}
export interface IncomeCategoryRef {
  id: number
  title: string | null
}

/** An income record (Pul kirim / Daromad) — IncomeAdminList. */
export interface Income {
  id: ID
  organization: IncomeOrganization
  incomeCategory?: IncomeCategoryRef | null
  client: string | null
  cashBox: string | null
  paymentMethod: string | null
  currency: string | null
  amount: number
  comment: string | null
  date: string
  isDeleted: boolean
}

/** Matches IncomeAdminCreate. clientId + incomeCategoryId are optional. */
export const createIncomeSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    incomeCategoryId: z.number().int().optional(),
    clientId: z.number().int().optional(),
    cashBoxId: z.number().int().positive(t('common.required')),
    paymentMethodId: z.number().int().positive(t('common.required')),
    currencyId: z.number().int().positive(t('common.required')),
    amount: z.number().positive(t('common.required')),
    date: z.string().min(1, t('common.required')),
    comment: z.string().trim().max(500).optional(),
  })

export type IncomeFormValues = z.infer<ReturnType<typeof createIncomeSchema>>
export type CreateIncomeDto = IncomeFormValues
export type UpdateIncomeDto = Partial<IncomeFormValues> & { isDeleted?: boolean }

export interface IncomeListParams extends ListParams {
  incomeCategoryId?: number
  clientId?: number
  cashBoxId?: number
  currencyId?: number
  startDate?: string
  endDate?: string
}
