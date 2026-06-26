import { useMemo, useState } from 'react'
import { Card, Table, Tabs, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { httpClient } from '@/shared/api'
import { PAGE_SIZE_OPTIONS } from '@/shared/config/constants'

interface Row {
  id: number
  [key: string]: unknown
}

const fmtDate = (v?: unknown) => (typeof v === 'string' && dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : '—')
const txt = (v?: unknown) => (v == null || v === '' ? '—' : String(v))
const num = (v?: unknown) => (v == null ? '—' : Number(v).toLocaleString())

/** Read-only payments list for one resource (client / supplier / salary payments). */
function PaymentsList({ queryKey, resource, columns }: { queryKey: string; resource: string; columns: TableColumnsType<Row> }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tolovlar', queryKey, page, pageSize],
    queryFn: async () => {
      const res = await httpClient.get(resource, { params: { Page: page, Limit: pageSize } })
      const body = res.data as Row[] | { data?: Row[]; items?: Row[]; result?: Row[] }
      const items = Array.isArray(body) ? body : (body.data ?? body.items ?? body.result ?? [])
      const header = Number(res.headers['x-total-count'])
      const total = Number.isFinite(header) ? header : items.length < pageSize ? (page - 1) * pageSize + items.length : page * pageSize + 1
      return { items, total }
    },
    placeholderData: keepPreviousData,
  })
  return (
    <Table<Row>
      rowKey="id"
      columns={columns}
      dataSource={data?.items ?? []}
      loading={isLoading || isFetching}
      scroll={{ x: 900 }}
      pagination={{
        current: page,
        pageSize,
        total: data?.total ?? 0,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        onChange: (p, ps) => {
          setPage(p)
          setPageSize(ps)
        },
      }}
    />
  )
}

/** To'lovlar — read-only view of all payment movements (created in Moliya / Maosh). */
export function TolovlarPage() {
  const { t } = useTranslation()

  const items = useMemo(() => {
    const amount = { title: t('tolovlar.amount'), dataIndex: 'amount', key: 'amount', align: 'right' as const, render: num }
    const cashBox = { title: t('tolovlar.cashBox'), dataIndex: 'cashBox', key: 'cashBox', render: txt }
    const currency = { title: t('tolovlar.currency'), dataIndex: 'currency', key: 'currency', render: txt }
    const date = { title: t('tolovlar.date'), dataIndex: 'date', key: 'date', render: fmtDate }
    const comment = { title: t('tolovlar.comment'), dataIndex: 'comment', key: 'comment', ellipsis: true, render: txt }
    return [
      {
        key: 'client',
        label: t('tolovlar.tabs.client'),
        children: (
          <PaymentsList
            queryKey="client"
            resource="/admin/client-payments"
            columns={[
              { title: t('tolovlar.client'), dataIndex: 'client', key: 'client', render: txt },
              { title: t('tolovlar.order'), dataIndex: 'orderId', key: 'orderId', render: (v) => (v ? `#${v}` : '—') },
              cashBox,
              amount,
              currency,
              date,
              comment,
            ]}
          />
        ),
      },
      {
        key: 'supplier',
        label: t('tolovlar.tabs.supplier'),
        children: (
          <PaymentsList
            queryKey="supplier"
            resource="/admin/supplier-payments"
            columns={[
              { title: t('tolovlar.supplier'), dataIndex: 'supplier', key: 'supplier', render: txt },
              cashBox,
              amount,
              currency,
              date,
              comment,
            ]}
          />
        ),
      },
      {
        key: 'salary',
        label: t('tolovlar.tabs.salary'),
        children: (
          <PaymentsList
            queryKey="salary"
            resource="/admin/salary-payments"
            columns={[
              { title: t('tolovlar.employee'), dataIndex: 'user', key: 'user', render: (v) => (v && typeof v === 'object' ? txt((v as { fullName?: string }).fullName) : txt(v)) },
              { title: t('tolovlar.forDate'), dataIndex: 'forDate', key: 'forDate', render: fmtDate },
              amount,
              date,
              comment,
            ]}
          />
        ),
      },
    ]
  }, [t])

  return (
    <Card variant="borderless">
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        {t('tolovlar.title')}
      </Typography.Title>
      <Tabs items={items} />
    </Card>
  )
}
