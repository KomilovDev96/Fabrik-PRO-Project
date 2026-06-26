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
  createSalarySchema,
  useCreateSalary,
  useSalary,
  useSalaryStore,
  useUpdateSalary,
  type SalaryFormValues,
} from '@/entities/salary'

const EMPTY: SalaryFormValues = { organizationId: 0, userId: 0, fromDate: '', toDate: '', amount: 0, comment: '' }

/** Create/Edit salary accrual (Hisoblangan oylik). */
export function SalaryFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useSalaryStore((s) => s.formOpen)
  const editingId = useSalaryStore((s) => s.editingId)
  const close = useSalaryStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useSalary(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const { data: userOptions = [], isLoading: usersLoading } = useUserOptions()
  const createMutation = useCreateSalary()
  const updateMutation = useUpdateSalary()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createSalarySchema(t)), [t])
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SalaryFormValues>({ resolver, defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organization?.id ?? 0,
        userId: editing.user?.id ?? 0,
        fromDate: editing.fromDate ?? '',
        toDate: editing.toDate ?? '',
        amount: editing.amount ?? 0,
        comment: editing.comment ?? '',
      })
    } else if (!isEdit) reset(EMPTY)
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const dto = { ...values, comment: values.comment || undefined }
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate({ id: editingId, dto }, { onSuccess: () => { message.success(t('salaryAccrual.savedSuccess')); close() }, onError })
    } else {
      createMutation.mutate(dto, { onSuccess: () => { message.success(t('salaryAccrual.savedSuccess')); close() }, onError })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('salaryAccrual.edit') : t('salaryAccrual.add')}
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
            <Form.Item label={t('salaryAccrual.organization')} required validateStatus={errors.organizationId && 'error'} help={errors.organizationId?.message}>
              <Select showSearch optionFilterProp="label" loading={orgsLoading} options={orgOptions} value={field.value || undefined} onChange={field.onChange} />
            </Form.Item>
          )}
        />
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('salaryAccrual.employee')} required validateStatus={errors.userId && 'error'} help={errors.userId?.message}>
              <Select showSearch optionFilterProp="label" loading={usersLoading} options={userOptions} value={field.value || undefined} onChange={field.onChange} />
            </Form.Item>
          )}
        />
        <Controller
          name="fromDate"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('salaryAccrual.fromDate')} required validateStatus={errors.fromDate && 'error'} help={errors.fromDate?.message}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="toDate"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('salaryAccrual.toDate')} required validateStatus={errors.toDate && 'error'} help={errors.toDate?.message}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('salaryAccrual.amount')} required validateStatus={errors.amount && 'error'} help={errors.amount?.message}>
              <InputNumber value={field.value} onChange={(v) => field.onChange(v ?? 0)} onBlur={field.onBlur} min={0} style={{ width: '100%' }} />
            </Form.Item>
          )}
        />
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('salaryAccrual.comment')}>
              <Input.TextArea {...field} rows={3} maxLength={500} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
