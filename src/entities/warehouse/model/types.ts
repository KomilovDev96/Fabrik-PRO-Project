import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

/** Responsible user as embedded in warehouse responses (string or mini-object). */
export type WarehouseUser = string | { id?: number; fullName?: string; title?: string }

/** A warehouse as returned by the backend (GetAll / Get). */
export interface Warehouse {
  id: ID
  title: string
  address: string
  latitude: number
  longitude: number
  userId?: number
  user?: WarehouseUser
  created?: string
  updated?: string | null
}

/**
 * Zod schema factory — localized messages via `t`.
 * Matches WarehouseCreate: { userId, title, address, latitude, longitude }.
 */
export const createWarehouseSchema = (t: TFunction) =>
  z.object({
    title: z.string().trim().min(2, t('common.required')).max(150),
    address: z.string().trim().min(1, t('common.required')).max(255),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    userId: z.number().int().positive(t('common.required')),
  })

/** Form values inferred from the schema — single source of truth for the form. */
export type WarehouseFormValues = z.infer<ReturnType<typeof createWarehouseSchema>>

/** Payloads for the API layer. */
export type CreateWarehouseDto = WarehouseFormValues
export type UpdateWarehouseDto = Partial<WarehouseFormValues>

/** Display helper: resolve a readable label from the embedded user field. */
export function warehouseUserLabel(user?: WarehouseUser): string {
  if (!user) return '—'
  if (typeof user === 'string') return user || '—'
  return user.fullName || user.title || '—'
}
