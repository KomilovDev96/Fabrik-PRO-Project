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
  getIncomeColumns,
  useDeleteIncomes,
  useIncomeStore,
  useIncomes,
  type Income,
} from '@/entities/income'
import { ClientPaymentFormDrawer, IncomeFormDrawer } from '@/features/income-form'
import { DeleteIncomeButton } from '@/features/income-delete'

const ALL_KEYS = ['selection', 'index', 'client', 'cashBox', 'date', 'amount', 'currency', 'paymentMethod', 'comment', 'incomeCategory']

/** Pul kirim (Income) — money in. Two create flows: Daromad puli + Kirim puli. */
export function PulKirimPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { page, pageSize, search, setSearch, setPage, setSort, openIncome, openClientPayment, openEditIncome } =
    useIncomeStore(
      useShallow((s) => ({
        page: s.page,
        pageSize: s.pageSize,
        search: s.search,
        setSearch: s.setSearch,
        setPage: s.setPage,
        setSort: s.setSort,
        openIncome: s.openIncome,
        openClientPayment: s.openClientPayment,
        openEditIncome: s.openEditIncome,
      })),
    )

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_KEYS)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useIncomes({ page, pageSize, search: debouncedSearch })

  const bulkDelete = useDeleteIncomes()
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('income.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('income.orderNo') },
      { key: 'client', label: t('income.client') },
      { key: 'cashBox', label: t('income.cashBox') },
      { key: 'date', label: t('income.date') },
      { key: 'amount', label: t('income.amount') },
      { key: 'currency', label: t('income.currency') },
      { key: 'paymentMethod', label: t('income.paymentMethod') },
      { key: 'comment', label: t('income.comment') },
      { key: 'incomeCategory', label: t('income.category') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<Income>>(() => {
    const orderNo: TableColumnsType<Income>[number] = {
      title: t('income.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    const byKey: Record<string, TableColumnsType<Income>[number]> = {
      index: orderNo,
      ...Object.fromEntries(getIncomeColumns(t).map((c) => [String(c.key), c])),
    }
    const dataColumns = ALL_KEYS.filter((k) => k !== 'selection' && visibleKeys.includes(k) && byKey[k]).map((k) => byKey[k])
    const actions: TableColumnsType<Income>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="finance.update">
            <Button type="text" aria-label="edit" icon={<EditOutlined />} onClick={() => openEditIncome(record.id)} />
          </Can>
          <Can perform="finance.delete">
            <DeleteIncomeButton income={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, page, pageSize, visibleKeys, openEditIncome])

  const rowSelection: TableRowSelection<Income> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<Income>['onChange'] = (pag, _f, sorter) => {
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
          {t('income.title')}
        </Typography.Title>
        <Space wrap>
          <Input.Search allowClear placeholder={t('income.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
          <Can perform="finance.delete">
            <Popconfirm
              title={t('income.deleteSelectedConfirm', { count: selectedCount })}
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
            <Button icon={<PlusOutlined />} onClick={openClientPayment}>
              {t('income.addClientPayment')}
            </Button>
          </Can>
          <Can perform="finance.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openIncome}>
              {t('income.addIncome')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Income>
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

      <IncomeFormDrawer />
      <ClientPaymentFormDrawer />
    </Card>
  )
}
