# AI RULES

These rules are mandatory for Codex in this project.

## Before work

- Read `PROJECT_CONTEXT.md` first.
- Read this file first.
- Understand the current architecture before changing code.

## What requires separate approval

- Large refactors.
- Design changes when the task is not about design.
- Backend schema changes without an Alembic migration.
- Deleting data.
- `drop table` or `drop column` without explicit approval.
- Large SaaS refactors without a separate clear task.
- Adding billing, multi-tenant support, invite flows, or subscription logic by accident.

## What must not be committed

- `frontend/.env.local`
- `*.db`
- `dist`
- `node_modules`
- `.venv`
- `**pycache**`
- secrets, tokens, passwords

## Auth and protected endpoints

- Mutating endpoints (`POST`, `PATCH`, `PUT`, `DELETE`) must stay protected.
- The main write auth model is Telegram Web App `initData` in header `X-Telegram-Init-Data`.
- `TRUD_AUTH_BYPASS=true` is allowed only locally for dev.
- `TRUD_AUTH_BYPASS` must never be enabled in Railway production.
- `TRUD_SMOKE_TEST_TOKEN` is allowed only for automated production CRUD smoke checks.
- Never write real token values or secrets into code, docs, or commits.

## Product direction

- If the task concerns product architecture, remember: TRUD is the first pilot, not the only future customer.
- Keep changes small and production-safe.

## Universal SaaS UI rules

- Do not brand the whole interface as TRUD.
- Do not make a unique design for a specific cafe by default.
- Do not turn the SaaS product into a custom agency project.
- Keep the interface reusable across different workspaces.
- Use TRUD only as a workspace name, demo data, or pilot case.
- Do not hardcode TRUD visual identity as the product baseline.
- Think of future UI changes as reusable product UI, not one-off client styling.
- Any future theme support must stay limited and optional, not the product identity.

## Working order

- After changes, run `cd frontend && npm run build`.
- After a successful check, inspect `git status`.
- Then commit.
- Then run `git push origin main`.
- After each push to `main`, Codex should, when possible, wait for Railway deploy and run:
  `python scripts/check_production.py --base-url https://trud-miniapp-production.up.railway.app`
- For tasks that touch CRUD/API, Codex should also run:
  `python scripts/check_production.py --base-url https://trud-miniapp-production.up.railway.app --crud-smoke`
- If `TRUD_SMOKE_TEST_TOKEN` is not configured, state clearly that authenticated CRUD smoke was not run.
- If Codex cannot wait for Railway deploy or cannot make the internet request, it must explicitly say:
  `PRODUCTION CHECK NOT RUN: <reason>`
- In the final answer, include PASS/FAIL results for the checks.

## What to include in the final answer

After finishing work, always include:

- which files changed;
- build result;
- commit hash;
- push result;
- what to verify after Railway deploy.

