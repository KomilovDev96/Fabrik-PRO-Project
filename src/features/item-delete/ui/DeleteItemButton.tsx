import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteItem, type Item } from '@/entities/item'

interface Props {
  item: Item
}

/** Delete an inventory item with confirmation. */
export function DeleteItemButton({ item }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteItem()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: item.title })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(item.id, {
          onSuccess: () => message.success(t('item.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
