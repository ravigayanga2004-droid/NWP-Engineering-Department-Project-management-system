---
name: nwp-supabase-migration
description: Create a Supabase/Postgres migration for this project – table conventions, row-level security with MFA and role/division/fund scope, audit trigger, workflow functions, pgTAP tests and regenerated TypeScript types. Use whenever adding or changing a table, view, enum, policy or Postgres function, or writing database tests.
---

# Supabase migration

The database is the security boundary. If a rule matters, enforce it here.

## 1. Create the file (named by area)

```bash
npx supabase migration new <area>_<what>     # area: auth | ref | register | estimate
# → supabase/migrations/20261124093000_register_works.sql
```

Never edit a migration that is merged. Never alter another area's table – ask its owner (see `.github/CODEOWNERS`).

## 2. Table template

```sql
create table public.<table> (
  id          uuid primary key default gen_random_uuid(),
  -- columns: money numeric(14,2), dates date, codes text with check constraints
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users default auth.uid(),
  updated_at  timestamptz not null default now()
);

alter table public.<table> enable row level security;

create trigger audit_<table>
  after insert or update or delete on public.<table>
  for each row execute function audit.log_change();
```

## 3. Policies – deny by default, MFA first

Helpers (from the `auth` migration, see `docs/phase-1/contracts.md`): `mfa_ok()`, `current_app_role()`, `current_division()`, `has_fund(uuid)`, `is_role(variadic app_role[])`, `setting_numeric(text)`.

```sql
create policy "<table>: DE staff read own division"
  on public.<table> for select to authenticated
  using ( public.mfa_ok()
          and public.is_role('de_to', 'de_engineer')
          and division_id = public.current_division() );

create policy "<table>: subject clerk inserts own funds"
  on public.<table> for insert to authenticated
  with check ( public.mfa_ok()
               and public.is_role('subject_clerk')
               and public.has_fund(fund_id) );

create policy "<table>: head engineer reads all"
  on public.<table> for select to authenticated
  using ( public.mfa_ok() and public.is_role('head_engineer') );
```

- `admin` gets **no** policies on work data.
- One policy per (role group × action); name policies `"<table>: <who> <does what>"`.
- Columns only workflow functions may change (e.g. `works.status`): `revoke update (status) on public.works from authenticated;`

## 4. Workflow functions

```sql
create function public.<verb>_<noun>(p_work_id uuid, ...)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare v_work public.works;
begin
  if not public.mfa_ok() then raise exception 'MFA required'; end if;
  select * into v_work from public.works where id = p_work_id for update;
  if not found then raise exception 'Work not found or not visible to you'; end if;
  if v_work.status <> 'EUP' then raise exception 'Work % is not waiting for an estimate', v_work.estimate_no; end if;
  -- role/scope checks, then the change, then a row in work_status_history
end $$;
```

Use `security definer` only when a function must bypass RLS on purpose; then check role and scope explicitly inside, and keep `set search_path = ''`. Read limits such as the Rs 5M threshold with `public.setting_numeric('ho_check_threshold')` – never a literal.

## 5. Tests (pgTAP) – allowed AND blocked

`supabase/tests/<area>_<what>.sql`:

```sql
begin;
select plan(3);
-- set the caller: select set_config('request.jwt.claims', '{"sub":"<user uuid>","role":"authenticated","aal":"aal2"}', true); set local role authenticated;
select is( (select count(*) from public.works where division_id = '<other division>'), 0::bigint, 'DE TO cannot see another division');
select throws_ok( $$ select public.send_to_sender('<work>', current_date) $$, null, 'send blocked before HO approval');
select is( (select count(*) from public.works), 0::bigint, 'no rows without aal2' );  -- after setting aal1 claims
select * from finish();
rollback;
```

## 6. Run and regenerate

```bash
npm run db:reset          # rebuild local DB from migrations + seed
npx supabase test db      # pgTAP
npm run db:types          # regenerate src/types/database.ts – commit it
```

CI fails if `src/types/database.ts` is out of date. On a merge conflict in that file, never edit by hand: rebase, `npm run db:reset && npm run db:types`, commit.
