<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NWP School Works System – instructions for AI agents

Next.js 16 (App Router, TypeScript, Tailwind, shadcn/ui) on Vercel + Supabase (Postgres, Auth with MFA, Storage). A government system for the Department of Engineering Services, North Western Province, Sri Lanka – security and data correctness come first.

This file is the development contract for every member and every AI session. If it conflicts with your assumption, this file wins. If it conflicts with a more specific doc, the specific doc wins – and record the contradiction in `.agent/open-questions.md`.

## Mandatory read order

Before writing code for a task, read in this order (don't ask what these already answer):

1. `AGENTS.md` (this file)
2. `docs/phase-1/00-overview.md` – slices, folder ownership, branches, timeline, definition of done
3. `docs/phase-1/contracts.md` – shared tables, functions, routes, public APIs, Estimate No and status rules
4. Your member doc – `docs/phase-1/member-<N>-*.md`
5. `nwp-domain` skill and `docs/decisions.md`
6. `.agent/current-state.md` and `.agent/open-questions.md`
7. `.agent/memory/member-<N>.md` – only when continuing earlier work (`/remember restore`)
8. `docs/ui-registry.md` and the Figma screen – before building any UI

## Skills (`.claude/skills/`)

**Workflow skills** – how to work (adapted from the B-Trust project's workflow, originally `JavaScript-Mastery-Pro/jsm-agent-skill`, MIT):

| Skill | When |
| --- | --- |
| `/architect` | Before any non-trivial task. Resolves decisions, ends with "Blueprint ready." and a plan you confirm |
| `/remember` | `save` at the end of a session, `restore` at the start of the next. Per-member file in `.agent/memory/` |
| `/feature-review` | After finishing a feature, before the PR. Three layers: plan, NWP system rules, production readiness. Reports only |
| `/recover` | When a problem keeps coming back. Diagnose the failure mode before fixing again |
| `/imprint` | After building UI. Records patterns in `docs/ui-registry.md`; `audit` checks drift |

**NWP project skills** – what the rules are:

| Skill | When |
| --- | --- |
| `nwp-domain` | Anything touching estimates, tenders, sections, statuses, roles, divisions, the Rs 5M rule, money rules |
| `nwp-feature-slice` | Adding pages, components, routes, translations |
| `nwp-supabase-migration` | Tables, policies, Postgres functions, database tests |
| `nwp-server-action` | Any data change or form submit |
| `nwp-security-checklist` | Reviews, auth, permissions, uploads, exports, env vars |
| `nwp-feature-docs` | Documenting a finished or changed feature |
| `nwp-pr-ready` | Before committing or opening a PR |

Agents without skill support: read the `SKILL.md` files directly.

## Shared project state (`.agent/`)

| File | Purpose |
| --- | --- |
| `.agent/current-state.md` | Team-wide status, newest first – migrations merged, contracts changed, blockers |
| `.agent/open-questions.md` | Questions for the department or team, with IDs (OQ-NN) |
| `.agent/decisions/` | ADRs for decisions that affect other members (template in its README) |
| `.agent/handoffs/` | Notes from one member to another – work ready, or a change in someone else's folder |
| `.agent/memory/member-<N>.md` | Each member's latest session memory (written by `/remember`) |

## Starting and ending a session

**Start**

1. `git switch dev && git pull`, then `git switch -c feat/<slice>-<task>`.
2. Follow the mandatory read order; run `/remember restore` if continuing.
3. If teammates' migrations merged: `npm run db:reset && npm run db:types`.
4. Run `/architect` for anything non-trivial. No code until the plan is confirmed.

**End**

1. Run the checks (`nwp-pr-ready`), then `/feature-review`; `/imprint` if UI changed.
2. Update the member doc checkboxes, `.agent/current-state.md` if teammates need to know, and write a handoff if someone depends on your work.
3. Run `/remember save`.
4. Commit and open the PR into `dev`.

**Never**

- Mark a task done with failing checks or a database that doesn't rebuild (`npm run db:reset`).
- Change a shared contract without updating `docs/phase-1/contracts.md` and getting the owners' approval.
- Edit another member's files or merged migrations without a handoff.

## Hard rules

1. Work only in the current slice's folders (`.github/CODEOWNERS`); use other slices through their `index.ts`.
2. `requireUser()` first in every server action, route handler and protected page; RLS on every table, policies start with `mfa_ok()`.
3. The Supabase secret key stays in `server-only` files; never `NEXT_PUBLIC_`.
4. Estimate No and Tender No are different fields – never store one in the other.
5. Schema changes only through new migration files in `supabase/migrations/` named `<timestamp>_<area>_<what>.sql`.
6. Never commit real department data, `.env` files or secrets. Seeds and tests use made-up data.
7. PRs go into `dev`, with Conventional Commit titles.

## Commands

`npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run test:e2e` · `npm run db:start` · `npm run db:reset` · `npm run db:types` · `npx supabase test db`
