import axios, { AxiosError, type AxiosInstance } from 'axios'
import { API_BASE_URL } from '@/shared/config/env'
import { STORAGE_KEYS } from '@/shared/config/constants'
import type { ApiError } from './types'

/**
 * Single axios instance for the whole app.
 *
 * Responsibilities:
 *  - attach the bearer token on every request,
 *  - normalize any failure into a predictable `ApiError`,
 *  - centralize 401 handling (session expiry) in one place.
 *
 * Entity API modules import this client — they never create their own axios.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// --- Request: attach auth token -------------------------------------------
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Callback invoked when the API returns 401. Wired up by the session layer
 *  so `shared` never imports `entities` (keeps the FSD dependency rule intact). */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

/** Extract a human-readable message from any backend error body.
 *  This backend returns JSON `{ message }` for some errors and plain text for
 *  others (e.g. invalid login → 404 with a text body), so handle both. */
function readErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (data && typeof data === 'object') {
    const obj = data as { message?: unknown; title?: unknown }
    if (typeof obj.message === 'string' && obj.message) return obj.message
    if (typeof obj.title === 'string' && obj.title) return obj.title
  }
  return fallback
}

// --- Response: unwrap + normalize errors ----------------------------------
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    if (error.response?.status === 401) {
      onUnauthorized?.()
    }

    const data = error.response?.data
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: readErrorMessage(data, error.message || 'Произошла ошибка. Повторите попытку.'),
      fields:
        data && typeof data === 'object'
          ? (data as { errors?: Record<string, string[]> }).errors
          : undefined,
    }
    return Promise.reject(apiError)
  },
)
