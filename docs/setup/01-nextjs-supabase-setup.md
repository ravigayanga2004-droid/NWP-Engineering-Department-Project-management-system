# Start the Next.js + Supabase project

> **Status (20 Nov 2026): steps 1–5 are done** on branch `chore/scaffold-nextjs`. New members only need [Everyday setup for each member](#everyday-setup-for-each-member). Steps 6–7 (hosted Supabase and Vercel) are still to do by Member 4. Sections 1–5 stay here as a record of how the project was created.

Created with Node.js 24.15 and npm 11.12: **Next.js 16.4.6, React 19.3, Tailwind CSS 4.3**, shadcn/ui, Supabase CLI 3.2, Vitest 5, Playwright 1.65.

### What is already in the repo

| Item | File(s) |
| --- | --- |
| Next.js app (App Router, TypeScript, Tailwind, `src/`) | `src/app/`, `next.config.ts` (security headers added) |
| shadcn/ui | `components.json`, `src/components/ui/`, `src/lib/utils.ts` |
| Supabase clients | `src/lib/supabase/server.ts`, `client.ts`, `admin.ts` (secret key, server only) |
| Session refresh | `src/proxy.ts` |
| Auth guard for server actions | `src/lib/auth/require-user.ts` (session → MFA aal2 → active profile → role), `src/lib/auth/roles.ts` |
| Local Supabase config | `supabase/config.toml` – sign-ups off, passwords ≥ 12 with upper/lower/digits, TOTP MFA on |
| Env template | `.env.example` |
| Vercel region | `vercel.json` → Mumbai (`bom1`) |
| Tests | `vitest.config.ts` + `src/lib/auth/roles.test.ts`; `playwright.config.ts` + `e2e/home.spec.ts` |
| CI/CD | `.github/workflows/pr.yml` → reusable `checks.yml` (lint, typecheck, unit, build, audit, database tests, E2E); `db-deploy.yml` (migrations to dev/staging/production Supabase); `CODEOWNERS`; PR template; Dependabot → `dev` |
| Agent skills | `.claude/skills/nwp-*`, `AGENTS.md`, `CLAUDE.md` |
| Branding | `public/branding/placeholders/` (low-res placeholders) |

## Prerequisites (every member)

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 24 LTS or newer | `node -v` |
| Git | any recent | `git --version` |
| Docker Desktop | running | needed for the local Supabase database |
| VS Code (suggested) | – | extensions: ESLint, Tailwind CSS IntelliSense, Prettier |

Accounts: GitHub (repo access), Supabase and Vercel (Member 4 invites the others to the team/org).

## 1. Scaffold Next.js into the repo (Member 4, once)

Two problems had to be worked around: `create-next-app` refuses a folder that contains `README.md` or `branding/`, and npm rejects package names with capital letters (the repo folder has them). So the app was created in a lowercase subfolder and moved up:

```bash
git switch -c chore/scaffold-nextjs
mkdir ../_keep && mv README.md branding ../_keep/

npx create-next-app@latest nwp-works --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes

rm -rf nwp-works/.next nwp-works/README.md
mv nwp-works/* nwp-works/.gitignore . && rmdir nwp-works      # move the app to the repo root
mkdir -p public && mv ../_keep/branding public/branding        # logos become /branding/... URLs
mv ../_keep/README.md README.md && rmdir ../_keep             # keep our README
# package name set to "nwp-school-works"
```

## 2. Add the libraries

```bash
# Supabase, forms, tables, translations, Excel
npm install @supabase/supabase-js @supabase/ssr server-only zod react-hook-form @hookform/resolvers @tanstack/react-table next-intl exceljs

# UI components (Tailwind-based) – choose the defaults
npx shadcn@latest init

# Dev tools: Supabase CLI, unit tests, end-to-end tests
# (vitest needs @types/node 22+, so it was raised to ^24 to match Node 24)
npm install -D @types/node@^24 supabase vitest @playwright/test
npx playwright install chromium   # each member runs this once before E2E tests
```

Scripts in `package.json`:

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen && tsc --noEmit` (typegen creates route types such as `LayoutProps`) |
| `npm test` / `npm run test:watch` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:start` / `npm run db:reset` | Start local Supabase / rebuild it from migrations + seed |
| `npm run db:types` | Regenerate `src/types/database.ts` from the local database |

Known audit note: `exceljs` depends on an old `uuid` with a **moderate** advisory (only affects a code path exceljs does not use). CI fails only on high/critical; recheck when exceljs updates.

## 3. Local Supabase

```bash
npx supabase init     # creates supabase/ (config, migrations, seed)
npx supabase start    # starts Postgres, Auth, Storage in Docker (first run downloads images)
npx supabase status   # prints the local URL and keys
```

Create `.env.example` (committed) and `.env.local` (never committed) from the `status` output:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key (older CLI: "anon key")>
SUPABASE_SECRET_KEY=<secret key (older CLI: "service_role key")>   # server only – never NEXT_PUBLIC_
```

Local Studio (database UI): http://127.0.0.1:54323

## 4. Supabase clients

`src/lib/supabase/server.ts` – for server components, server actions, route handlers:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a server component – the proxy refreshes the session instead
          }
        },
      },
    },
  );
}
```

`src/lib/supabase/client.ts` – for client components (session only, no data writes):

```ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
```

`src/lib/supabase/admin.ts` – secret key, **server only** (user invites, import scripts):

```ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
```

`src/proxy.ts` – keeps the sign-in session fresh (Next.js 16 calls this file `proxy.ts`; older versions used `middleware.ts`). **It is not an access check** – every server action still checks the user itself.

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|branding/).*)'],
};
```

## 5. Folder structure

```
src/
  app/
    (auth)/login, mfa/setup, mfa/verify
    (app)/works, works/[id], letters/new, inbox/de, inbox/ho-check, admin/...
  components/            shared UI (shadcn/ui in components/ui)
  lib/
    supabase/            server.ts, client.ts, admin.ts
    auth/                requireUser() – session + MFA (aal2) + role check
    validation/          zod schemas shared by forms and server actions
    estimate-no/         parse / validate / suggest (Member 3)
  types/database.ts      generated – npm run db:types
messages/                en.json, si.json, ta.json
supabase/
  migrations/            Member 1 – the only way the schema changes
  seed.sql               Member 3 – reference data + made-up test data
  tests/                 pgTAP RLS tests
scripts/import/          Member 3 – one-off import scripts (run locally)
public/branding/         logos (placeholders for now)
docs/
```

## 6. Hosted Supabase and Vercel (Member 4)

1. **Supabase:** create projects `nwp-works-dev` (and later staging/prod) at supabase.com, region **South Asia (Mumbai)**. Link and push migrations:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
2. **Vercel:** "Add New Project" → import the GitHub repo → framework Next.js (auto). Add the three env vars (secret key only for the server environment). Settings → Functions → region **Mumbai (bom1)**, or add `vercel.json`:
   ```json
   { "regions": ["bom1"] }
   ```
   Turn on Deployment Protection for preview deployments.

## 7. Commit the scaffold

```bash
npm run lint && npm run typecheck && npm run build
git add .
git commit -m "chore: scaffold Next.js app with Supabase setup"
git push -u origin chore/scaffold-nextjs
```

Open a PR, get one review, merge. The team starts work from the merged `main`.

## Everyday setup for each member

```bash
git clone https://github.com/ravigayanga2004-droid/NWP-Engineering-Department-Project-management-system.git
cd NWP-Engineering-Department-Project-management-system
npm install
npx playwright install chromium   # once, for E2E tests
npx supabase start          # Docker Desktop must be running
npx supabase db reset       # build the local DB from migrations + seed
cp .env.example .env.local  # then paste the keys from `npx supabase status`
npm run dev
```

Daily: `git pull`, `npx supabase db reset` when migrations changed, `npm run db:types` after schema changes.
