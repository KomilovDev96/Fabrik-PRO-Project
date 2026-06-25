import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteWarehouse, type Warehouse } from '@/entities/warehouse'

interface Props {
  warehouse: Warehouse
}

/** Delete action with confirmation. Self-contained feature: owns its mutation + toasts. */
export function DeleteWarehouseButton({ warehouse }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteWarehouse()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: warehouse.title })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(warehouse.id, {
          onSuccess: () => message.success(t('warehouse.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
