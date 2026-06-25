import { Tag, Tooltip, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import { ORDER_STATUS_COLOR, type Order, type OrderStatus } from '../model/types'

/** Status badge — color from ORDER_STATUS_COLOR, label localized via `order.statuses.*`. */
function statusTag(status: OrderStatus, t: TFunction) {
  return <Tag color={ORDER_STATUS_COLOR[status]}>{t(`order.statuses.${status}`)}</Tag>
}

/**
 * Real data columns for the sales table (no actions/placeholder columns).
 * OrderAdminList is header-only, so document date/number, total and products
 * (design columns) are added as placeholders in the page, not here.
 */
export function getOrderColumns(t: TFunction): TableColumnsType<Order> {
  return [
    {
      title: t('order.status'),
      key: 'status',
      width: 130,
      render: (_, record) => statusTag(record.status, t),
    },
    {
      title: t('order.warehouse'),
      dataIndex: 'warehouse',
      key: 'warehouse',
      ellipsis: true,
      render: (value?: string | null) => value || '—',
    },
    {
      title: t('order.client'),
      dataIndex: 'client',
      key: 'client',
      ellipsis: true,
      render: (value?: string | null) => value || '—',
    },
    {
      title: t('order.delivery'),
      key: 'delivery',
      width: 130,
      responsive: ['md'],
      render: (_, record) =>
        record.delivery ? (
          <Tag color="processing">{t('common.yes')}</Tag>
        ) : (
          <Tag>{t('common.no')}</Tag>
        ),
    },
    {
      title: t('order.cancellation'),
      key: 'cancellation',
      width: 160,
      responsive: ['lg'],
      render: (_, record) =>
        record.rejectionReason ? (
          <Tooltip title={record.rejectionReason}>
            <Typography.Text type="danger" ellipsis style={{ maxWidth: 140 }}>
              {record.rejectionReason}
            </Typography.Text>
          </Tooltip>
        ) : (
          '—'
        ),
    },
  ]
}
