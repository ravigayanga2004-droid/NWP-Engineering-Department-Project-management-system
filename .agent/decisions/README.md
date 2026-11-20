# Architecture decision records (ADRs)

Write an ADR when a decision affects other members or is hard to reverse – a contract change, a new table shared between slices, a security or hosting choice, a change of rule. Smaller decisions go in `docs/decisions.md` as one line.

- File name: `ADR-NNNN-<short-slug>.md` (next free number).
- Never rewrite an accepted ADR – supersede it with a new one and link both ways.
- Link the ADR from `docs/decisions.md` and, if relevant, `docs/phase-1/contracts.md`.

## Template

```markdown
# ADR-NNNN – <title>

YYYY-MM-DD · Status: Proposed | Accepted | Superseded by ADR-XXXX · Owner: Member N

## Context
What forced the decision (facts, constraints, links).

## Decision
What we will do, in a few sentences.

## Consequences
What changes for each slice; what becomes easier or harder; follow-up tasks.

## Alternatives considered
- option – why not
```
