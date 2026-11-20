# Member 4 – DevOps, QA, security & department contact

**Name:** ______________ · **Phase 1, 8 weeks** · Read first: [Phase 1 overview](00-overview.md)

You set the project up so the others can start on day 2, keep it secure and tested, run the environments, and are the team's single contact with the department.

## Deliverables

| # | Deliverable | Week |
| --- | --- | --- |
| 1 | Scaffold the repo ([setup guide](../setup/01-nextjs-supabase-setup.md)), CI, Supabase dev project, Vercel project | 1 |
| 2 | Supabase Auth settings, security headers, test tooling | 2 |
| 3 | RLS test suite running in CI, staging environment | 3 |
| 4–6 | E2E tests per feature, security review each week | 4–6 |
| 7 | UAT with a subject clerk and one DE office | 7 |
| 8 | Production go-live checklist, handover notes | 8 |

## 1. Repository and CI

- Branch protection on `main`: PR required, 1 approval, CI must pass, no force push.
- GitHub Actions workflow `ci.yml` on every PR: `npm ci` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build` → `npm audit --audit-level=high`.
- Second job: start local Supabase in CI (`npx supabase start`), `npx supabase db reset`, `npx supabase test db` (pgTAP RLS tests).
- Enable Dependabot (npm + GitHub Actions, weekly) and GitHub secret scanning.
- `.gitignore` must cover `.env*` (except `.env.example`), `/supabase/.temp`, real data files (`*.xlsx` outside `scripts/fixtures/`).

## 2. Environments

| Environment | Supabase project | Vercel | Data |
| --- | --- | --- | --- |
| Local | `npx supabase start` (Docker) | `npm run dev` | Made-up seed data |
| Dev / preview | `nwp-works-dev` | Preview deployments (protected) | Made-up |
| Staging | `nwp-works-staging` | `staging` branch | Copy of real data for UAT |
| Production | `nwp-works-prod` (paid plan) | `main` | Real |

- Supabase region: **Mumbai (ap-south-1)**. Vercel function region: **bom1** (`vercel.json` → `"regions": ["bom1"]`).
- Vercel **Deployment Protection** on for previews.
- Secret key (`SUPABASE_SECRET_KEY`) only in Vercel's server env vars, never `NEXT_PUBLIC_`.
- Production on paid plans (Supabase Free pauses idle projects and has no backups; Vercel Hobby is for non-commercial use). Check current pricing and get budget approval.

## 3. Supabase Auth settings

- Disable public sign-ups; users are invited by an admin.
- Email/password with minimum length 12; enable leaked-password protection if the plan supports it.
- MFA: TOTP enabled; the app forces enrolment, and RLS requires `aal2` (Member 1).
- Session: short JWT expiry (e.g. 1 hour) with refresh; sign out on all devices when a user is deactivated.
- Custom SMTP (department email) for invites and password resets.
- Auth redirect URLs limited to the production, staging and localhost URLs.

## 4. Security headers (`next.config.ts`)

Content-Security-Policy (self + Supabase URL), `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, mic, geolocation off), HSTS on the production domain.

## 5. Tests

| Kind | Tool | Covers |
| --- | --- | --- |
| Unit | Vitest | Estimate No helpers, zod schemas, formatting |
| Database | pgTAP (`supabase test db`) | Every RLS policy: allowed **and** blocked roles; workflow functions refuse wrong status/role |
| End-to-end | Playwright | Sign-in + MFA; register letter + works; forward to DE; DE estimate < 5M → send; DE estimate ≥ 5M → HO check → send; DE of another division sees nothing |

Seed test users for each role in local/dev (never in production).

## 6. Security checklist (tick on every PR)

- [ ] Server action / route handler checks user, MFA level and role.
- [ ] New table has RLS enabled with tests.
- [ ] No secret in client code or `NEXT_PUBLIC_` variables.
- [ ] Input validated with zod on the server.
- [ ] No raw SQL built from user input.
- [ ] Changes are audited.
- [ ] Error messages don't leak internal details.
- [ ] Dependencies added are maintained and needed.

Also keep Next.js, React and `@supabase/*` patched within a week of security releases (Next.js had a middleware auth bypass in March 2025 and React Server Components a critical RCE in December 2025).

## 7. Department contact

You own getting these answers and files, and logging them in `docs/decisions.md`:

- [ ] Digital copy of the 2026 Estimate Register (by week 3).
- [ ] User list: names, emails, office, role, division; which funds each subject clerk handles.
- [ ] Written approval to store data on Vercel/Supabase outside Sri Lanka (PDPA cross-border rules).
- [ ] Official logo files and permission to use the emblem.
- [ ] Answers to the open questions in the spec (Rs 5M rule source, Return vs Sent date, design for repairs, status codes).
- [ ] UAT volunteers: one subject clerk, one DE office, the head engineer for a demo.

## 8. Go-live checklist (week 8)

- [ ] Production env vars set; secret key only server-side.
- [ ] Backups confirmed (Supabase) + weekly encrypted export kept by the department; **restore tested once**.
- [ ] Admin accounts with MFA; no test users in production.
- [ ] Custom domain with HTTPS (gov.lk subdomain if the department provides DNS).
- [ ] Import done and cleanup report closed.
- [ ] Handover notes: how to add a user, reset MFA, change the Rs 5M setting, restore a backup.
