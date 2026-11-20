# Member 4 – Works list, import & DevOps

**Name:** ______________ · Read first: [overview](00-overview.md), [contracts](contracts.md) · Skills: `nwp-domain`, `nwp-server-action`, `nwp-feature-slice`, `nwp-security-checklist`, `nwp-pr-ready`

You build the page everyone uses most – the **works list** – plus the Excel export and the import of today's register and workbook. You also run the project: branches, environments, CI, E2E tests, and contact with the department.

## Your folders

`src/app/(app)/works/page.tsx` · `src/features/works-list/**` · `messages/*/works-list.json` · `scripts/**` · `e2e/**` · `.github/**` · `package.json`, `package-lock.json`, `next.config.ts`, `vercel.json`, `vitest.config.ts`, `playwright.config.ts`, `supabase/config.toml`

## Tasks

### Week 1 – project setup

- [ ] Create `dev` and `staging` branches from `main`; branch protection (PR + 1 approval + CI on `dev`; 2 approvals on `main`). Set the default branch for PRs to `dev`.
- [ ] Replace placeholder GitHub handles in `.github/CODEOWNERS`.
- [ ] Supabase projects `nwp-works-dev`, `-staging`, `-prod` in **Mumbai**; GitHub Environments `dev`, `staging`, `production` (required reviewer on production) with secrets `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`; repo secret `SUPABASE_ACCESS_TOKEN` (see `db-deploy.yml`).
- [ ] Vercel project linked to the repo, env vars per environment, region `bom1`, preview protection on.
- [ ] Works list UI on mock data (`src/features/works-list/mock.ts`).

### Week 2 – import parser (no database yet)

- [ ] `scripts/import/parse-workbook.ts` and `parse-register.ts` (ExcelJS): read the July 2026 workbook detail sheets (header row contains "Tender Code"; skip Sum/Cover sheets) and the 2026 register; output normalised JSON + list of problems. Real files stay outside Git (`.gitignore` blocks `*.xlsx`).
- [ ] Give Member 2 the de-duplicated school list.

### Weeks 3–4 – works list on real data

- [ ] `/works`: TanStack Table on `works_overview` (Member 3's view): Estimate No, school, work, division, fund, budget, estimate, status (`<StatusBadge>`), days in stage. Filters: year, fund, program, division, status, New/Repair; search; state kept in the URL; server-side pagination.
- [ ] `exportWorks(filters)` server action → `.xlsx` (ExcelJS) of what the user can see; log the export.
- [ ] Playwright E2E: sign-in + MFA with seeded test users.

### Weeks 5–6 – import + E2E

- [ ] `scripts/import/run.ts --dry-run`: writes nothing, prints a cleanup report (`cleanup-report-<date>.xlsx`): duplicate works across sheets (9), one Estimate No on two works (2026/362), division mismatches (8), spelling variants, text dates, blank statuses.
- [ ] Real run (upsert by Estimate No) using the secret key from a local `.env` – never from the app.
- [ ] E2E for the full flow: register → forward → DE estimate < 5M → send; ≥ 5M → HO check → send; DE of another division sees nothing.

### Weeks 7–8 – UAT and go-live

- [ ] UAT with one subject clerk and one DE office on staging; log issues.
- [ ] Staging import, then production import after the cleanup report is resolved.
- [ ] Go-live checklist: backups and one restore test, no test users in production, admin MFA, custom domain + HTTPS.
- [ ] Feature doc `docs/features/works-list-and-import.md`.

## Department contact

Log answers in `docs/decisions.md`: user list and roles; subject clerks' funds; digital copy of the 2026 register (**by week 2**); district secretariat list; written approval for data stored outside Sri Lanka; official logo files.

## Done when

- The works list loads 1,500+ works quickly, filtered correctly per role.
- Import dry run produces a cleanup report; staging holds the imported register.
- CI runs lint, typecheck, unit, database and E2E tests on every PR to `dev`.
