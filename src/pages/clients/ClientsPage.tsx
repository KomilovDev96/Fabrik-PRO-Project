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
  getClientColumns,
  useClientStore,
  useClients,
  useDeleteClients,
  type Client,
} from '@/entities/client'
import { ClientFormDrawer } from '@/features/client-form'
import { DeleteClientButton } from '@/features/client-delete'

/** Every toggleable column key (selection + order-no + data columns), in display order. */
const ALL_COLUMN_KEYS = [
  'selection',
  'index',
  'title',
  'contactPhone',
  'contactName',
  'organization',
  'telegram',
  'location',
]

/**
 * Clients (Mijozlar) screen — same composition as WarehousesPage, plus:
 *   - multi-row selection with a bulk-delete ("O'chirish") action,
 *   - a column-settings gear to show/hide columns (incl. the checkbox column).
 *
 * Server state = React Query (useClients) · UI state = Zustand (search/paging/drawer).
 */
export function ClientsPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, sortBy, sortOrder, setSearch, setPage, setSort, openCreate, openEdit } =
    useClientStore(
      useShallow((s) => ({
        page: s.page,
        pageSize: s.pageSize,
        search: s.search,
        sortBy: s.sortBy,
        sortOrder: s.sortOrder,
        setSearch: s.setSearch,
        setPage: s.setPage,
        setSort: s.setSort,
        openCreate: s.openCreate,
        openEdit: s.openEdit,
      })),
    )

  // --- multi-select + column visibility (ephemeral UI state) ---
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_COLUMN_KEYS)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useClients({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  })

  const bulkDelete = useDeleteClients()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('client.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  // Labels for the column-settings dropdown (order matches ALL_COLUMN_KEYS).
  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('client.orderNo') },
      { key: 'title', label: t('client.name') },
      { key: 'contactPhone', label: t('client.contactPhone') },
      { key: 'contactName', label: t('client.contactName') },
      { key: 'organization', label: t('client.organization') },
      { key: 'telegram', label: t('client.telegram') },
      { key: 'location', label: t('client.mapTitle') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<Client>>(() => {
    const orderNo: TableColumnsType<Client>[number] = {
      title: t('client.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    // Toggleable data columns filtered by the gear settings (actions stays pinned).
    const dataColumns = [orderNo, ...getClientColumns(t)].filter((c) =>
      visibleKeys.includes(String(c.key)),
    )
    const actions: TableColumnsType<Client>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="clients.update">
            <Button
              type="text"
              aria-label="edit"
              icon={<EditOutlined />}
              onClick={() => openEdit(record.id)}
            />
          </Can>
          <Can perform="clients.delete">
            <DeleteClientButton client={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, page, pageSize, visibleKeys, openEdit])

  // The checkbox column is itself toggleable via the gear.
  const rowSelection: TableRowSelection<Client> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<Client>['onChange'] = (pag, _filters, sorter) => {
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
          {t('client.title')}
        </Typography.Title>

        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('client.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Can perform="clients.delete">
            <Popconfirm
              title={t('client.deleteSelectedConfirm', { count: selectedCount })}
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
          <Can perform="clients.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('client.create')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Client>
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

      {/* Single drawer instance, driven by the Zustand store. */}
      <ClientFormDrawer />
    </Card>
  )
}
