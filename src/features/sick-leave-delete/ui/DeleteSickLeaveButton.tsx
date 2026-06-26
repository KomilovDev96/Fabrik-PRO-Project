import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteSickLeave, type SickLeave } from '@/entities/sick-leave'

interface Props {
  sickLeave: SickLeave
}

export function DeleteSickLeaveButton({ sickLeave }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteSickLeave()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: sickLeave.user?.fullName || `#${sickLeave.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(sickLeave.id, {
          onSuccess: () => message.success(t('sickLeave.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
