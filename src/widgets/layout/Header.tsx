import { Avatar, Button, Dropdown, Grid, Layout, Space, theme } from 'antd'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ThemeSwitch } from '@/features/theme-switch'
import { LangSwitch } from '@/features/lang-switch'
import { useSessionStore } from '@/entities/session'

const { Header: AntHeader } = Layout

interface HeaderProps {
  collapsed: boolean
  onToggle: () => void
}

/** Top bar: sidebar toggle + language / theme switches + user menu. */
export function Header({ collapsed, onToggle }: HeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const user = useSessionStore((s) => s.user)
  const clearSession = useSessionStore((s) => s.clearSession)

  const onLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Button
        type="text"
        aria-label="toggle-sidebar"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
      />

      <Space size="middle">
        <LangSwitch />
        <ThemeSwitch />
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: t('auth.logout'),
                onClick: onLogout,
              },
            ],
          }}
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" src={user?.avatarUrl} icon={<UserOutlined />} />
            {screens.md && (
              <span
                style={{
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.fullName ?? 'User'}
              </span>
            )}
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}
