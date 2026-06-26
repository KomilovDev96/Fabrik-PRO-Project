import { useMemo, useState, type Key } from 'react'
import { App, Button, Card, Flex, Input, Popconfirm, Space, Table, Typography } from 'antd'
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
  LEDGER_STORES,
  getPayrollColumns,
  useDeletePayrolls,
  usePayrollList,
  type PayrollEntry,
  type PayrollKind,
} from '@/entities/payroll'
import { PayrollFormDrawer } from '@/features/payroll-form'
import { DeletePayrollButton } from '@/features/payroll-delete'
import { PayrollFilterBar } from './PayrollFilterBar'

/** Toggleable column keys in design order. The API covers every column (no placeholders). */
const ALL_COLUMN_KEYS = ['selection', 'index', 'user', 'forDate', 'date', 'amount', 'comment']

interface Props {
  kind: PayrollKind
}

/**
 * Generic ledger screen for the four Maosh sub-pages (Oylik/Avans/Jarima/Bonus).
 * Identical layout; only `kind` selects the REST resource, store, and title.
 */
export function PayrollLedgerPage({ kind }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const useStore = LEDGER_STORES[kind]

  const { page, pageSize, search, filters, setSearch, setPage, setSort, openCreate, openEdit } =
    useStore(
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
  const { data, isLoading, isFetching } = usePayrollList(kind, {
    page,
    pageSize,
    search: debouncedSearch,
    ...filters,
  })

  const bulkDelete = useDeletePayrolls(kind)
  const onBulkDelete = () =>
    bulkDelete.mutate(selectedRowKeys as number[], {
      onSuccess: () => {
        message.success(t('payroll.deletedSuccess'))
        setSelectedRowKeys([])
      },
      onError: (e) => message.error(e.message),
    })

  const columnOptions = useMemo<ColumnOption[]>(
    () => [
      { key: 'selection', label: t('common.selectColumn') },
      { key: 'index', label: t('payroll.orderNo') },
      { key: 'user', label: t('payroll.employee') },
      { key: 'forDate', label: t('payroll.workMonth') },
      { key: 'date', label: t('payroll.givenDate') },
      { key: 'amount', label: t('payroll.amount') },
      { key: 'comment', label: t('payroll.comment') },
    ],
    [t],
  )

  const columns = useMemo<TableColumnsType<PayrollEntry>>(() => {
    const orderNo: TableColumnsType<PayrollEntry>[number] = {
      title: t('payroll.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    const byKey: Record<string, TableColumnsType<PayrollEntry>[number]> = {
      index: orderNo,
      ...Object.fromEntries(getPayrollColumns(t).map((c) => [String(c.key), c])),
    }
    const dataColumns = ALL_COLUMN_KEYS.filter(
      (k) => k !== 'selection' && visibleKeys.includes(k) && byKey[k],
    ).map((k) => byKey[k])

    const actions: TableColumnsType<PayrollEntry>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="salary.update">
            <Button
              type="text"
              aria-label="edit"
              icon={<EditOutlined />}
              onClick={() => openEdit(record.id)}
            />
          </Can>
          <Can perform="salary.delete">
            <DeletePayrollButton kind={kind} entry={record} />
          </Can>
        </Space>
      ),
    }
    return [...dataColumns, actions]
  }, [t, kind, page, pageSize, visibleKeys, openEdit])

  const rowSelection: TableRowSelection<PayrollEntry> | undefined = visibleKeys.includes('selection')
    ? { selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }
    : undefined

  const handleTableChange: TableProps<PayrollEntry>['onChange'] = (pag, _filters, sorter) => {
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
          {t(`payroll.titles.${kind}`)}
        </Typography.Title>

        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('payroll.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Can perform="salary.delete">
            <Popconfirm
              title={t('payroll.deleteSelectedConfirm', { count: selectedCount })}
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
            {t('payroll.filter')}
          </Button>
          <ColumnSettings options={columnOptions} value={visibleKeys} onChange={setVisibleKeys} />
          <Can perform="salary.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('payroll.add')}
            </Button>
          </Can>
        </Space>
      </Flex>

      {filtersOpen && <PayrollFilterBar kind={kind} />}

      <Table<PayrollEntry>
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

      <PayrollFormDrawer kind={kind} />
    </Card>
  )
}
