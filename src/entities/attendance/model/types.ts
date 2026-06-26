import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

export interface AttendanceUser {
  id: number
  fullName: string | null
  phoneNumber?: string | null
}
export interface AttendanceOrganization {
  id: number
  title: string | null
}

/** Attendance record (Davomat) — one employee's attendance for a day. */
export interface Attendance {
  id: ID
  organization: AttendanceOrganization
  user: AttendanceUser
  date: string
  arrivalTime: string | null
  departureTime: string | null
  notes: string | null
  isDeleted: boolean
}

/** Matches AttendanceAdminCreate: { organizationId, userId, date, arrivalTime?, departureTime?, notes? }. */
export const createAttendanceSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    userId: z.number().int().positive(t('common.required')),
    date: z.string().min(1, t('common.required')),
    arrivalTime: z.string().optional(),
    departureTime: z.string().optional(),
    notes: z.string().trim().max(500).optional(),
  })

export type AttendanceFormValues = z.infer<ReturnType<typeof createAttendanceSchema>>
export type CreateAttendanceDto = AttendanceFormValues
export type UpdateAttendanceDto = Partial<AttendanceFormValues> & { isDeleted?: boolean }

export interface AttendanceListParams extends ListParams {
  userId?: number
  dateStart?: string
  dateEnd?: string
}
