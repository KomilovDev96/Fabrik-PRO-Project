import { useMemo } from 'react'
import { Card, Tabs, Typography } from 'antd'
import {
  BgColorsOutlined,
  ColumnHeightOutlined,
  DollarOutlined,
  PartitionOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { AccountTab } from './AccountTab'
import { ReferenceManager } from './ReferenceManager'

/**
 * Sozlamalar — a single tabbed settings page (per design):
 *   Account · Ranglar · To'lov · Valyuta · Mahsulot kategoriyalari
 */
export function SettingsPage() {
  const { t } = useTranslation()

  const items = useMemo(
    () => [
      {
        key: 'account',
        label: (
          <span>
            <UserOutlined /> {t('settings.tabs.account')}
          </span>
        ),
        children: <AccountTab />,
      },
      {
        key: 'colors',
        label: (
          <span>
            <BgColorsOutlined /> {t('settings.tabs.colors')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="colors"
            resource="/admin/colors"
            orgScoped
            addLabel={t('settings.addColor')}
            columns={[
              { key: 'title', title: t('settings.colorName') },
              { key: 'colorCode', title: t('settings.colorCode'), color: true },
            ]}
            fields={[
              { name: 'title', label: t('settings.colorName'), required: true },
              { name: 'colorCode', label: t('settings.colorCode'), required: true },
            ]}
          />
        ),
      },
      {
        key: 'payment-methods',
        label: (
          <span>
            <WalletOutlined /> {t('settings.tabs.payment')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="payment-methods"
            resource="/admin/payment-methods"
            orgScoped
            addLabel={t('settings.addPayment')}
            columns={[{ key: 'title', title: t('settings.paymentName') }]}
            fields={[{ name: 'title', label: t('settings.paymentName'), required: true }]}
          />
        ),
      },
      {
        key: 'currencies',
        label: (
          <span>
            <DollarOutlined /> {t('settings.tabs.currency')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="currencies"
            resource="/admin/currencies"
            orgScoped
            addLabel={t('settings.addCurrency')}
            columns={[
              { key: 'title', title: t('settings.currencyName') },
              { key: 'shortCode', title: t('settings.currencyCode') },
              { key: 'symbol', title: t('settings.currencySymbol') },
              { key: 'exchangeRate', title: t('settings.exchangeRate') },
            ]}
            fields={[
              { name: 'title', label: t('settings.currencyName'), required: true },
              { name: 'shortCode', label: t('settings.currencyCode'), required: true },
              { name: 'symbol', label: t('settings.currencySymbol') },
              { name: 'exchangeRate', label: t('settings.exchangeRate'), required: true, type: 'number' },
            ]}
          />
        ),
      },
      {
        key: 'units',
        label: (
          <span>
            <ColumnHeightOutlined /> {t('settings.tabs.units')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="units"
            resource="/admin/units"
            orgScoped
            addLabel={t('settings.addUnit')}
            columns={[
              { key: 'title', title: t('settings.unitName') },
              { key: 'shortCode', title: t('settings.unitCode') },
            ]}
            fields={[
              { name: 'title', label: t('settings.unitName'), required: true },
              { name: 'shortCode', label: t('settings.unitCode'), required: true },
            ]}
          />
        ),
      },
      {
        key: 'product-categories',
        label: (
          <span>
            <PartitionOutlined /> {t('settings.tabs.productCategories')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="product-categories"
            resource="/ProductCategoryAdmin"
            rpc
            addLabel={t('settings.addProductCategory')}
            columns={[
              { key: 'code', title: t('settings.code') },
              { key: 'fullName', title: t('settings.fullName') },
              { key: 'shortName', title: t('settings.shortName') },
            ]}
            fields={[
              { name: 'code', label: t('settings.code'), required: true },
              { name: 'fullName', label: t('settings.fullName'), required: true },
              { name: 'shortName', label: t('settings.shortName'), required: true },
            ]}
          />
        ),
      },
    ],
    [t],
  )

  return (
    <Card variant="borderless">
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        {t('settings.title')}
      </Typography.Title>
      <Tabs items={items} />
    </Card>
  )
}
