---
name: feature-review
description: After finishing a task or feature, check that it is correct – it matches the plan and member doc, respects the slice, contracts, database-first and security rules of this repo, matches the UI registry, and is ready for real users. Reports issues by severity without fixing them. Use after every feature and before opening a PR.
---

# /feature-review – is it correct, not just "does it work"

## 1. Establish the benchmark

Read the `/architect` plan for the task (if any), the task in the member doc (`docs/phase-1/member-*.md`), `docs/phase-1/contracts.md`, the `nwp-domain` skill and `docs/ui-registry.md` if UI changed. If there is no plan and the task is unclear, ask what it should do before reviewing.

Then read the diff: `git diff origin/dev...HEAD` (or the files the user names).

## 2. Review in three layers

**Layer 1 – Plan alignment**
- Everything planned and listed in the member doc's task is present.
- Decisions from the plan are reflected; nothing contradicts `contracts.md` or `docs/decisions.md`.
- No scope creep (work belonging to another task or phase).

**Layer 2 – System integrity (NWP rules)**
- Changed files stay in the slice's folders (`.github/CODEOWNERS`); other slices used only through their `index.ts`.
- Database first: rules that matter are constraints, RLS or Postgres functions – not only in forms.
- Every new table: RLS on, policies start with `mfa_ok()`, scoped by division/fund, audit trigger.
- Every server action / route handler starts with `requireUser()`; zod validation on the server; standard result shape (`nwp-server-action` skill).
- Status changes only through workflow functions; Estimate No and Tender No never mixed; totals calculated, never stored typed.
- Migrations named `<timestamp>_<area>_<what>.sql`, no edits to merged migrations; `src/types/database.ts` regenerated.
- UI uses shadcn components and registry classes (no hard-coded colours/sizes that differ from `docs/ui-registry.md`); all text through next-intl.

**Layer 3 – Production readiness**
- Error handling: no silent failures; readable messages; no SQL or stack traces to users.
- Empty, loading, error and permission-denied states exist.
- Edge cases from the domain: amounts ≥ / < Rs 5M, duplicate Estimate No, cancelled works, DE of another division, missing optional fields.
- Tests: pgTAP for allowed **and** blocked roles, unit tests for helpers, E2E if a flow changed.
- Security: run through the `nwp-security-checklist` skill for anything touching auth, data access, uploads, exports or env vars.

## 3. Report

```markdown
## Review – [feature]

### Layer 1 – Plan alignment: PASS | ISSUES FOUND
- [Critical|Important|Minor] file:line – issue

### Layer 2 – System integrity: PASS | ISSUES FOUND
- …

### Layer 3 – Production readiness: PASS | ISSUES FOUND
- …

### Summary
[X] issues across [Y] layers. "No issues found – ready for PR." | "Resolve the above before the PR."
```

Severity: **Critical** – missing planned behaviour, security/RLS gap, silent failure, boundary violation that breaks other slices. **Important** – registry/design drift, missing tests or states real users will hit. **Minor** – naming, style, small optimisations.

## 4. Stop

Do not fix anything and do not propose fixes unless asked. Wait for the user to ask for fixes, mark an item intentional, or confirm it is ready. Record accepted findings in the PR description.

## Never

- Fix code during a review.
- Soften or bury a Critical issue.
- Review only style while skipping correctness and security.
