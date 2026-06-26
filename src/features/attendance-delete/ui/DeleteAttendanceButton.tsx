import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteAttendance, type Attendance } from '@/entities/attendance'

interface Props {
  attendance: Attendance
}

export function DeleteAttendanceButton({ attendance }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteAttendance()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: attendance.user?.fullName || `#${attendance.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(attendance.id, {
          onSuccess: () => message.success(t('attendance.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
