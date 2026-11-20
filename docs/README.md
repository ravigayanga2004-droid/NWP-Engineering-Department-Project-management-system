# Project documentation

School Works Management System for the Department of Engineering Services, North Western Province.

Full specification (workflow, data model, rules, security): [NWP School Works System – Workflow & Data Model Spec](https://claude.ai/artifact/Tz5mPsNagmcuqhNkZRn97q)

## Phase 1 – Foundation + Register & Estimates

| Doc | For |
| --- | --- |
| [Phase 1 overview](phase-1/00-overview.md) | Everyone – scope, timeline, conventions, who depends on whom |
| [Member 1 – Database & backend](phase-1/member-1-database-backend.md) | Supabase schema, row-level security, business rules |
| [Member 2 – Frontend](phase-1/member-2-frontend.md) | Next.js screens, forms, tables, translations |
| [Member 3 – Reference data & import](phase-1/member-3-data-import.md) | Seed lists, Excel/register import, duplicate checks, exports |
| [Member 4 – DevOps, QA & security](phase-1/member-4-devops-qa-security.md) | Repo, CI, Vercel/Supabase environments, auth config, testing, department contact |

## Setup

- [Start the Next.js + Supabase project](setup/01-nextjs-supabase-setup.md)
