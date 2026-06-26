import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

export interface ProductOrganization {
  id: number
  title: string | null
}

/** A product (Mahsulot) — root of the product hierarchy. */
export interface Product {
  id: ID
  organization: ProductOrganization
  organizationId?: number
  title: string
  isDeleted: boolean
}

/** Matches ProductAdminCreate: { organizationId, title }. */
export const createProductSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    title: z.string().trim().min(2, t('common.required')).max(150),
  })

export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>
export type CreateProductDto = ProductFormValues
export type UpdateProductDto = Partial<ProductFormValues> & { isDeleted?: boolean }
