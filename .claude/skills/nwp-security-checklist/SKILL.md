---
name: nwp-security-checklist
description: Security review checklist for this government system (Next.js on Vercel + Supabase) – auth and MFA, RLS, secret keys, input validation, audit, file uploads, exports, dependencies and personal data. Use when reviewing a pull request, before merging, or when touching auth, permissions, uploads, exports or environment variables.
---

# Security checklist (government system)

Target: OWASP ASVS 5.0 Level 2, Sri Lanka CERT web application guidelines, PDPA No. 9 of 2022 (amended 2025).

Report findings as: file:line – problem – concrete fix. Treat any ✗ in sections 1–3 as blocking.

## 1. Access

- [ ] Every server action, route handler and `(app)` page calls `requireUser()` (session + MFA `aal2` + active profile + role) **before** doing anything.
- [ ] No access decision relies only on `src/proxy.ts`, hidden buttons, or client state.
- [ ] Every new table: `enable row level security`, policies start with `public.mfa_ok()`, scoped by division (DE staff) or fund (subject clerk).
- [ ] `admin` cannot read or change work data.
- [ ] pgTAP tests prove a **blocked** case for each policy, not just the allowed one.

## 2. Secrets and keys

- [ ] `SUPABASE_SECRET_KEY` only in server files that `import 'server-only'`; never in a `NEXT_PUBLIC_` variable, client component, log or error.
- [ ] No keys, passwords, tokens or real department data committed (check `.env*`, fixtures, screenshots, seeds).

## 3. Input and output

- [ ] All input validated with zod on the server; Postgres constraints back it up.
- [ ] No SQL built from strings; use the Supabase client or parameters in functions.
- [ ] No `dangerouslySetInnerHTML` with user data.
- [ ] Error messages are readable but reveal no SQL, stack traces or whether an email exists.

## 4. Audit and data

- [ ] New business tables have the `audit.log_change()` trigger; nobody can update/delete `audit.log`.
- [ ] Workflow/status changes go through Postgres functions and write `work_status_history`.
- [ ] Exports (Excel/PDF) respect RLS and are logged.
- [ ] Only the personal data needed (staff/contractor names and contacts); no NIC numbers or private details.

## 5. Files

- [ ] Uploads go to private Storage buckets with policies; downloads via short-lived signed URLs.
- [ ] Allowed types (PDF, JPG, PNG) and size limit checked on the server.

## 6. Platform

- [ ] Next.js, React and `@supabase/*` up to date with security releases (Next.js had a middleware auth bypass, CVE-2025-29927; React Server Components a critical RCE, CVE-2025-55182).
- [ ] `npm audit --audit-level=high` clean; new packages are maintained and necessary.
- [ ] Security headers in `next.config.ts` unchanged or strengthened.
- [ ] Preview deployments protected; production env vars only in Vercel/GitHub Environments.
