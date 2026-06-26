import { useEffect } from 'react'
import { App, Button, Col, DatePicker, Divider, Flex, Form, InputNumber, Row, Select } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useOrganizationOptions } from '@/entities/organization'
import { useSupplierOptions } from '@/entities/supplier'
import { useWarehouseOptions } from '@/entities/warehouse'
import { useCurrencyOptions } from '@/entities/currency'
import { useUnitOptions } from '@/entities/unit'
import { useItemCategoryOptions } from '@/entities/item-category'
import { useItemRefOptions } from '@/entities/item-ref'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { useCreateSupply, useSupplyStore, type CreateSupplyDto } from '@/entities/supply'

interface Row {
  meta?: 'Material' | 'Other'
  categoryId?: number
  itemId?: number
  unitId?: number
  quantity?: number
  pricePerUnit?: number
}
interface FormShape {
  organizationId?: number
  supplierId?: number
  warehouseId?: number
  currencyId?: number
  date?: dayjs.Dayjs
  supplyItems?: Row[]
}

/** Create a supply (Kirim buyurtma) — header + line items grid. */
export function SupplyFormDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormShape>()

  const open = useSupplyStore((s) => s.formOpen)
  const close = useSupplyStore((s) => s.closeForm)

  const { data: orgOptions = [] } = useOrganizationOptions()
  const { data: supplierOptions = [] } = useSupplierOptions()
  const { data: warehouseOptions = [] } = useWarehouseOptions()
  const { data: currencyOptions = [] } = useCurrencyOptions()
  const { data: unitOptions = [] } = useUnitOptions()
  const { data: categoryOptions = [] } = useItemCategoryOptions()
  const { data: itemOptions = [] } = useItemRefOptions()
  const createMutation = useCreateSupply()

  const metaOptions = [
    { value: 'Material', label: t('supply.metaMaterial') },
    { value: 'Other', label: t('supply.metaOther') },
  ]

  useEffect(() => {
    if (open) form.setFieldsValue({ supplyItems: [{ meta: 'Material' }] })
  }, [open, form])

  const onSubmit = () =>
    form.validateFields().then((v) => {
      const dto: CreateSupplyDto = {
        organizationId: v.organizationId!,
        supplierId: v.supplierId!,
        warehouseId: v.warehouseId!,
        currencyId: v.currencyId!,
        date: v.date ? v.date.toISOString() : '',
        supplyItems: (v.supplyItems ?? []).map((r) => ({
          meta: r.meta ?? 'Material',
          categoryId: r.categoryId!,
          itemId: r.itemId!,
          unitId: r.unitId!,
          quantity: r.quantity ?? 0,
          pricePerUnit: r.pricePerUnit ?? 0,
        })),
      }
      createMutation.mutate(dto, {
        onSuccess: () => {
          message.success(t('supply.createdSuccess'))
          form.resetFields()
          close()
        },
        onError: (e) => message.error(e.message),
      })
    })

  const req = [{ required: true, message: t('common.required') }]

  return (
    <FormDrawer
      open={open}
      title={t('supply.create')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      confirmLoading={createMutation.isPending}
      onOk={onSubmit}
      onClose={close}
    >
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="supplierId" label={t('supply.supplier')} rules={req}>
              <Select showSearch optionFilterProp="label" options={supplierOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="warehouseId" label={t('supply.warehouse')} rules={req}>
              <Select showSearch optionFilterProp="label" options={warehouseOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="organizationId" label={t('supply.organization')} rules={req}>
              <Select showSearch optionFilterProp="label" options={orgOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="currencyId" label={t('supply.currency')} rules={req}>
              <Select showSearch optionFilterProp="label" options={currencyOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="date" label={t('supply.date')} rules={req}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider>{t('supply.items')}</Divider>

        <Form.List name="supplyItems">
          {(fields, { add, remove }) => (
            <Flex vertical gap={8}>
              {fields.map((field) => (
                <Row key={field.key} gutter={8} align="middle" wrap>
                  <Col flex="120px">
                    <Form.Item name={[field.name, 'meta']} rules={req} style={{ marginBottom: 8 }}>
                      <Select options={metaOptions} placeholder={t('supply.meta')} />
                    </Form.Item>
                  </Col>
                  <Col flex="150px">
                    <Form.Item name={[field.name, 'categoryId']} rules={req} style={{ marginBottom: 8 }}>
                      <Select showSearch optionFilterProp="label" options={categoryOptions} placeholder={t('supply.category')} />
                    </Form.Item>
                  </Col>
                  <Col flex="150px">
                    <Form.Item name={[field.name, 'itemId']} rules={req} style={{ marginBottom: 8 }}>
                      <Select showSearch optionFilterProp="label" options={itemOptions} placeholder={t('supply.item')} />
                    </Form.Item>
                  </Col>
                  <Col flex="120px">
                    <Form.Item name={[field.name, 'unitId']} rules={req} style={{ marginBottom: 8 }}>
                      <Select showSearch optionFilterProp="label" options={unitOptions} placeholder={t('supply.unit')} />
                    </Form.Item>
                  </Col>
                  <Col flex="100px">
                    <Form.Item name={[field.name, 'quantity']} rules={req} style={{ marginBottom: 8 }}>
                      <InputNumber min={0} style={{ width: '100%' }} placeholder={t('supply.quantity')} />
                    </Form.Item>
                  </Col>
                  <Col flex="110px">
                    <Form.Item name={[field.name, 'pricePerUnit']} rules={req} style={{ marginBottom: 8 }}>
                      <InputNumber min={0} style={{ width: '100%' }} placeholder={t('supply.pricePerUnit')} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ meta: 'Material' })} block>
                {t('supply.addItem')}
              </Button>
            </Flex>
          )}
        </Form.List>
      </Form>
    </FormDrawer>
  )
}
