# SaaS Roadmap

## Stage 0 - Current TRUD Pilot

Goal:
Make the TRUD workspace stable as a real production pilot.

What is included:

- stable CRUD for recipes and items;
- Telegram auth for mutating actions;
- Railway production deploy;
- production smoke-checks;
- baseline mobile UI for daily use.

What is not included:

- multi-tenant support;
- billing;
- invite flows;
- role-based workspace management;
- productized onboarding for external customers.

Main risk:
Trying to generalize too early and destabilizing the current TRUD workflow.

## Stage 1 - Better Staff Tool

Goal:
Turn the current pilot into a sharper daily operations tool for one team.

What is included:

- better recipe forms;
- a more practical staff-tool home screen;
- removal of decorative or non-functional UI clutter;
- better search and better cards;
- more useful checklists and shift flows.

What is not included:

- workspace model;
- billing;
- organization onboarding;
- cross-company access control.

Main risk:
UI/design work consumes effort without improving actual shift operations.

## Stage 2 - Access and Roles

Goal:
Move from "valid Telegram user" to "known user with role".

What is included:

- users table as a real access layer;
- `telegram_id` as the main identity bridge;
- roles such as `owner`, `admin`, `manager`, `barista`, `viewer`;
- allowlist-based access control;
- role-aware permissions for mutating operations.

What is not included:

- invite links at first;
- multi-workspace support;
- self-service organization setup.

Main risk:
Adding roles before product workflows are clear can create permission complexity without real benefit.

## Stage 3 - Workspace and Organization Model

Goal:
Introduce the first clean boundary that makes the product reusable beyond TRUD.

What is included:

- `organization` or `workspace` entity;
- TRUD represented as the first workspace;
- recipes, items, checklists, and related content scoped by `workspace_id`;
- a migration plan for existing TRUD data;
- auth rules upgraded from "valid user" to "valid user in this workspace".

What is not included:

- public self-serve onboarding;
- subscription automation;
- fully productized tenant administration.

Main risk:
Schema and auth changes touch core production data paths and must be staged carefully.

## Stage 4 - Multi-cafe SaaS

Goal:
Open the product to multiple coffee businesses in a controlled way.

What is included:

- multiple organizations;
- onboarding flow;
- invite flow;
- manual or offline-first subscription handling;
- a product framing that works outside TRUD.

What is not included:

- payment integration on day one;
- enterprise integrations;
- large operational back-office tooling.

Main risk:
Customer-facing SaaS expectations can outrun product maturity if launched before the core staff tool is strong enough.

## Stage 5 - Advanced Ops

Goal:
Add higher-value operational features once the foundation is stable.

What is included:

- shift logs;
- training mode;
- recipe version history;
- analytics;
- export/import.

What is not included:

- full ERP features;
- full payroll or HR tooling;
- deep finance/accounting features.

Main risk:
Adding advanced features on top of weak core workflows creates a wide but fragile product.
