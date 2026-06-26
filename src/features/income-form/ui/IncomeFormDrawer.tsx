import { useEffect, useMemo } from 'react'
import { App, DatePicker, Form, Input, InputNumber, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useOrganizationOptions } from '@/entities/organization'
import { useClientOptions } from '@/entities/client'
import { useCashBoxOptions } from '@/entities/cashbox'
import { useCurrencyOptions } from '@/entities/currency'
import { usePaymentMethodOptions } from '@/entities/payment-method'
import { useIncomeCategoryOptions } from '@/entities/income-category'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  createIncomeSchema,
  useCreateIncome,
  useIncome,
  useIncomeStore,
  useUpdateIncome,
  type IncomeFormValues,
} from '@/entities/income'

const EMPTY: IncomeFormValues = {
  organizationId: 0,
  incomeCategoryId: undefined,
  clientId: undefined,
  cashBoxId: 0,
  paymentMethodId: 0,
  currencyId: 0,
  amount: 0,
  date: '',
  comment: '',
}

/** "Daromad puli" — create/edit an income (Pul kirim). */
export function IncomeFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useIncomeStore((s) => s.formKind === 'income')
  const editingId = useIncomeStore((s) => s.editingId)
  const close = useIncomeStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useIncome(isEdit && open ? editingId : undefined)
  const { data: orgOptions = [] } = useOrganizationOptions()
  const { data: categoryOptions = [] } = useIncomeCategoryOptions()
  const { data: clientOptions = [] } = useClientOptions()
  const { data: cashboxOptions = [] } = useCashBoxOptions()
  const { data: paymentOptions = [] } = usePaymentMethodOptions()
  const { data: currencyOptions = [] } = useCurrencyOptions()
  const createMutation = useCreateIncome()
  const updateMutation = useUpdateIncome()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createIncomeSchema(t)), [t])
  const { control, handleSubmit, reset, formState: { errors } } = useForm<IncomeFormValues>({
    resolver,
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organization?.id ?? 0,
        incomeCategoryId: editing.incomeCategory?.id ?? undefined,
        clientId: undefined, // list returns names, not ids — reselect on edit
        cashBoxId: 0,
        paymentMethodId: 0,
        currencyId: 0,
        amount: editing.amount ?? 0,
        date: editing.date ?? '',
        comment: editing.comment ?? '',
      })
    } else if (!isEdit) {
      reset(EMPTY)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const dto = {
      ...values,
      incomeCategoryId: values.incomeCategoryId || undefined,
      clientId: values.clientId || undefined,
      comment: values.comment || undefined,
    }
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate({ id: editingId, dto }, { onSuccess: () => { message.success(t('income.savedSuccess')); close() }, onError })
    } else {
      createMutation.mutate(dto, { onSuccess: () => { message.success(t('income.savedSuccess')); close() }, onError })
    }
  })

  const sel = (name: keyof IncomeFormValues, label: string, options: { value: number; label: string }[], required?: boolean, allowClear?: boolean) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item label={label} required={required} validateStatus={errors[name] && 'error'} help={errors[name]?.message as string}>
          <Select
            showSearch
            allowClear={allowClear}
            optionFilterProp="label"
            options={options}
            value={(field.value as number) || undefined}
            onChange={(v) => field.onChange(v ?? undefined)}
            onBlur={field.onBlur}
          />
        </Form.Item>
      )}
    />
  )

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('income.editIncome') : t('income.addIncome')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={submitting}
      onOk={onSubmit}
      onClose={close}
    >
      <Form layout="vertical" disabled={submitting || (isEdit && isFetching)}>
        {sel('organizationId', t('income.organization'), orgOptions, true)}
        {sel('incomeCategoryId', t('income.category'), categoryOptions, false, true)}
        {sel('clientId', t('income.client'), clientOptions, false, true)}
        {sel('cashBoxId', t('income.cashBox'), cashboxOptions, true)}
        {sel('paymentMethodId', t('income.paymentMethod'), paymentOptions, true)}
        {sel('currencyId', t('income.currency'), currencyOptions, true)}
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
