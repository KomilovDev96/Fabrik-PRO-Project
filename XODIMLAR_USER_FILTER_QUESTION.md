# Вопрос бэкенду: как фильтровать «Xodimlar» (сотрудников) в селекторе User

Касается выбора сотрудника («Xodimni ismi») в модуле **Maosh** (Oylik/Avans/Jarima/Bonus),
а в перспективе — и страницы **Xodimlar**.

---

## Контекст (как сейчас на фронте)

Селектор сотрудника берёт людей из **User**:
- источник: `GET /api/v1/User/GetAll` (label = `fullName || phoneNumber`);
- поле формы: `userId` → уходит в `*AdminCreate` (salary-payments / advances / penalties / bonuses);
- в таблице колонка «Xodim» = `user.fullName` (из ответа API, `BaseUserListDto`).

**Проблема:** сейчас тянем **всех** пользователей без фильтра — в выпадашке оказываются
и админы, и прочие, а нужны только сотрудники-работники (Xodimlar).

---

## Что нашли в Swagger (admin-спека)

1. **У `User` есть поле `type: UserType`, но enum только из 3 значений:**
   ```
   UserType = User | Admin | SuperAdmin
   ```
   Отдельного значения **«Employee / Xodim / Worker» НЕТ**. То есть «сотрудник» —
   это, видимо, `type = User` (не Admin/SuperAdmin) ИЛИ различается по роли/отделу.

2. **Список пользователей `GET /admin/UserAdmin/GetAll` фильтрует по:**
   ```
   RoleId, DepartmentId, OrganizationId, Search, IsDeleted,
   CreatedById, UpdatedById, даты..., Limit, Page
   ```
   👉 **Фильтра по `Type` здесь НЕТ.** Есть `RoleId` и `DepartmentId`.

3. Фронт сейчас использует **`/User/GetAll`** (не `/admin/UserAdmin/GetAll`).

---

## Вопросы к backend

1. **Как правильно отобрать «Xodimlar» (сотрудников-работников) среди User?**
   - по `type = User` (исключая Admin/SuperAdmin)?
   - по конкретной **роли** (`RoleId`) — если да, какой Role = «Сотрудник/Xodim»?
   - по **отделу** (`DepartmentId`)?
   - или иначе?

2. Если фильтр по `type` — **добавьте параметр `Type` в `UserAdmin/GetAll`**
   (сейчас его нет), либо подскажите эндпоинт, который отдаёт только сотрудников.

3. Какой эндпоинт использовать для пикера — публичный `/User/GetAll`
   или admin `/admin/UserAdmin/GetAll`? (для админки логичнее второй).

---

## Что сделаем на фронте, когда ответят
- Добавим в `useUserOptions` нужный фильтр (`Type` / `RoleId` / `DepartmentId`)
  и/или переключим на `/admin/UserAdmin/GetAll`.
- Тогда в селекторе сотрудника (Maosh) и на странице Xodimlar будут только работники.

---

## Связанный маппинг модулей (на будущее, со слов заказчика)
- **Xodimlar** → User (с фильтром по type/роли)
- **Davomat** → Attendance
- **Javob olgan kunlar** → SickLeave

_Источник: Swagger admin-спека (`/swagger/admin/swagger.json`). См. также
[SOTUVLAR_API_GAPS.md](SOTUVLAR_API_GAPS.md)._
