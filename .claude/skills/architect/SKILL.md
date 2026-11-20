---
name: architect
description: Think a task through like a senior engineer before writing any code – read what the NWP docs already decide, agree on terms, resolve only the decisions that change the build, and produce an implementation plan the user confirms. Use before starting any non-trivial task, feature, migration or screen in this repo.
---

# /architect – plan before code

A short thinking session, not an interrogation and not a full spec. No code is written until the user confirms the plan.

## 1. Read what already exists (do not ask what the docs answer)

In this order, only as far as the task needs:

1. `AGENTS.md`
2. `docs/phase-1/00-overview.md` and `docs/phase-1/contracts.md`
3. The member doc for the task's slice (`docs/phase-1/member-*.md`)
4. `nwp-domain` skill (business rules), `docs/decisions.md`, `.agent/open-questions.md`
5. `.agent/current-state.md` and your `.agent/memory/<member>.md` if continuing
6. `docs/ui-registry.md` and the Figma screen if the task has UI
7. The existing code in the slice's folders

## 2. Align on language

Pick the 3–5 terms in the task most likely to be misunderstood (e.g. "estimate", "budget", "sent", "completed", "division serial"). State the working meaning of each from the docs and ask the user to confirm or correct. Do not continue until the terms are agreed.

## 3. Resolve decisions – one at a time

Raise only decisions that change how the task is built, highest impact first. For each: one question, your recommendation with the reason, then wait. Skip any decision an earlier answer made irrelevant. Typical NWP decisions:

- Does it stay inside one slice (`.github/CODEOWNERS`)? If not, who owns the other files – handoff or contract change?
- Does it change `docs/phase-1/contracts.md`? (Needs every affected owner's approval.)
- Which rules go in the database (constraint, RLS, function) vs the server action?
- Which roles may do it, and how is it scoped (division / fund)?
- Which migration area (`auth`, `ref`, `register`, `estimate`) and tables?

When every build-changing decision is resolved, say **"Blueprint ready."**

## 4. The plan (then wait for confirmation)

```markdown
## Implementation Plan – [task]

### What we are building
One paragraph.

### Language we agreed on
- term: meaning

### Decisions made
- decision: outcome – reason

### Assumptions
- not yet confirmed: …

### Slice and files
- Slice / owner:
- Files to create or change (all inside the slice, or note the handoff):
- Migrations (`<timestamp>_<area>_<what>.sql`):
- Contract changes: none | describe

### How to build it
1. Ordered steps, database first, then server actions, then UI, then tests and docs.

### Done when
- Checks from the member doc and the definition of done that prove it works.
```

Start implementing only after the user explicitly confirms the plan.

## Never

- Ask about something the docs or code already answer.
- Ask a long list of questions at once, or questions that don't change the build.
- Write code, migrations or files before the plan is confirmed.
- Plan work in another member's folders without a handoff note (`.agent/handoffs/`).
