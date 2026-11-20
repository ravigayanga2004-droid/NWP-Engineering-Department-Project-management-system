# Project documentation

School Works Management System for the Department of Engineering Services, North Western Province.

Full specification (workflow, data model, rules, security): [NWP School Works System – Workflow & Data Model Spec](https://claude.ai/artifact/Tz5mPsNagmcuqhNkZRn97q)

## Phase 1 – Foundation + Register & Estimates

| Doc | For |
| --- | --- |
| [Phase 1 overview](phase-1/00-overview.md) | Everyone – slices, folder ownership, branches, timeline, definition of done |
| [Contracts](phase-1/contracts.md) | Everyone – shared tables, functions, routes and APIs between slices |
| [Member 1 – Auth, access & app shell](phase-1/member-1-auth-access-shell.md) | Sign-in + MFA, roles, RLS helpers, audit log, layout, user admin |
| [Member 2 – Reference data & register](phase-1/member-2-reference-register.md) | Reference lists, request letters, works, Estimate No |
| [Member 3 – Estimate workflow](phase-1/member-3-estimate-workflow.md) | Forward to DE, estimates, Rs 5M HO check, work page, inboxes |
| [Member 4 – Works list, import & DevOps](phase-1/member-4-works-list-import-devops.md) | Works list, Excel export, data import, CI, environments, E2E |

## Other docs

- [Start the Next.js + Supabase project](setup/01-nextjs-supabase-setup.md)
- [Feature docs](features/README.md) – one per feature, written as each slice is finished
- [Decisions log](decisions.md) – answers from the department and team decisions
- [UI registry](ui-registry.md) – classes every screen uses (updated by `/imprint`)
- Shared state: [current state](../.agent/current-state.md) · [open questions](../.agent/open-questions.md) · [ADRs](../.agent/decisions/README.md) · [handoffs](../.agent/handoffs/README.md)
- [Workbook formula analysis](analysis/workbook-formulas.md) – business rules and bugs found in the old Excel formulas
- UI designs (Figma): [NWP School Works – Phase 1 UI](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY)
- Agent instructions: [AGENTS.md](../AGENTS.md) and skills in [.claude/skills](../.claude/skills)
