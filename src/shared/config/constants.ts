/** localStorage keys — keep them in one place to avoid typos and collisions. */
export const STORAGE_KEYS = {
  accessToken: 'fp_access_token',
  refreshToken: 'fp_refresh_token',
  locale: 'fp_locale',
  theme: 'fp_theme',
  sidebarCollapsed: 'fp_sidebar_collapsed',
} as const

/** Default pagination used by every list/table. */
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

/** Debounce (ms) for search inputs that trigger network requests. */
export const SEARCH_DEBOUNCE_MS = 400
