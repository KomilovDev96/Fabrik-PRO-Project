# Fabric PRO — Frontend Architecture (Enterprise ERP)

> React 19 · TypeScript · Ant Design 6 · React Router 7 · Zustand · TanStack Query · React Hook Form · Zod · Axios · i18next
>
> Архитектура: **Feature-Sliced Design (FSD)** — рассчитана на 100+ страниц и 19 модулей.

---

## 1. Выбор архитектуры

| Подход | Когда подходит | Вердикт для Fabric PRO |
|---|---|---|
| **Classic** (`components/`, `pages/`, `hooks/`, `services/`) | MVP, < 15 страниц | ❌ на 60+ страницах превращается в «свалку» — циклические импорты, всё зависит от всего |
| **Modular** (папка на модуль, внутри свой хаос) | средние проекты | ⚠️ нет правил связей между модулями → модули начинают импортировать друг друга напрямую |
| **Feature-Sliced Design** | крупные SaaS/ERP/CRM | ✅ **выбрано** — строгие слои, однонаправленные зависимости, изоляция модулей |
| **Hybrid FSD** | FSD + доменные группировки | ✅ применяем элементы (группировка меню по доменам), не ломая слои |

### Почему FSD

1. **Однонаправленные зависимости.** Слой может импортировать только слои **ниже** себя. Это физически запрещает «спагетти».
2. **Изоляция модулей.** Склады ничего не знают о Финансах. Удалить/перенести модуль — операция на одну папку.
3. **Предсказуемость.** Любой разработчик за секунды понимает, где лежит API, где UI, где состояние.
4. **Масштабируемость.** 100-я страница добавляется так же, как 5-я — структура не деградирует.

### Правило зависимостей (железное)

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
 (выше)                                                  (ниже)

Импортировать МОЖНО только слои правее (ниже). Обратно — НЕЛЬЗЯ.
shared не импортирует ничего из бизнес-слоёв.
```

Внутри слоя «срезы» (slices) тоже не импортируют друг друга напрямую — только через публичный `index.ts` и только сверху вниз.

---

## 2. Полная структура папок

```
fabric-pro-frontend/
├── public/
│   └── images/logo/            # логотип (перенесён из TailAdmin)
├── src/
│   ├── app/                    # 🟣 СЛОЙ 1 — инициализация приложения
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx     # композиция всех провайдеров
│   │   │   ├── QueryProvider.tsx    # TanStack Query + Devtools
│   │   │   └── ThemeProvider.tsx    # AntD ConfigProvider (тема + locale)
│   │   ├── router/
│   │   │   ├── AppRouter.tsx        # маршруты + lazy loading
│   │   │   └── ProtectedRoute.tsx   # guard: auth + RBAC
│   │   ├── styles/index.css
│   │   └── App.tsx
│   │
│   ├── pages/                  # 🔵 СЛОЙ 2 — страницы (тонкие, под маршрут)
│   │   ├── dashboard/
│   │   ├── warehouses/              # ← эталонная страница
│   │   ├── auth/
│   │   ├── errors/                  # 403 / 404
│   │   └── ModulePlaceholder.tsx    # заглушка для нереализованных модулей
│   │
│   ├── widgets/                # 🟢 СЛОЙ 3 — композиционные блоки UI
│   │   └── layout/
│   │       ├── MainLayout.tsx       # каркас: Sider + Header + Content
│   │       ├── Sidebar.tsx          # динамическое меню (RBAC)
│   │       ├── Header.tsx           # тема / язык / пользователь
│   │       └── menuConfig.tsx       # декларативное меню + ROUTES
│   │
│   ├── features/              # 🟡 СЛОЙ 4 — пользовательские действия
│   │   ├── warehouse-form/         # создание/редактирование (RHF + Zod)
│   │   ├── warehouse-delete/       # удаление с подтверждением
│   │   ├── theme-switch/
│   │   └── lang-switch/
│   │
│   ├── entities/             # 🟠 СЛОЙ 5 — бизнес-сущности
│   │   ├── warehouse/
│   │   │   ├── api/                 # warehouseApi + RQ hooks (queries)
│   │   │   ├── model/               # types + Zod schema + Zustand store
│   │   │   └── ui/                  # колонки таблицы
│   │   ├── session/                # auth-стор, useAccess, <Can>
│   │   └── user/                    # тип AuthUser
│   │
│   └── shared/              # 🔴 СЛОЙ 6 — переиспользуемый фундамент
│       ├── api/                    # axios-клиент + интерсепторы + типы
│       ├── config/
│       │   ├── env.ts              # типизированные env
│       │   ├── constants.ts        # STORAGE_KEYS, пагинация
│       │   ├── i18n/               # i18next + ru/uz/en
│       │   └── theme/              # AntD токены + Zustand стор темы
│       ├── lib/
│       │   ├── rbac/               # ядро прав (pure-функции)
│       │   ├── hooks/              # useDebouncedValue, …
│       │   └── utils/              # format, …
│       └── types/                  # ID, Timestamps, SortOrder
│
├── .env / .env.example         # VITE_API_BASE_URL, локаль, имя
├── vite.config.ts              # @ alias, dev-proxy /api, manualChunks
└── tsconfig.app.json           # strict, paths @/*
```

> Внутри каждого среза действует **Public API**: наружу торчит только `index.ts`. Остальные файлы — приватные. Импорт `@/entities/warehouse/model/warehouseStore` запрещён — только `@/entities/warehouse`.

---

## 3. Слои детально

### `app` — что инициализирует приложение
Провайдеры (Query/Theme/i18n), роутер, глобальные стили, точка сборки. Здесь и **только здесь** «склеивается» всё приложение.

### `pages` — тонкие страницы
Страница = композиция виджетов/фич/сущностей под конкретный маршрут. В ней **нет бизнес-логики** — только сборка. См. [WarehousesPage.tsx](src/pages/warehouses/WarehousesPage.tsx).

### `widgets` — самостоятельные блоки
Крупные переиспользуемые куски интерфейса: layout, шапка, сайдбар. Виджет может использовать несколько фич и сущностей.

### `features` — действия пользователя
Одна фича = один сценарий («создать склад», «удалить склад», «сменить тему»). Фича владеет своей мутацией и своими тостами — она самодостаточна.

### `entities` — бизнес-сущности
Данные + их представление: типы, схемы, API, React Query хуки, сторы, UI-кусочки (колонки, карточки). Сущность не знает о фичах.

### `shared` — фундамент
Никакой бизнес-логики. Axios, конфиг, RBAC-движок, i18n, тема, утилиты, примитивы. Может использоваться кем угодно, сам не использует никого.

---

## 4. Где что хранить (ключевые решения)

### Zustand vs React Query — главное правило

```
┌─────────────────────────────┬──────────────────────────────────────────┐
│ React Query (server state)  │ Zustand (client/UI state)                  │
├─────────────────────────────┼──────────────────────────────────────────┤
│ • данные с бэкенда           │ • фильтры, поиск, сортировка, страница     │
│ • кэш, инвалидация           │ • открыта ли модалка, какой id редактируем │
│ • loading/error/refetch      │ • тема (dark/light), свёрнут ли сайдбар    │
│ • пагинация-как-данные       │ • сессия/токен/права (auth)                │
└─────────────────────────────┴──────────────────────────────────────────┘
```

**Никогда не дублируйте серверные данные в Zustand.** Список складов живёт в кэше React Query ([warehouseQueries.ts](src/entities/warehouse/api/warehouseQueries.ts)). Состояние «какая страница/что в поиске/открыта ли форма» — в Zustand ([warehouseStore.ts](src/entities/warehouse/model/warehouseStore.ts)). UI-стор формирует ключ запроса → React Query сам перезапрашивает.

| Что | Где | Файл |
|---|---|---|
| Серверные данные | React Query | `entities/*/api/*Queries.ts` |
| UI-состояние модуля | Zustand | `entities/*/model/*Store.ts` |
| Сессия / права | Zustand (persist) | [sessionStore.ts](src/entities/session/model/sessionStore.ts) |
| Тема | Zustand (persist) | [themeStore.ts](src/shared/config/theme/themeStore.ts) |
| **API-вызовы** | transport-функции | `entities/*/api/*Api.ts` (без React) |
| **Типы** | рядом с сущностью | `entities/*/model/types.ts`; общие — `shared/types` |
| **Формы** | feature + Zod-схема | `features/*-form/`; схема — в `entities/*/model/types.ts` |
| **Таблицы AntD** | фабрика колонок в entity | `entities/*/ui/*Columns.tsx`; сборка — в page |

Почему схема формы лежит в `entities`, а сама форма — в `features`: схема описывает **сущность** (правила валидации склада), а форма — это **действие** над ней. Так одну схему переиспользуют и create, и edit, и (при желании) импорт CSV.

---

## 5. Масштабирование на 100+ страниц

Добавление нового модуля (например, «Товары») — это **повторение шаблона «Склады»**, всего 6 файлов + 2 строки в конфиге:

```
1. entities/product/model/types.ts        # тип + Zod-схема
2. entities/product/api/productApi.ts      # CRUD
3. entities/product/api/productQueries.ts  # RQ-хуки + ключи
4. entities/product/model/productStore.ts  # UI-стор
5. entities/product/ui/productColumns.tsx  # колонки
6. pages/products/ProductsPage.tsx         # страница
+ features/product-form, product-delete    # действия
```

И всё. Подключение:

```tsx
// widgets/layout/menuConfig.tsx — пункт меню (1 строка, уже есть)
{ key: ROUTES.products, labelKey: 'menu.products', icon: <AppstoreOutlined/>, permission: 'products.view' }

// app/router/AppRouter.tsx — роут генерируется автоматически из меню,
// нужно лишь добавить case в renderModulePage():
case ROUTES.products: return <ProductsPage />
```

Маршруты, пункт меню, проверка прав, lazy-загрузка — **генерируются из одного декларативного конфига** [menuConfig.tsx](src/widgets/layout/menuConfig.tsx). 19 модулей уже описаны; их страницы пока ведут на `ModulePlaceholder`, заменяются по одному.

---

## 6. Эталонный модуль «Склады»

Полный CRUD реализован сквозь все слои:

```
СПИСОК + ПОИСК + ПАГИНАЦИЯ + СОРТИРОВКА
   pages/warehouses/WarehousesPage.tsx
        │  ├─ entities/warehouse: useWarehouses() ── React Query ── warehouseApi.list()
        │  ├─ entities/warehouse: useWarehouseStore() ── Zustand (page/search/sort)
        │  ├─ entities/warehouse: getWarehouseColumns(t) ── колонки таблицы
        │  └─ entities/session: <Can perform="warehouses.create"> ── RBAC

СОЗДАНИЕ / РЕДАКТИРОВАНИЕ
   features/warehouse-form/WarehouseFormModal.tsx
        │  ├─ React Hook Form + zodResolver(createWarehouseSchema(t))
        │  ├─ useCreateWarehouse() / useUpdateWarehouse() ── мутации
        │  └─ при успехе → message + invalidateQueries → таблица сама обновится

УДАЛЕНИЕ
   features/warehouse-delete/DeleteWarehouseButton.tsx
        └─ Popconfirm + useDeleteWarehouse() → invalidate
```

Открытие модалки идёт **через Zustand-стор**, без prop-drilling: кнопка вызывает `openCreate()`/`openEdit(id)`, модалка читает `formOpen`/`editingId` из того же стора.

---

## 7. Примеры кода (реальные файлы проекта)

### 7.1 API-слой (transport) — [warehouseApi.ts](src/entities/warehouse/api/warehouseApi.ts)

```ts
export const warehouseApi = {
  list: async (params: ListParams): Promise<Paginated<Warehouse>> => {
    const { data } = await httpClient.get<RawList | Warehouse[]>(RESOURCE, { params: toQuery(params) })
    return adaptList(data, params)          // нормализуем любой формат ответа
  },
  create: async (dto: CreateWarehouseDto) => (await httpClient.post<Warehouse>(RESOURCE, dto)).data,
  update: async (id, dto) => (await httpClient.patch<Warehouse>(`${RESOURCE}/${id}`, dto)).data,
  remove: async (id) => { await httpClient.delete(`${RESOURCE}/${id}`) },
}
```

Единый axios-клиент с интерсепторами — [httpClient.ts](src/shared/api/httpClient.ts): автоматически подставляет `Bearer`-токен, нормализует ошибки в `ApiError`, ловит `401` (выход из сессии).

### 7.2 React Query хуки + фабрика ключей — [warehouseQueries.ts](src/entities/warehouse/api/warehouseQueries.ts)

```ts
export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (params) => [...warehouseKeys.lists(), params] as const,
  detail: (id) => [...warehouseKeys.all, 'detail', id] as const,
}

export function useWarehouses(params: ListParams) {
  return useQuery({
    queryKey: warehouseKeys.list(params),
    queryFn: () => warehouseApi.list(params),
    placeholderData: keepPreviousData,        // таблица не «мигает» при пагинации
  })
}

export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation<Warehouse, ApiError, CreateWarehouseDto>({
    mutationFn: (dto) => warehouseApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: warehouseKeys.lists() }),
  })
}
```

### 7.3 Zustand UI-стор — [warehouseStore.ts](src/entities/warehouse/model/warehouseStore.ts)

```ts
export const useWarehouseStore = create<WarehouseUiState>((set) => ({
  page: 1, pageSize: 20, search: '',
  formOpen: false, editingId: null,

  setSearch: (search) => set({ search, page: 1 }),     // сброс на 1-ю страницу
  openCreate: () => set({ formOpen: true, editingId: null }),
  openEdit: (id) => set({ formOpen: true, editingId: id }),
  closeForm: () => set({ formOpen: false, editingId: null }),
}))
```

### 7.4 Ant Design Table — [WarehousesPage.tsx](src/pages/warehouses/WarehousesPage.tsx)

```tsx
const columns = useMemo<TableColumnsType<Warehouse>>(() => [
  ...getWarehouseColumns(t),                 // data-колонки из entity
  {
    title: t('common.actions'), key: 'actions', fixed: 'right',
    render: (_, record) => (
      <Space size={0}>
        <Can perform="warehouses.update">
          <Button type="text" icon={<EditOutlined/>} onClick={() => openEdit(record.id)} />
        </Can>
        <Can perform="warehouses.delete">
          <DeleteWarehouseButton warehouse={record} />   {/* feature */}
        </Can>
      </Space>
    ),
  },
], [t, openEdit])

<Table<Warehouse>
  rowKey="id" columns={columns}
  dataSource={data?.items ?? []}
  loading={isLoading || isFetching}
  onChange={handleTableChange}               // page/size/sort → Zustand → RQ
  pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true }}
/>
```

### 7.5 Form Modal (RHF + Zod + AntD) — [WarehouseFormModal.tsx](src/features/warehouse-form/ui/WarehouseFormModal.tsx)

```tsx
const resolver = useMemo(() => zodResolver(createWarehouseSchema(t)), [t])
const { control, handleSubmit, reset, formState: { errors } } = useForm<WarehouseFormValues>({
  resolver, defaultValues: EMPTY_FORM,
})

// AntD-инпут подключается к RHF через Controller:
<Controller name="name" control={control} render={({ field }) => (
  <Form.Item label={t('warehouse.name')} required
             validateStatus={errors.name && 'error'} help={errors.name?.message}>
    <Input {...field} />
  </Form.Item>
)} />
```

Схема (одна для create и edit) — [types.ts](src/entities/warehouse/model/types.ts):

```ts
export const createWarehouseSchema = (t: TFunction) => z.object({
  name: z.string().trim().min(2, t('common.required')).max(120),
  code: z.string().trim().min(1, t('common.required')).max(32),
  address: z.string().trim().min(1, t('common.required')).max(255),
  phone: z.string().trim().max(32).optional(),
  capacity: z.number().int().nonnegative().nullable().optional(),
  isActive: z.boolean(),
})
export type WarehouseFormValues = z.infer<ReturnType<typeof createWarehouseSchema>>
```

---

## 8. Лучшие практики (реализованы в проекте)

### RBAC (роли и права) — [shared/lib/rbac](src/shared/lib/rbac/permissions.ts)
- Права в формате `resource.action` (`warehouses.create`), `'*'` = суперюзер.
- **Ядро — чистые функции** (`hasPermission`) в `shared`, без React и без сессии.
- Хук `useAccess()` и компонент `<Can>` — в `entities/session`, читают права из стора.
- Три уровня защиты: **роут** (`ProtectedRoute permission`), **меню** (фильтрация), **кнопка** (`<Can>`).

```tsx
const { can } = useAccess()
if (can('warehouses.create')) { /* ... */ }
<Can perform="finance.view" fallback={<NoAccess/>}>...</Can>
```

### Динамическое меню — [Sidebar.tsx](src/widgets/layout/Sidebar.tsx)
Меню генерируется из `NAV_SECTIONS` и фильтруется через `can()`. Пользователь видит только доступное; пустые группы исчезают сами. Добавить пункт = 1 строка в конфиге.

### Lazy loading + code splitting — [AppRouter.tsx](src/app/router/AppRouter.tsx) + [vite.config.ts](vite.config.ts)
- Каждая страница — `React.lazy()` → отдельный чанк (подтверждено сборкой: `warehouses-*.js`, `dashboard-*.js`, …).
- Вендоры разнесены через `manualChunks`: `react`, `antd`, `query`, `forms`.
- `<Suspense>` с центрированным `<Spin>` как fallback.

### Dark / Light тема — [ThemeProvider.tsx](src/app/providers/ThemeProvider.tsx) + [tokens.ts](src/shared/config/theme/tokens.ts)
- Палитра перенесена из TailAdmin (`colorPrimary: #465fff`, шрифт Outfit) в seed-токены AntD.
- Переключение — `useThemeStore` (persist), применяется через `ConfigProvider theme={buildTheme(mode)}` + `darkAlgorithm`.
- Синхронизируется `document.colorScheme` и dayjs-локаль.

### Мультиязычность (ru / uz / en) — [shared/config/i18n](src/shared/config/i18n/index.ts)
- `i18next` + `react-i18next` + детектор языка (localStorage).
- **Типобезопасные ключи**: `ru` — каноничная локаль, `en`/`uz` типизируются `typeof ru`, ключи `t('warehouse.title')` автодополняются ([i18next.d.ts](src/shared/config/i18n/i18next.d.ts)).
- AntD-компоненты и даты локализуются вместе с интерфейсом.

### Прочее
- **TypeScript strict** включён; `@/*` alias на `src/*`.
- **Единый axios** с интерсепторами (токен, нормализация ошибок, 401).
- **Public API** у каждого среза (`index.ts`) — рефакторинг-устойчивые импорты.
- **Debounce поиска** (`useDebouncedValue`) — нет запроса на каждый символ.

---

## 9. Production-ready чеклист

| ✅ Сделано | ⏭️ Следующие шаги для прод |
|---|---|
| FSD, strict TS, alias, ESLint | Подключить реальный `authApi.login` вместо демо-логина |
| Единый API-клиент + 401-handling | Refresh-token flow (очередь повторных запросов) |
| RBAC: роут + меню + кнопка | Получать права от бэкенда (сейчас fallback по ролям) |
| Тема, i18n, lazy, code splitting | Error Boundary + Sentry, тосты на сетевые ошибки |
| CRUD «Склады» эталон | Тесты (Vitest + RTL), CI, Storybook для `shared/ui` |
| Dev-proxy на реальный backend | Доклеить 18 модулей по шаблону «Склады» |

---

## Команды

```bash
npm run dev         # дев-сервер (порт 3000, проксирует /api на backend)
npm run build       # tsc + vite build (прод-сборка в dist/)
npm run type-check  # только проверка типов
npm run preview     # предпросмотр прод-сборки
npm run lint        # ESLint
```

API настраивается через `.env` (`VITE_API_BASE_URL`, `VITE_API_PROXY_TARGET`).
```
