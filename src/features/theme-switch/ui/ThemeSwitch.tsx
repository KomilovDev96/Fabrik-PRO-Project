import { Button, Tooltip } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/shared/config/theme/themeStore'

/** Toggles the global light/dark theme. */
export function ThemeSwitch() {
  const { t } = useTranslation()
  const mode = useThemeStore((s) => s.mode)
  const toggle = useThemeStore((s) => s.toggle)
  const isDark = mode === 'dark'

  return (
    <Tooltip title={isDark ? t('theme.light') : t('theme.dark')}>
      <Button
        type="text"
        shape="circle"
        aria-label="toggle-theme"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggle}
      />
    </Tooltip>
  )
}
