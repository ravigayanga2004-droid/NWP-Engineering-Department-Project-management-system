# Handoffs

A handoff tells another member something they need in order to continue: your work is ready for them, or you had to touch their files. Write one whenever:

- another member depends on what you just merged (e.g. the `register` migration is in – Member 3 can build `estimate`);
- your task needed a change in a folder you don't own (`.github/CODEOWNERS`) – describe it **before** the PR and mention it in the PR;
- you stop mid-task and someone else will continue.

File name: `YYYY-MM-DD-<from>-to-<to>-<slug>.md`, e.g. `2026-11-27-m2-to-m3-register-migration.md`. Delete or mark **Done** when the receiver confirms.

## Template

```markdown
# Handoff – <slug>

YYYY-MM-DD · From: Member N · To: Member M · Status: Open | Done

## What is ready / what changed
## What you need to do
## Files, migrations, PRs
## Watch out for
```
