# Deploy Workflow

Короткая проверка после deploy на Railway.

## Что проверить

Открой и проверь:

- `/api/health`
- `/api/recipes/brew-bar`
- `/api/recipes/batch-brew`
- `/api/recipes/signature-ttk`

Ожидание:

- ответы 200/201 там, где это уместно;
- JSON, а не HTML;
- нормальные данные по рецептам.

## Auth после deploy

- Read-only GET endpoints остаются публичными для чтения и диагностики.
- Mutating endpoints (`POST`, `PATCH`, `PUT`, `DELETE`) требуют авторизацию.
- Основной production-сценарий записи — через Telegram Mini App с валидным `X-Telegram-Init-Data`.
- `TRUD_AUTH_BYPASS=true` использовать только локально, не на Railway.
- Для automated production CRUD smoke можно использовать `TRUD_SMOKE_TEST_TOKEN` и header `X-Trud-Smoke-Token`.

## Признаки сломанного API

- `500`
- HTML вместо JSON
- `UndefinedColumnError`

Если на API-пути возвращается HTML, это почти всегда значит, что запрос попал не в backend router, а в SPA fallback или в неправильный сервер.

## Пользовательские сценарии

Проверяй на реальных данных:

1. Создать Воронку.
2. Создать Батч-брю.
3. Создать Авторский без фото.
4. Обновить приложение.
5. Убедиться, что записи остались и отображаются после перезагрузки.

## На что смотреть особенно внимательно

- Авторские рецепты должны отображаться даже без `imageUrl`.
- После deploy новые записи должны сохраняться и возвращаться в списках.
- Если данные пропали после обновления, сначала проверяй API и базу, а не фронтенд-дизайн.

## Автоматическая production-проверка

После push в `main` запускай:

```bash
python scripts/check_production.py --base-url https://trud-miniapp-production.up.railway.app
```

Если нужно проверить CRUD и при этом не оставить тестовые записи, запускай:

```bash
python scripts/check_production.py --base-url https://trud-miniapp-production.up.railway.app --crud-smoke
```

Если `TRUD_SMOKE_TEST_TOKEN` не настроен в окружении запуска скрипта, CRUD smoke должен быть честно помечен как `SKIPPED`, а не `PASS`.

Если Codex не может дождаться Railway deploy или выполнить internet request, он должен прямо написать:

`PRODUCTION CHECK NOT RUN: <reason>`
