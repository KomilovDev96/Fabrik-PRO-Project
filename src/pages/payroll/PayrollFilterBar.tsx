import { useState } from 'react'
import { Button, Card, DatePicker, Flex, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useUserOptions } from '@/entities/user'
import { LEDGER_STORES, type LedgerFilters, type PayrollKind } from '@/entities/payroll'

interface Props {
  kind: PayrollKind
}

/**
 * Payroll filter bar — employee + work-month range ("Oylik olgan vaqti dan/gacha"),
 * with Tozalash (clear) / Saqlash (apply). Local draft, commits to the store on apply.
 */
export function PayrollFilterBar({ kind }: Props) {
  const { t } = useTranslation()
  const useStore = LEDGER_STORES[kind]
  const setFilters = useStore((s) => s.setFilters)
  const clearFilters = useStore((s) => s.clearFilters)

  const { data: userOptions = [] } = useUserOptions()

  const [userId, setUserId] = useState<number>()
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)

  const apply = () => {
    const next: LedgerFilters = {
      userId,
      forDateStart: range?.[0] ? range[0].startOf('month').format('YYYY-MM-DD') : undefined,
      forDateEnd: range?.[1] ? range[1].endOf('month').format('YYYY-MM-DD') : undefined,
    }
    setFilters(next)
  }

  const clear = () => {
    setUserId(undefined)
    setRange(null)
    clearFilters()
  }

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Flex wrap gap={12} align="flex-end">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('payroll.employee')}
          options={userOptions}
          value={userId}
          onChange={setUserId}
          style={{ minWidth: 220 }}
        />
        <DatePicker.RangePicker
          picker="month"
          value={range ?? undefined}
          onChange={(v) => setRange(v as [Dayjs | null, Dayjs | null] | null)}
          placeholder={[t('payroll.periodFrom'), t('payroll.periodTo')]}
        />
        <Flex gap={8} style={{ marginLeft: 'auto' }}>
          <Button onClick={clear}>{t('payroll.clearFilters')}</Button>
          <Button type="primary" onClick={apply}>
            {t('payroll.applyFilters')}
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}
