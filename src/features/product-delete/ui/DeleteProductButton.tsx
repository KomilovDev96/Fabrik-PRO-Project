import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteProduct, type Product } from '@/entities/product'

interface Props {
  product: Product
}

export function DeleteProductButton({ product }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteProduct()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: product.title })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(product.id, {
          onSuccess: () => message.success(t('product.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
