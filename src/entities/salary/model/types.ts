import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

export interface SalaryUser {
  id: number
  fullName: string | null
  phoneNumber?: string | null
}
export interface SalaryOrganization {
  id: number
  title: string | null
}

/** A salary accrual (Hisoblangan oylik) — SalaryAdminList. Period = fromDate..toDate. */
export interface Salary {
  id: ID
  organization: SalaryOrganization
  user: SalaryUser
  fromDate: string
  toDate: string
  amount: number
  comment: string | null
  isDeleted: boolean
}

/** Matches SalaryAdminCreate: { organizationId, userId, fromDate, toDate, amount, comment? }. */
export const createSalarySchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    userId: z.number().int().positive(t('common.required')),
    fromDate: z.string().min(1, t('common.required')),
    toDate: z.string().min(1, t('common.required')),
    amount: z.number().positive(t('common.required')),
    comment: z.string().trim().max(500).optional(),
  })

export type SalaryFormValues = z.infer<ReturnType<typeof createSalarySchema>>
export type CreateSalaryDto = SalaryFormValues
export type UpdateSalaryDto = Partial<SalaryFormValues> & { isDeleted?: boolean }

export interface SalaryListParams extends ListParams {
  userId?: number
}
