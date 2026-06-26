import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeletePayroll, type PayrollEntry, type PayrollKind } from '@/entities/payroll'

interface Props {
  kind: PayrollKind
  entry: PayrollEntry
}

/** Delete action with confirmation. Self-contained: owns its mutation + toasts. */
export function DeletePayrollButton({ kind, entry }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeletePayroll(kind)

  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: entry.user?.fullName || `#${entry.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(entry.id, {
          onSuccess: () => message.success(t('payroll.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
