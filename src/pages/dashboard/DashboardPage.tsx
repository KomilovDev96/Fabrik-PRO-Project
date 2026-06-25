import { Card, Col, Row, Statistic, Typography } from 'antd'
import {
  InboxOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

/** Lightweight dashboard with KPI cards. Replace the static values with queries. */
export function DashboardPage() {
  const { t } = useTranslation()

  const stats = [
    { title: t('menu.warehouses'), value: 12, icon: <InboxOutlined /> },
    { title: t('menu.orders'), value: 348, icon: <ShoppingCartOutlined /> },
    { title: t('menu.employees'), value: 76, icon: <TeamOutlined /> },
    { title: t('menu.sales'), value: '₴ 1.2M', icon: <RiseOutlined /> },
  ]

  return (
    <>
      <Typography.Title level={3}>{t('menu.dashboard')}</Typography.Title>
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col key={s.title} xs={24} sm={12} xl={6}>
            <Card variant="borderless">
              <Statistic title={s.title} value={s.value} prefix={s.icon} />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
