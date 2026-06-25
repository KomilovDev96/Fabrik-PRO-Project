import { useState } from 'react'
import { Button, Card, DatePicker, Flex, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useClientOptions } from '@/entities/client'
import { useWarehouseOptions } from '@/entities/warehouse'
import { ORDER_STATUSES, useOrderStore, type OrderFilters, type OrderStatus } from '@/entities/order'

/**
 * Sales filter bar — matches the design: document date range, status, warehouse,
 * client, plus Tozalash (clear) / Saqlash (apply). Holds a local draft and only
 * commits to the store (→ the query) on "Saqlash", so the table doesn't refetch
 * on every keystroke.
 */
export function OrderFilterBar() {
  const { t } = useTranslation()
  const setFilters = useOrderStore((s) => s.setFilters)
  const clearFilters = useOrderStore((s) => s.clearFilters)

  const { data: warehouseOptions = [] } = useWarehouseOptions()
  const { data: clientOptions = [] } = useClientOptions()

  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [status, setStatus] = useState<OrderStatus>()
  const [warehouseId, setWarehouseId] = useState<number>()
  const [clientId, setClientId] = useState<number>()

  const statusOptions = ORDER_STATUSES.map((s) => ({ value: s, label: t(`order.statuses.${s}`) }))

  const apply = () => {
    const next: OrderFilters = {
      status,
      warehouseId,
      clientId,
      createdStart: range?.[0] ? range[0].startOf('day').toISOString() : undefined,
      createdEnd: range?.[1] ? range[1].endOf('day').toISOString() : undefined,
    }
    setFilters(next)
  }

  const clear = () => {
    setRange(null)
    setStatus(undefined)
    setWarehouseId(undefined)
    setClientId(undefined)
    clearFilters()
  }

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Flex wrap gap={12} align="flex-end">
        <DatePicker.RangePicker
          value={range ?? undefined}
          onChange={(v) => setRange(v as [Dayjs | null, Dayjs | null] | null)}
          placeholder={[t('order.dateFrom'), t('order.dateTo')]}
        />
        <Select
          allowClear
          placeholder={t('order.status')}
          options={statusOptions}
          value={status}
          onChange={setStatus}
          style={{ minWidth: 150 }}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('order.warehouse')}
          options={warehouseOptions}
          value={warehouseId}
          onChange={setWarehouseId}
          style={{ minWidth: 170 }}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('order.client')}
          options={clientOptions}
          value={clientId}
          onChange={setClientId}
          style={{ minWidth: 190 }}
        />
        <Flex gap={8} style={{ marginLeft: 'auto' }}>
          <Button onClick={clear}>{t('order.clearFilters')}</Button>
          <Button type="primary" onClick={apply}>
            {t('order.applyFilters')}
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}
