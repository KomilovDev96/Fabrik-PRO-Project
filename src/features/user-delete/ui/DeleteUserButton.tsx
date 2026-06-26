import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteUser, type AdminUser } from '@/entities/user'

interface Props {
  user: AdminUser
}

/** Delete action with confirmation. Self-contained: owns its mutation + toasts. */
export function DeleteUserButton({ user }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteUser()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: user.fullName || `#${user.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(user.id, {
          onSuccess: () => message.success(t('user.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
