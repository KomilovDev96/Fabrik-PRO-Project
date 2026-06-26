import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import dayjs from 'dayjs'
import type { Attendance } from '../model/types'

const fmtDate = (v?: string) => (v && dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : '—')
const fmtTime = (v?: string | null) => (v ? String(v).slice(0, 5) : '—')

/** Data columns for the attendance table: employee · date · arrival · departure · notes. */
export function getAttendanceColumns(t: TFunction): TableColumnsType<Attendance> {
  return [
    {
      title: t('attendance.employee'),
      key: 'user',
      ellipsis: true,
      render: (_, r) => r.user?.fullName || r.user?.phoneNumber || '—',
    },
    {
      title: t('attendance.date'),
      dataIndex: 'date',
      key: 'date',
      width: 140,
      render: (v?: string) => fmtDate(v),
    },
    {
      title: t('attendance.arrival'),
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      width: 120,
      responsive: ['md'],
      render: (v?: string | null) => fmtTime(v),
    },
    {
      title: t('attendance.departure'),
      dataIndex: 'departureTime',
      key: 'departureTime',
      width: 120,
      responsive: ['md'],
      render: (v?: string | null) => fmtTime(v),
    },
    {
      title: t('attendance.notes'),
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (v?: string | null) => v || '—',
    },
  ]
}
