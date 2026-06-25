import { useMemo, useState } from 'react'
import { Button, Checkbox, Dropdown, Empty, Flex, Input, theme } from 'antd'
import { ControlOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

export interface ColumnOption {
  key: string
  label: string
}

interface ColumnSettingsProps {
  /** All toggleable columns, in display order. */
  options: ColumnOption[]
  /** Keys currently visible. */
  value: string[]
  onChange: (keys: string[]) => void
}

/**
 * Gear dropdown that toggles table column visibility, with a quick text filter.
 * Generic + theme-aware — reusable by any list page (clients, warehouses, …).
 */
export function ColumnSettings({ options, value, onChange }: ColumnSettingsProps) {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  const toggle = (key: string, checked: boolean) => {
    // Keep the original column order regardless of toggle sequence.
    onChange(checked ? options.filter((o) => value.includes(o.key) || o.key === key).map((o) => o.key)
                     : value.filter((k) => k !== key))
  }

  const panel = (
    <div
      style={{
        width: 240,
        padding: 8,
        background: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
      }}
    >
      <Input
        size="small"
        allowClear
        placeholder={t('common.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      {filtered.length ? (
        <Flex vertical gap={8} style={{ maxHeight: 280, overflowY: 'auto' }}>
          {filtered.map((o) => (
            <Checkbox
              key={o.key}
              checked={value.includes(o.key)}
              onChange={(e) => toggle(o.key, e.target.checked)}
            >
              {o.label}
            </Checkbox>
          ))}
        </Flex>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.noData')} />
      )}
    </div>
  )

  return (
    <Dropdown trigger={['click']} placement="bottomRight" popupRender={() => panel}>
      <Button icon={<ControlOutlined />} aria-label={t('common.columns')} title={t('common.columns')} />
    </Dropdown>
  )
}
