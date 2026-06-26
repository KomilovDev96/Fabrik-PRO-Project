import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteIncome, type Income } from '@/entities/income'

export function DeleteIncomeButton({ income }: { income: Income }) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteIncome()
  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: income.client || `#${income.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(income.id, {
          onSuccess: () => message.success(t('income.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
