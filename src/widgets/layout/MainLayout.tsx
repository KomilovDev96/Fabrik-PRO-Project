import { useState } from 'react'
import { Grid, Layout, theme } from 'antd'
import { Outlet } from 'react-router-dom'
import { STORAGE_KEYS } from '@/shared/config/constants'
import { useThemeStore } from '@/shared/config/theme/themeStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'

const { Sider, Content } = Layout

function readCollapsed(): boolean {
  return localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === '1'
}

/** Authenticated app shell: collapsible sider + header + routed content (Outlet). */
export function MainLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const mode = useThemeStore((s) => s.mode)
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()

  const toggle = () =>
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, next ? '1' : '0')
      return next
    })

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme={mode}
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={260}
        breakpoint="lg"
        collapsedWidth={screens.sm ? 80 : 0}
        onBreakpoint={(broken) => setCollapsed(broken)}
        style={{ borderInlineEnd: `1px solid ${token.colorBorderSecondary}` }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      <Layout>
        <Header collapsed={collapsed} onToggle={toggle} />
        <Content style={{ margin: 16, minHeight: 0 }}>
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </Layout>
  )
}
