import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

export interface RoleOrganization {
  id: number
  title: string | null
}

/** A role (RoleAdminList). */
export interface Role {
  id: ID
  title: string
  organization?: RoleOrganization
  isDeleted: boolean
}

/** A permission definition (PermissionAdminList) — global, not org-scoped. */
export interface Permission {
  id: ID
  title: string
  description?: string | null
}

/** Matches RoleAdminCreate: { organizationId, title }. */
export const createRoleSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    title: z.string().trim().min(2, t('common.required')).max(150),
  })

export type RoleFormValues = z.infer<ReturnType<typeof createRoleSchema>>
export type CreateRoleDto = RoleFormValues
export type UpdateRoleDto = Partial<RoleFormValues> & { isDeleted?: boolean }

/** Permission assignment: replace/add/remove a set of permission ids on a role. */
export type UpdateMethod = 'Replace' | 'Add' | 'Remove'
