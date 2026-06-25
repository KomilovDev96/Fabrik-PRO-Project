import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { ID } from '@/shared/types'

/** Item category. `meta` ("Material" | "Other") splits raw materials vs accessories. */
export interface ItemCategory {
  id: number
  title: string
  meta: string
}

/** Inventory item (xom-ashyo / aksessuar). List returns `category` as a title string;
 *  detail returns `categoryId` + a category object — both normalized here. */
export interface Item {
  id: ID
  title: string
  categoryId?: number
  /** Category title (display). */
  category?: string
  created?: string
}

export const createItemSchema = (t: TFunction) =>
  z.object({
    title: z.string().trim().min(1, t('common.required')).max(200),
    categoryId: z.number().int().positive(t('common.required')),
  })

export type ItemFormValues = z.infer<ReturnType<typeof createItemSchema>>
export type CreateItemDto = ItemFormValues
export type UpdateItemDto = Partial<ItemFormValues>
