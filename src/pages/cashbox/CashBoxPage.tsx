import { useMemo } from 'react'
import { Button, Card, Flex, Input, Space, Table, Tooltip, Typography } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/shared/config/constants'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { Can } from '@/entities/session'
import { getCashBoxColumns, useCashBoxStore, useCashBoxes, type CashBox } from '@/entities/cashbox'
import { CashBoxFormDrawer } from '@/features/cashbox-form'
import { DeleteCashBoxButton } from '@/features/cashbox-delete'

/**
 * Currencies shown as balance columns in the design. The admin API does NOT expose
 * cash-box balances (no balance field anywhere in the spec — they'd be aggregated
 * from finance movements), so these render as "—" placeholders until a balance
 * source exists. Kept to preserve the designed layout.
 */
const BALANCE_CURRENCIES = ['USD', 'UZS', 'RUB', 'CNY'] as const

/**
 * Cash boxes (Kassalar) screen — wired to GET/POST/PATCH/DELETE /admin/cash-boxes.
 * Server state = React Query (useCashBoxes) · UI state = Zustand (search/paging/drawer).
 */
export function CashBoxPage() {
  const { t } = useTranslation()

  const { page, pageSize, search, sortBy, sortOrder, setSearch, setPage, setSort, openCreate, openEdit } =
    useCashBoxStore(
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

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isFetching } = useCashBoxes({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  })

  const columns = useMemo<TableColumnsType<CashBox>>(() => {
    const orderNo: TableColumnsType<CashBox>[number] = {
      title: t('cashbox.orderNo'),
      key: 'index',
      width: 64,
      align: 'center',
      render: (_v, _r, i) => (page - 1) * pageSize + i + 1,
    }
    // Balance columns have no backing API data yet — render muted placeholders.
    const balanceColumns: TableColumnsType<CashBox> = BALANCE_CURRENCIES.map((cur) => ({
      title: `${t('cashbox.balance')} (${cur})`,
      key: `balance_${cur}`,
      align: 'right',
      width: 150,
      responsive: cur === 'USD' || cur === 'UZS' ? ['sm'] : ['lg'],
      render: () => (
        <Tooltip title={t('cashbox.balanceNotAvailable')}>
          <Typography.Text type="secondary">—</Typography.Text>
        </Tooltip>
      ),
    }))
    const actions: TableColumnsType<CashBox>[number] = {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Can perform="cashbox.update">
            <Button
              type="text"
              aria-label="edit"
              icon={<EditOutlined />}
              onClick={() => openEdit(record.id)}
            />
          </Can>
          <Can perform="cashbox.delete">
            <DeleteCashBoxButton cashbox={record} />
          </Can>
        </Space>
      ),
    }
    return [orderNo, ...getCashBoxColumns(t), ...balanceColumns, actions]
  }, [t, page, pageSize, openEdit])

  const handleTableChange: TableProps<CashBox>['onChange'] = (pag, _filters, sorter) => {
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
          {t('cashbox.title')}
        </Typography.Title>

        <Space wrap>
          <Input.Search
            allowClear
            placeholder={t('cashbox.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Can perform="cashbox.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('cashbox.create')}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<CashBox>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        onChange={handleTableChange}
        scroll={{ x: 1100 }}
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
      <CashBoxFormDrawer />
    </Card>
  )
}
