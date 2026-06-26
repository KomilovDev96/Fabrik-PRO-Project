import { useEffect, useMemo } from 'react'
import { App, DatePicker, Form, Input, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useOrganizationOptions } from '@/entities/organization'
import { useUserOptions } from '@/entities/user'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  createSickLeaveSchema,
  useCreateSickLeave,
  useSickLeave,
  useSickLeaveStore,
  useUpdateSickLeave,
  type SickLeaveFormValues,
} from '@/entities/sick-leave'

const EMPTY_FORM: SickLeaveFormValues = {
  organizationId: 0,
  userId: 0,
  startDate: '',
  endDate: '',
  notes: '',
}

/** Create/Edit sick leave (Javob olgan kunlar) drawer. */
export function SickLeaveFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useSickLeaveStore((s) => s.formOpen)
  const editingId = useSickLeaveStore((s) => s.editingId)
  const close = useSickLeaveStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useSickLeave(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const { data: userOptions = [], isLoading: usersLoading } = useUserOptions()
  const createMutation = useCreateSickLeave()
  const updateMutation = useUpdateSickLeave()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createSickLeaveSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SickLeaveFormValues>({ resolver, defaultValues: EMPTY_FORM })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organization?.id ?? 0,
        userId: editing.user?.id ?? 0,
        startDate: editing.startDate ?? '',
        endDate: editing.endDate ?? '',
        notes: editing.notes ?? '',
      })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const dto = { ...values, notes: values.notes || undefined }
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto },
        { onSuccess: () => { message.success(t('sickLeave.updatedSuccess')); close() }, onError },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => { message.success(t('sickLeave.createdSuccess')); close() },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('sickLeave.edit') : t('sickLeave.add')}
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
            <Form.Item label={t('sickLeave.organization')} required validateStatus={errors.organizationId && 'error'} help={errors.organizationId?.message}>
              <Select showSearch optionFilterProp="label" loading={orgsLoading} options={orgOptions} value={field.value || undefined} onChange={field.onChange} />
            </Form.Item>
          )}
        />
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('sickLeave.employee')} required validateStatus={errors.userId && 'error'} help={errors.userId?.message}>
              <Select showSearch optionFilterProp="label" loading={usersLoading} options={userOptions} value={field.value || undefined} onChange={field.onChange} />
            </Form.Item>
          )}
        />
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('sickLeave.startDate')} required validateStatus={errors.startDate && 'error'} help={errors.startDate?.message}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('sickLeave.endDate')} required validateStatus={errors.endDate && 'error'} help={errors.endDate?.message}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('sickLeave.notes')}>
              <Input.TextArea {...field} rows={3} maxLength={500} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
