# Phase 1 contracts – what each slice promises the others

Agreed in week 1. Build against these names and shapes; until the real table or function is merged, use the mock data in your own slice. **Change this file only through a PR approved by every affected owner.**

## 1. Roles and session (Member 1)

```ts
// src/lib/auth/roles.ts
type AppRole =
  | 'subject_clerk' | 'designer' | 'draughtsman' | 'ho_to'
  | 'de_to' | 'de_engineer' | 'head_engineer' | 'admin';

// src/lib/auth/require-user.ts – call first in every server action, route handler and protected page
requireUser({ roles?: AppRole[] }): Promise<{
  supabase;                       // server client, RLS applies
  user;                           // auth user
  profile: { role: AppRole; office: 'HO' | 'DE'; division_id: string | null; active: boolean };
}>
```

SQL helpers (all `stable`, usable in any RLS policy):

| Function | Returns |
| --- | --- |
| `public.mfa_ok()` | `true` when the JWT is `aal2` |
| `public.current_app_role()` | the caller's `app_role` |
| `public.current_division()` | caller's division id (DE staff), else null |
| `public.has_fund(fund_id uuid)` | subject clerk handles this fund |
| `public.is_role(variadic roles app_role[])` | caller has one of these roles |
| `public.setting_numeric(key text)` | numeric value from `settings`, e.g. `setting_numeric('ho_check_threshold')` = 5000000 |

Audit: attach the trigger to every business table you create:

```sql
create trigger audit_<table> after insert or update or delete on public.<table>
  for each row execute function audit.log_change();
```

## 2. Shared tables

| Table | Owner | Columns other slices rely on |
| --- | --- | --- |
| `divisions` | M1 | `id`, `code` (`Kul`…`Wen`), `name` |
| `funds` | M1 | `id`, `code`, `name` |
| `settings` | M1 | `key text primary key`, `value jsonb` |
| `profiles` | M1 | `user_id`, `full_name`, `role`, `office`, `division_id`, `active` |
| `institutes`, `programs`, `district_secretariats`, `schools` | M2 | `id`, `code`/`name`; `schools.division_id` |
| `request_letters` | M2 | `id`, `ref_no`, `letter_date`, `institute_id`, `received_at_ho_on`, `file_path` |
| `works` | M2 | `id`, `estimate_no` (unique), `estimate_year`, `estimate_serial`, `letter_id`, `institute_id`, `fund_id`, `program_id`, `division_id`, `district_secretariat_id`, `school_id`, `description`, `work_type` (`new`/`repair`), `budget`, `status` (`work_status`), `created_at` |
| `estimates` | M3 | `id`, `work_id`, `version`, `is_current`, `forwarded_to_de_on`, `expected_on`, `total_cost`, `submitted_to_ho_on`, `checked_on`, `check_result`, `sent_to_sender_on` |
| `design_tasks` | M3 | `work_id`, `discipline`, `submitted_on`, `completed_on` |
| `work_status_history` | M3 | `work_id`, `from_status`, `to_status`, `changed_by`, `changed_at` |

`work_status` enum is created by **M2** in the `register` migration with values `REG`, `EUP`, `EP`, `CAN`. Only **M3's functions** change `works.status` (M2 revokes direct updates of that column).

View for the works list (created by **M3**, read by M4):

```sql
create view public.works_overview with (security_invoker = true) as
select w.*, e.total_cost as estimate_total, e.forwarded_to_de_on, e.sent_to_sender_on,
       e.expected_on, (e.submitted_to_ho_on is not null and e.checked_on is null) as waiting_ho_check
from public.works w
left join public.estimates e on e.work_id = w.id and e.is_current;
```

## 3. Postgres functions (RPC)

| Function | Owner | Called by |
| --- | --- | --- |
| `next_estimate_serial(p_year int) returns int` | M2 | register form |
| `find_similar_works(p_school_id uuid, p_description text) returns setof works` | M2 | register form |
| `forward_to_de(p_work_id uuid, p_forwarded_on date, p_expected_on date)` | M3 | register (after saving) and work page |
| `submit_estimate(p_work_id uuid, p_total_cost numeric, p_stage_note text, p_file_path text)` | M3 | DE inbox |
| `check_estimate(p_work_id uuid, p_result text, p_note text)` | M3 | HO check queue |
| `send_to_sender(p_work_id uuid, p_sent_on date)` | M3 | work page |
| `cancel_work(p_work_id uuid, p_reason text)` | M3 | work page |

## 4. Feature public APIs (`src/features/<feature>/index.ts`)

Import from another slice **only** through its `index.ts`.

| Feature | Exports |
| --- | --- |
| `auth` (M1) | `SignOutButton` |
| `reference` (M2) | `getDivisions()`, `getFunds()`, `getInstitutes()`, `getPrograms()`, `getSchools(divisionId?)`, `<DivisionSelect>`, `<FundSelect>`, `<SchoolCombobox>` |
| `register` (M2) | `getWorkRegistration(workId)` |
| `estimates` (M3) | `<StatusBadge status>`, `<EstimateStageTimeline workId>`, `statusLabel(status)` |
| `works-list` (M4) | `exportWorks(filters)` (server action) |
| `src/lib/estimate-no` (M2) | `parseEstimateNo()`, `validateEstimateNo()`, `formatEstimateNo()` |

## 5. Routes and navigation

| Route | Owner | Roles |
| --- | --- | --- |
| `/login`, `/mfa/setup`, `/mfa/verify` | M1 | everyone |
| `/admin/users` | M1 | admin |
| `/admin/reference/*` | M2 | admin |
| `/letters/new`, `/letters/[id]` | M2 | subject_clerk (head_engineer read) |
| `/works` | M4 | all except admin |
| `/works/[id]` | M3 | by RLS |
| `/inbox/de` | M3 | de_to, de_engineer |
| `/inbox/ho-check` | M3 | ho_to |

Navigation items live in `src/components/shell/nav-items.ts` (M1): `{ href, labelKey, icon, roles }` – one line per route.

## 6. Translations

next-intl, one namespace per feature: `messages/<locale>/<feature>.json` with locales `en`, `si`, `ta`. Namespaces: `common`, `auth`, `shell`, `admin-users`, `reference`, `register`, `estimates`, `works-list`. English is required; Sinhala/Tamil files start as copies of English.

## 7. Conventions

- Dates: `date` in Postgres, ISO strings in TypeScript, `DD/MM/YYYY` on screen.
- Money: `numeric(14,2)`; display `Rs 1,234,567.00`.
- Server action result: `{ ok: true, data? } | { ok: false, message: string, fieldErrors?: Record<string, string[]> }`.
- Errors raised in Postgres functions use readable English messages; the UI shows them as-is.
