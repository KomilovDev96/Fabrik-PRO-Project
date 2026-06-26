import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

/**
 * The four payroll ledgers (Maosh sub-pages) share an identical contract — only
 * the REST resource differs:
 *   Oylik  → /admin/salary-payments   Avans  → /admin/advances
 *   Jarima → /admin/penalties         Bonus  → /admin/bonuses
 * So one generic entity drives all four.
 */
export type PayrollKind = 'salary' | 'advance' | 'penalty' | 'bonus'

export const PAYROLL_KINDS: PayrollKind[] = ['salary', 'advance', 'penalty', 'bonus']

export const PAYROLL_RESOURCE: Record<PayrollKind, string> = {
  salary: '/admin/salary-payments',
  advance: '/admin/advances',
  penalty: '/admin/penalties',
  bonus: '/admin/bonuses',
}

/** Employee as embedded in payroll responses (BaseUserListDto). */
export interface PayrollUser {
  id: number
  fullName: string | null
  phoneNumber?: string | null
  role?: string | null
}

export interface PayrollOrganization {
  id: number
  title: string | null
}

/** A payroll ledger entry (salary payment / advance / penalty / bonus). */
export interface PayrollEntry {
  id: ID
  organization: PayrollOrganization
  user: PayrollUser
  /** Month the entry is for (date). */
  forDate: string
  /** When it was given (date-time). */
  date: string
  amount: number
  comment: string | null
  isDeleted: boolean
}

/**
 * Zod schema factory — localized messages via `t`. Matches *AdminCreate for all
 * four ledgers: { organizationId, userId, forDate, date, amount, comment }.
 */
export const createPayrollSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    userId: z.number().int().positive(t('common.required')),
    forDate: z.string().min(1, t('common.required')),
    date: z.string().min(1, t('common.required')),
    amount: z.number().positive(t('common.required')),
    comment: z.string().trim().max(500).optional(),
  })

export type PayrollFormValues = z.infer<ReturnType<typeof createPayrollSchema>>
export type CreatePayrollDto = PayrollFormValues
export type UpdatePayrollDto = Partial<PayrollFormValues> & { isDeleted?: boolean }

/** List params + payroll-specific server filters (all optional). */
export interface PayrollListParams extends ListParams {
  userId?: number
  forDateStart?: string
  forDateEnd?: string
  dateStart?: string
  dateEnd?: string
  amountStart?: number
  amountEnd?: number
}
