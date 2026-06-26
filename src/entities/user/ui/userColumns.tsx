import { Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TFunction } from 'i18next'
import type { AdminUser } from '../model/adminUser'
import type { UserVariant } from '../model/userStore'

/**
 * Data columns for the user table, by page variant:
 *  - foydalanuvchilar: name · phone · role · owner
 *  - xodimlar:         name · phone · id · position(role) · department · salary
 */
export function getUserColumns(t: TFunction, variant: UserVariant): TableColumnsType<AdminUser> {
  const fullName: TableColumnsType<AdminUser>[number] = {
    title: t(`user.${variant}Name`),
    dataIndex: 'fullName',
    key: 'fullName',
    ellipsis: true,
    render: (v?: string | null) => v || '—',
  }
  const phone: TableColumnsType<AdminUser>[number] = {
    title: t('user.phone'),
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 180,
    render: (v?: string | null) => v || '—',
  }
  const role: TableColumnsType<AdminUser>[number] = {
    title: t(variant === 'xodimlar' ? 'user.position' : 'user.role'),
    dataIndex: 'role',
    key: 'role',
    ellipsis: true,
    render: (v?: string | null) => v || '—',
  }

  if (variant === 'foydalanuvchilar') {
    return [
      fullName,
      phone,
      role,
      {
        title: t('user.owner'),
        key: 'owner',
        ellipsis: true,
        responsive: ['md'],
        render: (_, r) => r.organization?.title ?? '—',
      },
    ]
  }

  // xodimlar
  return [
    fullName,
    phone,
    {
      title: t('user.idNumber'),
      dataIndex: 'id',
      key: 'idNumber',
      width: 120,
      responsive: ['md'],
    },
    role,
    {
      title: t('user.department'),
      dataIndex: 'department',
      key: 'department',
      ellipsis: true,
      responsive: ['lg'],
      render: (v?: string | null) => v || '—',
    },
    {
      title: t('user.salary'),
      key: 'salary',
      width: 130,
      align: 'right',
      render: (_, r) =>
        r.salary?.amount != null ? (
          <Typography.Text style={{ color: 'var(--ant-color-success, #52c41a)' }}>
            {Number(r.salary.amount).toLocaleString()}
          </Typography.Text>
        ) : (
          '—'
        ),
    },
  ]
}
