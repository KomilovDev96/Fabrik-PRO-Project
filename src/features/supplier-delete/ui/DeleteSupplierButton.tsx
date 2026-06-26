import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteSupplier, type Supplier } from '@/entities/supplier'

interface Props {
  supplier: Supplier
}

export function DeleteSupplierButton({ supplier }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteSupplier()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: supplier.title })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(supplier.id, {
          onSuccess: () => message.success(t('supplier.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
