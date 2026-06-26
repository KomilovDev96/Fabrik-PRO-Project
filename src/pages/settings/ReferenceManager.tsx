import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/shared/config/constants'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { useCurrentOrganization } from '@/entities/organization'
import { makeReferenceApi, type ReferenceItem } from '@/entities/reference'

export interface RefColumn {
  key: string
  title: string
  color?: boolean
  /** Render a nested object's `.title`/`.fullName` (e.g. a `product` column). */
  nested?: boolean
}
export interface RefOption {
  value: number
  label: string
}
export interface RefField {
  name: string
  label: string
  required?: boolean
  type?: 'text' | 'number' | 'select'
  options?: RefOption[]
}

interface Props {
  /** Cache namespace + REST/RPC resource. */
  queryKey: string
  resource: string
  rpc?: boolean
  /** Add `organizationId` (current org) to the create payload. */
  orgScoped?: boolean
  columns: RefColumn[]
  fields: RefField[]
  addLabel: string
}

/**
 * Generic CRUD manager for a simple reference resource (Sozlamalar tabs:
 * colors / payment methods / currencies / product categories). One component,
 * configured per tab.
 */
export function ReferenceManager({ queryKey, resource, rpc, orgScoped, columns, fields, addLabel }: Props) {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const qc = useQueryClient()
  const [form] = Form.useForm()

  const api = useMemo(() => makeReferenceApi(resource, { rpc }), [resource, rpc])
  const { data: currentOrg } = useCurrentOrganization()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<ID | null>(null)

  const keyBase = ['reference', queryKey] as const
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...keyBase, 'list', page, pageSize],
    queryFn: () => api.list({ page, pageSize }),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: [...keyBase, 'list'] })

  const saveMutation = useMutation<ReferenceItem, ApiError, Record<string, unknown>>({
    mutationFn: (values) => {
      const dto = orgScoped ? { ...values, organizationId: currentOrg?.id } : values
      return editingId != null ? api.update(editingId, dto) : api.create(dto)
    },
    onSuccess: () => {
      message.success(t('common.save'))
      setModalOpen(false)
      invalidate()
    },
    onError: (e) => message.error(e.message),
  })

  const delMutation = useMutation<void, ApiError, ID>({
    mutationFn: (id) => api.remove(id),
    onSuccess: () => {
      message.success(t('settings.deleted'))
      invalidate()
    },
    onError: (e) => message.error(e.message),
  })

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    setModalOpen(true)
  }
  const openEdit = (row: ReferenceItem) => {
    setEditingId(row.id)
    form.setFieldsValue(row)
    setModalOpen(true)
  }

  const tableColumns = useMemo<TableColumnsType<ReferenceItem>>(() => {
    const dataCols: TableColumnsType<ReferenceItem> = columns.map((c) => ({
      title: c.title,
      dataIndex: c.key,
      key: c.key,
      ellipsis: true,
      render: c.color
        ? (v: string) =>
            v ? (
              <Tag color={v} style={{ minWidth: 56, textAlign: 'center' }}>
                {v}
              </Tag>
            ) : (
              '—'
            )
        : c.nested
          ? (v: unknown) => {
              if (v == null) return '—'
              if (typeof v === 'object') {
                const o = v as { title?: string; fullName?: string }
                return o.title || o.fullName || '—'
              }
              return String(v)
            }
          : (v: unknown) => (v == null || v === '' ? '—' : String(v)),
    }))
    return [
      ...dataCols,
      {
        title: t('common.actions'),
        key: 'actions',
        width: 110,
        align: 'center',
        render: (_, row) => (
          <Space size={0}>
            <Button type="text" aria-label="edit" icon={<EditOutlined />} onClick={() => openEdit(row)} />
            <Popconfirm
              title={t('common.deleteConfirm', { name: String(row[columns[0]?.key] ?? `#${row.id}`) })}
              okText={t('common.yes')}
              cancelText={t('common.no')}
              okButtonProps={{ danger: true, loading: delMutation.isPending }}
              onConfirm={() => delMutation.mutate(row.id)}
            >
              <Button type="text" danger aria-label="delete" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, t, delMutation.isPending])

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {addLabel}
        </Button>
      </Flex>

      <Table<ReferenceItem>
        rowKey="id"
        columns={tableColumns}
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
        open={modalOpen}
        title={addLabel}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        confirmLoading={saveMutation.isPending}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.validateFields().then((v) => saveMutation.mutate(v))}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {fields.map((f) => (
            <Form.Item
              key={f.name}
              name={f.name}
              label={f.label}
              rules={f.required ? [{ required: true, message: t('common.required') }] : undefined}
            >
              {f.type === 'select' ? (
                <Select showSearch optionFilterProp="label" options={f.options} allowClear={!f.required} />
              ) : f.type === 'number' ? (
                <InputNumber style={{ width: '100%' }} />
              ) : (
                <Input maxLength={150} />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  )
}
