import { ACTIONS, RESOURCES, type Action, type Permission, type Resource, type Role } from './types'

/** Helper to build a permission string with autocompletion. */
export function perm(resource: Resource, action: Action): Permission {
  return `${resource}.${action}`
}

/** All permissions for a resource (view/create/update/delete/export). */
function allFor(resource: Resource): Permission[] {
  return ACTIONS.map((a) => perm(resource, a))
}

/** Read-only permissions for every resource. */
const VIEW_ALL: Permission[] = RESOURCES.map((r) => perm(r, 'view'))

/**
 * Fallback role→permission map used when the backend does not send explicit
 * permissions. The source of truth in production is the API's RBAC response.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['*'],
  manager: [
    ...VIEW_ALL,
    ...allFor('warehouses'),
    ...allFor('products'),
    ...allFor('categories'),
    ...allFor('orders'),
    ...allFor('sales'),
    ...allFor('clients'),
    ...allFor('suppliers'),
  ],
  warehouse_keeper: [
    perm('dashboard', 'view'),
    ...allFor('warehouses'),
    ...allFor('products'),
    ...allFor('categories'),
    ...allFor('accessories'),
    ...allFor('spareParts'),
    ...allFor('tools'),
  ],
  accountant: [
    perm('dashboard', 'view'),
    ...allFor('finance'),
    ...allFor('cashbox'),
    ...allFor('salary'),
    perm('analytics', 'view'),
  ],
  viewer: VIEW_ALL,
}

/**
 * Core access check. Pure function — no React, no global state.
 * @param granted   permissions the current user holds
 * @param required  permission(s) the action/route needs
 * @param mode      'all' (default) requires every permission; 'any' requires one
 */
export function hasPermission(
  granted: Permission[],
  required: Permission | Permission[],
  mode: 'all' | 'any' = 'all',
): boolean {
  if (granted.includes('*')) return true
  const list = Array.isArray(required) ? required : [required]
  if (list.length === 0) return true
  return mode === 'any'
    ? list.some((p) => granted.includes(p))
    : list.every((p) => granted.includes(p))
}
