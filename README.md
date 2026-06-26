# ТРУД Mini App

MVP Telegram Mini App для бара: рецепты кофе, кондитерская карта, чек-листы и быстрые карточки товаров.

## Стек

- Frontend: React + Vite + TypeScript
- Backend: FastAPI + SQLite
- Telegram: webhook и Web App button в том же FastAPI-сервисе
- Deploy: Dockerfile готов для Railway

## Локальный запуск

1. Установить frontend-зависимости:

```bash
cd frontend
npm install
npm run dev
```

2. В другом терминале запустить backend:

```bash
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --reload --app-dir backend --port 8000
```

Vite проксирует `/api` и `/telegram` на `http://localhost:8000`.

## Telegram bot

1. Создать бота через `@BotFather` и получить `BOT_TOKEN`.
2. Для Railway указать переменные:

```bash
BOT_TOKEN=123456:telegram-token
PUBLIC_BASE_URL=https://your-service.up.railway.app
WEB_APP_URL=https://your-service.up.railway.app
WEBHOOK_SECRET=long-random-string
```

При старте backend сам установит webhook, команды и кнопку меню. Команда `/start` пришлет кнопку открытия mini app.

## Что уже работает

- Просмотр рецептов кофе: V60, batch brew, эспрессо, авторские напитки.
- Просмотр кондитерской карты.
- Чек-листы смены.
- Создание новой карточки с фото, описанием, ценой, параметрами и шагами.
- Детальная карточка с параметрами и технологией.
- Быстрый brew timer внутри карточки рецепта.
- Golden Cup расчет экстракции: `(вес напитка × TDS) / доза`.
- Черновая история заваров в API: `/api/brew-history`.
- Telegram WebApp SDK hooks: `ready`, `expand`, цвета шапки, данные пользователя.

## Что взято из старого `Makhmutov18/coffee-bot`

- Идея расчета экстракции Golden Cup.
- Идея истории завершенных заваров.
- Направление на будущие роли: владелец, менеджер, бариста.
- Направление на будущие точки/споты, если проект будет продаваться не одной кофейне, а сети.

## Следующий слой

- Роли: владелец/бариста/кондитер.
- Нормальная авторизация по Telegram `initData` на каждом изменении.
- Postgres вместо SQLite для production.
- Загрузка фото в S3/Cloudflare R2.
- Админ-раздел для архива, себестоимости и сезонных меню.
