import { useMemo } from 'react'
import { Card, Tabs, Typography } from 'antd'
import {
  AppstoreOutlined,
  DeploymentUnitOutlined,
  FlagOutlined,
  PictureOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useProductOptions } from '@/entities/product'
import { useProductModelOptions } from '@/entities/product-model'
import { useProductSizeOptions } from '@/entities/product-size'
import { useItemRefOptions } from '@/entities/item-ref'
import { ReferenceManager } from '@/pages/settings/ReferenceManager'

/**
 * Ishlab chiqarish (Production) — reference classifiers used by manufacturing.
 * Material / DesignLibrary / Priority / Status are RPC `{code, fullName, shortName}`
 * resources, managed via the generic ReferenceManager.
 */
export function ProductionPage() {
  const { t } = useTranslation()
  const { data: productOptions = [] } = useProductOptions()
  const { data: modelOptions = [] } = useProductModelOptions()
  const { data: sizeOptions = [] } = useProductSizeOptions()
  const { data: itemOptions = [] } = useItemRefOptions()

  const codeFields = (label: string) => ({
    addLabel: label,
    columns: [
      { key: 'code', title: t('settings.code') },
      { key: 'fullName', title: t('settings.fullName') },
      { key: 'shortName', title: t('settings.shortName') },
    ],
    fields: [
      { name: 'code', label: t('settings.code'), required: true },
      { name: 'fullName', label: t('settings.fullName'), required: true },
      { name: 'shortName', label: t('settings.shortName'), required: true },
    ],
  })

  const items = useMemo(
    () => [
      {
        key: 'material',
        label: (
          <span>
            <AppstoreOutlined /> {t('production.tabs.material')}
          </span>
        ),
        children: <ReferenceManager queryKey="materials" resource="/MaterialAdmin" rpc {...codeFields(t('production.addMaterial'))} />,
      },
      {
        key: 'design',
        label: (
          <span>
            <PictureOutlined /> {t('production.tabs.design')}
          </span>
        ),
        children: <ReferenceManager queryKey="design-library" resource="/DesignLibraryAdmin" rpc {...codeFields(t('production.addDesign'))} />,
      },
      {
        key: 'priority',
        label: (
          <span>
            <FlagOutlined /> {t('production.tabs.priority')}
          </span>
        ),
        children: <ReferenceManager queryKey="priorities" resource="/PriorityAdmin" rpc {...codeFields(t('production.addPriority'))} />,
      },
      {
        key: 'status',
        label: (
          <span>
            <TagsOutlined /> {t('production.tabs.status')}
          </span>
        ),
        children: <ReferenceManager queryKey="statuses" resource="/StatusAdmin" rpc {...codeFields(t('production.addStatus'))} />,
      },
      {
        key: 'bom',
        label: (
          <span>
            <DeploymentUnitOutlined /> {t('production.tabs.bom')}
          </span>
        ),
        children: (
          <ReferenceManager
            queryKey="item-to-products"
            resource="/admin/item-to-products"
            orgScoped
            addLabel={t('production.addBom')}
            columns={[
              { key: 'product', title: t('production.product'), nested: true },
              { key: 'productModel', title: t('production.model'), nested: true },
              { key: 'productSize', title: t('production.size'), nested: true },
              { key: 'item', title: t('production.item'), nested: true },
              { key: 'quantity', title: t('production.quantity') },
            ]}
            fields={[
              { name: 'productId', label: t('production.product'), type: 'select', required: true, options: productOptions },
              { name: 'productModelId', label: t('production.model'), type: 'select', required: true, options: modelOptions },
              { name: 'productSizeId', label: t('production.size'), type: 'select', required: true, options: sizeOptions },
              { name: 'itemId', label: t('production.item'), type: 'select', required: true, options: itemOptions },
              { name: 'quantity', label: t('production.quantity'), type: 'number', required: true },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, productOptions, modelOptions, sizeOptions, itemOptions],
  )

  return (
    <Card variant="borderless">
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        {t('production.title')}
      </Typography.Title>
      <Tabs items={items} />
    </Card>
  )
}
