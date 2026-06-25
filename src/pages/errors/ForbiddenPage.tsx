import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function ForbiddenPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Result
      status="403"
      title="403"
      subTitle={t('errors.forbidden')}
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          {t('errors.backHome')}
        </Button>
      }
    />
  )
}
