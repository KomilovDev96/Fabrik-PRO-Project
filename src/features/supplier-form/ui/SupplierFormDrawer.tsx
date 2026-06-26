import { useEffect, useMemo } from 'react'
import { App, Form, Input, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useOrganizationOptions } from '@/entities/organization'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { YandexMapPicker } from '@/shared/ui/YandexMapPicker'
import {
  createSupplierSchema,
  useCreateSupplier,
  useSupplier,
  useSupplierStore,
  useUpdateSupplier,
  type SupplierFormValues,
} from '@/entities/supplier'

const EMPTY_FORM: SupplierFormValues = {
  organizationId: 0,
  title: '',
  contactPhone: '',
  contactName: '',
  telegramUsername: '',
  latitude: 0,
  longitude: 0,
}

/** Create/Edit supplier (Ta'minotchi) drawer — same fields as a client. */
export function SupplierFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useSupplierStore((s) => s.formOpen)
  const editingId = useSupplierStore((s) => s.editingId)
  const close = useSupplierStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useSupplier(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createSupplierSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierFormValues>({ resolver, defaultValues: EMPTY_FORM })

  const latitude = watch('latitude')
  const longitude = watch('longitude')

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organizationId ?? editing.organization?.id ?? 0,
        title: editing.title,
        contactPhone: editing.contactPhone,
        contactName: editing.contactName,
        telegramUsername: editing.telegramUsername ?? '',
        latitude: editing.latitude,
        longitude: editing.longitude,
      })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const dto = { ...values, telegramUsername: values.telegramUsername || undefined }
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto },
        { onSuccess: () => { message.success(t('supplier.updatedSuccess')); close() }, onError },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => { message.success(t('supplier.createdSuccess')); close() },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('supplier.edit') : t('supplier.create')}
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
            <Form.Item label={t('supplier.organization')} required validateStatus={errors.organizationId && 'error'} help={errors.organizationId?.message}>
              <Select showSearch optionFilterProp="label" loading={orgsLoading} options={orgOptions} value={field.value || undefined} onChange={field.onChange} onBlur={field.onBlur} />
            </Form.Item>
          )}
        />
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('supplier.name')} required validateStatus={errors.title && 'error'} help={errors.title?.message}>
              <Input {...field} autoFocus maxLength={150} />
            </Form.Item>
          )}
        />
        <Controller
          name="contactPhone"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('supplier.contactPhone')} required validateStatus={errors.contactPhone && 'error'} help={errors.contactPhone?.message}>
              <Input {...field} maxLength={50} placeholder="+998 ..." />
            </Form.Item>
          )}
        />
        <Controller
          name="contactName"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('supplier.contactName')} required validateStatus={errors.contactName && 'error'} help={errors.contactName?.message}>
              <Input {...field} maxLength={150} />
            </Form.Item>
          )}
        />
        <Controller
          name="telegramUsername"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('supplier.telegram')} validateStatus={errors.telegramUsername && 'error'} help={errors.telegramUsername?.message}>
              <Input {...field} maxLength={100} addonBefore="@" />
            </Form.Item>
          )}
        />
        <Form.Item label={t('supplier.mapTitle')} help={t('supplier.mapHint')}>
          <YandexMapPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(la, ln) => {
              setValue('latitude', la, { shouldValidate: true })
              setValue('longitude', ln, { shouldValidate: true })
            }}
          />
        </Form.Item>
        <Controller
          name="latitude"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('supplier.latitude')} validateStatus={errors.latitude && 'error'} help={errors.latitude?.message}>
              <Input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} onBlur={field.onBlur} />
            </Form.Item>
          )}
        />
        <Controller
          name="longitude"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('supplier.longitude')} validateStatus={errors.longitude && 'error'} help={errors.longitude?.message}>
              <Input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} onBlur={field.onBlur} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
