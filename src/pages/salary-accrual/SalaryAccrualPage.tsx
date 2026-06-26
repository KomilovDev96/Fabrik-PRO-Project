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
import { getSalaryColumns, useDeleteSalaries, useSalaries, useSalaryStore, type Salary } from '@/entities/salary'
import { SalaryFormDrawer } from '@/features/salary-form'
import { DeleteSalaryButton } from '@/features/salary-delete'

const ALL_KEYS = ['selection', 'index', 'user', 'fromDate', 'toDate', 'amount', 'comment']

/** Maosh → Hisoblangan oylik (salary accruals). */
export function SalaryAccrualPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, setSearch, setPage, setSort, openCreate, openEdit } = useSalaryStore(
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
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_KEYS)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useSalaries({ page, pageSize, search: debouncedSearch })

  const bulkDelete = useDeleteSalaries()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('salaryAccrual.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('salaryAccrual.orderNo') },
      { key: 'user', label: t('salaryAccrual.employee') },
      { key: 'fromDate', label: t('salaryAccrual.fromDate') },
      { key: 'toDate', label: t('salaryAccrual.toDate') },
      { key: 'amount', label: t('salaryAccrual.amount') },
      { key: 'comment', label: t('salaryAccrual.comment') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<Salary>>(() => {
    const orderNo: TableColumnsType<Salary>[number] = {
      title: t('salaryAccrual.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    const byKey: Record<string, TableColumnsType<Salary>[number]> = {
      index: orderNo,
      ...Object.fromEntries(getSalaryColumns(t).map((c) => [String(c.key), c])),
    }
    const dataColumns = ALL_KEYS.filter((k) => k !== 'selection' && visibleKeys.includes(k) && byKey[k]).map((k) => byKey[k])
    const actions: TableColumnsType<Salary>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="salary.update">
            <Button type="text" aria-label="edit" icon={<EditOutlined />} onClick={() => openEdit(record.id)} />
          </Can>
          <Can perform="salary.delete">
            <DeleteSalaryButton salary={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, page, pageSize, visibleKeys, openEdit])

  const rowSelection: TableRowSelection<Salary> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<Salary>['onChange'] = (pag, _f, sorter) => {
    setPage(pag.current ?? 1, pag.pageSize)
    const single = Array.isArray(sorter) ? sorter[0] : sorter
    if (single?.order && typeof single.field === 'string') setSort(single.field, single.order === 'ascend' ? 'asc' : 'desc')
    else setSort(undefined, undefined)
  }

  const selectedCount = selectedRowKeys.length

  return (
    <Card variant="borderless">
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('salaryAccrual.title')}
        </Typography.Title>
        <Space wrap>
          <Input.Search allowClear placeholder={t('salaryAccrual.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} />
          <Can perform="salary.delete">
            <Popconfirm
              title={t('salaryAccrual.deleteSelectedConfirm', { count: selectedCount })}
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
          <Can perform="salary.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('salaryAccrual.add')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Salary>
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        onChange={handleTableChange}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (total) => `${t('common.total')}: ${total}`,
        }}
      />

      <SalaryFormDrawer />
    </Card>
  )
}
