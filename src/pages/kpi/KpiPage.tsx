import { Card, Empty, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

/** KPI sozlamalari — no backend API exists for this yet. */
export function KpiPage() {
  const { t } = useTranslation()
  return (
    <Card variant="borderless">
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 24 }}>
        {t('kpi.title')}
      </Typography.Title>
      <Empty description={t('kpi.noApi')} style={{ padding: 48 }} />
    </Card>
  )
}
