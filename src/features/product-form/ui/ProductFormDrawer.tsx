import { useEffect, useMemo } from 'react'
import { App, Form, Input, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useOrganizationOptions } from '@/entities/organization'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  createProductSchema,
  useCreateProduct,
  useProduct,
  useProductStore,
  useUpdateProduct,
  type ProductFormValues,
} from '@/entities/product'

const EMPTY_FORM: ProductFormValues = { organizationId: 0, title: '' }

/** Create/Edit product (Mahsulot) drawer. */
export function ProductFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useProductStore((s) => s.formOpen)
  const editingId = useProductStore((s) => s.editingId)
  const close = useProductStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useProduct(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createProductSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({ resolver, defaultValues: EMPTY_FORM })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({ organizationId: editing.organizationId ?? editing.organization?.id ?? 0, title: editing.title })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto: values },
        { onSuccess: () => { message.success(t('product.updatedSuccess')); close() }, onError },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => { message.success(t('product.createdSuccess')); close() },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('product.edit') : t('product.create')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={submitting}
      onOk={onSubmit}
      onClose={close}
    >
      <Form layout="vertical" disabled={submitting || (isEdit && isFetching)}>
        <Controller
          name="organizationId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('product.organization')} required validateStatus={errors.organizationId && 'error'} help={errors.organizationId?.message}>
              <Select showSearch optionFilterProp="label" loading={orgsLoading} options={orgOptions} value={field.value || undefined} onChange={field.onChange} onBlur={field.onBlur} />
            </Form.Item>
          )}
        />
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('product.name')} required validateStatus={errors.title && 'error'} help={errors.title?.message}>
              <Input {...field} autoFocus maxLength={150} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
