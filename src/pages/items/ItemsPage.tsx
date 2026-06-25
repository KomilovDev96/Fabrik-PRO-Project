import { useMemo, useState } from 'react'
import { Button, Card, Flex, Input, Select, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/shared/config/constants'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { perm, type Resource } from '@/shared/lib/rbac'
import { Can } from '@/entities/session'
import { getItemColumns, useItemCategories, useItems, type Item } from '@/entities/item'
import { ItemFormModal } from '@/features/item-form'
import { DeleteItemButton } from '@/features/item-delete'

interface ItemsPageProps {
  /** Category meta this page shows: "Material" (xom-ashyo) or "Other" (aksessuar). */
  meta: string
  /** RBAC resource used to gate create/edit/delete. */
  resource: Resource
  labels: {
    title: string
    add: string
    searchPlaceholder: string
    filterAll: string
    create: string
    edit: string
    created: string
    updated: string
  }
}

/**
 * Reusable list screen for inventory items (/items), shared by Xom-ashyolar and
 * Aksessuarlar. Items are split by their category `meta`; filtering/paging is
 * client-side (the dataset is small and the list endpoint returns no meta).
 */
export function ItemsPage({ meta, resource, labels }: ItemsPageProps) {
  const { t } = useTranslation()

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)

  const { data: categories = [] } = useItemCategories()
  const { data, isLoading, isFetching } = useItems({ page: 1, pageSize: 1000 })

  // Maps to resolve meta/title for the current page (list items carry only the title).
  const metaByTitle = useMemo(
    () => new Map(categories.map((c) => [c.title, c.meta])),
    [categories],
  )
  const titleById = useMemo(() => new Map(categories.map((c) => [c.id, c.title])), [categories])

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.meta === meta).map((c) => ({ value: c.id, label: c.title })),
    [categories, meta],
  )

  const dataSource = useMemo(() => {
    const all = data?.items ?? []
    const selectedTitle = categoryId != null ? titleById.get(categoryId) : undefined
    const term = debouncedSearch.trim().toLowerCase()
    return all.filter((it) => {
      if (metaByTitle.get(it.category ?? '') !== meta) return false
      if (selectedTitle && it.category !== selectedTitle) return false
      if (term && !it.title.toLowerCase().includes(term)) return false
      return true
    })
  }, [data, meta, categoryId, debouncedSearch, metaByTitle, titleById])

  const columns = useMemo<TableColumnsType<Item>>(
    () => [
      ...getItemColumns(t),
      {
        title: t('common.actions'),
        key: 'actions',
        width: 110,
        align: 'center',
        render: (_, record) => (
          <Space size={0}>
            <Can perform={perm(resource, 'update')}>
              <Button
                type="text"
                aria-label="edit"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingId(Number(record.id))
                  setModalOpen(true)
                }}
              />
            </Can>
            <Can perform={perm(resource, 'delete')}>
              <DeleteItemButton item={record} />
            </Can>
          </Space>
        ),
      },
    ],
    [t, resource],
  )

  return (
    <Card variant="borderless">
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {labels.title}
        </Typography.Title>

        <Space wrap>
          <Select
            allowClear
            placeholder={labels.filterAll}
            style={{ width: 200 }}
            options={categoryOptions}
            value={categoryId}
            onChange={(v) => setCategoryId(v)}
          />
          <Input.Search
            allowClear
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Can perform={perm(resource, 'create')}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null)
                setModalOpen(true)
              }}
            >
              {labels.add}
            </Button>
          </Can>
        </Space>
      </Flex>

      <Table<Item>
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        loading={isLoading || isFetching}
        scroll={{ x: 600 }}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (total) => `${t('common.total')}: ${total}`,
        }}
      />

      <ItemFormModal
        open={modalOpen}
        editingId={editingId}
        meta={meta}
        labels={{
          create: labels.create,
          edit: labels.edit,
          created: labels.created,
          updated: labels.updated,
        }}
        onClose={() => setModalOpen(false)}
      />
    </Card>
  )
}
