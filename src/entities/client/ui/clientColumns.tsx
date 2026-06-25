import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import type { Client } from '../model/types'

/**
 * Data columns for the clients table (no actions column).
 * The actions column is composed in the page from the delete/edit features.
 * Mirrors the Mijozlar design: name · phone · contact · telegram · location.
 */
export function getClientColumns(t: TFunction): TableColumnsType<Client> {
  return [
    {
      title: t('client.name'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('client.contactPhone'),
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 170,
    },
    {
      title: t('client.contactName'),
      dataIndex: 'contactName',
      key: 'contactName',
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: t('client.organization'),
      key: 'organization',
      ellipsis: true,
      responsive: ['lg'],
      render: (_, record) => record.organization?.title ?? '—',
    },
    {
      title: t('client.telegram'),
      key: 'telegram',
      width: 160,
      responsive: ['lg'],
      render: (_, record) =>
        record.telegramUsername ? `@${record.telegramUsername.replace(/^@/, '')}` : '—',
    },
    {
      title: t('client.mapTitle'),
      key: 'location',
      width: 160,
      align: 'right',
      responsive: ['xl'],
      render: (_, record) =>
        record.latitude != null && record.longitude != null
          ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
          : '—',
    },
  ]
}
