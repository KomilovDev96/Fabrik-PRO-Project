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
import { useOutcomeCategoryOptions } from '@/entities/outcome-category'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  createOutcomeSchema,
  useCreateOutcome,
  useOutcome,
  useOutcomeStore,
  useUpdateOutcome,
  type OutcomeFormValues,
} from '@/entities/outcome'

const EMPTY: OutcomeFormValues = {
  organizationId: 0,
  outcomeCategoryId: undefined,
  supplierId: undefined,
  cashBoxId: 0,
  paymentMethodId: 0,
  currencyId: 0,
  amount: 0,
  date: '',
  comment: '',
}

/** "Xarajat puli" — create/edit an outcome (Pul chiqim). */
export function OutcomeFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useOutcomeStore((s) => s.formKind === 'outcome')
  const editingId = useOutcomeStore((s) => s.editingId)
  const close = useOutcomeStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useOutcome(isEdit && open ? editingId : undefined)
  const { data: orgOptions = [] } = useOrganizationOptions()
  const { data: categoryOptions = [] } = useOutcomeCategoryOptions()
  const { data: supplierOptions = [] } = useSupplierOptions()
  const { data: cashboxOptions = [] } = useCashBoxOptions()
  const { data: paymentOptions = [] } = usePaymentMethodOptions()
  const { data: currencyOptions = [] } = useCurrencyOptions()
  const createMutation = useCreateOutcome()
  const updateMutation = useUpdateOutcome()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createOutcomeSchema(t)), [t])
  const { control, handleSubmit, reset, formState: { errors } } = useForm<OutcomeFormValues>({
    resolver,
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organization?.id ?? 0,
        outcomeCategoryId: editing.outcomeCategory?.id ?? undefined,
        supplierId: undefined,
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
      outcomeCategoryId: values.outcomeCategoryId || undefined,
      supplierId: values.supplierId || undefined,
      comment: values.comment || undefined,
    }
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate({ id: editingId, dto }, { onSuccess: () => { message.success(t('outcome.savedSuccess')); close() }, onError })
    } else {
      createMutation.mutate(dto, { onSuccess: () => { message.success(t('outcome.savedSuccess')); close() }, onError })
    }
  })

  const sel = (name: keyof OutcomeFormValues, label: string, options: { value: number; label: string }[], required?: boolean, allowClear?: boolean) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item label={label} required={required} validateStatus={errors[name] && 'error'} help={errors[name]?.message as string}>
          <Select showSearch allowClear={allowClear} optionFilterProp="label" options={options} value={(field.value as number) || undefined} onChange={(v) => field.onChange(v ?? undefined)} onBlur={field.onBlur} />
        </Form.Item>
      )}
    />
  )

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('outcome.editOutcome') : t('outcome.addOutcome')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={submitting}
      onOk={onSubmit}
      onClose={close}
    >
      <Form layout="vertical" disabled={submitting || (isEdit && isFetching)}>
        {sel('organizationId', t('outcome.organization'), orgOptions, true)}
        {sel('outcomeCategoryId', t('outcome.category'), categoryOptions, false, true)}
        {sel('supplierId', t('outcome.supplier'), supplierOptions, false, true)}
        {sel('cashBoxId', t('outcome.cashBox'), cashboxOptions, true)}
        {sel('paymentMethodId', t('outcome.paymentMethod'), paymentOptions, true)}
        {sel('currencyId', t('outcome.currency'), currencyOptions, true)}
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
