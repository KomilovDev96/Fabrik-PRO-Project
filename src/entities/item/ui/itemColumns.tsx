import { Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import type { Item } from '../model/types'

/** Data columns for the items table (no actions column). */
export function getItemColumns(t: TFunction): TableColumnsType<Item> {
  return [
    {
      title: t('item.name'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('item.category'),
      dataIndex: 'category',
      key: 'category',
      width: 220,
      render: (value?: string) => (value ? <Tag>{value}</Tag> : '—'),
    },
  ]
}
