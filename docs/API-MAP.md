# API-карта проекта Fabriq PRO

Документ описывает, **какая страница к каким API-эндпоинтам подключена**.

## Общие правила

- **Базовый URL:** все пути ниже относительны к `API_BASE_URL = <origin> + /api/v1`
  (см. [env.ts](../src/shared/config/env.ts)). В dev — относительный `/api/v1` через Vite-прокси.
- **Авторизация:** `Bearer <token>` добавляется ко всем запросам интерсептором
  [httpClient.ts](../src/shared/api/httpClient.ts). На `401` — авто-разлогин.
- **Пагинация:** список читает `X-Total-Count`; параметры обычно `Page` / `Limit`.
- **Источник меню/роутов:** [menuConfig.tsx](../src/widgets/layout/menuConfig.tsx) →
  роуты генерируются в [AppRouter.tsx](../src/app/router/AppRouter.tsx).
- **CRUD-сокращение:** `list / get{id} / create / update{id} / delete{id} / bulk-delete`
  означает стандартный набор (GET список, GET по id, POST, PATCH, DELETE, DELETE?ids=).
- Каждая entity лежит в `src/entities/<name>/api`.

Легенда статуса: ✅ — видна сейчас · 🚫 — закомментирована (скрыта до особого указания).

---

## ✅ Видимые страницы (активны)

### 🔐 Login — `/login`
- **Страница:** [pages/auth](../src/pages/auth) · entity `session`
  ([authApi.ts](../src/entities/session/api/authApi.ts))
- **API:**
  - `POST /User/Login/login` — вход (токен приходит в теле/заголовке; при неверных данных backend отдаёт `404`)
  - `GET  /User/GetMe/me` — текущий пользователь после входа

### 👥 Foydalanuvchilar (Пользователи) — `/users`
- **Страница:** [pages/users](../src/pages/users) `UsersPage variant="foydalanuvchilar"` · entity `user`
- **API (`/admin/UserAdmin`):**
  - `GET    /admin/UserAdmin/GetAll`
  - `GET    /admin/UserAdmin/Get/{id}`
  - `POST   /admin/UserAdmin/Create`
  - `PATCH  /admin/UserAdmin/Update/{id}`
  - `DELETE /admin/UserAdmin/Delete/{id}`
  - доп. простой список: `GET /User/GetAll`
- **Lookups формы** (user-form): `GET /admin/departments`, `GET /admin/roles`, `GET /admin/organizations`

### 🧑‍💼 Mijozlar (Клиенты) — `/clients`
- **Страница:** [pages/clients](../src/pages/clients) `ClientsPage` · entity `client`
- **API (`/admin/clients`):** list / get{id} / create / update{id} / delete{id} / bulk-delete (+ поисковый список)
- **Lookups формы** (client-form): `GET /admin/organizations`

### 🏬 Omborxona (Склады) — `/warehouses`
- **Страница:** [pages/warehouses](../src/pages/warehouses) `WarehousesPage` · entity `warehouse`
- **API (`/Warehouse`):**
  - `GET    /Warehouse/GetAll`
  - `GET    /Warehouse/Get/{id}`
  - `POST   /Warehouse/Create`
  - `PATCH  /Warehouse/Update/{id}`
  - `DELETE /Warehouse/Delete/{id}`
- **Lookups формы** (warehouse-form): `GET /User/GetAll`

### 🧵 Xom ashyolar (Сырьё) — `/raw-materials`
- **Страница:** [pages/items](../src/pages/items) `RawMaterialsPage` · entity `item`
- **API:**
  - `GET /items` (фильтр по типу «сырьё») · `GET /items/{id}` · `POST /items` · `PATCH /items/{id}` · `DELETE /items/{id}`
  - `GET /item-categories` — категории

### 🧷 Aksesuarlar (Аксессуары) — `/accessories`
- **Страница:** [pages/items](../src/pages/items) `AccessoriesPage` · entity `item` (та же, фильтр по типу «аксессуар»)
- **API:** `GET /items`, `GET /items/{id}`, `POST /items`, `PATCH /items/{id}`, `DELETE /items/{id}`, `GET /item-categories`

### 💰 Maosh (Зарплата) — подменю
Общая логика — entity `payroll`, ресурс выбирается по `kind`
([payrollApi.ts](../src/entities/payroll/api/payrollApi.ts)). Для каждого: list / get{id} / create / update{id} / delete{id} / bulk-delete.

| Пункт | Роут | `kind` | API-ресурс |
|---|---|---|---|
| Oylik | `/salary` | `salary` | `/admin/salary-payments` |
| Avans | `/advance` | `advance` | `/admin/advances` |
| Jarima | `/penalty` | `penalty` | `/admin/penalties` |
| Bonus | `/bonus` | `bonus` | `/admin/bonuses` |
| Hisoblangan | `/salary-accrual` | — | entity `salary` → `/admin/salaries` |

- **Страницы:** [pages/payroll](../src/pages/payroll) `PayrollLedgerPage` (oylik/avans/jarima/bonus),
  [pages/salary-accrual](../src/pages/salary-accrual) `SalaryAccrualPage`
- **Lookups форм** (payroll-form / salary-form): `GET /admin/organizations`, список пользователей (`/admin/UserAdmin/GetAll`, `/User/GetAll`)

---

## 🚫 Скрытые страницы (закомментированы)

### 📊 Dashboard — `/dashboard`
- [pages/dashboard](../src/pages/dashboard) `DashboardPage` — **статическая, API нет.**
- ⚠️ Был стартовым роутом; сейчас редирект `/` ведёт на `/clients`.

### 📈 Analytics — `/analytics`
- `ModulePlaceholder` (реальной страницы нет) — **API нет.**

### 🔩 Ehtiyot qismlar (Запчасти) — `/spare-parts`
- `ModulePlaceholder` — **API нет** (страница не реализована).

### 🛠 Asboblar (Инструменты) — `/tools`
- `ModulePlaceholder` — **API нет** (страница не реализована).

### 📦 Products (Товары) — `/products`
- [pages/products](../src/pages/products) `ProductsPage` · entity `product`
- **API (`/admin/products`):** list / get{id} / create / update{id} / delete{id} / bulk-delete (+ поиск)
- **Lookups:** `GET /admin/organizations`

### 🚚 Suppliers (Поставщики) — `/suppliers`
- [pages/suppliers](../src/pages/suppliers) `SuppliersPage` · entity `supplier`
- **API (`/admin/suppliers`):** list / get{id} / create / update{id} / delete{id} / bulk-delete (+ поиск)
- **Lookups:** `GET /admin/organizations`

### 🛒 Sales (Продажи) — `/sales`
- [pages/sales](../src/pages/sales) `SalesPage` · entities `order`, `client`, `warehouse`
- **API (`/admin/orders`):** list / get{id} / create / update{id} / delete{id} / bulk-delete (+ поиск)
- **Lookups** (order-form): `/admin/clients`, `/admin/currencies`, `/admin/organizations`, `/admin/payment-methods`, `/Warehouse/GetAll`

### 📥 Orders / Kirim buyurtmalar (Приходные заказы) — `/orders`
- [pages/kirim-buyurtmalar](../src/pages/kirim-buyurtmalar) `KirimBuyurtmalarPage` · entity `supply`
- **API (`/admin/supplies`):** list / create / delete{id} / bulk-delete
- **Lookups** (supply-form): `/admin/currencies`, `/admin/item-categories`, `/admin/items`, `/admin/organizations`, `/admin/suppliers`, `/admin/units`, `/Warehouse/GetAll`

### 🧑‍🏭 Xodimlar (Сотрудники) — подменю
- **Roʻyxati** — `/employees` → `UsersPage variant="xodimlar"` · entity `user` (те же эндпоинты `/admin/UserAdmin/*`)
- **Davomati (Посещаемость)** — `/attendance` → [pages/attendance](../src/pages/attendance) · entity `attendance`
  - **API (`/admin/attendances`):** list / get{id} / create / update{id} / delete{id} / bulk-delete
  - Lookups: `/admin/organizations`, список пользователей
- **Sick leave (Больничные)** — `/sick-leave` → [pages/sick-leave](../src/pages/sick-leave) · entity `sick-leave`
  - **API (`/admin/sick-leaves`):** list / get{id} / create / update{id} / delete{id} / bulk-delete
  - Lookups: `/admin/organizations`, список пользователей

### 💵 Moliya (Финансы) — подменю
- **Pul kirim (Приход)** — `/pul-kirim` → [pages/pul-kirim](../src/pages/pul-kirim) · entity `income`
  - **API (`/admin/incomes`):** list / get{id} / create / update{id} / delete{id} / bulk-delete
  - **Lookups** (income-form): `/admin/cash-boxes`, `/admin/clients`, `/admin/client-payments`, `/admin/currencies`, `/admin/income-categories`, `/admin/orders`, `/admin/organizations`, `/admin/payment-methods`
- **Pul chiqim (Расход)** — `/pul-chiqim` → [pages/pul-chiqim](../src/pages/pul-chiqim) · entity `outcome`
  - **API (`/admin/outcomes`):** list / get{id} / create / update{id} / delete{id} / bulk-delete
  - **Lookups** (outcome-form): `/admin/cash-boxes`, `/admin/currencies`, `/admin/organizations`, `/admin/outcome-categories`, `/admin/payment-methods`, `/admin/suppliers`, `/admin/supplier-payments`
- **KPI** — `/kpi` → [pages/kpi](../src/pages/kpi) `KpiPage` — **статическая, API нет.**

### 🏦 Cashbox (Касса) — `/cashbox`
- [pages/cashbox](../src/pages/cashbox) `CashBoxPage` · entity `cashbox`
- **API (`/admin/cash-boxes`):** list / get{id} / create / update{id} / delete{id} (+ доп. список)
- **Lookups:** `/admin/organizations`

### ⚙️ Settings (Настройки) — `/settings`
- [pages/settings](../src/pages/settings) `SettingsPage` → `ReferenceManager` (универсальный CRUD-фабрика
  [referenceApi.ts](../src/entities/reference/api/referenceApi.ts), `makeReferenceApi`)
- **Ресурсы-справочники** (для каждого: list / create / update{id} / delete{id}):
  - `/admin/colors`
  - `/admin/payment-methods`
  - `/admin/currencies`
  - `/admin/units`
  - `/ProductCategoryAdmin` — **RPC-стиль**: `GetAll` / `Create` / `Update/{id}` / `Delete/{id}`
- Доп. entity на странице: `business-category` (`GET /admin/business-categories`), `currency`, `organization`

### 💳 Payments / Tolovlar (Платежи) — `/payments`
- [pages/tolovlar](../src/pages/tolovlar) `TolovlarPage` — **прямые запросы через httpClient** (read-only):
  - `GET /admin/client-payments`
  - `GET /admin/supplier-payments`
  - `GET /admin/salary-payments`

### 🏗 Production (Производство) — `/production`
- [pages/production](../src/pages/production) `ProductionPage` · entities `item-ref`, `product`, `product-model`, `product-size`
- **API:** `GET /admin/items`, `GET /admin/products`, `GET /admin/product-models`, `GET /admin/product-sizes`

### 🧩 Product model (Модель товара) — `/product-model`
- [pages/product-model](../src/pages/product-model) `ProductModelPage` · entities `product`, `product-model`
- **API:** `GET /admin/products`, `GET /admin/product-models`

### 🛡 Roles / RBAC (Роли) — `/roles`
- [pages/rbac](../src/pages/rbac) `RbacPage` · entities `role`, `organization`
- **API (`/admin/roles`):**
  - `GET    /admin/roles` · `POST /admin/roles` · `PATCH /admin/roles/{id}` · `DELETE /admin/roles/{id}`
  - `PATCH  /admin/roles/{id}` — изменение прав (`{ permissions, method }`)
  - `GET    /admin/permissions` — справочник прав
  - `GET    /admin/organizations`

### 🔔 Notifications (Уведомления) — `/notifications`
- `ModulePlaceholder` — **API нет** (страница не реализована).

---

## Справочники-эндпоинты (используются как lookups)

| Entity | Эндпоинт |
|---|---|
| organization | `/admin/organizations` |
| department | `/admin/departments` |
| role / permissions | `/admin/roles` · `/admin/permissions` |
| currency | `/admin/currencies` |
| unit | `/admin/units` |
| payment-method | `/admin/payment-methods` |
| business-category | `/admin/business-categories` |
| income-category | `/admin/income-categories` |
| outcome-category | `/admin/outcome-categories` |
| item-category | `/admin/item-categories` |
| client-payment | `/admin/client-payments` |
| supplier-payment | `/admin/supplier-payments` |
| product-model | `/admin/product-models` |
| product-size | `/admin/product-sizes` |
| cash-boxes | `/admin/cash-boxes` |

> Примечание о стилях API: большинство модулей — REST (`/admin/<resource>`),
> но часть — RPC-стиль (`GetAll/Create/Update/Delete`): **User**, **UserAdmin**,
> **Warehouse**, **ProductCategoryAdmin**.
