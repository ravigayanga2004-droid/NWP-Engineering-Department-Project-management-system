## What and why

<!-- One or two sentences. Link the task in docs/phase-1/member-*.md. -->

**Slice:** auth · reference · register · estimate · works-list · import · ci · docs

## How to test

1.
2.

## Checklist

- [ ] Only files in my slice's folders changed (or the owner of the other folder approved)
- [ ] Server actions / route handlers call `requireUser()` with the right roles
- [ ] New tables have RLS enabled, policies start with `mfa_ok()`, audit trigger attached
- [ ] Database tests added for allowed **and** blocked roles
- [ ] Input validated with zod on the server
- [ ] No secret key in client code or in a `NEXT_PUBLIC_` variable
- [ ] Translations added in `messages/en/<feature>.json` (si/ta copies)
- [ ] `npm run db:types` re-run if migrations changed
- [ ] Feature doc in `docs/features/` updated
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` pass locally
