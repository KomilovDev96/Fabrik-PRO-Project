import { useMemo } from 'react'
import { Card, Tabs, Typography } from 'antd'
import { AppstoreOutlined, BuildOutlined, ColumnWidthOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useProductOptions } from '@/entities/product'
import { useProductModelOptions } from '@/entities/product-model'
import { ReferenceManager } from '@/pages/settings/ReferenceManager'

/**
 * Mahsulot model — the product hierarchy: Product → Model → {Part, Size}.
 * Parts/Sizes require both productId and productModelId (independent selects here).
 */
export function ProductModelPage() {
  const { t } = useTranslation()
  const { data: productOptions = [] } = useProductOptions()
  const { data: modelOptions = [] } = useProductModelOptions()

  const items = useMemo(
    () => [
      {
        key: 'models',
        label: (
          <span>
            <AppstoreOutlined /> {t('productModel.tabs.models')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="product-models"
            resource="/admin/product-models"
            orgScoped
            addLabel={t('productModel.addModel')}
            columns={[
              { key: 'product', title: t('productModel.product'), nested: true },
              { key: 'title', title: t('productModel.name') },
            ]}
            fields={[
              { name: 'productId', label: t('productModel.product'), type: 'select', required: true, options: productOptions },
              { name: 'title', label: t('productModel.name'), required: true },
            ]}
          />
        ),
      },
      {
        key: 'parts',
        label: (
          <span>
            <BuildOutlined /> {t('productModel.tabs.parts')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="product-parts"
            resource="/admin/product-parts"
            orgScoped
            addLabel={t('productModel.addPart')}
            columns={[
              { key: 'product', title: t('productModel.product'), nested: true },
              { key: 'productModel', title: t('productModel.model'), nested: true },
              { key: 'title', title: t('productModel.name') },
            ]}
            fields={[
              { name: 'productId', label: t('productModel.product'), type: 'select', required: true, options: productOptions },
              { name: 'productModelId', label: t('productModel.model'), type: 'select', required: true, options: modelOptions },
              { name: 'title', label: t('productModel.name'), required: true },
            ]}
          />
        ),
      },
      {
        key: 'sizes',
        label: (
          <span>
            <ColumnWidthOutlined /> {t('productModel.tabs.sizes')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="product-sizes"
            resource="/admin/product-sizes"
            orgScoped
            addLabel={t('productModel.addSize')}
            columns={[
              { key: 'product', title: t('productModel.product'), nested: true },
              { key: 'productModel', title: t('productModel.model'), nested: true },
              { key: 'title', title: t('productModel.name') },
              { key: 'description', title: t('productModel.description') },
            ]}
            fields={[
              { name: 'productId', label: t('productModel.product'), type: 'select', required: true, options: productOptions },
              { name: 'productModelId', label: t('productModel.model'), type: 'select', required: true, options: modelOptions },
              { name: 'title', label: t('productModel.name'), required: true },
              { name: 'description', label: t('productModel.description') },
            ]}
          />
        ),
      },
    ],
    [t, productOptions, modelOptions],
  )

  return (
    <Card variant="borderless">
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        {t('productModel.title')}
      </Typography.Title>
      <Tabs items={items} />
    </Card>
  )
}
