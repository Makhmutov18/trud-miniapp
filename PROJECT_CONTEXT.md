# PROJECT CONTEXT

Этот репозиторий — Telegram Mini App для кофейни ТРУД.

Это внутренний staff operations tool для команды кофейни, а не публичный SaaS. Здесь важны скорость работы на смене, понятная структура данных и стабильное сохранение контента.

## Основные разделы

- Главная
- Рецепты
- Смена
- Ещё

## Основные сущности

- `brew-bar recipes` / Воронки
- `batch-brew recipes` / Батч-брю
- `signature-ttk` / Авторские рецепты
- `items pastry` / Булки
- `items checklist` / Чек-листы

## Доступ к API

- Read-only GET endpoints пока остаются публичными:
  - `/api/health`
  - `GET /api/recipes...`
  - `GET /api/items...`
- Mutating endpoints (`POST`, `PATCH`, `PUT`, `DELETE`) защищены.
- В production запись разрешается через валидный `X-Telegram-Init-Data`.
- Для локальной разработки допускается только env-bypass `TRUD_AUTH_BYPASS=true`.
- Для production CRUD smoke-check можно использовать `TRUD_SMOKE_TEST_TOKEN`, если он задан в окружении backend и в окружении запуска smoke-скрипта.

## Как работает база

- В production на Railway используется PostgreSQL.
- Локально есть fallback на SQLite, чтобы проект можно было запускать без внешней базы.
- Изменения схемы данных вносятся через Alembic migrations.
- `create_all` не заменяет migrations для уже существующих таблиц и не должен считаться способом менять схему в production.

## Как работает deploy

- Изменения вносятся через commit и push в `main`.
- Railway автоматически подхватывает push и запускает deploy.
- Проверка результата выполняется через Railway URL и внутри Telegram Mini App.
