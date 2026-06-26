import { Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import dayjs from 'dayjs'
import type { Income } from '../model/types'

const fmtDate = (v?: string) => (v && dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : '—')

/** Columns for Pul kirim: client · cashbox · date · amount · currency · payment · comment · category. */
export function getIncomeColumns(t: TFunction): TableColumnsType<Income> {
  return [
    { title: t('income.client'), dataIndex: 'client', key: 'client', ellipsis: true, render: (v?: string | null) => v || '—' },
    { title: t('income.cashBox'), dataIndex: 'cashBox', key: 'cashBox', width: 130, render: (v?: string | null) => v || '—' },
    { title: t('income.date'), dataIndex: 'date', key: 'date', width: 130, render: (v?: string) => fmtDate(v) },
    {
      title: t('income.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (v: number) => (
        <Typography.Text style={{ color: 'var(--ant-color-success, #52c41a)' }}>{Number(v ?? 0).toLocaleString()}</Typography.Text>
      ),
    },
    { title: t('income.currency'), dataIndex: 'currency', key: 'currency', width: 100, render: (v?: string | null) => v || '—' },
    { title: t('income.paymentMethod'), dataIndex: 'paymentMethod', key: 'paymentMethod', width: 130, responsive: ['md'], render: (v?: string | null) => v || '—' },
    { title: t('income.comment'), dataIndex: 'comment', key: 'comment', ellipsis: true, responsive: ['lg'], render: (v?: string | null) => v || '—' },
    { title: t('income.category'), key: 'incomeCategory', width: 140, responsive: ['md'], render: (_, r) => r.incomeCategory?.title ?? '—' },
  ]
}
