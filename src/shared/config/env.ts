/**
 * Typed, centralized access to environment variables.
 * Never read `import.meta.env` directly elsewhere — import from here.
 */
export const env = {
  /** API origin as seen by the browser. Empty in dev (relative `/api` + Vite proxy). */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE ?? 'ru',
  appName: import.meta.env.VITE_APP_NAME ?? 'Fabric PRO',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

/** Full base URL for the API client. Backend exposes everything under `/api/v1`.
 *  Dev: empty origin → relative `/api/v1` (Vite proxy). Prod: `<origin>/api/v1`. */
export const API_BASE_URL = `${env.apiBaseUrl}/api/v1`
