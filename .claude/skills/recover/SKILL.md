---
name: recover
description: When something goes wrong during a build – a bug keeps coming back, fixes make it worse, or the result is fundamentally wrong – diagnose which kind of failure it is before responding with a targeted fix, a clean restart, or a rethink. Use instead of trying yet another fix.
---

# /recover – diagnose before you fix

## 1. Ask three things

1. What did you expect?
2. What happened instead (exact error, screen, test output)?
3. How many fix attempts so far? (This number matters.)

## 2. Classify – and say which mode before doing anything

> "This looks like Failure Mode [1/2/3] – [name]." + one sentence why.

| Mode | Signs | Go to |
| --- | --- | --- |
| **1 – Something specific is broken** | Isolated, first or second attempt, clear error | 3A |
| **2 – The session has gone wrong** | Many attempts, patches on patches, each fix breaks something else | 3B |
| **3 – The foundation is wrong** | It runs but is wrong; a rule, API or architecture was misunderstood (e.g. budget used instead of DE estimate for the Rs 5M rule, status set by an update instead of a workflow function, logic in the UI instead of RLS) | 3C |

## 3A – Targeted fix

1. Get the exact error, the file/function, expected vs actual.
2. Read only the relevant code – the slice's files, the migration, the policy or function involved. Not the whole repo.
3. Write `Root cause: …` (different from the symptom) and `Fix: …` (precise change).
4. Wait for confirmation before changing code.
5. If the fix fails, do **not** try another fix straight away – start again at step 1. If two diagnoses were wrong, reconsider Mode 2 or 3.

Common NWP root causes to check: RLS policy missing or not `aal2` (empty results), `requireUser()` redirect, stale generated types after a teammate's migration (`npm run db:reset && npm run db:types`), wrong role/division scope in seed users, Next.js 16 API differences (`node_modules/next/dist/docs/`).

## 3B – Hard reset

Say the session is polluted and a clean start is the right move. Write:

```markdown
## Reset Note – [task]
### What we were building
### What went wrong
### What to avoid next time
### Starting point for the fresh session
```

Tell the user: save this note (e.g. into their `.agent/memory/member-<N>.md` via `/remember save`), end this session, start a new one, run `/remember restore`, and continue from the note. **Do not continue in this session.**

## 3C – Rethink

```markdown
Assumed: …
Reality: … (cite the doc: contracts.md, nwp-domain, decisions.md)
Correct approach: …
Key difference: …
Discard: …
Keep: …
```

Ask the user to confirm the diagnosis. If the correction changes a shared contract or another slice, record it in `.agent/open-questions.md` or as an ADR before rebuilding. Do not rebuild until confirmed.

## Never

- Respond before classifying.
- Suggest another fix right after one failed – re-diagnose first.
- Read the whole codebase.
- Change code before the user confirms the root cause or rethink.
- Keep pushing in a polluted session.
