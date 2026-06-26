import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

export interface SickLeaveUser {
  id: number
  fullName: string | null
  phoneNumber?: string | null
}
export interface SickLeaveOrganization {
  id: number
  title: string | null
}

/** Sick leave (Javob olgan kunlar) — an employee's leave period. */
export interface SickLeave {
  id: ID
  organization: SickLeaveOrganization
  user: SickLeaveUser
  startDate: string
  endDate: string
  notes: string | null
  isDeleted: boolean
}

/** Matches SickLeaveAdminCreate: { organizationId, userId, startDate, endDate, notes? }. */
export const createSickLeaveSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    userId: z.number().int().positive(t('common.required')),
    startDate: z.string().min(1, t('common.required')),
    endDate: z.string().min(1, t('common.required')),
    notes: z.string().trim().max(500).optional(),
  })

export type SickLeaveFormValues = z.infer<ReturnType<typeof createSickLeaveSchema>>
export type CreateSickLeaveDto = SickLeaveFormValues
export type UpdateSickLeaveDto = Partial<SickLeaveFormValues> & { isDeleted?: boolean }

export interface SickLeaveListParams extends ListParams {
  userId?: number
  startDateStart?: string
  startDateEnd?: string
}
