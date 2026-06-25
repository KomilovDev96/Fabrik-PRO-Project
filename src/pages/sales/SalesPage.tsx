import { useMemo, useState, type Key } from 'react'
import { App, Button, Card, Flex, Input, Popconfirm, Space, Table, Tooltip, Typography } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import type { TableRowSelection } from 'antd/es/table/interface'
import { EditOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/shared/config/constants'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { ColumnSettings, type ColumnOption } from '@/shared/ui/ColumnSettings'
import { Can } from '@/entities/session'
import {
  getOrderColumns,
  useDeleteOrders,
  useOrderStore,
  useOrders,
  type Order,
} from '@/entities/order'
import { OrderFormDrawer } from '@/features/order-form'
import { DeleteOrderButton } from '@/features/order-delete'
import { OrderFilterBar } from './OrderFilterBar'

/** Toggleable column keys in design order (selection + order-no + data + placeholders). */
const ALL_COLUMN_KEYS = [
  'selection',
  'index',
  'docDate',
  'docNumber',
  'status',
  'total',
  'warehouse',
  'client',
  'delivery',
  'products',
  'cancellation',
]

/** Design columns with no backing API field yet — header-only order contract. */
const PLACEHOLDER_KEYS = new Set(['docDate', 'docNumber', 'total', 'products'])

/**
 * Sales (Sotuvlar) screen — wired to /admin/orders (header-only).
 * Real columns: status, warehouse, client, delivery, cancellation.
 * Placeholder columns (doc date/number, total, products) render "—" until the
 * backend exposes line items — see OrderFormDrawer notice.
 */
export function SalesPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, filters, setSearch, setPage, setSort, openCreate, openEdit } =
    useOrderStore(
      useShallow((s) => ({
        page: s.page,
        pageSize: s.pageSize,
        search: s.search,
        filters: s.filters,
        setSearch: s.setSearch,
        setPage: s.setPage,
        setSort: s.setSort,
        openCreate: s.openCreate,
        openEdit: s.openEdit,
      })),
    )

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_COLUMN_KEYS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useOrders({
    page,
    pageSize,
    search: debouncedSearch,
    ...filters,
  })

  const bulkDelete = useDeleteOrders()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('order.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('order.orderNo') },
      { key: 'docDate', label: t('order.docDate') },
      { key: 'docNumber', label: t('order.docNumber') },
      { key: 'status', label: t('order.status') },
      { key: 'total', label: t('order.total') },
      { key: 'warehouse', label: t('order.warehouse') },
      { key: 'client', label: t('order.client') },
      { key: 'delivery', label: t('order.delivery') },
      { key: 'products', label: t('order.products') },
      { key: 'cancellation', label: t('order.cancellation') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<Order>>(() => {
    const placeholder = (key: string): TableColumnsType<Order>[number] => ({
      title: columnOptions.find((o) => o.key === key)?.label ?? key,
      key,
      align: 'right',
      width: 140,
      render: () => (
        <Tooltip title={t('order.notInApi')}>
          <Typography.Text type="secondary">—</Typography.Text>
        </Tooltip>
      ),
    })
    const realByKey = Object.fromEntries(
      getOrderColumns(t).map((c) => [String(c.key), c]),
    ) as Record<string, TableColumnsType<Order>[number]>
    const orderNo: TableColumnsType<Order>[number] = {
      title: t('order.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }

    const byKey: Record<string, TableColumnsType<Order>[number]> = {
      index: orderNo,
      ...realByKey,
    }
    PLACEHOLDER_KEYS.forEach((k) => (byKey[k] = placeholder(k)))

    const dataColumns = ALL_COLUMN_KEYS.filter(
      (k) => k !== 'selection' && visibleKeys.includes(k) && byKey[k],
    ).map((k) => byKey[k])

    const actions: TableColumnsType<Order>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="orders.update">
            <Button
              type="text"
              aria-label="edit"
              icon={<EditOutlined />}
              onClick={() => openEdit(record.id)}
            />
          </Can>
          <Can perform="orders.delete">
            <DeleteOrderButton order={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, page, pageSize, visibleKeys, columnOptions, openEdit])

  const rowSelection: TableRowSelection<Order> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<Order>['onChange'] = (pag, _filters, sorter) => {
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
          {t('order.title')}
        </Typography.Title>

        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('order.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Can perform="orders.delete">
            <Popconfirm
              title={t('order.deleteSelectedConfirm', { count: selectedCount })}
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
          <Button
            icon={<FilterOutlined />}
            type={filtersOpen ? 'primary' : 'default'}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {t('order.filter')}
          </Button>
          <ColumnSettings options={columnOptions} value={visibleKeys} onChange={setVisibleKeys} />
          <Can perform="orders.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('order.create')}
            </Button>
          </Can>
        </Space>
      </Flex>

      {filtersOpen && <OrderFilterBar />}

      <Table<Order>
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (total) => `${t('common.total')}: ${total}`,
        }}
      />

      {/* Single drawer instance, driven by the Zustand store. */}
      <OrderFormDrawer />
    </Card>
  )
}
