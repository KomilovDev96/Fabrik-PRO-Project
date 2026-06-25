import { useEffect, useMemo } from 'react'
import { Alert, App, Form, Select, Switch } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useOrganizationOptions } from '@/entities/organization'
import { useClientOptions } from '@/entities/client'
import { useWarehouseOptions } from '@/entities/warehouse'
import { useCurrencyOptions } from '@/entities/currency'
import { usePaymentMethodOptions } from '@/entities/payment-method'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  ORDER_STATUSES,
  createOrderSchema,
  useCreateOrder,
  useOrder,
  useOrderStore,
  useUpdateOrder,
  type OrderFormValues,
} from '@/entities/order'

const EMPTY_FORM: OrderFormValues = {
  organizationId: 0,
  clientId: undefined,
  warehouseId: 0,
  paymentMethodId: 0,
  currencyId: 0,
  status: 'New',
  delivery: false,
}

/**
 * Create/Edit sale (Sotuv) drawer — wired to the real /admin/orders contract.
 *
 * This contract is header-only: organization, client, warehouse, payment method,
 * currency, status, delivery. Product line items / totals from the design are NOT
 * part of it, so a notice is shown instead of a (non-savable) products grid.
 * Edit can't prefill the organization (OrderAdminDetail omits it) — reselect it.
 */
export function OrderFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useOrderStore((s) => s.formOpen)
  const editingId = useOrderStore((s) => s.editingId)
  const close = useOrderStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useOrder(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const { data: clientOptions = [], isLoading: clientsLoading } = useClientOptions()
  const { data: warehouseOptions = [], isLoading: warehousesLoading } = useWarehouseOptions()
  const { data: currencyOptions = [], isLoading: currenciesLoading } = useCurrencyOptions()
  const { data: paymentOptions = [], isLoading: paymentsLoading } = usePaymentMethodOptions()
  const createMutation = useCreateOrder()
  const updateMutation = useUpdateOrder()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createOrderSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({ resolver, defaultValues: EMPTY_FORM })

  const statusOptions = useMemo(
    () => ORDER_STATUSES.map((s) => ({ value: s, label: t(`order.statuses.${s}`) })),
    [t],
  )

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: 0, // detail omits organization — must be reselected
        clientId: editing.client?.id ?? undefined,
        warehouseId: editing.warehouse?.id ?? 0,
        paymentMethodId: editing.paymentMethod?.id ?? 0,
        currencyId: editing.currency?.id ?? 0,
        status: editing.status,
        delivery: editing.delivery,
      })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    // clientId is optional — omit when none selected.
    const dto = { ...values, clientId: values.clientId || undefined }
    const onError = (e: { message: string }) => message.error(e.message)

    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto },
        {
          onSuccess: () => {
            message.success(t('order.updatedSuccess'))
            close()
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          message.success(t('order.createdSuccess'))
          close()
        },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('order.edit') : t('order.create')}
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
              label={t('order.organization')}
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
          name="clientId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('order.client')}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={clientsLoading}
                options={clientOptions}
                value={field.value || undefined}
                onChange={(v) => field.onChange(v ?? undefined)}
                onBlur={field.onBlur}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="warehouseId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('order.warehouse')}
              required
              validateStatus={errors.warehouseId && 'error'}
              help={errors.warehouseId?.message}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={warehousesLoading}
                options={warehouseOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="paymentMethodId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('order.paymentMethod')}
              required
              validateStatus={errors.paymentMethodId && 'error'}
              help={errors.paymentMethodId?.message}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={paymentsLoading}
                options={paymentOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="currencyId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('order.currency')}
              required
              validateStatus={errors.currencyId && 'error'}
              help={errors.currencyId?.message}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={currenciesLoading}
                options={currencyOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('order.status')} required>
              <Select options={statusOptions} value={field.value} onChange={field.onChange} />
            </Form.Item>
          )}
        />

        <Controller
          name="delivery"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('order.delivery')}>
              <Switch checked={field.value} onChange={field.onChange} />
            </Form.Item>
          )}
        />

        <Alert
          type="info"
          showIcon
          message={t('order.itemsNotice')}
          style={{ marginTop: 8 }}
        />
      </Form>
    </FormDrawer>
  )
}
