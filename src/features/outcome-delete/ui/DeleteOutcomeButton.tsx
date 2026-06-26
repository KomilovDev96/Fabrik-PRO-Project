import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteOutcome, type Outcome } from '@/entities/outcome'

export function DeleteOutcomeButton({ outcome }: { outcome: Outcome }) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteOutcome()
  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: outcome.supplier || `#${outcome.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(outcome.id, {
          onSuccess: () => message.success(t('outcome.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
