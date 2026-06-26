import { useEffect, useMemo } from 'react'
import { App, DatePicker, Form, Input, InputNumber, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useOrganizationOptions } from '@/entities/organization'
import { useSupplierOptions } from '@/entities/supplier'
import { useCashBoxOptions } from '@/entities/cashbox'
import { useCurrencyOptions } from '@/entities/currency'
import { usePaymentMethodOptions } from '@/entities/payment-method'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { useOutcomeStore } from '@/entities/outcome'
import {
  createSupplierPaymentSchema,
  useCreateSupplierPayment,
  type SupplierPaymentFormValues,
} from '@/entities/supplier-payment'

const EMPTY: SupplierPaymentFormValues = {
  organizationId: 0,
  supplierId: 0,
  cashBoxId: 0,
  paymentMethodId: 0,
  currencyId: 0,
  amount: 0,
  date: '',
  comment: '',
}

/** "Chiqim puli" — register a payment to a supplier (Pul chiqim). */
export function SupplierPaymentFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useOutcomeStore((s) => s.formKind === 'supplierPayment')
  const close = useOutcomeStore((s) => s.closeForm)

  const { data: orgOptions = [] } = useOrganizationOptions()
  const { data: supplierOptions = [] } = useSupplierOptions()
  const { data: cashboxOptions = [] } = useCashBoxOptions()
  const { data: paymentOptions = [] } = usePaymentMethodOptions()
  const { data: currencyOptions = [] } = useCurrencyOptions()
  const createMutation = useCreateSupplierPayment()

  const resolver = useMemo(() => zodResolver(createSupplierPaymentSchema(t)), [t])
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SupplierPaymentFormValues>({
    resolver,
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (open) reset(EMPTY)
  }, [open, reset])

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(
      { ...values, comment: values.comment || undefined },
      {
        onSuccess: () => { message.success(t('outcome.paymentSaved')); close() },
        onError: (e) => message.error(e.message),
      },
    )
  })

  const sel = (name: keyof SupplierPaymentFormValues, label: string, options: { value: number; label: string }[]) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item label={label} required validateStatus={errors[name] && 'error'} help={errors[name]?.message as string}>
          <Select showSearch optionFilterProp="label" options={options} value={(field.value as number) || undefined} onChange={field.onChange} onBlur={field.onBlur} />
        </Form.Item>
      )}
    />
  )

  return (
    <FormDrawer
      open={open}
      title={t('outcome.addSupplierPayment')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={createMutation.isPending}
      onOk={onSubmit}
      onClose={close}
    >
      <Form layout="vertical" disabled={createMutation.isPending}>
        {sel('organizationId', t('outcome.organization'), orgOptions)}
        {sel('supplierId', t('outcome.supplier'), supplierOptions)}
        {sel('cashBoxId', t('outcome.cashBox'), cashboxOptions)}
        {sel('paymentMethodId', t('outcome.paymentMethod'), paymentOptions)}
        {sel('currencyId', t('outcome.currency'), currencyOptions)}
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('outcome.amount')} required validateStatus={errors.amount && 'error'} help={errors.amount?.message}>
              <InputNumber value={field.value} onChange={(v) => field.onChange(v ?? 0)} onBlur={field.onBlur} min={0} style={{ width: '100%' }} />
            </Form.Item>
          )}
        />
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('outcome.date')} required validateStatus={errors.date && 'error'} help={errors.date?.message}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d ? d.toISOString() : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('outcome.comment')}>
              <Input.TextArea {...field} rows={3} maxLength={500} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
