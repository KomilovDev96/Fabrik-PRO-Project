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
  getOutcomeColumns,
  useDeleteOutcomes,
  useOutcomeStore,
  useOutcomes,
  type Outcome,
} from '@/entities/outcome'
import { OutcomeFormDrawer, SupplierPaymentFormDrawer } from '@/features/outcome-form'
import { DeleteOutcomeButton } from '@/features/outcome-delete'

const ALL_KEYS = ['selection', 'index', 'supplier', 'cashBox', 'date', 'amount', 'currency', 'paymentMethod', 'comment', 'outcomeCategory']

/** Pul chiqim (Outcome) — money out. Two create flows: Xarajat puli + Chiqim puli. */
export function PulChiqimPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, setSearch, setPage, setSort, openOutcome, openSupplierPayment, openEditOutcome } =
    useOutcomeStore(
      useShallow((s) => ({
        page: s.page,
        pageSize: s.pageSize,
        search: s.search,
        setSearch: s.setSearch,
        setPage: s.setPage,
        setSort: s.setSort,
        openOutcome: s.openOutcome,
        openSupplierPayment: s.openSupplierPayment,
        openEditOutcome: s.openEditOutcome,
      })),
    )

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_KEYS)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useOutcomes({ page, pageSize, search: debouncedSearch })

  const bulkDelete = useDeleteOutcomes()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('outcome.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('outcome.orderNo') },
      { key: 'supplier', label: t('outcome.supplier') },
      { key: 'cashBox', label: t('outcome.cashBox') },
      { key: 'date', label: t('outcome.date') },
      { key: 'amount', label: t('outcome.amount') },
      { key: 'currency', label: t('outcome.currency') },
      { key: 'paymentMethod', label: t('outcome.paymentMethod') },
      { key: 'comment', label: t('outcome.comment') },
      { key: 'outcomeCategory', label: t('outcome.category') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<Outcome>>(() => {
    const orderNo: TableColumnsType<Outcome>[number] = {
      title: t('outcome.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    const byKey: Record<string, TableColumnsType<Outcome>[number]> = {
      index: orderNo,
      ...Object.fromEntries(getOutcomeColumns(t).map((c) => [String(c.key), c])),
    }
    const dataColumns = ALL_KEYS.filter((k) => k !== 'selection' && visibleKeys.includes(k) && byKey[k]).map((k) => byKey[k])
    const actions: TableColumnsType<Outcome>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="finance.update">
            <Button type="text" aria-label="edit" icon={<EditOutlined />} onClick={() => openEditOutcome(record.id)} />
          </Can>
          <Can perform="finance.delete">
            <DeleteOutcomeButton outcome={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, page, pageSize, visibleKeys, openEditOutcome])

  const rowSelection: TableRowSelection<Outcome> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<Outcome>['onChange'] = (pag, _f, sorter) => {
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
          {t('outcome.title')}
        </Typography.Title>
        <Space wrap>
          <Input.Search allowClear placeholder={t('outcome.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
          <Can perform="finance.delete">
            <Popconfirm
              title={t('outcome.deleteSelectedConfirm', { count: selectedCount })}
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
          <Can perform="finance.create">
            <Button icon={<PlusOutlined />} onClick={openSupplierPayment}>
              {t('outcome.addSupplierPayment')}
            </Button>
          </Can>
          <Can perform="finance.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openOutcome}>
              {t('outcome.addOutcome')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Outcome>
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

      <OutcomeFormDrawer />
      <SupplierPaymentFormDrawer />
    </Card>
  )
}
