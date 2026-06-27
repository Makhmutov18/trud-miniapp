# AI RULES

Эти правила обязательны для Codex в этом проекте.

## Перед работой

- Сначала прочитать `PROJECT_CONTEXT.md` и этот файл.
- Сначала понять текущую архитектуру и только потом менять код.

## Что нельзя делать без отдельного разрешения

- Не делать большие рефакторы.
- Не менять дизайн, если задача не про дизайн.
- Не менять backend schema без Alembic migration.
- Не удалять данные.
- Не делать `drop table` и `drop column` без явного разрешения.

## Что нельзя коммитить

- `frontend/.env.local`
- `*.db`
- `dist`
- `node_modules`
- `.venv`
- `**pycache**`
- любые секреты, токены и пароли

## Auth и protected endpoints

- Mutating endpoints (`POST`, `PATCH`, `PUT`, `DELETE`) должны оставаться защищёнными.
- Основная auth-модель для записи — Telegram Web App `initData` в header `X-Telegram-Init-Data`.
- `TRUD_AUTH_BYPASS=true` допустим только локально для dev.
- На Railway production `TRUD_AUTH_BYPASS` включать нельзя.
- Для automated production CRUD smoke допустим отдельный env `TRUD_SMOKE_TEST_TOKEN`.
- Реальные значения токенов и секретов нельзя писать в код, docs и commit.

## Рабочий порядок

- После изменений запускать `cd frontend && npm run build`.
- После успешной проверки смотреть `git status`.
- Потом делать commit.
- Потом делать `git push origin main`.
- После каждого push в `main` Codex должен по возможности дождаться Railway redeploy и запустить production smoke-check:
  `python scripts/check_production.py --base-url https://trud-miniapp-production.up.railway.app`
- Для задач, затрагивающих CRUD/API, Codex должен также запускать:
  `python scripts/check_production.py --base-url https://trud-miniapp-production.up.railway.app --crud-smoke`
- Если для `--crud-smoke` не задан `TRUD_SMOKE_TEST_TOKEN`, нужно честно написать, что authenticated CRUD smoke не был запущен.
- Если Codex не может дождаться Railway deploy или выполнить internet request, он должен прямо написать:
  `PRODUCTION CHECK NOT RUN: <reason>`
- В ответе после таких проверок нужно показывать PASS/FAIL отчет.

## Что писать в ответе

После завершения работы всегда указывать:

- какие файлы изменены;
- результат build;
- commit hash;
- результат push;
- что проверить после Railway deploy.
