# Member 1 – Database & backend lead

**Name:** ______________ · **Phase 1, 8 weeks** · Read first: [Phase 1 overview](00-overview.md)

You own the Supabase database: tables, constraints, row-level security (RLS), the Postgres functions that move a work through the workflow, and the audit log. **The database is the real security boundary** – if a rule matters, it is enforced here, not only in the UI.

## Deliverables

| # | Deliverable | Week |
| --- | --- | --- |
| 1 | Reference tables + profiles/roles schema | 1 |
| 2 | RLS helper functions and policies (deny by default), audit trigger | 2 |
| 3 | `request_letters`, `works` with Estimate No constraints | 3 |
| 4 | `design_tasks`, `estimates` (with versions) | 4 |
| 5 | Workflow functions: forward, submit estimate, HO check, send to requester | 5 |
| 6 | Rs 5M routing, cancel, status history | 6 |
| 7 | Indexes, performance, fixes | 7–8 |

## 1. Schema (first version)

All tables: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `created_by uuid references auth.users`, `updated_at`. Money as `numeric(14,2)`. Dates as `date`.

**Reference tables** (Member 3 fills them)

| Table | Key columns |
| --- | --- |
| `divisions` | `code` (Kul, Kur, Mah, Rid, War, Put, Wen), `name` |
| `district_secretariats` | `name`, `division_id` |
| `institutes` | `code` (CM, PED, MOE, DoSD), `name` |
| `funds` | `code` (PSDG, CBG, PCSL, NSBS, REC, GEMP, SESSIP, DON, OTHER, OTHER-D, OTHER-S, SPORTS), `name` |
| `programs` | `name` (e.g. Repair, Dental Unit, NCOE), `fund_id` nullable |
| `schools` | `name`, `division_id`, `district_secretariat_id` nullable, `active` |
| `settings` | `key`, `value jsonb` – e.g. `ho_check_threshold = 5000000` |

**People and access**

| Table | Key columns |
| --- | --- |
| `profiles` | `user_id` (= `auth.users.id`), `full_name`, `office` (`HO` / `DE`), `role`, `division_id` (DE staff only), `active` |
| `profile_funds` | `user_id`, `fund_id` – which funds a subject clerk handles |

Roles (Postgres enum `app_role`): `subject_clerk`, `designer`, `draughtsman`, `ho_to`, `de_to`, `de_engineer`, `head_engineer`, `admin`.

**Work tables**

| Table | Key columns |
| --- | --- |
| `request_letters` | `ref_no`, `letter_date`, `institute_id`, `received_at_ho_on`, `file_path` (Storage), `notes` |
| `works` | `estimate_no` **unique**, `estimate_year`, `estimate_serial`, `letter_id`, `section` (default `Education`), `institute_id`, `fund_id`, `program_id`, `division_id`, `district_secretariat_id` (optional), `school_id`, `description`, `work_type` (`new` / `repair`), `budget` (from the letter), `status`, `ped_approved_on`, `cancel_reason` |
| `design_tasks` | `work_id`, `discipline` (`architectural` / `structural` / `electrical`), `designer_id`, `draughtsman_id`, `assigned_on`, `submitted_on`, `completed_on` |
| `estimates` | `work_id`, `version`, `forwarded_to_de_on`, `expected_on`, `prepared_by` (DE TO), `total_cost`, `stage_note` (e.g. "Up to DPC"), `file_path`, `submitted_to_ho_on`, `checked_by` (HO TO), `checked_on`, `check_result` (`approved` / `returned`), `check_note`, `sent_to_sender_on`, `is_current` |
| `work_status_history` | `work_id`, `from_status`, `to_status`, `changed_by`, `changed_at`, `note` |
| `audit.log` | `table_name`, `row_id`, `action`, `old_data jsonb`, `new_data jsonb`, `actor`, `at` |

Status enum `work_status`: `REG`, `EUP`, `EP`, `CAN` (Phase 2 adds `TC`, `AW`, `WIP`, ...).

**Estimate No checks (with Member 3's validator)**

- `check (estimate_no ~ '^NWPEng/E/[0-9]{4}/[0-9]{3,4}/[A-Za-z]+/[A-Za-z-]+/[A-Za-z]{3} [0-9]{3}$')`
- A trigger compares the parts with the row: year = `estimate_year`, institute code, fund code, division code. Mismatch → error with a clear message.
- `unique (estimate_no)` and `unique (estimate_year, estimate_serial)`.
- Function `next_estimate_serial(p_year int) returns int` – highest serial for the year + 1 (suggestion only; the clerk confirms).
- Imported legacy numbers that do not match (e.g. `OTHER -D`, lowercase `war`) keep the original in `estimate_no_original`; Member 3 normalises them.

## 2. Row-level security

Enable RLS on **every** table in `public`. No policy = no access.

Helper functions (`security definer`, `stable`, `set search_path = ''`):

```sql
create function public.current_role() returns app_role ...      -- from profiles
create function public.current_division() returns uuid ...      -- DE staff only
create function public.has_fund(p_fund uuid) returns boolean ... -- subject clerk scope
create function public.mfa_ok() returns boolean as $$
  select coalesce((auth.jwt() ->> 'aal') = 'aal2', false)
$$ language sql stable;
```

Every policy starts with `mfa_ok()` so a password alone never reads data.

| Role | `works` read | `works` write |
| --- | --- | --- |
| `subject_clerk` | works in their funds | insert/update registration fields of their funds |
| `designer`, `draughtsman` | works with a design task assigned to them | only their design task |
| `de_to`, `de_engineer` | works in their division | only through workflow functions (estimate) |
| `ho_to` | works waiting for HO check + history | only through `check_estimate` |
| `head_engineer` | all | none |
| `admin` | none (users and settings only) | none |

Workflow changes (status, routing) go **only** through the functions below – no direct `update works set status`. Revoke update on `status` from `authenticated`.

## 3. Workflow functions (agree names with Member 2 in week 2)

All `security invoker` where possible; each checks role, scope and current status, writes `work_status_history`, and raises a clear error otherwise.

| Function | Who | Does |
| --- | --- | --- |
| `register_work(...)` | subject_clerk | Creates the work (status `REG`) under an existing letter |
| `forward_to_de(work_id, forwarded_on, expected_on)` | subject_clerk | Creates estimate v1, status `EUP` |
| `submit_estimate(work_id, total_cost, stage_note, file_path)` | de_to / de_engineer of that division | Saves the estimate. If `total_cost >= ho_check_threshold` → marks `submitted_to_ho_on` and puts it in the HO check queue; else it can be sent by the DE office |
| `check_estimate(work_id, result, note)` | ho_to | `approved` → ready to send; `returned` → back to the DE office as a new version |
| `send_to_sender(work_id, sent_on)` | subject_clerk (≥ 5M) or DE office (< 5M) | Status `EP`. Refused if ≥ 5M and not approved by HO |
| `cancel_work(work_id, reason)` | subject_clerk, HO approval later | Status `CAN` with reason |

## 4. Audit log

- One generic trigger function `audit.log_change()` on every business table (insert, update, delete).
- `audit.log` has **no** update/delete grants for anyone; only the trigger inserts.
- `head_engineer` can read it; `admin` can read it; nobody can change it.

## 5. How you work

```bash
npx supabase migration new create_reference_tables   # new migration file
npx supabase db reset                                 # rebuild local DB from migrations + seed
npm run db:types                                      # regenerate TypeScript types for the team
npx supabase test db                                  # run pgTAP tests (RLS)
```

- One migration per change; never edit a migration that is already merged.
- After every schema change: regenerate types and commit `src/types/database.ts`.
- Write a pgTAP test for each policy: "DE TO of Kul cannot read a Kur work", "subject clerk without PSDG cannot insert a PSDG work", "no aal2 → no rows".

## Done when

- [ ] All tables have RLS enabled and tested for allowed **and** blocked roles.
- [ ] A work can go REG → EUP → EP through functions only, with both the < 5M and ≥ 5M paths.
- [ ] Estimate No format, uniqueness and part-matching are enforced in the database.
- [ ] Every change lands in `audit.log`.
- [ ] Types are generated and committed; Member 2 and 3 use them.
