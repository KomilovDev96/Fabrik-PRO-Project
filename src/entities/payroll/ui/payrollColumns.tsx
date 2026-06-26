import { Tooltip, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import dayjs from 'dayjs'
import type { PayrollEntry } from '../model/types'

/** Format the work month (forDate) as "Avgust, 2025" in the active locale. */
function formatWorkMonth(forDate?: string): string {
  if (!forDate) return '—'
  const d = dayjs(forDate)
  return d.isValid() ? d.format('MMMM, YYYY') : '—'
}

/** Format the given date (date) as DD/MM/YYYY. */
function formatGivenDate(date?: string): string {
  if (!date) return '—'
  const d = dayjs(date)
  return d.isValid() ? d.format('DD/MM/YYYY') : '—'
}

/**
 * Real data columns for any payroll ledger (no actions/selection — those are
 * composed in the page). Mirrors the Maosh design: employee · work month ·
 * given date · amount · comment. The API exposes every column (no placeholders).
 */
export function getPayrollColumns(t: TFunction): TableColumnsType<PayrollEntry> {
  return [
    {
      title: t('payroll.employee'),
      key: 'user',
      ellipsis: true,
      render: (_, r) => r.user?.fullName || r.user?.phoneNumber || '—',
    },
    {
      title: t('payroll.workMonth'),
      dataIndex: 'forDate',
      key: 'forDate',
      width: 150,
      render: (value?: string) => formatWorkMonth(value),
    },
    {
      title: t('payroll.givenDate'),
      dataIndex: 'date',
      key: 'date',
      width: 140,
      render: (value?: string) => formatGivenDate(value),
    },
    {
      title: t('payroll.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (value: number) => (
        <Typography.Text style={{ color: 'var(--ant-color-primary, #1677ff)' }}>
          {Number(value ?? 0).toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: t('payroll.comment'),
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (value?: string | null) =>
        value ? (
          <Tooltip title={value}>
            <span>{value}</span>
          </Tooltip>
        ) : (
          '—'
        ),
    },
  ]
}
