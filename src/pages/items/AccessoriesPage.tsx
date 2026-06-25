import { useTranslation } from 'react-i18next'
import { ItemsPage } from './ItemsPage'

/** Aksessuarlar — items in "Other" categories. */
export function AccessoriesPage() {
  const { t } = useTranslation()
  return (
    <ItemsPage
      meta="Other"
      resource="accessories"
      labels={{
        title: t('accessories.title'),
        add: t('accessories.add'),
        searchPlaceholder: t('accessories.searchPlaceholder'),
        filterAll: t('accessories.filterAll'),
        create: t('accessories.create'),
        edit: t('accessories.edit'),
        created: t('accessories.createdSuccess'),
        updated: t('accessories.updatedSuccess'),
      }}
    />
  )
}
