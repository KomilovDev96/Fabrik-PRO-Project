/** Business resources = ERP modules. */
export const RESOURCES = [
  'dashboard',
  'analytics',
  'warehouses',
  'products',
  'categories',
  'rawMaterials',
  'accessories',
  'spareParts',
  'tools',
  'clients',
  'suppliers',
  'sales',
  'orders',
  'employees',
  'finance',
  'cashbox',
  'salary',
  'settings',
  'roles',
  'notifications',
] as const
export type Resource = (typeof RESOURCES)[number]

/** Actions a user can perform on a resource. */
export const ACTIONS = ['view', 'create', 'update', 'delete', 'export'] as const
export type Action = (typeof ACTIONS)[number]

/** A permission string, e.g. `"warehouses.create"`. `"*"` means superuser. */
export type Permission = `${Resource}.${Action}` | '*'

/** Built-in roles. Real role→permission mapping usually comes from the backend. */
export const ROLES = [
  'admin',
  'manager',
  'warehouse_keeper',
  'accountant',
  'viewer',
] as const
export type Role = (typeof ROLES)[number]
