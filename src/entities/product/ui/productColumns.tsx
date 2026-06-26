import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import type { Product } from '../model/types'

export function getProductColumns(t: TFunction): TableColumnsType<Product> {
  return [
    {
      title: t('product.name'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('product.organization'),
      key: 'organization',
      ellipsis: true,
      responsive: ['md'],
      render: (_, r) => r.organization?.title ?? '—',
    },
  ]
}
