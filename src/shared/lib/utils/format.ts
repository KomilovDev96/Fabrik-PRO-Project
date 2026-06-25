import dayjs from 'dayjs'

/** Format a money amount with thousands separators (UZS by default). */
export function formatMoney(value: number, currency = 'UZS'): string {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ${currency}`
}

/** Format an ISO date string for display. Returns '—' for empty values. */
export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '—'
  return dayjs(value).format(withTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY')
}
