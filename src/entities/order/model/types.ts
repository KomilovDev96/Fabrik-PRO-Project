import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

/** Order lifecycle status (OrderStatus enum in the admin spec). */
export type OrderStatus = 'New' | 'Accepted' | 'Rejected' | 'Progress' | 'Completed' | 'Delivered'

export const ORDER_STATUSES: OrderStatus[] = [
  'New',
  'Accepted',
  'Progress',
  'Completed',
  'Delivered',
  'Rejected',
]

/** Ant Design tag color per status (label comes from i18n `order.statuses.*`). */
export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  New: 'blue',
  Accepted: 'cyan',
  Progress: 'gold',
  Completed: 'green',
  Delivered: 'success',
  Rejected: 'red',
}

/** Organization as embedded in order responses (OrganizationMini). */
export interface OrderOrganization {
  id: number
  title: string | null
}

/** An order (sale) as returned by the admin API (OrderAdminList).
 *  Header only — there are no line items / total on the order resource. */
export interface Order {
  id: ID
  organization: OrderOrganization
  client: string | null
  status: OrderStatus
  paymentMethod: string | null
  currency: string | null
  warehouse: string | null
  delivery: boolean
  rejectionReason: string | null
  isDeleted: boolean
}

/** A referenced entity as nested in OrderAdminDetail (carries the id for edit prefill). */
export interface OrderRef {
  id: number
  title?: string | null
}

/**
 * Order detail (OrderAdminDetail) — nested objects carry ids the form needs to
 * prefill its selectors. NB: the detail does NOT include the organization, so
 * `organizationId` can't be prefilled on edit (a backend gap).
 */
export interface OrderDetail {
  id: ID
  status: OrderStatus
  delivery: boolean
  rejectionReason?: string | null
  isDeleted: boolean
  client?: OrderRef | null
  warehouse?: OrderRef | null
  paymentMethod?: OrderRef | null
  currency?: OrderRef | null
}

/**
 * Zod schema factory — localized messages via `t`.
 * Matches OrderAdminCreate: { organizationId, clientId?, status, paymentMethodId,
 * currencyId, warehouseId, delivery }. Line items are NOT part of this contract.
 */
export const createOrderSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    clientId: z.number().int().optional(),
    warehouseId: z.number().int().positive(t('common.required')),
    paymentMethodId: z.number().int().positive(t('common.required')),
    currencyId: z.number().int().positive(t('common.required')),
    status: z.enum(['New', 'Accepted', 'Rejected', 'Progress', 'Completed', 'Delivered']),
    delivery: z.boolean(),
  })

/** Form values inferred from the schema — single source of truth for the form. */
export type OrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>

/** Payloads for the API layer (clientId omitted when 0/none). */
export type CreateOrderDto = OrderFormValues
export type UpdateOrderDto = Partial<OrderFormValues> & { isDeleted?: boolean }

/** List params + order-specific server filters (all optional). */
export interface OrderListParams extends ListParams {
  status?: OrderStatus
  warehouseId?: number
  clientId?: number
  createdStart?: string
  createdEnd?: string
}
