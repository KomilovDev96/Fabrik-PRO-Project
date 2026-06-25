import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteOrder, type Order } from '@/entities/order'

interface Props {
  order: Order
}

/** Delete action with confirmation. Self-contained feature: owns its mutation + toasts. */
export function DeleteOrderButton({ order }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteOrder()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: `#${order.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(order.id, {
          onSuccess: () => message.success(t('order.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
