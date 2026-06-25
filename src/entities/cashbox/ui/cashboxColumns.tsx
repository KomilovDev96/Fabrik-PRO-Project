import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import type { CashBox } from '../model/types'

/**
 * Real data columns for the cash-box table (no actions/balance columns).
 * The API only exposes `title` + `organization` — there are no balance fields,
 * so the per-currency balance columns from the design are added as placeholders
 * in the page, not here.
 */
export function getCashBoxColumns(t: TFunction): TableColumnsType<CashBox> {
  return [
    {
      title: t('cashbox.name'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('cashbox.organization'),
      key: 'organization',
      ellipsis: true,
      responsive: ['md'],
      render: (_, record) => record.organization?.title ?? '—',
    },
  ]
}
