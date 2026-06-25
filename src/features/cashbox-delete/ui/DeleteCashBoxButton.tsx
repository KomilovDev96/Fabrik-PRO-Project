import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteCashBox, type CashBox } from '@/entities/cashbox'

interface Props {
  cashbox: CashBox
}

/** Delete action with confirmation. Self-contained feature: owns its mutation + toasts. */
export function DeleteCashBoxButton({ cashbox }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteCashBox()

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: cashbox.title })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(cashbox.id, {
          onSuccess: () => message.success(t('cashbox.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
