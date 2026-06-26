import { Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import dayjs from 'dayjs'
import type { Outcome } from '../model/types'

const fmtDate = (v?: string) => (v && dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : '—')

/** Columns for Pul chiqim: supplier · cashbox · date · amount · currency · payment · comment · category. */
export function getOutcomeColumns(t: TFunction): TableColumnsType<Outcome> {
  return [
    { title: t('outcome.supplier'), dataIndex: 'supplier', key: 'supplier', ellipsis: true, render: (v?: string | null) => v || '—' },
    { title: t('outcome.cashBox'), dataIndex: 'cashBox', key: 'cashBox', width: 130, render: (v?: string | null) => v || '—' },
    { title: t('outcome.date'), dataIndex: 'date', key: 'date', width: 130, render: (v?: string) => fmtDate(v) },
    {
      title: t('outcome.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (v: number) => (
        <Typography.Text type="danger">{Number(v ?? 0).toLocaleString()}</Typography.Text>
      ),
    },
    { title: t('outcome.currency'), dataIndex: 'currency', key: 'currency', width: 100, render: (v?: string | null) => v || '—' },
    { title: t('outcome.paymentMethod'), dataIndex: 'paymentMethod', key: 'paymentMethod', width: 130, responsive: ['md'], render: (v?: string | null) => v || '—' },
    { title: t('outcome.comment'), dataIndex: 'comment', key: 'comment', ellipsis: true, responsive: ['lg'], render: (v?: string | null) => v || '—' },
    { title: t('outcome.category'), key: 'outcomeCategory', width: 140, responsive: ['md'], render: (_, r) => r.outcomeCategory?.title ?? '—' },
  ]
}
