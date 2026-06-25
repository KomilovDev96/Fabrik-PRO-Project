import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import { formatDate } from '@/shared/lib/utils/format'
import { warehouseUserLabel, type Warehouse } from '../model/types'

/**
 * Data columns for the warehouse table (no actions column).
 * The actions column is composed in the page from the delete/edit features.
 */
export function getWarehouseColumns(t: TFunction): TableColumnsType<Warehouse> {
  return [
    {
      title: t('warehouse.name'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('warehouse.user'),
      key: 'user',
      responsive: ['md'],
      render: (_, record) => warehouseUserLabel(record.user),
    },
    {
      title: t('warehouse.address'),
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: t('warehouse.latitude'),
      dataIndex: 'latitude',
      key: 'latitude',
      width: 120,
      align: 'right',
      responsive: ['lg'],
      render: (value: number) => value?.toFixed?.(6) ?? '—',
    },
    {
      title: t('warehouse.longitude'),
      dataIndex: 'longitude',
      key: 'longitude',
      width: 120,
      align: 'right',
      responsive: ['lg'],
      render: (value: number) => value?.toFixed?.(6) ?? '—',
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'created',
      key: 'created',
      width: 160,
      responsive: ['xl'],
      render: (value?: string) => formatDate(value),
    },
  ]
}
