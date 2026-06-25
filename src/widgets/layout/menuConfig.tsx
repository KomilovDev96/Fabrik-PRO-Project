import type { ReactNode } from 'react'
import {
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  DashboardOutlined,
  DollarOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { Permission } from '@/shared/lib/rbac'

/** Routes (paths) for every module. Single source of truth shared by menu + router. */
export const ROUTES = {
  dashboard: '/dashboard',
  analytics: '/analytics',
  warehouses: '/warehouses',
  rawMaterials: '/raw-materials',
  products: '/products',
  categories: '/categories',
  accessories: '/accessories',
  spareParts: '/spare-parts',
  tools: '/tools',
  clients: '/clients',
  suppliers: '/suppliers',
  sales: '/sales',
  orders: '/orders',
  employees: '/employees',
  salary: '/salary',
  finance: '/finance',
  cashbox: '/cashbox',
  settings: '/settings',
  roles: '/roles',
  notifications: '/notifications',
} as const

/** A clickable menu item that maps to a route. */
export interface NavLeaf {
  key: string
  labelKey: string
  permission: Permission
  icon?: ReactNode
}

/** A top-level menu item: either a leaf or a parent with `children` (a submenu). */
export interface NavNode extends NavLeaf {
  children?: NavLeaf[]
}

export interface NavSection {
  key: string
  titleKey: string
  items: NavNode[]
}

/**
 * Declarative menu. The Sidebar renders this and filters by permission.
 * A node with `children` becomes a collapsible submenu (e.g. "Omborxona").
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    key: 'dashboards',
    titleKey: 'menu.groups.dashboards',
    items: [
      { key: ROUTES.dashboard, labelKey: 'menu.dashboard', icon: <DashboardOutlined />, permission: 'dashboard.view' },
      { key: ROUTES.analytics, labelKey: 'menu.analytics', icon: <BarChartOutlined />, permission: 'analytics.view' },
    ],
  },
  {
    key: 'modules',
    titleKey: 'menu.groups.modules',
    items: [
      {
        key: 'omborxona',
        labelKey: 'menu.omborxona',
        icon: <ShopOutlined />,
        permission: 'warehouses.view',
        children: [
          { key: ROUTES.warehouses, labelKey: 'menu.warehouses', permission: 'warehouses.view' },
          { key: ROUTES.rawMaterials, labelKey: 'menu.rawMaterials', permission: 'rawMaterials.view' },
          { key: ROUTES.accessories, labelKey: 'menu.accessories', permission: 'accessories.view' },
          { key: ROUTES.spareParts, labelKey: 'menu.spareParts', permission: 'spareParts.view' },
          { key: ROUTES.tools, labelKey: 'menu.tools', permission: 'tools.view' },
        ],
      },
      { key: ROUTES.products, labelKey: 'menu.products', icon: <AppstoreOutlined />, permission: 'products.view' },
      { key: ROUTES.clients, labelKey: 'menu.clients', icon: <UserOutlined />, permission: 'clients.view' },
      { key: ROUTES.suppliers, labelKey: 'menu.suppliers', icon: <TruckOutlined />, permission: 'suppliers.view' },
      { key: ROUTES.sales, labelKey: 'menu.sales', icon: <ShoppingOutlined />, permission: 'sales.view' },
      { key: ROUTES.orders, labelKey: 'menu.orders', icon: <ShoppingCartOutlined />, permission: 'orders.view' },
      { key: ROUTES.employees, labelKey: 'menu.employees', icon: <TeamOutlined />, permission: 'employees.view' },
      { key: ROUTES.salary, labelKey: 'menu.salary', icon: <WalletOutlined />, permission: 'salary.view' },
      { key: ROUTES.finance, labelKey: 'menu.finance', icon: <DollarOutlined />, permission: 'finance.view' },
      { key: ROUTES.cashbox, labelKey: 'menu.cashbox', icon: <BankOutlined />, permission: 'cashbox.view' },
      { key: ROUTES.settings, labelKey: 'menu.settings', icon: <SettingOutlined />, permission: 'settings.view' },
      { key: ROUTES.roles, labelKey: 'menu.roles', icon: <SafetyOutlined />, permission: 'roles.view' },
      { key: ROUTES.notifications, labelKey: 'menu.notifications', icon: <BellOutlined />, permission: 'notifications.view' },
    ],
  },
]

/** Flat list of every routable leaf — used to generate routes and resolve the active item. */
export const ALL_NAV_ITEMS: NavLeaf[] = NAV_SECTIONS.flatMap((s) =>
  s.items.flatMap((item) => (item.children ? item.children : [item])),
)

/** Find the parent submenu key for a given route (for default-open state). */
export function findParentKey(pathname: string): string | undefined {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.children?.some((c) => pathname.startsWith(c.key))) return item.key
    }
  }
  return undefined
}
