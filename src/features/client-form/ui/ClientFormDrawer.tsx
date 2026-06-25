import { useEffect, useMemo } from 'react'
import { App, Form, Input, InputNumber, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useOrganizationOptions } from '@/entities/organization'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { YandexMapPicker } from '@/shared/ui/YandexMapPicker'
import {
  createClientSchema,
  useClient,
  useClientStore,
  useCreateClient,
  useUpdateClient,
  type ClientFormValues,
} from '@/entities/client'

const EMPTY_FORM: ClientFormValues = {
  organizationId: 0,
  title: '',
  contactPhone: '',
  contactName: '',
  telegramUsername: '',
  latitude: 0,
  longitude: 0,
}

/**
 * Create/Edit client (Mijoz) drawer — wired to the real admin API.
 *
 * - Opens as a right-side drawer at 60% width (85% tablet, 100% phone) via `FormDrawer`.
 * - Open/edit state from the client Zustand store (no prop drilling).
 * - Validation: Zod (localized) via zodResolver into React Hook Form.
 * - `organizationId` is required by the API, so the org <Select> is mandatory even
 *   though the original design omitted it. There is no "balance" field on the client
 *   resource — balances are derived from /admin/client-payments, so it is not here.
 */
export function ClientFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useClientStore((s) => s.formOpen)
  const editingId = useClientStore((s) => s.editingId)
  const close = useClientStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useClient(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createClientSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({ resolver, defaultValues: EMPTY_FORM })

  // Two-way binding between the map and the latitude/longitude fields.
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
    // Don't send an empty telegram username — the API field is nullable.
    const dto = { ...values, telegramUsername: values.telegramUsername || undefined }
    const onError = (e: { message: string }) => message.error(e.message)

    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto },
        {
          onSuccess: () => {
            message.success(t('client.updatedSuccess'))
            close()
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          message.success(t('client.createdSuccess'))
          close()
        },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('client.edit') : t('client.create')}
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
            <Form.Item
              label={t('client.organization')}
              required
              validateStatus={errors.organizationId && 'error'}
              help={errors.organizationId?.message}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={orgsLoading}
                options={orgOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('client.name')}
              required
              validateStatus={errors.title && 'error'}
              help={errors.title?.message}
            >
              <Input {...field} autoFocus maxLength={150} />
            </Form.Item>
          )}
        />

        <Controller
          name="contactPhone"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('client.contactPhone')}
              required
              validateStatus={errors.contactPhone && 'error'}
              help={errors.contactPhone?.message}
            >
              <Input {...field} maxLength={50} placeholder="+998 ..." />
            </Form.Item>
          )}
        />

        <Controller
          name="contactName"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('client.contactName')}
              required
              validateStatus={errors.contactName && 'error'}
              help={errors.contactName?.message}
            >
              <Input {...field} maxLength={150} />
            </Form.Item>
          )}
        />

        <Controller
          name="telegramUsername"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('client.telegram')}
              validateStatus={errors.telegramUsername && 'error'}
              help={errors.telegramUsername?.message}
            >
              <Input {...field} maxLength={100} addonBefore="@" />
            </Form.Item>
          )}
        />

        <Form.Item label={t('client.mapTitle')} help={t('client.mapHint')}>
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
            <Form.Item
              label={t('client.latitude')}
              validateStatus={errors.latitude && 'error'}
              help={errors.latitude?.message}
            >
              <InputNumber
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
                onBlur={field.onBlur}
                min={-90}
                max={90}
                step={0.000001}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="longitude"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('client.longitude')}
              validateStatus={errors.longitude && 'error'}
              help={errors.longitude?.message}
            >
              <InputNumber
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
                onBlur={field.onBlur}
                min={-180}
                max={180}
                step={0.000001}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
