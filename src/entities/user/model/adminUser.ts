import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

/** User account type (UserType enum). */
export type UserType = 'User' | 'Admin' | 'SuperAdmin'
export const USER_TYPES: UserType[] = ['User', 'Admin', 'SuperAdmin']

export interface UserOrganization {
  id: number
  title: string | null
}

/** Salary summary embedded in the user list (SalaryMini). */
export interface UserSalary {
  amount?: number
}

/** A user as returned by UserAdmin/GetAll (UserAdminList). */
export interface AdminUser {
  id: ID
  fullName: string | null
  phoneNumber: string | null
  role: string | null
  department: string | null
  organization?: UserOrganization
  salary?: UserSalary | null
  isDeleted: boolean
}

/** Referenced entity in the detail (carries id for edit prefill). */
export interface UserRef {
  id: number
  title?: string | null
}

/** UserAdmin/Get detail — nested role/department carry ids for the form. */
export interface AdminUserDetail {
  id: ID
  type: UserType
  fullName: string | null
  phoneNumber: string | null
  role?: UserRef | null
  department?: UserRef | null
  organization?: UserOrganization | null
}

/**
 * Zod schema factory — localized messages via `t`.
 * Matches UserAdminCreate: { type, organizationId?, roleId?, departmentId?,
 * fullName, phoneNumber, password? }.
 */
export const createUserSchema = (t: TFunction) =>
  z.object({
    type: z.enum(['User', 'Admin', 'SuperAdmin']),
    organizationId: z.number().int().optional(),
    roleId: z.number().int().optional(),
    departmentId: z.number().int().optional(),
    fullName: z.string().trim().min(2, t('common.required')).max(150),
    phoneNumber: z.string().trim().min(1, t('common.required')).max(30),
    password: z.string().trim().max(100).optional(),
  })

export type UserFormValues = z.infer<ReturnType<typeof createUserSchema>>
export type CreateUserDto = UserFormValues
export type UpdateUserDto = Partial<UserFormValues> & { isDeleted?: boolean }

export interface UserListParams extends ListParams {
  roleId?: number
  departmentId?: number
}
