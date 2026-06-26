import { Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import dayjs from 'dayjs'
import type { Salary } from '../model/types'

const fmt = (v?: string) => (v && dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : '—')

export function getSalaryColumns(t: TFunction): TableColumnsType<Salary> {
  return [
    { title: t('salaryAccrual.employee'), key: 'user', ellipsis: true, render: (_, r) => r.user?.fullName || r.user?.phoneNumber || '—' },
    { title: t('salaryAccrual.fromDate'), dataIndex: 'fromDate', key: 'fromDate', width: 150, render: (v?: string) => fmt(v) },
    { title: t('salaryAccrual.toDate'), dataIndex: 'toDate', key: 'toDate', width: 150, render: (v?: string) => fmt(v) },
    {
      title: t('salaryAccrual.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (v: number) => <Typography.Text style={{ color: 'var(--ant-color-success, #52c41a)' }}>{Number(v ?? 0).toLocaleString()}</Typography.Text>,
    },
    { title: t('salaryAccrual.comment'), dataIndex: 'comment', key: 'comment', ellipsis: true, render: (v?: string | null) => v || '—' },
  ]
}
