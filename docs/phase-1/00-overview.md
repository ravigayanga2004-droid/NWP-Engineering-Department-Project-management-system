# Phase 1 overview – Foundation + Register & Estimates

**Length:** 8 weeks · **Team:** 4 members · **Stack:** Next.js 16 (App Router, TypeScript) on Vercel + Supabase (Postgres, Auth, Storage)

## Goal

At the end of Phase 1 the subject clerks stop using the paper **Estimate Register**. Every request is registered in the system, sent to its DE office, estimated there under its Estimate No, checked at Head Office when it is Rs 5M or more, and sent back to the requester – with a full history of who did what.

## How the work is split: one feature slice per member

Every member writes **Next.js code end to end** for their own slice: database migration → Postgres functions / RLS → server actions → pages and components → tests → feature doc. Each slice lives in its **own folders**, so members rarely edit the same files.

| Member | Slice | Main screens | Owns tables |
| --- | --- | --- | --- |
| **1** | [Auth, access & app shell](member-1-auth-access-shell.md) | `/login`, `/mfa/*`, app layout + sidebar, `/admin/users` | `profiles`, `profile_funds`, `settings`, `divisions`, `funds`, `audit.log` + RLS helper functions |
| **2** | [Reference data & register](member-2-reference-register.md) | `/admin/reference/*`, `/letters/new`, `/letters/[id]` | `institutes`, `programs`, `district_secretariats`, `schools`, `request_letters`, `works` |
| **3** | [Estimate workflow](member-3-estimate-workflow.md) | `/works/[id]`, `/inbox/de`, `/inbox/ho-check` | `design_tasks`, `estimates`, `work_status_history` + workflow functions |
| **4** | [Works list, import & DevOps](member-4-works-list-import-devops.md) | `/works` (list, filters, Excel export) | none (reads others' tables); `scripts/import/`, CI, environments, E2E tests |

Shared interfaces between slices are fixed in **[contracts.md](contracts.md)** in week 1. If you need to change a contract, open a PR that only changes `contracts.md` and get the affected owners to approve.

## Folder ownership (enforced by `.github/CODEOWNERS`)

| Path | Owner |
| --- | --- |
| `src/app/(auth)/**`, `src/app/(app)/layout.tsx`, `src/app/(app)/admin/users/**`, `src/features/auth/**`, `src/features/admin-users/**`, `src/lib/auth/**`, `src/lib/supabase/**`, `src/components/shell/**`, `src/i18n/**` | Member 1 |
| `src/app/(app)/admin/reference/**`, `src/app/(app)/letters/**`, `src/features/reference/**`, `src/features/register/**`, `src/lib/estimate-no/**` | Member 2 |
| `src/app/(app)/works/[id]/**`, `src/app/(app)/inbox/**`, `src/features/estimates/**` | Member 3 |
| `src/app/(app)/works/page.tsx`, `src/features/works-list/**`, `scripts/**`, `e2e/**`, `.github/**`, config files, `package.json` | Member 4 |
| `supabase/migrations/*_<area>_*.sql` | owner of that area (see naming below) |
| `messages/<locale>/<feature>.json` | owner of that feature |
| `src/components/ui/**` (shadcn) | anyone may add a component; Member 1 reviews |
| `docs/**` | everyone; overview and contracts need 2 approvals |

## Rules that keep conflicts low

1. **Stay in your folders.** Need something from another slice? Import it from that slice's `index.ts` (its public API) – never reach into its internals, never edit its files.
2. **Migrations are named by area:** `npx supabase migration new <area>_<what>` → `20261124093000_auth_profiles.sql`. Areas: `auth`, `ref`, `register`, `estimate`. Never edit a merged migration; never alter another area's table – ask its owner.
3. **Translations are split per feature:** `messages/en/register.json`, `messages/si/register.json`, … – no shared giant file.
4. **Navigation:** one line per feature in `src/components/shell/nav-items.ts` (Member 1's file). Add your line in your first PR; Member 1 approves.
5. **Dependencies:** adding a package changes `package.json` + lockfile (Member 4's files). Ask in the team chat first; Member 4 adds it in a small PR, or approves yours. Batch requests.
6. **Generated types:** `src/types/database.ts` is generated. On a conflict, never merge by hand – rebase, run `npm run db:reset && npm run db:types`, commit the result.
7. **Small PRs, merged daily.** Rebase on `dev` every morning.

## Branches (same model as RUR)

| Branch | Deploys to | Rules |
| --- | --- | --- |
| `feat/<area>-<name>`, `fix/...` | Vercel preview | your work |
| `dev` | Supabase **dev** + Vercel dev preview | PRs from feature branches, 1 approval + CI green |
| `staging` | Supabase **staging** + Vercel staging | PR `dev → staging` at the end of each week, demo to the department |
| `main` | Supabase **production** + Vercel production | PR `staging → main`, 2 approvals, production environment approval |

Workflows: [.github/workflows](../../.github/workflows) – `pr.yml` (checks on every PR, reusing `checks.yml`), `db-deploy.yml` (applies migrations to the matching Supabase project on push to `dev`/`staging`/`main`). Vercel deploys the app itself through its GitHub integration.

## Timeline

Week 1 is about **contracts and mocks**: everyone can build UI against mock data before the real tables exist.

| Week | Member 1 – Auth & shell | Member 2 – Reference & register | Member 3 – Estimate workflow | Member 4 – Works list & DevOps |
| --- | --- | --- | --- | --- |
| 1 | `auth` migration: profiles, roles, divisions, funds, settings, RLS helpers, audit trigger (**merge by day 4**) | Estimate No library + tests; collect reference lists | Contracts for workflow functions; inbox/work page UI on mock data | Branches, environments, secrets, Vercel; works list UI on mock data |
| 2 | Login, MFA setup/verify, `requireUser`, app shell, next-intl | `ref` migration + seed; admin reference pages | `estimate` migration draft (waits for `works`) | Import script: parse register + workbook (no DB yet) |
| 3 | `/admin/users` (invite, roles, funds, deactivate) | `register` migration: letters, works, Estimate No checks (**merge by day 2**) | `estimate` migration: design_tasks, estimates, history | Works list on real data: filters, search, URL state |
| 4 | Test users seed, RLS pgTAP tests for auth | `/letters/new` form, letter scan upload | `forward_to_de`, `submit_estimate` + DE inbox | Excel export; E2E: sign-in |
| 5 | Session timeout, sign-out-everywhere, audit viewer | Duplicate warning, next-serial suggestion | `check_estimate`, `send_to_sender`, HO check queue, 5M routing | Import dry runs + cleanup report |
| 6 | Language switcher, Sinhala/Tamil fonts, accessibility pass | `/letters/[id]`, cancel/edit rules | `/works/[id]` page: stages, design tasks, history | E2E: full register → estimate → send flow |
| 7 | Fixes from UAT | Fixes from UAT | Fixes from UAT | UAT with a clerk + one DE office; staging import |
| 8 | Bug fixes, handover notes | Bug fixes, feature doc | Bug fixes, feature doc | Production import, go-live checklist |

## Key rules (from the spec)

| Rule | Detail |
| --- | --- |
| Estimate No | Entered by the subject clerk **before** the work is sent to the division; the system suggests it with the department's original rule. Format `NWPEng/<section>/<year>/<serial>/<institute>/<FUND>/<Div> <div serial>`, e.g. `NWPEng/E/2026/266/MOE/OTHER/Kul 033`. Unique. |
| Sections | `E` Education · `H` Health · `O` Other Department – the register covers more than schools; Phase 1 screens show Education |
| Status order | `REG → EUP → EP → TC → AW → WIP → WC → FBTP → RTR → RR → RRD` (`TS`, `TER` after award, `CAN` outside). Counts use `status_rank`, never fixed rows/cells |
| Tender No | Not in Phase 1. Entered later by the subject clerk when the work is given to a company. Never stored in the Estimate No field. |
| Every work goes to its DE office | The letter budget never decides the route. |
| Rs 5M rule | DE estimate **< Rs 5M** → DE office completes it. **≥ Rs 5M** → HO TO must check it before it is sent. Limit is in `settings`, not hard-coded. |
| Status | `REG` → `EUP` (forwarded to DE) → `EP` (sent to requester); `CAN` cancelled with reason. Set by functions, never typed. |
| Divisions | Kul Kuliyapitiya · Kur Kurunegala · Mah Maho · Rid Ridigama · War Wariyapola · Put Puttalam · Wen Wennappuwa |

## Definition of done (every PR)

- Works for the right roles and is **blocked for the wrong ones** (tested).
- Validation on the server (Postgres or server action with zod), not only in the form.
- Changes are audited.
- CI green: lint, typecheck, unit tests, build, database tests.
- Feature doc updated in `docs/features/` (RUR format – see the `nwp-feature-docs` skill).
- `/feature-review` run and findings fixed or recorded in the PR; `/imprint` run if UI changed.
- Handoff written in `.agent/handoffs/` if another member depends on the work; `.agent/current-state.md` updated if the team needs to know.
- PR template checklist ticked.

## Agent skills

Claude Code skills for this repo are in [`.claude/skills`](../../.claude/skills). They encode the rules above so an AI agent writes code the same way the team does. See [AGENTS.md](../../AGENTS.md).

## Open questions (Member 4 collects answers)

- Subject clerks and which funds/programs each owns; full user list.
- "Date of Return to Sender" vs "Date of Sent to Sender" – one date or two?
- Do Repairs ever need design tasks?
- Written approval to store data on Vercel/Supabase outside Sri Lanka.
- Digital copy of the 2026 Estimate Register.
