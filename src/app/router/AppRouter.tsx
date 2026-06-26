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
const PayrollLedgerPage = lazy(() =>
  import('@/pages/payroll').then((m) => ({ default: m.PayrollLedgerPage })),
)
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })))
const AttendancePage = lazy(() =>
  import('@/pages/attendance').then((m) => ({ default: m.AttendancePage })),
)
const SickLeavePage = lazy(() =>
  import('@/pages/sick-leave').then((m) => ({ default: m.SickLeavePage })),
)
const SuppliersPage = lazy(() =>
  import('@/pages/suppliers').then((m) => ({ default: m.SuppliersPage })),
)
const ProductsPage = lazy(() => import('@/pages/products').then((m) => ({ default: m.ProductsPage })))
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })))
const PulKirimPage = lazy(() => import('@/pages/pul-kirim').then((m) => ({ default: m.PulKirimPage })))
const PulChiqimPage = lazy(() =>
  import('@/pages/pul-chiqim').then((m) => ({ default: m.PulChiqimPage })),
)
const KpiPage = lazy(() => import('@/pages/kpi').then((m) => ({ default: m.KpiPage })))
const ProductionPage = lazy(() =>
  import('@/pages/production').then((m) => ({ default: m.ProductionPage })),
)
const SalaryAccrualPage = lazy(() =>
  import('@/pages/salary-accrual').then((m) => ({ default: m.SalaryAccrualPage })),
)
const TolovlarPage = lazy(() => import('@/pages/tolovlar').then((m) => ({ default: m.TolovlarPage })))
const ProductModelPage = lazy(() =>
  import('@/pages/product-model').then((m) => ({ default: m.ProductModelPage })),
)
const RbacPage = lazy(() => import('@/pages/rbac').then((m) => ({ default: m.RbacPage })))
const KirimBuyurtmalarPage = lazy(() =>
  import('@/pages/kirim-buyurtmalar').then((m) => ({ default: m.KirimBuyurtmalarPage })),
)
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
    case ROUTES.salary:
      return <PayrollLedgerPage kind="salary" />
    case ROUTES.advance:
      return <PayrollLedgerPage kind="advance" />
    case ROUTES.penalty:
      return <PayrollLedgerPage kind="penalty" />
    case ROUTES.bonus:
      return <PayrollLedgerPage kind="bonus" />
    case ROUTES.users:
      return <UsersPage variant="foydalanuvchilar" />
    case ROUTES.employees:
      return <UsersPage variant="xodimlar" />
    case ROUTES.attendance:
      return <AttendancePage />
    case ROUTES.sickLeave:
      return <SickLeavePage />
    case ROUTES.suppliers:
      return <SuppliersPage />
    case ROUTES.products:
      return <ProductsPage />
    case ROUTES.settings:
      return <SettingsPage />
    case ROUTES.pulKirim:
      return <PulKirimPage />
    case ROUTES.pulChiqim:
      return <PulChiqimPage />
    case ROUTES.kpi:
      return <KpiPage />
    case ROUTES.production:
      return <ProductionPage />
    case ROUTES.salaryAccrual:
      return <SalaryAccrualPage />
    case ROUTES.payments:
      return <TolovlarPage />
    case ROUTES.productModel:
      return <ProductModelPage />
    case ROUTES.roles:
      return <RbacPage />
    case ROUTES.orders:
      return <KirimBuyurtmalarPage />
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
