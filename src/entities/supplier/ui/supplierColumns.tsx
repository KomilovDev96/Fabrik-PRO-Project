import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import type { Supplier } from '../model/types'

/**
 * Real data columns for the supplier table (mirrors the Mijozlar design):
 * name · phone · contact · telegram · location. The "Balans" design column has
 * no API field (derived from supplier-payments) and is added as a placeholder
 * in the page.
 */
export function getSupplierColumns(t: TFunction): TableColumnsType<Supplier> {
  return [
    {
      title: t('supplier.name'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('supplier.contactPhone'),
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 170,
    },
    {
      title: t('supplier.contactName'),
      dataIndex: 'contactName',
      key: 'contactName',
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: t('supplier.telegram'),
      key: 'telegram',
      width: 160,
      responsive: ['lg'],
      render: (_, r) => (r.telegramUsername ? `@${r.telegramUsername.replace(/^@/, '')}` : '—'),
    },
    {
      title: t('supplier.mapTitle'),
      key: 'location',
      width: 160,
      align: 'right',
      responsive: ['xl'],
      render: (_, r) =>
        r.latitude != null && r.longitude != null
          ? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`
          : '—',
    },
  ]
}
