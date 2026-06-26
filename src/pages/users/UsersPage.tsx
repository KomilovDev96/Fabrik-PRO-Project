import { useMemo, useState, type Key } from 'react'
import { App, Button, Card, Flex, Input, Popconfirm, Space, Table, Typography } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import type { TableRowSelection } from 'antd/es/table/interface'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/shared/config/constants'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { ColumnSettings, type ColumnOption } from '@/shared/ui/ColumnSettings'
import { Can } from '@/entities/session'
import {
  USER_STORES,
  getUserColumns,
  useDeleteUsers,
  useUsers,
  type AdminUser,
  type UserVariant,
} from '@/entities/user'
import { UserFormDrawer } from '@/features/user-form'
import { DeleteUserButton } from '@/features/user-delete'

interface Props {
  variant: UserVariant
}

/**
 * Users list — one component for both Foydalanuvchilar and Xodimlar → Ro'yxati.
 * `variant` selects the store, title, and column set (same /admin/UserAdmin data).
 */
export function UsersPage({ variant }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const useStore = USER_STORES[variant]

  const { page, pageSize, search, setSearch, setPage, setSort, openCreate, openEdit } = useStore(
    useShallow((s) => ({
      page: s.page,
      pageSize: s.pageSize,
      search: s.search,
      setSearch: s.setSearch,
      setPage: s.setPage,
      setSort: s.setSort,
      openCreate: s.openCreate,
      openEdit: s.openEdit,
    })),
  )

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  // Column keys differ per variant.
  const dataKeys = useMemo(
    () =>
      variant === 'xodimlar'
        ? ['fullName', 'phoneNumber', 'idNumber', 'role', 'department', 'salary']
        : ['fullName', 'phoneNumber', 'role', 'owner'],
    [variant],
  )
  const allKeys = useMemo(() => ['selection', 'index', ...dataKeys], [dataKeys])
  const [visibleKeys, setVisibleKeys] = useState<string[]>(allKeys)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useUsers({ page, pageSize, search: debouncedSearch })

  const bulkDelete = useDeleteUsers()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('user.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const labelByKey: Record<string, string> = useMemo(
    () => ({
      selection: t('common.selectColumn'),
      index: t('user.orderNo'),
      fullName: t(`user.${variant}Name`),
      phoneNumber: t('user.phone'),
      idNumber: t('user.idNumber'),
      role: t(variant === 'xodimlar' ? 'user.position' : 'user.role'),
      department: t('user.department'),
      owner: t('user.owner'),
      salary: t('user.salary'),
    }),
    [t, variant],
  )

  const columnOptions = useMemo<ColumnOption[]>(
    () => allKeys.map((k) => ({ key: k, label: labelByKey[k] })),
    [allKeys, labelByKey],
  )

  const columns = useMemo<TableColumnsType<AdminUser>>(() => {
    const orderNo: TableColumnsType<AdminUser>[number] = {
      title: t('user.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    const byKey: Record<string, TableColumnsType<AdminUser>[number]> = {
      index: orderNo,
      ...Object.fromEntries(getUserColumns(t, variant).map((c) => [String(c.key), c])),
    }
    const dataColumns = ['index', ...dataKeys]
      .filter((k) => visibleKeys.includes(k) && byKey[k])
      .map((k) => byKey[k])

    const actions: TableColumnsType<AdminUser>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="employees.update">
            <Button type="text" aria-label="edit" icon={<EditOutlined />} onClick={() => openEdit(record.id)} />
          </Can>
          <Can perform="employees.delete">
            <DeleteUserButton user={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, variant, page, pageSize, visibleKeys, dataKeys, openEdit])

  const rowSelection: TableRowSelection<AdminUser> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<AdminUser>['onChange'] = (pag, _f, sorter) => {
    setPage(pag.current ?? 1, pag.pageSize)
    const single = Array.isArray(sorter) ? sorter[0] : sorter
    if (single?.order && typeof single.field === 'string') {
      setSort(single.field, single.order === 'ascend' ? 'asc' : 'desc')
    } else {
      setSort(undefined, undefined)
    }
  }

  const selectedCount = selectedRowKeys.length

  return (
    <Card variant="borderless">
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t(`user.titles.${variant}`)}
        </Typography.Title>

        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('user.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Can perform="employees.delete">
            <Popconfirm
              title={t('user.deleteSelectedConfirm', { count: selectedCount })}
              okText={t('common.yes')}
              cancelText={t('common.no')}
              okButtonProps={{ danger: true, loading: bulkDelete.isPending }}
              onConfirm={onBulkDelete}
              disabled={!selectedCount}
            >
              <Button danger disabled={!selectedCount}>
                {t('common.delete')}
                {selectedCount ? ` (${selectedCount})` : ''}
              </Button>
            </Popconfirm>
          </Can>
          <ColumnSettings options={columnOptions} value={visibleKeys} onChange={setVisibleKeys} />
          <Can perform="employees.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('user.add')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<AdminUser>
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (total) => `${t('common.total')}: ${total}`,
        }}
      />

      <UserFormDrawer variant={variant} />
    </Card>
  )
}
