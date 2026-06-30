# SaaS Readiness Audit

## 1. Current state

The current codebase is a single-workspace Telegram Mini App centered on TRUD operations.

Today it already has:

- production deploy on Railway;
- Telegram-based write protection for mutating endpoints;
- recipe CRUD across brew-bar, batch-brew, and signature TTK;
- item CRUD for pastry and checklist-like content;
- a mobile-first frontend that works as a staff tool.

This is good pilot infrastructure, but it is not yet a SaaS-ready architecture.

## 2. What is already reusable

Several parts are already generic enough to carry forward:

- the three recipe domains are modeled as separate entities;
- items are category-based and not inherently tied to one specific cafe concept;
- API routing by recipe type is already explicit and can later become workspace-scoped;
- Telegram auth as an identity signal is reusable;
- Railway deploy and smoke-check workflow are reusable operationally.

The current backend model layer is also reasonably clean in shape:

- `brew_bar_recipes`;
- `batch_brew_recipes`;
- `signature_drinks_ttk`;
- `items`;
- `users`.

That gives a usable base for later adding workspace ownership.

## 3. What is TRUD-specific

The codebase still contains clear TRUD-specific assumptions.

Backend and config:

- the API title is `TRUD Mini App API` in [backend/app/main.py](C:\Users\ada93\Documents\Codex\2026-06-26\new-chat-2\backend\app\main.py);
- seed data includes `TRUD roast` in [backend/app/seed/recipes.py](C:\Users\ada93\Documents\Codex\2026-06-26\new-chat-2\backend\app\seed\recipes.py);
- current auth logic answers only the question "is this a valid Telegram user/token path for writes", not "does this user belong to this workspace".

Frontend:

- the main brand and logo are explicitly TRUD in [frontend/src/App.tsx](C:\Users\ada93\Documents\Codex\2026-06-26\new-chat-2\frontend\src\App.tsx);
- folder storage uses local-only `trud_folders` in browser storage in [frontend/src/App.tsx](C:\Users\ada93\Documents\Codex\2026-06-26\new-chat-2\frontend\src\App.tsx);
- [frontend/src/main.tsx](C:\Users\ada93\Documents\Codex\2026-06-26\new-chat-2\frontend\src\main.tsx) still logs a TRUD-specific marker;
- some navigation labels and quick actions are built around the current TRUD staff workflow rather than a productized multi-workspace mental model.

## 4. What must change before SaaS

### Data model

The following entities will later need `workspace_id` or equivalent ownership:

- brew-bar recipes;
- batch-brew recipes;
- signature TTK records;
- items;
- users;
- future checklist executions, shift logs, and training records.

The current recipe tables also use `folder_id`, but folder definitions are still frontend-local rather than backend-owned. That is acceptable for the pilot, but not enough for SaaS.

### Endpoints

The following endpoints will later become tenant-scoped:

- `GET /api/recipes`
- `GET /api/recipes/brew-bar`
- `GET /api/recipes/batch-brew`
- `GET /api/recipes/signature-ttk`
- all mutating recipe endpoints
- `GET /api/items`
- all mutating item endpoints

Right now they operate on the whole shared dataset.

### Auth and authorization

Current auth is:

- valid Telegram WebApp request for writes;
- optional smoke token for production diagnostics.

Future auth must become:

- valid Telegram user;
- mapped to a user record;
- checked for membership in a workspace;
- checked for role permissions inside that workspace.

That is the biggest conceptual shift before SaaS.

## 5. Risks

- Premature multi-tenant refactor would touch core write paths, auth, and schema at once.
- `create_all` plus runtime column guards in [backend/app/main.py](C:\Users\ada93\Documents\Codex\2026-06-26\new-chat-2\backend\app\main.py) are acceptable for pilot stabilization, but they are not a long-term substitute for explicit migrations in a SaaS system.
- Frontend local storage for folders is convenient now, but it will become a product inconsistency once teams expect shared structure across users and devices.
- The `users` table already exists, but current write auth does not yet depend on it, so there is a risk of building more features around Telegram validity alone.

## 6. What should not be touched yet

Until the TRUD pilot is more stable, avoid changing:

- the current recipe entity split;
- Telegram write protection itself;
- current production deploy workflow;
- CRUD endpoint structure;
- database structure solely for hypothetical SaaS needs.

Those are the foundations currently carrying real usage.

## 7. Recommended safe implementation order

1. Stabilize the current TRUD staff tool UX and workflows.
2. Make checklists and shift routines operationally useful.
3. Start using the `users` table for real allowlist and role checks.
4. Design the workspace model and migration plan on paper before schema changes.
5. Add `workspace_id` only when access control and data-scoping rules are already explicit.
6. Only after that begin multi-organization onboarding and invite flows.
