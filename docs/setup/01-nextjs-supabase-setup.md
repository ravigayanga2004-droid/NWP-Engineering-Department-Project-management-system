# Start the Next.js + Supabase project

**Who runs this:** Member 4, once, on a branch (`chore/scaffold-nextjs`). Everyone else then pulls and follows [Everyday setup for each member](#everyday-setup-for-each-member).

Tested on 20 Nov 2026 with Node.js 24.15 and npm 11.12; `create-next-app@latest` installed **Next.js 16.4.6, React 19.3, Tailwind CSS 4.3**.

## Prerequisites (every member)

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 24 LTS or newer | `node -v` |
| Git | any recent | `git --version` |
| Docker Desktop | running | needed for the local Supabase database |
| VS Code (suggested) | – | extensions: ESLint, Tailwind CSS IntelliSense, Prettier |

Accounts: GitHub (repo access), Supabase and Vercel (Member 4 invites the others to the team/org).

## 1. Scaffold Next.js into the repo (Member 4, once)

`create-next-app` refuses to run in a folder that contains `README.md` or `branding/`, so move them aside first. (`docs/` is allowed.)

```bash
cd NWP-Engineering-Department-Project-management-system
git switch main && git pull
git switch -c chore/scaffold-nextjs

mkdir ../_keep
mv README.md branding ../_keep/

npx create-next-app@latest . --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes

mkdir -p public
mv ../_keep/branding public/branding   # logos become /branding/... URLs
mv ../_keep/README.md README.md        # keep our README instead of the generated one
rmdir ../_keep

npm run dev    # open http://localhost:3000 – the Next.js starter page should load
```

(PowerShell users: use `Move-Item` instead of `mv`, or run these commands in Git Bash.)

## 2. Add the libraries

```bash
# Supabase, forms, tables, translations, Excel
npm install @supabase/supabase-js @supabase/ssr server-only zod react-hook-form @hookform/resolvers @tanstack/react-table next-intl exceljs

# UI components (Tailwind-based) – choose the defaults
npx shadcn@latest init

# Dev tools: Supabase CLI, unit tests, end-to-end tests
npm install -D supabase vitest @playwright/test
npx playwright install chromium
```

Add these scripts to `package.json`:

```json
"typecheck": "tsc --noEmit",
"test": "vitest run",
"test:e2e": "playwright test",
"db:types": "supabase gen types typescript --local > src/types/database.ts"
```

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
npx supabase start          # Docker must be running
npx supabase db reset       # build the local DB from migrations + seed
cp .env.example .env.local  # then paste the keys from `npx supabase status`
npm run dev
```

Daily: `git pull`, `npx supabase db reset` when migrations changed, `npm run db:types` after schema changes.
