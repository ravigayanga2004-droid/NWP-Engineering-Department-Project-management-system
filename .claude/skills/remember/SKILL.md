---
name: remember
description: Save what matters at the end of a session so the next session continues exactly where this one stopped, or restore that context at the start of a session. Use "/remember save" when ending work and "/remember restore" when continuing work in this repo.
---

# /remember – session memory

Usage: `/remember save` · `/remember restore` · `/remember` (ask which).

Each team member has their **own** memory file so four people never conflict:
`.agent/memory/member-<N>.md` (N = 1–4 from `docs/phase-1/00-overview.md`). If you don't know which member you are working for, ask once.

Team-wide state (what is merged, what is blocked) goes in `.agent/current-state.md` instead – see "Save" step 6.

## Save

1. Review this session and keep only what a fresh session needs – not a transcript.
2. Capture:
   - **What was built** – exact file paths, migrations, routes.
   - **Decisions made** – especially hard-to-reverse ones; add an ADR in `.agent/decisions/` if it affects other members.
   - **Problems solved** – so they are not solved again.
   - **Current state** – works / partly works / broken; tests passing or not; branch and PR.
   - **Next session starts with** – one concrete first action.
   - **Open questions** – also add team-relevant ones to `.agent/open-questions.md`.
3. Leave out: anything readable from the code or docs, build logs, and **every secret** (keys, passwords, tokens, connection strings, cookies, Supabase keys) – write `[REDACTED]`. When unsure, treat it as secret. Also no real department data (names, amounts) – use the Estimate No only if needed.
4. If the member's memory file exists, show its one-line summary and ask: "Overwrite with this session's memory? (yes / no)". Wait. On "no", change nothing.
5. Write the file:

```markdown
# Memory – [task or session]
Last updated: [YYYY-MM-DD HH:mm, Asia/Colombo] · Branch: [branch] · PR: [link or none]

## What was built
## Decisions made
## Problems solved
## Current state
## Next session starts with
## Open questions
```

6. If something changed that teammates need to know (a migration merged, a contract changed, a blocker), add a dated line at the top of `.agent/current-state.md` and, when another member depends on it, a note in `.agent/handoffs/`.
7. Confirm and remind: next time run `/remember restore`.

## Restore

1. Read the member's `.agent/memory/member-<N>.md`. If missing, say so and suggest `/remember save` at the end of this session.
2. Read only: `AGENTS.md`, `.agent/current-state.md`, `.agent/open-questions.md`, and any `.agent/handoffs/` notes addressed to this member. Don't scan the rest of the repo.
3. Summarise: last session, current state, decisions in place, what's next. Point out anything in `current-state.md` that changed since (e.g. a teammate's migration merged – run `npm run db:reset && npm run db:types`).
4. Do **not** start building. Ask the user to confirm the next step. If the memory looks incomplete, say what is missing and let the user decide.

## Never

- Store or repeat secrets, `.env` contents or real department data.
- Overwrite a memory file without an explicit "yes".
- Write in another member's memory file.
- Start coding straight after a restore.
