import { useEffect, useMemo } from 'react'
import { App, Form, Input, InputNumber, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useUserOptions } from '@/entities/user'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { YandexMapPicker } from '@/shared/ui/YandexMapPicker'
import {
  createWarehouseSchema,
  useCreateWarehouse,
  useUpdateWarehouse,
  useWarehouse,
  useWarehouseStore,
  type WarehouseFormValues,
} from '@/entities/warehouse'

const EMPTY_FORM: WarehouseFormValues = {
  title: '',
  address: '',
  latitude: 0,
  longitude: 0,
  userId: 0,
}

/**
 * Create/Edit warehouse modal — wired to the real API.
 *
 * - Open/edit state from the warehouse Zustand store (no prop drilling).
 * - Validation: Zod (localized) via zodResolver into React Hook Form.
 * - Ant Design inputs bound through RHF `Controller`.
 * - Responsible user is picked from a live /User/GetAll options query.
 */
export function WarehouseFormModal() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useWarehouseStore((s) => s.formOpen)
  const editingId = useWarehouseStore((s) => s.editingId)
  const close = useWarehouseStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useWarehouse(isEdit ? editingId : undefined)
  const { data: userOptions = [], isLoading: usersLoading } = useUserOptions()
  const createMutation = useCreateWarehouse()
  const updateMutation = useUpdateWarehouse()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createWarehouseSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WarehouseFormValues>({ resolver, defaultValues: EMPTY_FORM })

  // Two-way binding between the map and the latitude/longitude fields.
  const latitude = watch('latitude')
  const longitude = watch('longitude')

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        title: editing.title,
        address: editing.address,
        latitude: editing.latitude,
        longitude: editing.longitude,
        userId: editing.userId ?? 0,
      })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const onError = (e: { message: string }) => message.error(e.message)

    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto: values },
        {
          onSuccess: () => {
            message.success(t('warehouse.updatedSuccess'))
            close()
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          message.success(t('warehouse.createdSuccess'))
          close()
        },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('warehouse.edit') : t('warehouse.create')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={submitting}
      onOk={onSubmit}
      onClose={close}
    >
      <Form layout="vertical" disabled={submitting || (isEdit && isFetching)}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('warehouse.name')}
              required
              validateStatus={errors.title && 'error'}
              help={errors.title?.message}
            >
              <Input {...field} autoFocus maxLength={150} />
            </Form.Item>
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('warehouse.address')}
              required
              validateStatus={errors.address && 'error'}
              help={errors.address?.message}
            >
              <Input.TextArea {...field} rows={2} maxLength={255} />
            </Form.Item>
          )}
        />

        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('warehouse.user')}
              required
              validateStatus={errors.userId && 'error'}
              help={errors.userId?.message}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={usersLoading}
                options={userOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Form.Item>
          )}
        />

        <Form.Item label={t('warehouse.mapTitle')} help={t('warehouse.mapHint')}>
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
              label={t('warehouse.latitude')}
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
              label={t('warehouse.longitude')}
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
