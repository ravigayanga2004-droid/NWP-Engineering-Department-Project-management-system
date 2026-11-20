# Member 2 – Frontend lead

**Name:** ______________ · **Phase 1, 8 weeks** · Read first: [Phase 1 overview](00-overview.md)

You build every screen in Next.js (App Router, TypeScript, Tailwind + shadcn/ui). Screens call Member 1's Postgres functions through **server actions**; you never put business rules only in the browser.

## Deliverables

| # | Deliverable | Week |
| --- | --- | --- |
| 1 | App shell: layout, sidebar by role, header with user + language switcher, design system | 1 |
| 2 | Sign-in, MFA enrolment (QR code) and MFA verify screens | 2 |
| 3 | Works list | 3 |
| 4 | Register request letter + its works | 4 |
| 5 | Work page: details, stages, design tasks, history | 5 |
| 6 | DE inbox, HO check queue, workflow actions | 6 |
| 7 | Polish: loading/empty/error states, accessibility, translation keys | 7 |
| 8 | Bug fixes from UAT | 8 |

## Screens

| Route | Who | Content |
| --- | --- | --- |
| `/login` | everyone | Email + password |
| `/mfa/setup`, `/mfa/verify` | everyone | TOTP enrolment with QR code; 6-digit verify. Users without MFA cannot reach any other page |
| `/works` | all except admin (rows filtered by RLS) | Table: Estimate No, school, work, division, fund, budget, estimate, status, days in stage. Filters: year, fund, program, division, status, New/Repair. Search. Excel export button (Member 3's function) |
| `/letters/new` | subject_clerk | Letter ref no, date, institute, received date, upload scanned letter; then add one or more works: fund, program, division, district secretariat (optional), school, description, New/Repair, budget, **Estimate No** (pre-filled with the suggested next number, editable, validated live) |
| `/works/[id]` | by RLS | Header (Estimate No, school, status badge) · Registration details · Design tasks · Estimate stage timeline (forwarded → prepared → submitted to HO → checked → sent) · Status history · Audit tab (head engineer) |
| `/inbox/de` | de_to, de_engineer | Works forwarded to my division waiting for an estimate, sorted by expected date; overdue highlighted |
| `/inbox/ho-check` | ho_to | Estimates ≥ Rs 5M waiting for a check; approve / return with note |
| `/admin/users` | admin | Invite user, set role, office, division, funds, deactivate |
| `/admin/reference` | admin | Divisions, funds, programs, schools, district secretariats |

Show actions only when allowed, **and** rely on the server to refuse them anyway.

## Forms

- `react-hook-form` + `zod`. Use the **same zod schemas** on the server action (shared in `src/lib/validation/`).
- Estimate No field: call `suggestEstimateNo()` (Member 3) when year/institute/fund/division are chosen; show inline errors from `validateEstimateNo()`.
- Duplicate warning: when school + description are filled, call `findSimilarWorks()` and show "Similar open work exists: …" with a link. The clerk can continue after confirming.
- Money: show `Rs 1,234,567.00`; store plain numbers. Dates: `DD/MM/YYYY` on screen (as the department writes them), ISO in the database.
- Every submit button: disabled while saving, success toast, error message from the server shown as-is.

## Server actions pattern

```ts
'use server';
import { requireUser } from '@/lib/auth/require-user';

export async function forwardToDe(input: unknown) {
  const { supabase } = await requireUser({ roles: ['subject_clerk'] }); // checks session + aal2 + role
  const data = forwardToDeSchema.parse(input);                            // zod, same schema as the form
  const { error } = await supabase.rpc('forward_to_de', data);           // Member 1's function, RLS applies
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/works/${data.work_id}`);
  return { ok: true };
}
```

Rules:
- **Check the user inside every server action and route handler.** Do not rely on `proxy.ts` (formerly `middleware.ts`) alone.
- Use the browser Supabase client only for reading the session; data reads and writes happen on the server.
- Never import `src/lib/supabase/admin.ts` (secret key) in a client component.

## Translations

- `next-intl` with `messages/en.json`, `messages/si.json`, `messages/ta.json`.
- Phase 1: every visible string goes through `t('...')`; English filled, Sinhala/Tamil keys present (copied from English) for later translation.
- Fonts: Noto Sans Sinhala and Noto Sans Tamil loaded with `next/font`.

## Branding

Placeholder images are in `public/branding/` (low resolution – replace when the department sends official files). Show the NWP emblem and "Department of Engineering Services – North Western Province" in the header and on the sign-in page.

## Done when

- [ ] A subject clerk can register a letter with works, forward one to a DE office, and see it move to EP.
- [ ] A DE TO sees only their division's inbox and can submit an estimate.
- [ ] An HO TO can approve or return an estimate ≥ Rs 5M.
- [ ] Pages work at 1366×768 (common office screens) and on a phone for viewing.
- [ ] Keyboard-usable forms, visible focus, labels on every field.
- [ ] E2E tests (Member 4) pass for these flows.
