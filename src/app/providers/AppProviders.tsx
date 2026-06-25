import { useEffect, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '@/shared/api'
import { useSessionStore } from '@/entities/session'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'

/**
 * Root provider stack. Order matters:
 *   QueryProvider (data) → ThemeProvider (UI + AntApp) → children (router).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // Wire the API 401 handler to the session here, so `shared/api` never imports
  // `entities/session` (preserves the FSD dependency direction).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      useSessionStore.getState().clearSession()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    })
  }, [])

  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  )
}
