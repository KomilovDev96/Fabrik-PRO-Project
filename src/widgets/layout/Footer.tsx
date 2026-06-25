import { Layout, theme, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Footer: AntFooter } = Layout

/** App footer: copyright + rights, shown under the routed content. */
export function Footer() {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const year = new Date().getFullYear()

  return (
    <AntFooter
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Typography.Text type="secondary">
        © {year} FabriqPro · {t('app.erp')}
      </Typography.Text>
      <Typography.Text type="secondary">{t('footer.rights')}</Typography.Text>
    </AntFooter>
  )
}
