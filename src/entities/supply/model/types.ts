import type { ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'

export interface SupplyRef {
  id: number
  title: string | null
}

/** A supply (Kirim buyurtma) header — SupplyAdminList. */
export interface Supply {
  id: ID
  organization?: SupplyRef
  supplier?: SupplyRef
  warehouse?: SupplyRef
  currency?: SupplyRef
  currencyExchangeRate?: number
  overallPrice: number
  date: string
  isDeleted: boolean
}

/** One line item in a supply create payload (SupplyItemInSupplyCreate). */
export interface SupplyItemDraft {
  meta: 'Material' | 'Other'
  categoryId: number
  itemId: number
  unitId: number
  quantity: number
  pricePerUnit: number
  colorId?: number
  thickness?: number
  width?: number
  serialNumber?: string
}

/** Matches SupplyAdminCreate — header + nested line items. */
export interface CreateSupplyDto {
  organizationId: number
  supplierId: number
  warehouseId: number
  currencyId: number
  date: string
  supplyItems: SupplyItemDraft[]
}

export type SupplyListParams = ListParams & {
  supplierId?: number
  warehouseId?: number
}
