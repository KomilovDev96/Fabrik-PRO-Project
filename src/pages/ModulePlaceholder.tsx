import { Empty, Typography } from 'antd'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tx } from '@/shared/config/i18n'
import { ALL_NAV_ITEMS } from '@/widgets/layout'

/**
 * Generic page for modules that share the warehouses blueprint but aren't built
 * yet. Every module route points here until its own `pages/<module>` is written.
 */
export function ModulePlaceholder() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const item = ALL_NAV_ITEMS.find((nav) => pathname.startsWith(nav.key))
  const title = item ? tx(t, item.labelKey) : t('common.noData')

  return (
    <>
      <Typography.Title level={3}>{title}</Typography.Title>
      <Empty
        description={`${title}: модуль в разработке — повторите архитектуру модуля «Склады».`}
        style={{ marginTop: 64 }}
      />
    </>
  )
}
