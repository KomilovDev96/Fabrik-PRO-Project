import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteClient, type Client } from '@/entities/client'

interface Props {
  client: Client
}

/** Delete action with confirmation. Self-contained feature: owns its mutation + toasts. */
export function DeleteClientButton({ client }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteClient()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: client.title })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(client.id, {
          onSuccess: () => message.success(t('client.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
