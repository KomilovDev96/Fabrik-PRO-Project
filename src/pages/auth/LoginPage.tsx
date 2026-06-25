import { Alert, App, Button, Col, Flex, Form, Grid, Input, Row, theme, Typography } from 'antd'
import { LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLogin, type LoginCredentials } from '@/entities/session'
import { LangSwitch } from '@/features/lang-switch'
import { ThemeSwitch } from '@/features/theme-switch'
import { LottiePlayer } from '@/shared/ui/LottiePlayer'
import { Logo } from '@/shared/ui/Logo'

interface LocationState {
  from?: { pathname?: string }
}

/**
 * Two-column sign-in screen:
 *   left  → Lottie animation (decorative),
 *   right → login form, wired to the real backend
 *           (POST /User/Login/login → token → GET /User/GetMe/me → session).
 */
export function LoginPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/dashboard'

  const onFinish = (values: LoginCredentials) => {
    login.mutate(values, { onSuccess: () => navigate(redirectTo, { replace: true }) })
  }

  return (
    <Row style={{ minHeight: '100vh' }}>
      {/* Left — animation (only on large screens / desktop & landscape tablets) */}
      {screens.lg && (
        <Col
          lg={12}
          style={{
            background: `${token.colorPrimary}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
          }}
        >
          <LottiePlayer src="/lottie/login.json" style={{ width: '100%', maxWidth: 520 }} />
        </Col>
      )}

      {/* Right — form */}
      <Col
        xs={24}
        lg={12}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: token.colorBgContainer,
        }}
      >
        <Flex gap={4} style={{ position: 'absolute', top: 20, right: 24 }}>
          <LangSwitch />
          <ThemeSwitch />
        </Flex>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <Flex vertical align="center" gap={10} style={{ marginBottom: 28 }}>
            <Logo height={48} />
            <Typography.Text type="secondary">{t('auth.dashboard')}</Typography.Text>
          </Flex>

          {login.isError && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message={login.error?.message ?? t('auth.failed')}
            />
          )}

          <Form<LoginCredentials> layout="vertical" requiredMark={false} onFinish={onFinish}>
            <Form.Item name="login" label={t('auth.phone')} rules={[{ required: true }]}>
              <Input prefix={<PhoneOutlined />} size="large" autoComplete="username" />
            </Form.Item>

            <Form.Item name="password" label={t('auth.password')} rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} size="large" autoComplete="current-password" />
            </Form.Item>

            <Flex justify="flex-end" style={{ marginBottom: 16 }}>
              <Typography.Link onClick={() => message.info(t('auth.forgotHint'))}>
                {t('auth.forgot')}
              </Typography.Link>
            </Flex>

            <Button type="primary" htmlType="submit" size="large" block loading={login.isPending}>
              {t('auth.signIn')}
            </Button>
          </Form>
        </div>
      </Col>
    </Row>
  )
}
