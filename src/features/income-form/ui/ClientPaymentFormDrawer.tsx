import { useEffect, useMemo } from 'react'
import { App, DatePicker, Form, Input, InputNumber, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useOrganizationOptions } from '@/entities/organization'
import { useClientOptions } from '@/entities/client'
import { useOrderOptions } from '@/entities/order'
import { useCashBoxOptions } from '@/entities/cashbox'
import { useCurrencyOptions } from '@/entities/currency'
import { usePaymentMethodOptions } from '@/entities/payment-method'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { useIncomeStore } from '@/entities/income'
import {
  createClientPaymentSchema,
  useCreateClientPayment,
  type ClientPaymentFormValues,
} from '@/entities/client-payment'

const EMPTY: ClientPaymentFormValues = {
  organizationId: 0,
  orderId: 0,
  clientId: 0,
  cashBoxId: 0,
  paymentMethodId: 0,
  currencyId: 0,
  amount: 0,
  date: '',
  comment: '',
}

/** "Kirim puli" — register a client payment against an order (Pul kirim). */
export function ClientPaymentFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useIncomeStore((s) => s.formKind === 'clientPayment')
  const close = useIncomeStore((s) => s.closeForm)

  const { data: orgOptions = [] } = useOrganizationOptions()
  const { data: orderOptions = [] } = useOrderOptions()
  const { data: clientOptions = [] } = useClientOptions()
  const { data: cashboxOptions = [] } = useCashBoxOptions()
  const { data: paymentOptions = [] } = usePaymentMethodOptions()
  const { data: currencyOptions = [] } = useCurrencyOptions()
  const createMutation = useCreateClientPayment()

  const resolver = useMemo(() => zodResolver(createClientPaymentSchema(t)), [t])
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ClientPaymentFormValues>({
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
        onSuccess: () => { message.success(t('income.paymentSaved')); close() },
        onError: (e) => message.error(e.message),
      },
    )
  })

  const sel = (name: keyof ClientPaymentFormValues, label: string, options: { value: number; label: string }[]) => (
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
      title={t('income.addClientPayment')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={createMutation.isPending}
      onOk={onSubmit}
      onClose={close}
    >
      <Form layout="vertical" disabled={createMutation.isPending}>
        {sel('organizationId', t('income.organization'), orgOptions)}
        {sel('orderId', t('income.order'), orderOptions)}
        {sel('clientId', t('income.client'), clientOptions)}
        {sel('cashBoxId', t('income.cashBox'), cashboxOptions)}
        {sel('paymentMethodId', t('income.paymentMethod'), paymentOptions)}
        {sel('currencyId', t('income.currency'), currencyOptions)}
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('income.amount')} required validateStatus={errors.amount && 'error'} help={errors.amount?.message}>
              <InputNumber value={field.value} onChange={(v) => field.onChange(v ?? 0)} onBlur={field.onBlur} min={0} style={{ width: '100%' }} />
            </Form.Item>
          )}
        />
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('income.date')} required validateStatus={errors.date && 'error'} help={errors.date?.message}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d ? d.toISOString() : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('income.comment')}>
              <Input.TextArea {...field} rows={3} maxLength={500} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
