# Member 1 – Auth, access & app shell

**Name:** ______________ · Read first: [overview](00-overview.md), [contracts](contracts.md) · Skills: `nwp-domain`, `nwp-supabase-migration`, `nwp-server-action`, `nwp-feature-slice`, `nwp-security-checklist`

You build the foundation everyone else stands on: sign-in with MFA, roles and data scope, the audit log, and the app shell. **Your week-1 migration is the critical path** – merge it by day 4.

## Your folders

`src/app/(auth)/**` · `src/app/(app)/layout.tsx` · `src/app/(app)/admin/users/**` · `src/features/auth/**` · `src/features/admin-users/**` · `src/lib/auth/**` · `src/lib/supabase/**` · `src/components/shell/**` · `src/i18n/**` · `messages/*/{common,auth,shell,admin-users}.json` · `supabase/migrations/*_auth_*.sql` · `supabase/tests/auth_*.sql`

## Tasks

### Week 1 – `auth` migration (critical path)

- [ ] Enum `app_role` (8 roles in [contracts](contracts.md)).
- [ ] `divisions` (7 rows seeded), `funds` (codes seeded), `settings` (`ho_check_threshold = 5000000`, `estimation_fee_rate_don = 0.01`, `retention_days_repair = 180`, `retention_days_new = 365` – values taken from the old workbook formulas).
- [ ] `profiles` (`user_id` → `auth.users`, `full_name`, `role`, `office`, `division_id`, `active`) and `profile_funds`.
- [ ] Helper functions: `mfa_ok()`, `current_app_role()`, `current_division()`, `has_fund()`, `is_role()`, `setting_numeric()` – `security definer`, `stable`, `set search_path = ''`.
- [ ] `audit` schema: `audit.log` table + `audit.log_change()` trigger function; no update/delete grants on `audit.log`.
- [ ] RLS on all your tables; policies start with `public.mfa_ok()`.

### Week 2 – sign-in and shell

- [ ] `/login` (email + password, generic error message – never say whether the email exists).
- [ ] `/mfa/setup` (TOTP enrol with QR code via `supabase.auth.mfa.enroll`) and `/mfa/verify` (6-digit code).
- [ ] Update `requireUser()` if your profile columns differ from the scaffold.
- [ ] `(app)/layout.tsx`: header (NWP emblem from `public/branding/`, department name, user menu, sign out), sidebar from `nav-items.ts` filtered by role.
- [ ] next-intl setup in `src/i18n/` loading `messages/<locale>/<namespace>.json` per feature; locale cookie; `en` default.

### Week 3 – user admin

- [ ] `/admin/users`: list, invite (server action using `createAdminClient()` → `auth.admin.inviteUserByEmail`), set role/office/division/funds, deactivate (also signs the user out everywhere).
- [ ] Only `admin` can open it – checked in the page **and** the server actions **and** RLS.

### Weeks 4–6

- [ ] Seed test users for every role in `supabase/seed.sql` (local/dev only).
- [ ] pgTAP tests (`supabase/tests/auth_*.sql`): no `aal2` → no rows; admin cannot read works; deactivated user blocked.
- [ ] Audit viewer for `head_engineer` and `admin` (filter by table, user, date).
- [ ] Language switcher; Noto Sans Sinhala / Tamil via `next/font`; keyboard and focus pass on the shell.
- [ ] Feature doc `docs/features/auth-and-access.md`.

## Done when

- Nobody reaches any page or row without password **and** MFA.
- Each role sees only its menu items; changing a user's role takes effect on their next request.
- Every insert/update/delete on business tables appears in `audit.log`.
- pgTAP and unit tests pass in CI.
