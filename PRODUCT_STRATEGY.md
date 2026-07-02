# Product Strategy

## What this product is

Today this repository is a Telegram Mini App for TRUD.

Operationally, TRUD is the first real workspace where the product is used every day by a bar team. Product-wise, TRUD is the pilot, not the final boundary of the system.

The future direction is a reusable product for coffee shops and small hospitality teams:

- coffee shops;
- coffee chains with 2-10 locations;
- small bars;
- bakeries with a beverage bar;
- teams that need fast access to recipes, standards, checklists, and shift processes.

## What problem it solves

The product solves a staff-operations problem, not a sales or accounting problem.

Common pain points:

- recipes are scattered across chats, PDFs, notes, and spreadsheets;
- new staff take too long to onboard;
- baristas prepare the same drinks differently;
- checklists are inconsistent or ignored;
- managers do not know which version of a standard is current;
- team knowledge is not stored in one reliable place.

## Positioning

This product is not:

- a POS;
- a cash register;
- an inventory system;
- accounting software.

This product is:

- a mobile bar operations system;
- a shared operational knowledge base for the bar;
- a fast Telegram-first staff tool;
- a place where recipes, standards, checklists, shift routines, and training live together.

In short:

`recipes -> standards -> checklists -> shift routines -> training`

## TRUD as the pilot

TRUD is the first working case and the first product laboratory.

New ideas can be tested at TRUD first because the team is close to the product and can give fast feedback. But new product decisions should be designed so that later they can be reused by other cafes without needing to undo hard-coded TRUD assumptions.

That means:

- current delivery remains TRUD-focused;
- current implementation can stay single-workspace for now;
- future planning should avoid making TRUD-specific assumptions harder to remove.

## Universal SaaS product direction

The long-term product should be a reusable Bar Ops / Standards tool, not a custom app design for one cafe.

Core principle:

- one product;
- many coffee shops;
- one shared UI/UX;
- many workspaces.

TRUD is the first workspace, not the brand of the entire product.

That means:

- TRUD can be used as pilot content, demo content, and a real operating case;
- the UI should stay neutral, professional, and reusable across different cafes;
- the interface should not become a custom theme for each location;
- product decisions should favor reuse over brand-specific styling.

Allowed customization should stay narrow:

- workspace name;
- workspace logo/avatar;
- locations / spots;
- users and roles;
- recipes;
- checklists;
- menu/items content.

Not allowed as a default product direction:

- unique visual themes per cafe;
- brand-heavy UI built around TRUD;
- one-off layout changes for each customer;
- custom agency-style redesigns per workspace.

The product should feel like a general staff tool that a coffee business joins, not like a new design made from scratch for every client.

## Core advantages

The current and near-future product promise is simple:

- one current standard instead of many conflicting versions;
- faster work on shift because the answer is always in one place;
- fewer mistakes and easier onboarding for new staff.

## What is not part of the current stage

This strategy does not mean the project should immediately become SaaS.

Not in scope right now:

- multi-tenant implementation;
- billing or subscriptions;
- invite flows;
- major auth redesign;
- POS or warehouse integration;
- broad backend or database restructuring just for future-proofing.

The immediate focus remains a stable, useful staff tool for TRUD, with decisions documented so the product can later expand into a broader Bar Ops OS.
