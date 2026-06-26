import { useEffect, useMemo } from 'react'
import { App, DatePicker, Form, Input, InputNumber, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useOrganizationOptions } from '@/entities/organization'
import { useUserOptions } from '@/entities/user'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  LEDGER_STORES,
  createPayrollSchema,
  useCreatePayroll,
  usePayrollEntry,
  useUpdatePayroll,
  type PayrollFormValues,
  type PayrollKind,
} from '@/entities/payroll'

const EMPTY_FORM: PayrollFormValues = {
  organizationId: 0,
  userId: 0,
  forDate: '',
  date: '',
  amount: 0,
  comment: '',
}

interface Props {
  kind: PayrollKind
}

/**
 * Create/Edit drawer shared by all four Maosh ledgers (salary/advance/penalty/bonus).
 * Fields: organization, employee, work month (forDate), given date (date), amount, comment.
 */
export function PayrollFormDrawer({ kind }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const useStore = LEDGER_STORES[kind]

  const open = useStore((s) => s.formOpen)
  const editingId = useStore((s) => s.editingId)
  const close = useStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = usePayrollEntry(kind, isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const { data: userOptions = [], isLoading: usersLoading } = useUserOptions()
  const createMutation = useCreatePayroll(kind)
  const updateMutation = useUpdatePayroll(kind)
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createPayrollSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayrollFormValues>({ resolver, defaultValues: EMPTY_FORM })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organization?.id ?? 0,
        userId: editing.user?.id ?? 0,
        forDate: editing.forDate ?? '',
        date: editing.date ?? '',
        amount: editing.amount ?? 0,
        comment: editing.comment ?? '',
      })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const dto = { ...values, comment: values.comment || undefined }
    const onError = (e: { message: string }) => message.error(e.message)

    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto },
        {
          onSuccess: () => {
            message.success(t('payroll.updatedSuccess'))
            close()
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          message.success(t('payroll.createdSuccess'))
          close()
        },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('payroll.edit') : t('payroll.add')}
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
              label={t('payroll.organization')}
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
          name="userId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('payroll.employee')}
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

        <Controller
          name="forDate"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('payroll.workMonth')}
              required
              validateStatus={errors.forDate && 'error'}
              help={errors.forDate?.message}
            >
              <DatePicker
                picker="month"
                style={{ width: '100%' }}
                value={field.value ? dayjs(field.value) : null}
                onChange={(d) => field.onChange(d ? d.startOf('month').format('YYYY-MM-DD') : '')}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('payroll.givenDate')}
              required
              validateStatus={errors.date && 'error'}
              help={errors.date?.message}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                value={field.value ? dayjs(field.value) : null}
                onChange={(d) => field.onChange(d ? d.toISOString() : '')}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('payroll.amount')}
              required
              validateStatus={errors.amount && 'error'}
              help={errors.amount?.message}
            >
              <InputNumber
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
                onBlur={field.onBlur}
                min={0}
                step={1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('payroll.comment')}>
              <Input.TextArea {...field} rows={3} maxLength={500} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
