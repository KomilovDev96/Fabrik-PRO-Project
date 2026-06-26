import { useEffect, useMemo } from 'react'
import { App, Form, Input, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useOrganizationOptions } from '@/entities/organization'
import { useRoleOptions } from '@/entities/role'
import { useDepartmentOptions } from '@/entities/department'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import {
  USER_STORES,
  USER_TYPES,
  createUserSchema,
  useCreateUser,
  useUpdateUser,
  useUser,
  type UserFormValues,
  type UserVariant,
} from '@/entities/user'

const EMPTY_FORM: UserFormValues = {
  type: 'User',
  organizationId: undefined,
  roleId: undefined,
  departmentId: undefined,
  fullName: '',
  phoneNumber: '',
  password: '',
}

interface Props {
  variant: UserVariant
}

/** Create/Edit user drawer — shared by Foydalanuvchilar and Xodimlar. */
export function UserFormDrawer({ variant }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const useStore = USER_STORES[variant]

  const open = useStore((s) => s.formOpen)
  const editingId = useStore((s) => s.editingId)
  const close = useStore((s) => s.closeForm)
  const isEdit = editingId != null

  const { data: editing, isFetching } = useUser(isEdit ? editingId : undefined)
  const { data: orgOptions = [], isLoading: orgsLoading } = useOrganizationOptions()
  const { data: roleOptions = [], isLoading: rolesLoading } = useRoleOptions()
  const { data: deptOptions = [], isLoading: deptsLoading } = useDepartmentOptions()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const submitting = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(createUserSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({ resolver, defaultValues: EMPTY_FORM })

  const typeOptions = useMemo(() => USER_TYPES.map((ty) => ({ value: ty, label: ty })), [])

  useEffect(() => {
    if (!open) return
    if (isEdit && editing) {
      reset({
        type: editing.type,
        organizationId: editing.organization?.id ?? undefined,
        roleId: editing.role?.id ?? undefined,
        departmentId: editing.department?.id ?? undefined,
        fullName: editing.fullName ?? '',
        phoneNumber: editing.phoneNumber ?? '',
        password: '',
      })
    } else if (!isEdit) {
      reset(EMPTY_FORM)
    }
  }, [open, isEdit, editing, reset])

  const onSubmit = handleSubmit((values) => {
    const dto = {
      ...values,
      organizationId: values.organizationId || undefined,
      roleId: values.roleId || undefined,
      departmentId: values.departmentId || undefined,
      password: values.password || undefined,
    }
    const onError = (e: { message: string }) => message.error(e.message)

    if (isEdit && editingId != null) {
      updateMutation.mutate(
        { id: editingId, dto },
        {
          onSuccess: () => {
            message.success(t('user.updatedSuccess'))
            close()
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          message.success(t('user.createdSuccess'))
          close()
        },
        onError,
      })
    }
  })

  return (
    <FormDrawer
      open={open}
      title={isEdit ? t('user.edit') : t('user.add')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={submitting}
      onOk={onSubmit}
      onClose={close}
    >
      <Form layout="vertical" disabled={submitting || (isEdit && isFetching)}>
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('user.fullName')}
              required
              validateStatus={errors.fullName && 'error'}
              help={errors.fullName?.message}
            >
              <Input {...field} autoFocus maxLength={150} />
            </Form.Item>
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('user.phone')}
              required
              validateStatus={errors.phoneNumber && 'error'}
              help={errors.phoneNumber?.message}
            >
              <Input {...field} maxLength={30} placeholder="+998 ..." />
            </Form.Item>
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('user.type')} required>
              <Select options={typeOptions} value={field.value} onChange={field.onChange} />
            </Form.Item>
          )}
        />

        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('user.role')}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={rolesLoading}
                options={roleOptions}
                value={field.value || undefined}
                onChange={(v) => field.onChange(v ?? undefined)}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('user.department')}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={deptsLoading}
                options={deptOptions}
                value={field.value || undefined}
                onChange={(v) => field.onChange(v ?? undefined)}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="organizationId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('user.organization')}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={orgsLoading}
                options={orgOptions}
                value={field.value || undefined}
                onChange={(v) => field.onChange(v ?? undefined)}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('user.password')}
              help={isEdit ? t('user.passwordEditHint') : undefined}
              validateStatus={errors.password && 'error'}
            >
              <Input.Password {...field} maxLength={100} autoComplete="new-password" />
            </Form.Item>
          )}
        />
      </Form>
    </FormDrawer>
  )
}
