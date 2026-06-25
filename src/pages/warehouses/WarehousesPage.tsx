import { useMemo } from 'react'
import { Button, Card, Flex, Input, Space, Table, Typography } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/shared/config/constants'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { Can } from '@/entities/session'
import {
  getWarehouseColumns,
  useWarehouseStore,
  useWarehouses,
  type Warehouse,
} from '@/entities/warehouse'
import { WarehouseFormModal } from '@/features/warehouse-form'
import { DeleteWarehouseButton } from '@/features/warehouse-delete'

/**
 * Warehouses screen — the reference implementation for every list module.
 *
 * Composition (FSD top-down):
 *   page → features (form modal, delete) + entity (table columns, queries, store)
 *
 * Server state  = React Query (useWarehouses)
 * UI state      = Zustand     (search / paging / sort / modal)
 */
export function WarehousesPage() {
  const { t } = useTranslation()

  const { page, pageSize, search, sortBy, sortOrder, setSearch, setPage, setSort, openCreate, openEdit } =
    useWarehouseStore(
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

  // Debounce search so we don't hit the API on every keystroke.
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useWarehouses({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  })

  // Data columns from the entity + an actions column composed from features.
  const columns = useMemo<TableColumnsType<Warehouse>>(
    () => [
      ...getWarehouseColumns(t),
      {
        title: t('common.actions'),
        key: 'actions',
        width: 110,
        fixed: 'right',
        align: 'center',
        render: (_, record) => (
          <Space size={0}>
            <Can perform="warehouses.update">
              <Button
                type="text"
                aria-label="edit"
                icon={<EditOutlined />}
                onClick={() => openEdit(record.id)}
              />
            </Can>
            <Can perform="warehouses.delete">
              <DeleteWarehouseButton warehouse={record} />
            </Can>
          </Space>
        ),
      },
    ],
    [t, openEdit],
  )

  const handleTableChange: TableProps<Warehouse>['onChange'] = (pag, _filters, sorter) => {
    setPage(pag.current ?? 1, pag.pageSize)
    const single = Array.isArray(sorter) ? sorter[0] : sorter
    if (single?.order && typeof single.field === 'string') {
      setSort(single.field, single.order === 'ascend' ? 'asc' : 'desc')
    } else {
      setSort(undefined, undefined)
    }
  }

  return (
    <Card variant="borderless">
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('warehouse.title')}
        </Typography.Title>

        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('warehouse.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Can perform="warehouses.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('warehouse.create')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Warehouse>
        rowKey="id"
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

      {/* Single modal instance, driven by the Zustand store. */}
      <WarehouseFormModal />
    </Card>
  )
}
