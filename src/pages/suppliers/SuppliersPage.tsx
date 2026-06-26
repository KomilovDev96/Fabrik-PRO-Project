import { useMemo, useState, type Key } from 'react'
import { App, Button, Card, Flex, Input, Popconfirm, Space, Table, Tooltip, Typography } from 'antd'
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
  getSupplierColumns,
  useDeleteSuppliers,
  useSupplierStore,
  useSuppliers,
  type Supplier,
} from '@/entities/supplier'
import { SupplierFormDrawer } from '@/features/supplier-form'
import { DeleteSupplierButton } from '@/features/supplier-delete'

/** Toggleable columns in design order. "balans" has no API field (from supplier-payments). */
const ALL_COLUMN_KEYS = ['selection', 'index', 'title', 'contactPhone', 'contactName', 'balans', 'telegram', 'location']

/** Suppliers (Ta'minotchilar) screen — same layout as Mijozlar. */
export function SuppliersPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, setSearch, setPage, setSort, openCreate, openEdit } =
    useSupplierStore(
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
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_COLUMN_KEYS)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useSuppliers({ page, pageSize, search: debouncedSearch })

  const bulkDelete = useDeleteSuppliers()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('supplier.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('supplier.orderNo') },
      { key: 'title', label: t('supplier.name') },
      { key: 'contactPhone', label: t('supplier.contactPhone') },
      { key: 'contactName', label: t('supplier.contactName') },
      { key: 'balans', label: t('supplier.balance') },
      { key: 'telegram', label: t('supplier.telegram') },
      { key: 'location', label: t('supplier.mapTitle') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<Supplier>>(() => {
    const orderNo: TableColumnsType<Supplier>[number] = {
      title: t('supplier.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    const balans: TableColumnsType<Supplier>[number] = {
      title: t('supplier.balance'),
      key: 'balans',
      width: 140,
      align: 'right',
      render: () => (
        <Tooltip title={t('supplier.balanceNotAvailable')}>
          <Typography.Text type="secondary">—</Typography.Text>
        </Tooltip>
      ),
    }
    const byKey: Record<string, TableColumnsType<Supplier>[number]> = {
      index: orderNo,
      balans,
      ...Object.fromEntries(getSupplierColumns(t).map((c) => [String(c.key), c])),
    }
    const dataColumns = ALL_COLUMN_KEYS.filter(
      (k) => k !== 'selection' && visibleKeys.includes(k) && byKey[k],
    ).map((k) => byKey[k])

    const actions: TableColumnsType<Supplier>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="suppliers.update">
            <Button type="text" aria-label="edit" icon={<EditOutlined />} onClick={() => openEdit(record.id)} />
          </Can>
          <Can perform="suppliers.delete">
            <DeleteSupplierButton supplier={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, page, pageSize, visibleKeys, openEdit])

  const rowSelection: TableRowSelection<Supplier> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<Supplier>['onChange'] = (pag, _f, sorter) => {
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
          {t('supplier.title')}
        </Typography.Title>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('supplier.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Can perform="suppliers.delete">
            <Popconfirm
              title={t('supplier.deleteSelectedConfirm', { count: selectedCount })}
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
          <Can perform="suppliers.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('supplier.create')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Supplier>
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

      <SupplierFormDrawer />
    </Card>
  )
}
