import { z } from 'zod'
import type { TFunction } from 'i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/shared/api'
import type { ApiError } from '@/shared/api'

const RESOURCE = '/admin/supplier-payments'

/** Matches SupplierPaymentAdminCreate — money paid to a supplier. */
export const createSupplierPaymentSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    supplierId: z.number().int().positive(t('common.required')),
    cashBoxId: z.number().int().positive(t('common.required')),
    paymentMethodId: z.number().int().positive(t('common.required')),
    currencyId: z.number().int().positive(t('common.required')),
    amount: z.number().positive(t('common.required')),
    date: z.string().min(1, t('common.required')),
    comment: z.string().trim().max(500).optional(),
  })

export type SupplierPaymentFormValues = z.infer<ReturnType<typeof createSupplierPaymentSchema>>

export function useCreateSupplierPayment() {
  const qc = useQueryClient()
  return useMutation<unknown, ApiError, SupplierPaymentFormValues>({
    mutationFn: (dto) => httpClient.post(RESOURCE, dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outcomes'] }),
  })
}
