import { useMemo, useState, type Key } from 'react'
import { App, Button, Card, Flex, Input, Popconfirm, Space, Table, Typography } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import type { TableRowSelection } from 'antd/es/table/interface'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import dayjs from 'dayjs'
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/shared/config/constants'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { Can } from '@/entities/session'
import { useDeleteSupplies, useDeleteSupply, useSupplies, useSupplyStore, type Supply } from '@/entities/supply'
import { SupplyFormDrawer } from '@/features/supply-form'

/** Kirim buyurtmalar (supplies) — incoming purchases with line items. */
export function KirimBuyurtmalarPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, setSearch, setPage, setSort, openCreate } = useSupplyStore(
    useShallow((s) => ({
      page: s.page,
      pageSize: s.pageSize,
      search: s.search,
      setSearch: s.setSearch,
      setPage: s.setPage,
      setSort: s.setSort,
      openCreate: s.openCreate,
    })),
  )

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useSupplies({ page, pageSize, search: debouncedSearch })
  const del = useDeleteSupply()
  const bulkDelete = useDeleteSupplies()

  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('supply.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columns = useMemo<TableColumnsType<Supply>>(
    () => [
      { title: t('supply.orderNo'), key: 'index', width: 64, align: 'center', render: (_v, _r, i) => (page - 1) * pageSize + i + 1 },
      { title: t('supply.supplier'), key: 'supplier', ellipsis: true, render: (_, r) => r.supplier?.title ?? '—' },
      { title: t('supply.warehouse'), key: 'warehouse', ellipsis: true, render: (_, r) => r.warehouse?.title ?? '—' },
      { title: t('supply.currency'), key: 'currency', width: 100, render: (_, r) => r.currency?.title ?? '—' },
      { title: t('supply.overallPrice'), dataIndex: 'overallPrice', key: 'overallPrice', width: 150, align: 'right', render: (v: number) => Number(v ?? 0).toLocaleString() },
      { title: t('supply.date'), dataIndex: 'date', key: 'date', width: 130, render: (v?: string) => (v && dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : '—') },
      {
        title: t('common.actions'),
        key: 'actions',
        width: 80,
        fixed: 'right',
        align: 'center',
        render: (_, r) => (
          <Can perform="orders.delete">
            <Popconfirm
              title={t('common.deleteConfirm', { name: `#${r.id}` })}
              okText={t('common.yes')}
              cancelText={t('common.no')}
              okButtonProps={{ danger: true, loading: del.isPending }}
              onConfirm={() => del.mutate(r.id, { onSuccess: () => message.success(t('supply.deletedSuccess')), onError: (e) => message.error(e.message) })}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Can>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, page, pageSize, del.isPending],
  )

  const rowSelection: TableRowSelection<Supply> = { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }

  const handleTableChange: TableProps<Supply>['onChange'] = (pag, _f, sorter) => {
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
          {t('supply.title')}
        </Typography.Title>
        <Space wrap>
          <Input.Search allowClear placeholder={t('supply.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} />
          <Can perform="orders.delete">
            <Popconfirm
              title={t('supply.deleteSelectedConfirm', { count: selectedCount })}
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
          <Can perform="orders.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('supply.create')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Supply>
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

      <SupplyFormDrawer />
    </Card>
  )
}
