# Sozlamalar (Настройки) — расхождения дизайна и API

Памятка по странице **Sozlamalar** (одна страница с вкладками). Основные вопросы —
по вкладке **Account** (профиль организации). Остальные вкладки полностью покрыты API.

Спека: `http://46.225.154.145/swagger/admin/swagger.json`

---

## Вкладки и их API

| Вкладка | API | Статус |
|---------|-----|--------|
| **Account** (профиль организации) | `/admin/organizations` + `/{id}` | ⚠️ часть полей дизайна нет в API |
| **Ranglar** (цвета) | `/admin/colors` | ✅ полностью |
| **To'lov** (способы оплаты) | `/admin/payment-methods` | ✅ полностью |
| **Valyuta** (валюты) | `/admin/currencies` | ✅ полностью |
| **Mahsulot kategoriyalari** | `ProductCategoryAdmin` (RPC) | ✅ полностью |

---

## ⚠️ Вкладка Account — что хранит API организации

`OrganizationAdminUpdate` принимает **только**:
```
title, stir (ИНН), categoryId, mainCurrencyId, ownerId, isDeleted
```
`OrganizationAdminDetail` отдаёт: `id, title, stir, category (строка!), mainCurrency{id,...}, owner, created`.

### Поля дизайна → есть ли в API
| Поле (дизайн «Korxona ma'lumotlar») | API | Статус |
|---|---|---|
| Korxona nomi | `title` | ✅ |
| INN | `stir` | ✅ |
| Biznes kategoriya | `categoryId` (на запись) | ⚠️ см. вопрос 2 |
| Valyuta | `mainCurrencyId` | ✅ |
| **Joylashuv** (напр. «111.222.333.44») | — | ❌ нет |
| **Korxona elektron pochtasi** (email) | — | ❌ нет |
| **Korxona telefon raqami** | — | ❌ нет |
| **Manzil** (адрес) | — | ❌ нет |
| **Ro'yxatdan o'tgan sana** (дата рег.) | — | ❌ нет (есть только `created` записи) |

Сейчас на фронте: 4 реальных поля сохраняются, остальные 5 показаны как
**disabled-плейсхолдеры** с подписью «Нет в API организации».

---

## Вопросы к backend

1. **Добавить в Organization недостающие поля?**
   `email`, `phoneNumber`, `address` (Manzil), `location` (Joylashuv), `registeredAt`
   (дата регистрации). Если да — добавить в `OrganizationAdminUpdate`/`Detail`.

2. **`categoryId` при редактировании не подставляется.**
   `OrganizationAdminDetail` возвращает `category` **строкой** (название), а не `id`.
   Из-за этого на форме нельзя предзаполнить выбранную категорию — пользователю
   приходится выбирать заново.
   Просьба: отдавать в Detail `categoryId` (или объект `category {id, title}`).
   То же касается прочих «*Detail», где связь приходит строкой (напр. order.category).

3. **Как получить «текущую» организацию?**
   Нет эндпоинта вида `GetMe-org`. Сейчас фронт берёт **первую** организацию из
   `GET /admin/organizations`. Это верно? Или у пользователя одна организация и её
   нужно брать из `UserAdmin/GetMe`? Подскажите правильный способ.

---

## Что сделаем на фронте, когда ответят
- Добавим недостающие поля в форму Account и уберём плейсхолдеры.
- При наличии `categoryId` в Detail — включим предзаполнение категории.
- Переключим «текущую организацию» на правильный эндпоинт, если нужно.

---
_Источник: Swagger admin-спека. См. также [SOTUVLAR_API_GAPS.md](SOTUVLAR_API_GAPS.md),
[XODIMLAR_USER_FILTER_QUESTION.md](XODIMLAR_USER_FILTER_QUESTION.md),
[SIDEBAR_API_MAP.md](SIDEBAR_API_MAP.md)._
