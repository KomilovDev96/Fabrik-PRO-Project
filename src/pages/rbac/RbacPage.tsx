import { useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PAGE_SIZE_OPTIONS } from '@/shared/config/constants'
import { useOrganizationOptions } from '@/entities/organization'
import {
  useCreateRole,
  useDeleteRole,
  usePermissions,
  useRoles,
  useSetRolePermissions,
  useUpdateRole,
  type Role,
} from '@/entities/role'

/** RBAC — roles + permission assignment (Sozlamalar). */
export function RbacPage() {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const [roleForm] = Form.useForm()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permsRole, setPermsRole] = useState<Role | null>(null)
  const [checked, setChecked] = useState<number[]>([])

  const { data, isLoading, isFetching } = useRoles({ page, pageSize })
  const { data: orgOptions = [] } = useOrganizationOptions()
  const { data: permissions = [], isLoading: permsLoading } = usePermissions()
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()
  const setPermsMutation = useSetRolePermissions()

  const openCreate = () => {
    setEditingRole(null)
    roleForm.resetFields()
    setRoleModalOpen(true)
  }
  const openEdit = (role: Role) => {
    setEditingRole(role)
    roleForm.setFieldsValue({ title: role.title, organizationId: role.organization?.id })
    setRoleModalOpen(true)
  }
  const saveRole = () =>
    roleForm.validateFields().then((values) => {
      const onDone = () => {
        message.success(t('rbac.savedSuccess'))
        setRoleModalOpen(false)
      }
      const onError = (e: { message: string }) => message.error(e.message)
      if (editingRole) updateMutation.mutate({ id: editingRole.id, dto: values }, { onSuccess: onDone, onError })
      else createMutation.mutate(values, { onSuccess: onDone, onError })
    })

  const openPerms = (role: Role) => {
    setPermsRole(role)
    setChecked([]) // detail does not return current permissions — see notice
  }
  const savePerms = () => {
    if (!permsRole) return
    setPermsMutation.mutate(
      { id: permsRole.id, permissions: checked, method: 'Replace' },
      {
        onSuccess: () => {
          message.success(t('rbac.permsSaved'))
          setPermsRole(null)
        },
        onError: (e) => message.error(e.message),
      },
    )
  }

  const columns = useMemo<TableColumnsType<Role>>(
    () => [
      { title: t('rbac.roleName'), dataIndex: 'title', key: 'title', ellipsis: true },
      { title: t('rbac.organization'), key: 'org', ellipsis: true, render: (_, r) => r.organization?.title ?? '—' },
      {
        title: t('common.actions'),
        key: 'actions',
        width: 170,
        align: 'center',
        render: (_, role) => (
          <Space size={0}>
            <Button type="text" icon={<SafetyOutlined />} onClick={() => openPerms(role)} title={t('rbac.permissions')} />
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(role)} />
            <Popconfirm
              title={t('common.deleteConfirm', { name: role.title })}
              okText={t('common.yes')}
              cancelText={t('common.no')}
              okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
              onConfirm={() => deleteMutation.mutate(role.id, { onSuccess: () => message.success(t('rbac.deletedSuccess')), onError: (e) => message.error(e.message) })}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, deleteMutation.isPending],
  )

  return (
    <Card variant="borderless">
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('rbac.title')}
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('rbac.addRole')}
        </Button>
      </Flex>

      <Table<Role>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />

      <Modal
        open={roleModalOpen}
        title={editingRole ? t('rbac.editRole') : t('rbac.addRole')}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => setRoleModalOpen(false)}
        onOk={saveRole}
        destroyOnHidden
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item name="title" label={t('rbac.roleName')} rules={[{ required: true, message: t('common.required') }]}>
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item name="organizationId" label={t('rbac.organization')} rules={[{ required: true, message: t('common.required') }]}>
            <Select showSearch optionFilterProp="label" options={orgOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={permsRole != null}
        title={`${t('rbac.permissions')} — ${permsRole?.title ?? ''}`}
        size="large"
        onClose={() => setPermsRole(null)}
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => setPermsRole(null)}>{t('common.cancel')}</Button>
            <Button type="primary" loading={setPermsMutation.isPending} onClick={savePerms}>
              {t('common.save')}
            </Button>
          </Flex>
        }
      >
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message={t('rbac.permsNotice')} />
        {permsLoading ? (
          <Flex justify="center" style={{ padding: 32 }}>
            <Spin />
          </Flex>
        ) : (
          <Checkbox.Group value={checked} onChange={(v) => setChecked(v as number[])} style={{ width: '100%' }}>
            <Flex vertical gap={10}>
              {permissions.map((p) => (
                <Checkbox key={p.id} value={p.id}>
                  {p.title}
                  {p.description ? <Typography.Text type="secondary"> — {p.description}</Typography.Text> : null}
                </Checkbox>
              ))}
            </Flex>
          </Checkbox.Group>
        )}
      </Drawer>
    </Card>
  )
}
