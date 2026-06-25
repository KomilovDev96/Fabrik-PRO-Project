import { useEffect, useMemo } from 'react'
import { App, Form, Input, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import type { ID } from '@/shared/types'
import {
  createItemSchema,
  useCreateItem,
  useItem,
  useItemCategories,
  useUpdateItem,
  type ItemFormValues,
} from '@/entities/item'

interface ItemFormModalProps {
  open: boolean
  /** null → create mode; otherwise edit that item. */
  editingId: ID | null
  /** Restrict the category select to this meta ("Material" | "Other"). */
  meta: string
  /** Resolved (already translated) labels — keeps i18n keys typed in the page. */
  labels: { create: string; edit: string; created: string; updated: string }
  onClose: () => void
}

const EMPTY: ItemFormValues = { title: '', categoryId: 0 }

/**
 * Create/Edit modal for inventory items (xom-ashyo / aksessuar), wired to /items.
 * The category <Select> is limited to the page's `meta`.
 */
export function ItemFormModal({ open, editingId, meta, labels, onClose }: ItemFormModalProps) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const isEdit = editingId != null

  const { data: editing, isFetching } = useItem(isEdit ? editingId : undefined)
  const { data: categories = [], isLoading: catsLoading } = useItemCategories()
  const createMutation = useCreateItem()
  const updateMutation = useUpdateItem()
  const submitting = createMutation.isPending || updateMutation.isPending

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.meta === meta).map((c) => ({ value: c.id, label: c.title })),
    [categories, meta],
  )

  const resolver = useMemo(() => zodResolver(createItemSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({ resolver, defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({ title: editing.title, categoryId: editing.categoryId ?? 0 })
    } else if (!isEdit) {
      reset(EMPTY)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto: values },
        {
          onSuccess: () => {
            message.success(labels.updated)
            onClose()
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          message.success(labels.created)
          onClose()
        },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? labels.edit : labels.create}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={submitting}
      onOk={onSubmit}
      onClose={onClose}
    >
      <Form layout="vertical" disabled={submitting || (isEdit && isFetching)}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('item.name')}
              required
              validateStatus={errors.title && 'error'}
              help={errors.title?.message}
            >
              <Input {...field} autoFocus maxLength={200} />
            </Form.Item>
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('item.category')}
              required
              validateStatus={errors.categoryId && 'error'}
              help={errors.categoryId?.message}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={catsLoading}
                options={categoryOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
