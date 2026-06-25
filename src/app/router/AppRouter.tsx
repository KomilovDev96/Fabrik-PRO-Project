import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import { MainLayout, ROUTES, ALL_NAV_ITEMS } from '@/widgets/layout'
import { ProtectedRoute } from './ProtectedRoute'

// --- Lazy pages: each becomes its own chunk (code splitting) ----------------
const LoginPage = lazy(() => import('@/pages/auth').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })),
)
const WarehousesPage = lazy(() =>
  import('@/pages/warehouses').then((m) => ({ default: m.WarehousesPage })),
)
const RawMaterialsPage = lazy(() =>
  import('@/pages/items').then((m) => ({ default: m.RawMaterialsPage })),
)
const AccessoriesPage = lazy(() =>
  import('@/pages/items').then((m) => ({ default: m.AccessoriesPage })),
)
const ClientsPage = lazy(() => import('@/pages/clients').then((m) => ({ default: m.ClientsPage })))
const CashBoxPage = lazy(() => import('@/pages/cashbox').then((m) => ({ default: m.CashBoxPage })))
const SalesPage = lazy(() => import('@/pages/sales').then((m) => ({ default: m.SalesPage })))
const ModulePlaceholder = lazy(() =>
  import('@/pages/ModulePlaceholder').then((m) => ({ default: m.ModulePlaceholder })),
)
const NotFoundPage = lazy(() => import('@/pages/errors').then((m) => ({ default: m.NotFoundPage })))
const ForbiddenPage = lazy(() =>
  import('@/pages/errors').then((m) => ({ default: m.ForbiddenPage })),
)

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
      <Spin size="large" />
    </div>
  )
}

const withSuspense = (node: ReactNode) => <Suspense fallback={<PageLoader />}>{node}</Suspense>

/** Map a module route to its page (real pages override the generic placeholder). */
function renderModulePage(routeKey: string): ReactNode {
  switch (routeKey) {
    case ROUTES.dashboard:
      return <DashboardPage />
    case ROUTES.warehouses:
      return <WarehousesPage />
    case ROUTES.rawMaterials:
      return <RawMaterialsPage />
    case ROUTES.accessories:
      return <AccessoriesPage />
    case ROUTES.clients:
      return <ClientsPage />
    case ROUTES.cashbox:
      return <CashBoxPage />
    case ROUTES.sales:
      return <SalesPage />
    default:
      return <ModulePlaceholder />
  }
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={withSuspense(<LoginPage />)} />

      {/* Authenticated shell */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />

        {/* One route per module, each guarded by its `view` permission. */}
        {ALL_NAV_ITEMS.map((item) => (
          <Route
            key={item.key}
            path={item.key}
            element={
              <ProtectedRoute permission={item.permission}>
                {withSuspense(renderModulePage(item.key))}
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="/403" element={withSuspense(<ForbiddenPage />)} />
        <Route path="*" element={withSuspense(<NotFoundPage />)} />
      </Route>
    </Routes>
  )
}
