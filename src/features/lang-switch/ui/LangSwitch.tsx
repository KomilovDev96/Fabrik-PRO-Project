import { Button, Dropdown, Grid } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { LOCALE_LABELS, SUPPORTED_LOCALES, type AppLocale } from '@/shared/config/i18n'

/** Language picker. Persists the choice via i18next's localStorage detector. */
export function LangSwitch() {
  const { i18n } = useTranslation()
  const screens = Grid.useBreakpoint()
  const current = i18n.language as AppLocale

  const items = SUPPORTED_LOCALES.map((locale) => ({
    key: locale,
    label: LOCALE_LABELS[locale],
  }))

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: [current],
        onClick: ({ key }) => void i18n.changeLanguage(key),
      }}
      trigger={['click']}
    >
      <Button type="text" icon={<GlobalOutlined />}>
        {screens.sm ? (LOCALE_LABELS[current] ?? current) : null}
      </Button>
    </Dropdown>
  )
}
