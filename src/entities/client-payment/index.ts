import { z } from 'zod'
import type { TFunction } from 'i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/shared/api'
import type { ApiError } from '@/shared/api'

const RESOURCE = '/admin/client-payments'

/** Matches ClientPaymentAdminCreate — money received from a client for an order. */
export const createClientPaymentSchema = (t: TFunction) =>
  z.object({
    organizationId: z.number().int().positive(t('common.required')),
    orderId: z.number().int().positive(t('common.required')),
    clientId: z.number().int().positive(t('common.required')),
    cashBoxId: z.number().int().positive(t('common.required')),
    paymentMethodId: z.number().int().positive(t('common.required')),
    currencyId: z.number().int().positive(t('common.required')),
    amount: z.number().positive(t('common.required')),
    date: z.string().min(1, t('common.required')),
    comment: z.string().trim().max(500).optional(),
  })

export type ClientPaymentFormValues = z.infer<ReturnType<typeof createClientPaymentSchema>>

export function useCreateClientPayment() {
  const qc = useQueryClient()
  return useMutation<unknown, ApiError, ClientPaymentFormValues>({
    mutationFn: (dto) => httpClient.post(RESOURCE, dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incomes'] }),
  })
}
