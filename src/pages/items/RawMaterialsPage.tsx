import { useTranslation } from 'react-i18next'
import { ItemsPage } from './ItemsPage'

/** Xom-ashyolar — items in "Material" categories. */
export function RawMaterialsPage() {
  const { t } = useTranslation()
  return (
    <ItemsPage
      meta="Material"
      resource="rawMaterials"
      labels={{
        title: t('rawMaterials.title'),
        add: t('rawMaterials.add'),
        searchPlaceholder: t('rawMaterials.searchPlaceholder'),
        filterAll: t('rawMaterials.filterAll'),
        create: t('rawMaterials.create'),
        edit: t('rawMaterials.edit'),
        created: t('rawMaterials.createdSuccess'),
        updated: t('rawMaterials.updatedSuccess'),
      }}
    />
  )
}
