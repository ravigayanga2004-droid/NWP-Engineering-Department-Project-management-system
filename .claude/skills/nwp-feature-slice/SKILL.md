---
name: nwp-feature-slice
description: How to add or change a feature in this Next.js app without stepping on other team members – folder ownership, where pages, server actions, queries, components, translations and tests go, and how to use another slice. Use whenever creating a page, component, route, server action or translation file in this repo.
---

# Building inside your feature slice

Phase 1 has four slices, one per member (`docs/phase-1/00-overview.md`, `.github/CODEOWNERS`). Work only inside the slice the task belongs to.

| Slice | Feature folder | Routes | Migration area |
| --- | --- | --- | --- |
| Auth, access & shell (M1) | `src/features/auth`, `src/features/admin-users`, `src/components/shell`, `src/lib/auth` | `/login`, `/mfa/*`, `/admin/users` | `auth` |
| Reference & register (M2) | `src/features/reference`, `src/features/register`, `src/lib/estimate-no` | `/admin/reference/*`, `/letters/*` | `ref`, `register` |
| Estimate workflow (M3) | `src/features/estimates` | `/works/[id]`, `/inbox/*` | `estimate` |
| Works list & import (M4) | `src/features/works-list`, `scripts/` | `/works` | – |

## Layout of a feature

```
src/features/<feature>/
  index.ts            public API – the ONLY file other slices may import
  actions.ts          'use server' server actions (see nwp-server-action skill)
  queries.ts          server-only read functions (import 'server-only')
  schemas.ts          zod schemas shared by forms and actions
  components/         React components ('use client' only where needed)
  mock.ts             mock data while the real tables are not merged yet
  *.test.ts           Vitest unit tests
src/app/(app)/<route>/page.tsx   thin: calls requireUser + queries, renders feature components
messages/<locale>/<feature>.json translations (en required; si, ta start as copies)
```

## Rules

1. **Pages are thin.** Logic lives in `src/features/<feature>/`; the page only checks access, loads data and renders.
2. **Access first.** Every page under `(app)` and every action calls `requireUser({ roles })` from `@/lib/auth/require-user`. RLS still applies on top.
3. **Cross-slice imports only via `index.ts`.** Never import `@/features/<other>/components/...` or edit another slice's files. Need a new export? Ask the owner (or update `docs/phase-1/contracts.md` in a PR they approve).
4. **Data reads on the server.** Server components or `queries.ts` with `createClient()` from `@/lib/supabase/server`. The browser client is for the session only.
5. **UI kit:** shadcn/ui in `src/components/ui` (`npx shadcn@latest add <component>`); Tailwind for layout. Tables with `@tanstack/react-table`, forms with `react-hook-form` + `zod`.
6. **Text through next-intl:** `useTranslations('<feature>')` / `getTranslations('<feature>')`. No hard-coded user-facing strings.
7. **Navigation:** add one line to `src/components/shell/nav-items.ts` (`{ href, labelKey, icon, roles }`) – Member 1 reviews.
8. **New npm package?** Ask Member 4 first; `package.json` and the lockfile are theirs.
9. **Next.js 16:** read `node_modules/next/dist/docs/` for APIs you are unsure of (see AGENTS.md). Request interception lives in `src/proxy.ts`, not `middleware.ts`.
10. **Accessibility:** every input has a label; buttons have text; works at 1366×768 and on a phone for viewing.

## Before you finish

Run the `nwp-pr-ready` skill.
