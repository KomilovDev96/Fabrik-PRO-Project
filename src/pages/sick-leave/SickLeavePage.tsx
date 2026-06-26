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
  getSickLeaveColumns,
  useDeleteSickLeaves,
  useSickLeaveStore,
  useSickLeaves,
  type SickLeave,
} from '@/entities/sick-leave'
import { SickLeaveFormDrawer } from '@/features/sick-leave-form'
import { DeleteSickLeaveButton } from '@/features/sick-leave-delete'

const ALL_KEYS = ['selection', 'index', 'user', 'startDate', 'endDate', 'notes']

/** Sick leave (Javob olgan kunlar) screen. */
export function SickLeavePage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, setSearch, setPage, setSort, openCreate, openEdit } =
    useSickLeaveStore(
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
  const { data, isLoading, isFetching } = useSickLeaves({ page, pageSize, search: debouncedSearch })

  const bulkDelete = useDeleteSickLeaves()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('sickLeave.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('sickLeave.orderNo') },
      { key: 'user', label: t('sickLeave.employee') },
      { key: 'startDate', label: t('sickLeave.startDate') },
      { key: 'endDate', label: t('sickLeave.endDate') },
      { key: 'notes', label: t('sickLeave.notes') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<SickLeave>>(() => {
    const orderNo: TableColumnsType<SickLeave>[number] = {
      title: t('sickLeave.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    const byKey: Record<string, TableColumnsType<SickLeave>[number]> = {
      index: orderNo,
      ...Object.fromEntries(getSickLeaveColumns(t).map((c) => [String(c.key), c])),
    }
    const dataColumns = ALL_KEYS.filter((k) => k !== 'selection' && visibleKeys.includes(k) && byKey[k]).map(
      (k) => byKey[k],
    )
    const actions: TableColumnsType<SickLeave>[number] = {
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
            <DeleteSickLeaveButton sickLeave={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, page, pageSize, visibleKeys, openEdit])

  const rowSelection: TableRowSelection<SickLeave> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<SickLeave>['onChange'] = (pag, _f, sorter) => {
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
          {t('sickLeave.title')}
        </Typography.Title>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('sickLeave.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Can perform="employees.delete">
            <Popconfirm
              title={t('sickLeave.deleteSelectedConfirm', { count: selectedCount })}
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
              {t('sickLeave.add')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<SickLeave>
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (total) => `${t('common.total')}: ${total}`,
        }}
      />

      <SickLeaveFormDrawer />
    </Card>
  )
}
