import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import dayjs from 'dayjs'
import type { SickLeave } from '../model/types'

const fmt = (v?: string) => (v && dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : '—')

/** Columns for the sick-leave table: employee · start · end · notes. */
export function getSickLeaveColumns(t: TFunction): TableColumnsType<SickLeave> {
  return [
    {
      title: t('sickLeave.employee'),
      key: 'user',
      ellipsis: true,
      render: (_, r) => r.user?.fullName || r.user?.phoneNumber || '—',
    },
    {
      title: t('sickLeave.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
      render: (v?: string) => fmt(v),
    },
    {
      title: t('sickLeave.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150,
      render: (v?: string) => fmt(v),
    },
    {
      title: t('sickLeave.notes'),
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (v?: string | null) => v || '—',
    },
  ]
}
