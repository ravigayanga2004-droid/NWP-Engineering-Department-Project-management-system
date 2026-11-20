# Phase 1 overview – Foundation + Register & Estimates

**Length:** 8 weeks · **Team:** 4 members · **Stack:** Next.js (App Router, TypeScript) on Vercel + Supabase (Postgres, Auth, Storage)

Phase 1 combines the spec's Phase 0 (Foundation) and Phase 1 (Register & Estimates), because the register cannot be built without sign-in, roles and the database underneath it.

## Goal

At the end of Phase 1 the subject clerks stop using the paper **Estimate Register**. Every new request is entered in the system, sent to the right DE office, estimated there, checked at Head Office when needed, and sent back to the requester – with a full history of who did what.

## In scope

1. Sign-in with MFA, roles, and access scoped by division (DE offices) and fund (subject clerks).
2. Reference lists: divisions, district secretariats, funds, programs, requesting institutes, schools.
3. **Request letters** (with scanned copy) and the **Works** they contain.
4. **Estimate No** entered by the subject clerk (format checked, next number suggested, must be unique).
5. Design tasks (architectural / structural / electrical + draughtsman, PED approval date).
6. Forward to DE office → DE TO prepares the estimate **under that Estimate No** → **Rs 5M rule** → HO TO check (≥ Rs 5M) → sent to requester.
7. Statuses `REG`, `EUP`, `EP`, `CAN` set automatically from these steps.
8. Duplicate warning (same school, similar work) when registering.
9. Audit log of every change.
10. Works list with filters and Excel export.
11. Import of the 2026 Estimate Register and the estimate-stage rows (EUP/EP) of the July 2026 workbook.

## Out of scope (later phases)

Tender No, contracts, securities, bills, completion, retention (Phase 2) · dashboards and alerts (Phase 3) · Sinhala/Tamil translation of every screen (Phase 4; Phase 1 only sets up the translation files).

## Key rules (from the spec)

| Rule | Detail |
| --- | --- |
| Estimate No | Entered by the subject clerk **before** the work is sent to the division. Format `NWPEng/E/<year>/<serial>/<institute>/<fund>/<Div> <div serial>`, e.g. `NWPEng/E/2026/266/MOE/OTHER/Kul 033`. Unique. The system suggests the next serial and checks the parts match the work's year, institute, fund and division. |
| Tender No | **Not in Phase 1.** Entered later by the subject clerk when the work is given to a company. Never stored in the Estimate No field. |
| Every work goes to its DE office | The letter budget never decides the route. |
| Rs 5M rule | DE estimate **< Rs 5M** → DE office completes it. **≥ Rs 5M** → returns to HO; an HO TO must check it before it can be sent. The limit is a setting, not hard-coded. |
| Status | `REG` registered → `EUP` forwarded to DE → `EP` sent to requester. `CAN` cancelled (with reason). Set by the system, not typed. |
| Division abbreviations | Kul = Kuliyapitiya, Kur = Kurunegala, Mah = Maho, Rid = Ridigama, War = Wariyapola, Put = Puttalam, Wen = Wennappuwa |

## Who does what

| Member | Owns | Doc |
| --- | --- | --- |
| 1 | Database schema, migrations, row-level security, Postgres functions for each workflow step, audit log | [member-1-database-backend.md](member-1-database-backend.md) |
| 2 | All screens: sign-in/MFA, app shell, works list, register form, work page, DE and HO queues | [member-2-frontend.md](member-2-frontend.md) |
| 3 | Reference data, Estimate No helpers, duplicate search, imports, cleanup report, Excel export | [member-3-data-import.md](member-3-data-import.md) |
| 4 | Project setup, CI, environments, Supabase Auth settings, security checks, tests, UAT, department contact | [member-4-devops-qa-security.md](member-4-devops-qa-security.md) |

## Timeline

| Week | Member 1 – DB/backend | Member 2 – Frontend | Member 3 – Data | Member 4 – DevOps/QA |
| --- | --- | --- | --- | --- |
| 1 | Reference tables, profiles & roles schema | App shell, layout, design system | Collect reference lists, school list from workbook | **Scaffold repo (day 1–2)**, CI, Supabase dev project, Vercel |
| 2 | RLS helpers + policies, audit trigger | Sign-in + MFA screens | Seed scripts, Estimate No parser/validator | Auth settings, security headers, test setup |
| 3 | `request_letters`, `works`, Estimate No checks | Works list (table, filters) | Next-serial suggestion, duplicate search | RLS tests, staging environment |
| 4 | Design tasks, estimates tables | Register letter + works form | Import script: 2026 register (dry run) | E2E tests for registration |
| 5 | Workflow functions: forward, submit, check, send | Work page: stages, design, history | Import: workbook EUP/EP rows (dry run) | Security review of weeks 1–4 |
| 6 | 5M routing, cancel, status history | DE inbox, HO check queue, actions | Cleanup report, Excel export | E2E tests for the full flow |
| 7 | Fixes, performance, indexes | Polish, empty/error states, translations setup | Real import into staging, fix data issues | UAT with a subject clerk and one DE office |
| 8 | Bug fixes | Bug fixes | Production import | Production go-live checklist, handover notes |

## Dependencies

- Everyone waits for Member 4's scaffold (week 1, day 2).
- Member 2 and 3 need Member 1's tables and generated types (`npm run db:types`) – Member 1 pushes reference tables in week 1.
- Member 2 builds screens against the Postgres functions Member 1 defines; agree function names and inputs in week 2 (see Member 1's doc).
- Member 4 needs a digital copy of the Estimate Register and the user list from the department **by week 3**.

## Working agreement

- **Branches:** `feat/<area>-<short-name>`, `fix/...`, `docs/...` from `main`. Never commit to `main` directly.
- **Pull requests:** small, one feature each, at least **1 review** from another member; CI must pass. Member 4 checks every PR against the security checklist.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
- **Database changes:** only through migration files in `supabase/migrations` (Member 1 reviews all of them). Never change the hosted database by hand.
- **Secrets:** never in Git. `.env.local` only; production values only in Vercel / Supabase settings.
- **Real data:** only in staging and production. Local and dev use made-up data.
- **Daily:** 15-minute stand-up. **Weekly:** demo to the team; every 2 weeks, demo to the department contact.

## Definition of done (every task)

- Works for the right roles and is **blocked for the wrong ones** (tested).
- Validation on the server (Postgres or server action), not only in the form.
- Changes appear in the audit log.
- Lint, type check, tests and build pass in CI.
- Reviewed and merged; Member 4 has ticked the security checklist.

## Open questions to settle early (Member 4 owns getting answers)

- Exact list of subject clerks and which funds/programs each owns.
- "Date of Return to Sender" vs "Date of Sent to Sender" – one date or two?
- Do Repairs ever need design tasks?
- Written department approval to store data on Vercel/Supabase outside Sri Lanka.
- Digital copy (Excel/Google Sheet) of the 2026 Estimate Register.
