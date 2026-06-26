# Сайдбар → API (Swagger admin) — полная карта

Маппинг каждого пункта меню на admin-эндпоинт(ы).
Статус: ✅ построено и подключено · ⏳ заглушка, API есть · ❌ API нет.

Спека: `http://46.225.154.145/swagger/admin/swagger.json`

---

## DASHBOARDS
- **Dashboard** → ❌ единого API нет (агрегаты)
- **Analitika** → ❌ нет (отчёты)

## MODULES

### 📦 Omborxona (группа)
- **Omborxonalar** → `/admin/warehouses` ✅ _(фронт сейчас RPC `/Warehouse/GetAll`)_
- **Xom-ashyolar** → `/admin/items` (meta=Material) + `/admin/item-categories` ✅
- **Aksessuarlar** → `/admin/items` (meta=Other) ✅
- **Zapchastlar** → ❌ нет (в backend только Material/Other)
- **Instrumentlar** → ❌ нет

### 👤 Foydalanuvchilar → `/admin/UserAdmin` (RPC: GetAll/Get/Create/Update/Delete) ⏳

### 🤝 Mijozlar → `/admin/clients` ✅

### 🧾 Sotuvlar → `/admin/orders` ✅

### 📥 Kirim buyurtmalar → `/admin/supplies` + `/admin/supply-items` ⏳

### 🚚 Ta'minotchilar → `/admin/suppliers` (+ `/admin/supplier-payments`) ⏳

### 🏦 Kassalar → `/admin/cash-boxes` ✅

### 💹 Moliya (группа) ⏳
- **Kirim (доходы)** → `/admin/incomes` + `/admin/income-categories`
- **Chiqim (расходы)** → `/admin/outcomes` + `/admin/outcome-categories`
- **Mijoz to'lovlari** → `/admin/client-payments`
- **Ta'minotchi to'lovlari** → `/admin/supplier-payments`

### 👷 Xodimlar (группа) ⏳
- **Ro'yxati** → `/admin/UserAdmin` (фильтр сотрудников — см. [XODIMLAR_USER_FILTER_QUESTION.md](XODIMLAR_USER_FILTER_QUESTION.md))
- **Davomati** → `/admin/attendances`
- **Javob olgan kunlar** → `/admin/sick-leaves`

### 💵 Maosh (группа) ✅ построено
- **Oylik** → `/admin/salary-payments` (+ `/admin/salaries`)
- **Avans** → `/admin/advances`
- **Jarima** → `/admin/penalties`
- **Bonus** → `/admin/bonuses`

### 🧶 Mahsulot → `/admin/products` (+ `ProductCategoryAdmin`) ⏳

### ⚙️ Sozlamalar (группа) ⏳
- **Foydalanuvchilar** → `/admin/UserAdmin`
- **Omborxonalar** → `/admin/warehouses`
- **O'lchov birliklari** → `/admin/units`
- **RBAC** → `/admin/roles` + `/admin/permissions` _(права роли: PATCH role с `permissions[]` + `method`)_
- **Mahsulot model** → `/admin/product-models` + `/admin/product-parts` + `/admin/product-sizes`

### 💳 To'lovlar → `/admin/client-payments` + `/admin/supplier-payments` + `/admin/salary-payments` ⏳

### 🏭 Ishlab chiqarish (группа) ⏳
- **Material** → `MaterialAdmin` (RPC)
- **Dizayn / DesignLibrary** → `DesignLibraryAdmin` (RPC)
- **Prioritet** → `PriorityAdmin` (RPC)
- **Status** → `StatusAdmin` (RPC)
- **Ranglar (цвета)** → `/admin/colors`
- **Plan / BOM** → `Plan` (вложенный) + `/admin/item-to-products`

---

## Справочники (нет своего пункта в меню — используются в селекторах)
- `/admin/organizations` — организации (корень всего, `organizationId` везде)
- `/admin/currencies` — валюты (заказы/финансы)
- `/admin/payment-methods` — способы оплаты (заказы/финансы)
- `/admin/business-categories` — бизнес-категории организаций
- `/admin/departments` — отделы (для `User.departmentId`)
- `ProductCategoryAdmin` — категории продукции

---

## Сводка
- **Построено и на API (✅):** Omborxona (склады/сырьё/аксессуары), Mijozlar, Sotuvlar, Kassalar, Maosh ×4.
- **Заглушка, API есть (⏳):** Foydalanuvchilar, Kirim buyurtmalar, Ta'minotchilar, Moliya, Xodimlar (Davomat/SickLeave), Mahsulot, Sozlamalar (Units/RBAC/Mahsulot model), To'lovlar, Ishlab chiqarish.
- **API нет (❌):** Dashboard, Analitika, Zapchastlar, Instrumentlar.

_Примечание: `UserAdmin`, `MaterialAdmin`, `DesignLibraryAdmin`, `PriorityAdmin`,
`StatusAdmin`, `ProductCategoryAdmin` — RPC-стиль (`/X/GetAll|Create|Update/{id}|Delete/{id}`),
остальные — REST под `/admin/*`._
