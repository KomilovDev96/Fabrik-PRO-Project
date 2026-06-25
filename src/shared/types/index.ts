/** Primary key type used across all entities. */
export type ID = number

export type Nullable<T> = T | null

/** Common audit fields most backend entities share. */
export interface Timestamps {
  createdAt: string
  updatedAt: string
}

/** Sort direction used by table columns and list queries. */
export type SortOrder = 'asc' | 'desc'
