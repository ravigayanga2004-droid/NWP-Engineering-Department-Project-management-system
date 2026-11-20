---
name: nwp-server-action
description: Pattern for Next.js server actions and route handlers in this project – requireUser with roles and MFA, zod validation shared with the form, calling Supabase RPC under RLS, the standard result shape, revalidation and form wiring with react-hook-form. Use whenever writing code that changes data or handles a form submit.
---

# Server action pattern

Every write goes: **form → server action → `requireUser` → zod → Supabase RPC/insert (RLS applies) → revalidate → result**.

## Schema (`src/features/<feature>/schemas.ts`)

```ts
import { z } from 'zod';

export const forwardToDeSchema = z.object({
  workId: z.uuid(),
  forwardedOn: z.iso.date(),
  expectedOn: z.iso.date(),
});
export type ForwardToDeInput = z.infer<typeof forwardToDeSchema>;
```

## Action (`src/features/<feature>/actions.ts`)

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/require-user';
import { forwardToDeSchema } from './schemas';

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function forwardToDe(input: unknown): Promise<ActionResult> {
  const { supabase } = await requireUser({ roles: ['subject_clerk'] });

  const parsed = forwardToDeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Please correct the highlighted fields.', fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { workId, forwardedOn, expectedOn } = parsed.data;
  const { error } = await supabase.rpc('forward_to_de', {
    p_work_id: workId, p_forwarded_on: forwardedOn, p_expected_on: expectedOn,
  });
  if (error) return { ok: false, message: error.message };   // Postgres raises readable messages

  revalidatePath(`/works/${workId}`);
  return { ok: true };
}
```

## Form (client component)

```tsx
'use client';
const form = useForm<ForwardToDeInput>({ resolver: zodResolver(forwardToDeSchema) });
const [pending, startTransition] = useTransition();
const onSubmit = form.handleSubmit((values) =>
  startTransition(async () => {
    const res = await forwardToDe(values);
    if (!res.ok) { /* show res.message, map res.fieldErrors to form.setError */ return; }
    /* success toast */
  }),
);
```

## Rules

- `requireUser()` is the **first** line of every action and route handler – never rely on `src/proxy.ts` or on hiding a button.
- Same zod schema on client and server; the server parse is the one that counts.
- Use the user's client (`requireUser().supabase`) so RLS applies. `createAdminClient()` (secret key) only for admin tasks such as inviting users, and only in files that `import 'server-only'`.
- Never trust ids or amounts from the client for permission decisions – Postgres functions re-check role, scope and status.
- Return messages a clerk can understand; never return stack traces or SQL.
- Money and dates cross the boundary as numbers and ISO strings.

## Tests

Unit-test the schema (`schemas.test.ts`). Role/scope behaviour is tested in pgTAP (database) and Playwright (E2E) – see `nwp-supabase-migration`.
