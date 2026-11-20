<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NWP School Works System – instructions for AI agents

Next.js 16 (App Router, TypeScript, Tailwind, shadcn/ui) on Vercel + Supabase (Postgres, Auth with MFA, Storage). A government system for the Department of Engineering Services, North Western Province, Sri Lanka – security and data correctness come first.

## Read before coding

- `docs/phase-1/00-overview.md` – slices, folder ownership, branches, definition of done
- `docs/phase-1/contracts.md` – shared tables, functions, routes and public APIs
- The member doc for the slice you are working in (`docs/phase-1/member-*.md`)

## Skills (`.claude/skills/`)

| Skill | Use when |
| --- | --- |
| `nwp-domain` | Anything touching estimates, tenders, statuses, roles, divisions, the Rs 5M rule |
| `nwp-feature-slice` | Adding pages, components, routes, translations |
| `nwp-supabase-migration` | Tables, policies, Postgres functions, database tests |
| `nwp-server-action` | Any data change or form submit |
| `nwp-security-checklist` | Reviews, auth, permissions, uploads, exports, env vars |
| `nwp-feature-docs` | Documenting a finished or changed feature |
| `nwp-pr-ready` | Before committing or opening a PR |

Agents without skill support: read the `SKILL.md` files directly.

## Hard rules

1. Work only in the current slice's folders (`.github/CODEOWNERS`); use other slices through their `index.ts`.
2. `requireUser()` first in every server action, route handler and protected page; RLS on every table, policies start with `mfa_ok()`.
3. The Supabase secret key stays in `server-only` files; never `NEXT_PUBLIC_`.
4. Estimate No and Tender No are different fields – never store one in the other.
5. Schema changes only through new migration files in `supabase/migrations/` named `<timestamp>_<area>_<what>.sql`.
6. Never commit real department data, `.env` files or secrets. Seeds and tests use made-up data.
7. PRs go into `dev`, with Conventional Commit titles.

## Commands

`npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run test:e2e` · `npm run db:start` · `npm run db:reset` · `npm run db:types` · `npx supabase test db`
