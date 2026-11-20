---
name: imprint
description: After building any UI component or screen, capture its visual patterns (colours, borders, radius, text, spacing, states) into docs/ui-registry.md so every member's screens look the same and match the Figma designs; "audit" mode checks existing UI for drift. Use after every UI change in this repo.
---

# /imprint – keep the UI consistent

Usage: `/imprint` · `/imprint <file>` · `/imprint audit`

Source of truth, in order: Figma file [NWP School Works – Phase 1 UI](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY) (tokens and components) → `docs/ui-registry.md` (classes used in code) → shadcn/ui defaults.

Read `docs/ui-registry.md` **before** building any UI; run `/imprint` **after**.

## Capture mode

1. **Find the target.** Use the given file, or the component/page files changed on this branch (`src/features/*/components/`, `src/components/`, `src/app/**/page.tsx`). If unclear, ask which component.
2. **Extract only what matters for consistency:** background, border (colour, width), radius, text colours (primary / muted / error), text size and weight, padding and gap, hover / focus / active / disabled states, shadow, accent and status colours.
3. **Skip:** widths, heights, grid/flex layout, positioning, z-index, breakpoint variants, animation timing.
4. **Write to `docs/ui-registry.md`:** add or update the entry for that component type (never duplicate, never delete other entries):

```markdown
### [Component]
File: `path` · Last updated: YYYY-MM-DD · Figma: [component name]

| Property | Classes |
| --- | --- |
| Background | |
| Border | |
| Radius | |
| Text – primary | |
| Text – secondary | |
| Spacing | |
| States (hover/focus/disabled) | |
| Shadow | |
| Accent / status | |

**Pattern notes:** why, and which variations are allowed.
```

5. **Confirm** with a short summary. Add a `Note:` for anything that differs from the baseline or the Figma token (e.g. a hex value instead of a theme class).

## Audit mode

1. Scan all UI files and collect the patterns in use.
2. Report conflicts per property (radius, backgrounds, text colours, spacing, borders, states, status colours) with a recommended standard, and list hard-coded values (`#hex`, `bg-[…]`, raw Tailwind palette colours like `bg-blue-600` where a theme token exists) with file:line.
3. **Stop** and ask the user to confirm the recommended baseline. Change nothing yet.
4. After confirmation, update the **Baseline** section of `docs/ui-registry.md` (dated, "established via /imprint audit") and list the components to fix. The owners fix them in their own slices.

## NWP specifics

- Status colours come from the status tokens (REG grey, EUP amber, HO check blue, EP green, CAN red) – always via `<StatusBadge>`; never re-create a badge.
- Grids (register, bills) use the Grid Cell states: Header, Default, Selected (2px blue ring), Error (red border + light red fill), Read-only (muted).
- Money right-aligned in tables with tabular figures; Estimate No may use the mono font.
- `src/components/ui/` (shadcn) is reviewed by Member 1; propose changes there rather than overriding classes locally.

## Never

- Overwrite or delete other components' registry entries.
- Record layout or sizing as a pattern.
- In audit mode, fix code or write the baseline before the user confirms.
- Skip `/imprint` after a UI change.
