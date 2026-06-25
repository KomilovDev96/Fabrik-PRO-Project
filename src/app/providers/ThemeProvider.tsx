import { useEffect, type ReactNode } from 'react'
import { App as AntApp, ConfigProvider } from 'antd'
import type { Locale } from 'antd/es/locale'
import ruRU from 'antd/locale/ru_RU'
import enUS from 'antd/locale/en_US'
import uzUZ from 'antd/locale/uz_UZ'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import 'dayjs/locale/uz'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/shared/config/theme/themeStore'
import { buildTheme } from '@/shared/config/theme/tokens'
import type { AppLocale } from '@/shared/config/i18n'

const ANTD_LOCALES: Record<AppLocale, Locale> = { ru: ruRU, en: enUS, uz: uzUZ }
const DAYJS_LOCALES: Record<AppLocale, string> = { ru: 'ru', en: 'en', uz: 'uz' }

/**
 * Applies the Ant Design theme (light/dark + brand tokens) and the active locale
 * to the whole tree. Also wraps children in Ant's `App` so `App.useApp()` works
 * (message/notification/modal with correct theme context).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode)
  const { i18n } = useTranslation()
  const locale = (i18n.language as AppLocale) in ANTD_LOCALES ? (i18n.language as AppLocale) : 'ru'

  // Keep dayjs + the document color-scheme in sync with the UI.
  useEffect(() => {
    dayjs.locale(DAYJS_LOCALES[locale])
  }, [locale])

  useEffect(() => {
    document.documentElement.style.colorScheme = mode
    document.documentElement.dataset.theme = mode
  }, [mode])

  return (
    <ConfigProvider theme={buildTheme(mode)} locale={ANTD_LOCALES[locale]}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  )
}
