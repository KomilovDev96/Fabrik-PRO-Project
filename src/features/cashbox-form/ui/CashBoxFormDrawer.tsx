import { useEffect, useMemo } from 'react'
import { App, Form, Input, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useOrganizationOptions } from '@/entities/organization'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  createCashBoxSchema,
  useCashBox,
  useCashBoxStore,
  useCreateCashBox,
  useUpdateCashBox,
  type CashBoxFormValues,
} from '@/entities/cashbox'

const EMPTY_FORM: CashBoxFormValues = {
  organizationId: 0,
  title: '',
}

/**
 * Create/Edit cash box (Kassa) drawer — wired to the real admin API.
 *
 * Opens as a right-side drawer at 60% width (85% tablet, 100% phone) via `FormDrawer`.
 * A cash box is just `{ title, organizationId }`; balances are not part of the entity.
 */
export function CashBoxFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useCashBoxStore((s) => s.formOpen)
  const editingId = useCashBoxStore((s) => s.editingId)
  const close = useCashBoxStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useCashBox(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const createMutation = useCreateCashBox()
  const updateMutation = useUpdateCashBox()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createCashBoxSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashBoxFormValues>({ resolver, defaultValues: EMPTY_FORM })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organizationId ?? editing.organization?.id ?? 0,
        title: editing.title,
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
            message.success(t('cashbox.updatedSuccess'))
            close()
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          message.success(t('cashbox.createdSuccess'))
          close()
        },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('cashbox.edit') : t('cashbox.create')}
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
              label={t('cashbox.organization')}
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
              label={t('cashbox.name')}
              required
              validateStatus={errors.title && 'error'}
              help={errors.title?.message}
            >
              <Input {...field} autoFocus maxLength={150} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
