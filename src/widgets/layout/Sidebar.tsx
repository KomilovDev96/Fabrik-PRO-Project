import { useMemo, useState } from 'react'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAccess } from '@/entities/session'
import { tx } from '@/shared/config/i18n'
import { useThemeStore } from '@/shared/config/theme/themeStore'
import { Logo } from '@/shared/ui/Logo'
import { ALL_NAV_ITEMS, findParentKey, NAV_SECTIONS } from './menuConfig'

type MenuItem = Required<MenuProps>['items'][number]

interface SidebarProps {
  collapsed: boolean
}

/**
 * Permission-aware navigation with collapsible submenus (e.g. "Omborxona").
 * Items the user can't access are hidden; empty submenus/groups disappear.
 */
export function Sidebar({ collapsed }: SidebarProps) {
  const { t } = useTranslation()
  const { can } = useAccess()
  const navigate = useNavigate()
  const location = useLocation()
  const mode = useThemeStore((s) => s.mode)

  const items = useMemo<MenuItem[]>(() => {
    const result: MenuItem[] = []
    for (const section of NAV_SECTIONS) {
      const sectionChildren: MenuItem[] = []
      for (const item of section.items) {
        if (item.children) {
          const visible = item.children.filter((c) => can(c.permission))
          if (visible.length === 0) continue
          sectionChildren.push({
            key: item.key,
            icon: item.icon,
            label: tx(t, item.labelKey),
            children: visible.map((c) => ({ key: c.key, label: tx(t, c.labelKey) })),
          })
        } else {
          if (!can(item.permission)) continue
          sectionChildren.push({ key: item.key, icon: item.icon, label: tx(t, item.labelKey) })
        }
      }
      if (sectionChildren.length > 0) {
        result.push({ key: section.key, type: 'group', label: tx(t, section.titleKey), children: sectionChildren })
      }
    }
    return result
  }, [can, t])

  const selectedKey =
    ALL_NAV_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ?? ''

  // Open the submenu containing the active route on mount (uncontrolled afterwards).
  const [defaultOpenKeys] = useState<string[]>(() => {
    const parent = findParentKey(location.pathname)
    return parent ? [parent] : []
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          gap: 10,
        }}
      >
        <Logo showText={!collapsed} height={30} />
      </div>

      <Menu
        mode="inline"
        theme={mode}
        items={items}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={defaultOpenKeys}
        onClick={({ key }) => navigate(key)}
        style={{ borderInlineEnd: 'none', flex: 1, overflowY: 'auto' }}
      />
    </div>
  )
}
