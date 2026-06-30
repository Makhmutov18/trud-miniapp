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
