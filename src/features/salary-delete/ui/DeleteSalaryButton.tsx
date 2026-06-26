import { App, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteSalary, type Salary } from '@/entities/salary'

export function DeleteSalaryButton({ salary }: { salary: Salary }) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const del = useDeleteSalary()
  return (
    <Popconfirm
      title={t('common.deleteConfirm', { name: salary.user?.fullName || `#${salary.id}` })}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      okButtonProps={{ danger: true, loading: del.isPending }}
      onConfirm={() =>
        del.mutate(salary.id, {
          onSuccess: () => message.success(t('salaryAccrual.deletedSuccess')),
          onError: (e) => message.error(e.message),
        })
      }
    >
      <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
