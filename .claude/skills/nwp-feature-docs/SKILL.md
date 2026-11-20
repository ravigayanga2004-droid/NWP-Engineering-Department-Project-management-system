---
name: nwp-feature-docs
description: Write or update a feature document in docs/features/ in the same format as the RUR project's feature docs (Overview, Roles and access, How It Works, Data, Rules and Validation, Code Reference, Functional Purpose). Use when a feature slice is finished or changed, or when asked to document a feature.
---

# Feature documentation (RUR format)

One file per feature in `docs/features/`, owned by the feature's owner. Add a row to `docs/features/README.md` when creating one.

## Before writing

Read the feature's code (pages, `src/features/<feature>/`, its migrations and tests) and `docs/phase-1/contracts.md`. Document what the code **does**, not what was planned; mark anything unfinished as "Not yet built".

## Structure

```markdown
# Feature Documentation: <Feature name>

## Overview
2–3 sentences: what it does, who uses it, which old paper/Excel process it replaces.

## Roles and access
| Role | Can |
| --- | --- |
| subject_clerk | ... |

## How It Works
### 1. <Step name>
What the user does, what the system checks, which status it sets.
### 2. ...

## Data
| Table / view | Purpose | Key columns |
| --- | --- | --- |

## Rules and Validation
- Rule – where it is enforced (database constraint / function / server action).

## Code Reference
| Part | Location |
| --- | --- |
| Pages | `src/app/(app)/.../page.tsx` |
| Server actions | `src/features/<feature>/actions.ts` |
| Migrations | `supabase/migrations/<file>.sql` |
| Tests | ... |

## Functional Purpose
Why the department needs it; which redundancy or error from the old process it removes.
```

## Style

- Plain English for department readers; short sentences; tables for roles, data and code locations.
- Use real rule values (e.g. the Rs 5M threshold setting) and real route names.
- No screenshots containing real department data.
