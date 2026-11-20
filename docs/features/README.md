# Feature docs

One file per feature, written by the feature's owner when the slice is finished and kept up to date afterwards. Same format as the RUR project's feature docs.

| Feature | Doc | Owner |
| --- | --- | --- |
| Auth, access & app shell | `auth-and-access.md` (to write) | Member 1 |
| Register (letters, works, Estimate No) | `register.md` (to write) | Member 2 |
| Estimate workflow | `estimate-workflow.md` (to write) | Member 3 |
| Works list & import | `works-list-and-import.md` (to write) | Member 4 |

## Template

```markdown
# Feature Documentation: <Feature name>

## Overview
What the feature does and who uses it, in 2–3 sentences.

## Roles and access
| Role | Can |
| --- | --- |

## How It Works
Numbered steps a user follows, and what the system does at each step
(status changes, routing rules such as the Rs 5M check).

## Data
Tables and columns this feature owns; what other features read from it.

## Rules and Validation
Business rules enforced in the database and in server actions.

## Code Reference
| Part | Location |
| --- | --- |
| Pages | `src/app/(app)/...` |
| Server actions | `src/features/<feature>/actions.ts` |
| Migrations | `supabase/migrations/*_<area>_*.sql` |
| Tests | `src/features/<feature>/*.test.ts`, `supabase/tests/<area>_*.sql`, `e2e/...` |

## Functional Purpose
Which part of the old Estimate Register / progress workbook this replaces.
```
