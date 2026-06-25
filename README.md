# Fabric PRO — Frontend

Административная панель ERP-системы управления фабрикой (60+ страниц, 19 модулей).

**Стек:** React 19 · TypeScript (strict) · Ant Design 6 · React Router 7 · Zustand · TanStack Query · React Hook Form · Zod · Axios · i18next
**Архитектура:** Feature-Sliced Design (FSD) — см. [ARCHITECTURE.md](ARCHITECTURE.md)

## Быстрый старт

```bash
npm install
cp .env.example .env     # настройте VITE_API_BASE_URL при необходимости
npm run dev              # http://localhost:3000  (/api проксируется на backend)
```

## Команды

| Команда | Действие |
|---|---|
| `npm run dev` | дев-сервер с HMR (порт 3000) |
| `npm run build` | прод-сборка (`tsc -b && vite build` → `dist/`) |
| `npm run preview` | предпросмотр прод-сборки |
| `npm run type-check` | проверка типов без сборки |
| `npm run lint` | ESLint |

## Демо-вход

Логин временно демонстрационный (без бэкенда): на странице `/login` любой логин/пароль,
плюс выбор роли (`admin`, `manager`, `warehouse_keeper`, `accountant`, `viewer`) —
чтобы вживую увидеть, как RBAC меняет меню и доступ к действиям.

Эталонный модуль с полным CRUD — **«Склады»** (`/warehouses`).

## Структура

```
src/
├── app/        # провайдеры, роутер, guard
├── pages/      # страницы под маршруты
├── widgets/    # layout, динамическое меню
├── features/   # действия (формы, удаление, переключатели)
├── entities/   # бизнес-сущности (warehouse, session, user)
└── shared/     # axios, RBAC, i18n, тема, утилиты
```

Подробное описание слоёв, диаграммы и примеры кода — в [ARCHITECTURE.md](ARCHITECTURE.md).
