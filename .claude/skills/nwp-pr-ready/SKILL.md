---
name: nwp-pr-ready
description: Get a branch ready for a pull request in this repo – run lint, typecheck, unit/database/E2E tests and build, check folder ownership, regenerate database types, write a Conventional Commit message and fill the PR template. Use when finishing a task, before committing or opening a PR, or when asked "is this ready to merge?".
---

# Ready for a pull request

## 1. Stay in your slice

```bash
git fetch origin && git diff --name-only origin/dev...HEAD
```

Compare the list with `.github/CODEOWNERS` and the task's slice. Files outside the slice → move the change to the right owner, or note in the PR that the owner must approve.

## 2. Bring the branch up to date

```bash
git rebase origin/dev
```

If `src/types/database.ts` conflicts: take either side, then `npm run db:reset && npm run db:types` and commit the regenerated file. Never hand-merge generated types.

## 3. Run the checks (same as CI)

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run db:reset && npx supabase test db     # if migrations or policies changed
npm run test:e2e                             # if pages or flows changed
```

Fix failures; do not skip or weaken tests to make them pass.

## 4. Self-review

- Run the `nwp-security-checklist` skill on the diff.
- New user-facing text is in `messages/en/<feature>.json` (with si/ta copies).
- Feature doc in `docs/features/` updated (`nwp-feature-docs` skill) when behaviour changed.
- No real department data, secrets or `.env` files in the diff.

## 5. Commit and PR

- Branch: `feat/<slice>-<short-name>` or `fix/...`, PR into **`dev`** (not `main`).
- Commit / PR title in Conventional Commits with the slice as scope:
  `feat(register): add Estimate No suggestion to letter form` · `fix(estimate): block send before HO approval` · `test(auth): RLS tests for deactivated users`
- Fill `.github/pull_request_template.md`; list how to test; tick the checklist honestly.
- Keep PRs small (one task from the member doc); request review from the slice owner(s) shown by CODEOWNERS.
