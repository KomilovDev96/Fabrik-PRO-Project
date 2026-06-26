import { useEffect, useMemo } from 'react'
import { App, Button, Col, Flex, Form, Input, Row, Select, Spin, Tooltip, Typography } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useBusinessCategoryOptions } from '@/entities/business-category'
import { useCurrencyOptions } from '@/entities/currency'
import {
  organizationSettingsSchema,
  useCurrentOrganization,
  useUpdateOrganization,
  type OrganizationSettingsValues,
} from '@/entities/organization'

const EMPTY: OrganizationSettingsValues = {
  title: '',
  stir: '',
  categoryId: undefined,
  mainCurrencyId: undefined,
}

/**
 * Sozlamalar → Account: the organization's own profile. The API only stores
 * title / stir(INN) / categoryId / mainCurrencyId — the design's email, phone,
 * location, address and registration date have no API field, so they are shown
 * as disabled placeholders.
 */
export function AccountTab() {
  const { t } = useTranslation()
  const { message } = App.useApp()

  const { data: org, isLoading } = useCurrentOrganization()
  const { data: categoryOptions = [], isLoading: catsLoading } = useBusinessCategoryOptions()
  const { data: currencyOptions = [], isLoading: curLoading } = useCurrencyOptions()
  const updateMutation = useUpdateOrganization()

  const resolver = useMemo(() => zodResolver(organizationSettingsSchema(t)), [t])
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationSettingsValues>({ resolver, defaultValues: EMPTY })

  useEffect(() => {
    if (org) {
      reset({
        title: org.title,
        stir: org.stir,
        categoryId: undefined, // detail returns category as a string, not an id
        mainCurrencyId: org.mainCurrency?.id ?? undefined,
      })
    }
  }, [org, reset])

  const onSubmit = handleSubmit((values) => {
    if (!org) return
    updateMutation.mutate(
      {
        id: org.id,
        dto: {
          ...values,
          categoryId: values.categoryId || undefined,
          mainCurrencyId: values.mainCurrencyId || undefined,
        },
      },
      {
        onSuccess: () => message.success(t('settings.savedSuccess')),
        onError: (e) => message.error(e.message),
      },
    )
  })

  if (isLoading) {
    return (
      <Flex justify="center" style={{ padding: 48 }}>
        <Spin />
      </Flex>
    )
  }

  return (
    <Form layout="vertical" style={{ maxWidth: 1000 }}>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        {t('settings.companyInfo')}
      </Typography.Title>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('settings.companyName')} required validateStatus={errors.title && 'error'} help={errors.title?.message}>
                <Input {...field} maxLength={200} />
              </Form.Item>
            )}
          />
        </Col>
        <Col xs={24} md={8}>
          <Controller
            name="stir"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('settings.inn')} required validateStatus={errors.stir && 'error'} help={errors.stir?.message}>
                <Input {...field} maxLength={50} />
              </Form.Item>
            )}
          />
        </Col>

        <Col xs={24} md={16}>
          <Form.Item label={t('settings.location')} help={t('settings.notInApi')}>
            <Input disabled placeholder="—" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Controller
            name="mainCurrencyId"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('settings.currency')}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={curLoading}
                  options={currencyOptions}
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v ?? undefined)}
                />
              </Form.Item>
            )}
          />
        </Col>

        <Col xs={24} md={16}>
          <Form.Item label={t('settings.email')} help={t('settings.notInApi')}>
            <Input disabled placeholder="—" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label={t('settings.companyPhone')} help={t('settings.notInApi')}>
            <Input disabled placeholder="—" />
          </Form.Item>
        </Col>

        <Col xs={24} md={16}>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('settings.businessCategory')}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={catsLoading}
                  options={categoryOptions}
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v ?? undefined)}
                  placeholder={org?.category ?? undefined}
                />
              </Form.Item>
            )}
          />
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label={t('settings.registeredAt')} help={t('settings.notInApi')}>
            <Input disabled placeholder="—" />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item label={t('settings.address')} help={t('settings.notInApi')}>
            <Input disabled placeholder="—" />
          </Form.Item>
        </Col>
      </Row>

      <Flex justify="flex-end" gap={8}>
        <Tooltip title={t('settings.fieldsNotice')}>
          <Button type="primary" loading={updateMutation.isPending} onClick={onSubmit} disabled={!org}>
            {t('common.save')}
          </Button>
        </Tooltip>
      </Flex>
    </Form>
  )
}
