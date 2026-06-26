import { useEffect, useMemo } from 'react'
import { App, DatePicker, Form, Input, Select, TimePicker } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useOrganizationOptions } from '@/entities/organization'
import { useUserOptions } from '@/entities/user'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  createAttendanceSchema,
  useAttendance,
  useAttendanceStore,
  useCreateAttendance,
  useUpdateAttendance,
  type AttendanceFormValues,
} from '@/entities/attendance'

const EMPTY_FORM: AttendanceFormValues = {
  organizationId: 0,
  userId: 0,
  date: '',
  arrivalTime: '',
  departureTime: '',
  notes: '',
}

const toTime = (v?: string) => (v ? dayjs(v, ['HH:mm:ss', 'HH:mm']) : null)

/** Create/Edit attendance (Davomat) drawer. */
export function AttendanceFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const open = useAttendanceStore((s) => s.formOpen)
  const editingId = useAttendanceStore((s) => s.editingId)
  const close = useAttendanceStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useAttendance(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const { data: userOptions = [], isLoading: usersLoading } = useUserOptions()
  const createMutation = useCreateAttendance()
  const updateMutation = useUpdateAttendance()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createAttendanceSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormValues>({ resolver, defaultValues: EMPTY_FORM })

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        organizationId: editing.organization?.id ?? 0,
        userId: editing.user?.id ?? 0,
        date: editing.date ?? '',
        arrivalTime: editing.arrivalTime ?? '',
        departureTime: editing.departureTime ?? '',
        notes: editing.notes ?? '',
      })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const dto = {
      ...values,
      arrivalTime: values.arrivalTime || undefined,
      departureTime: values.departureTime || undefined,
      notes: values.notes || undefined,
    }
    const onError = (e: { message: string }) => message.error(e.message)
    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto },
        { onSuccess: () => { message.success(t('attendance.updatedSuccess')); close() }, onError },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => { message.success(t('attendance.createdSuccess')); close() },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('attendance.edit') : t('attendance.add')}
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
            <Form.Item label={t('attendance.organization')} required validateStatus={errors.organizationId && 'error'} help={errors.organizationId?.message}>
              <Select showSearch optionFilterProp="label" loading={orgsLoading} options={orgOptions} value={field.value || undefined} onChange={field.onChange} />
            </Form.Item>
          )}
        />
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('attendance.employee')} required validateStatus={errors.userId && 'error'} help={errors.userId?.message}>
              <Select showSearch optionFilterProp="label" loading={usersLoading} options={userOptions} value={field.value || undefined} onChange={field.onChange} />
            </Form.Item>
          )}
        />
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('attendance.date')} required validateStatus={errors.date && 'error'} help={errors.date?.message}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="arrivalTime"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('attendance.arrival')}>
              <TimePicker format="HH:mm" style={{ width: '100%' }} value={toTime(field.value)} onChange={(d) => field.onChange(d ? d.format('HH:mm:ss') : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="departureTime"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('attendance.departure')}>
              <TimePicker format="HH:mm" style={{ width: '100%' }} value={toTime(field.value)} onChange={(d) => field.onChange(d ? d.format('HH:mm:ss') : '')} />
            </Form.Item>
          )}
        />
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('attendance.notes')}>
              <Input.TextArea {...field} rows={3} maxLength={500} />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
