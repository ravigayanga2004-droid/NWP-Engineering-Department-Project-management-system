# UI registry

The classes every screen uses, so the four members' pages look the same and match Figma. Read this **before** building UI; run `/imprint` **after**.

Design source: [NWP School Works – Phase 1 UI (Figma)](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY) – Components page (tokens, Button, Input, Status Badge, Nav Item, Grid Cell, Top Bar, Sidebar) and Screens page (01–07).

## Screens and owners

| Figma screen | Route | Owner |
| --- | --- | --- |
| [01 Login](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=6-2) | `/login` | Member 1 |
| [02 MFA verify](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=6-24) | `/mfa/verify` | Member 1 |
| [03 Register letters – Excel-style grid](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=7-17) | `/letters/new` | Member 2 |
| [04 Works list](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=9-242) | `/works` | Member 4 |
| [05 Work page](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=10-426) | `/works/[id]` | Member 3 |
| [06 DE inbox](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=12-506) | `/inbox/de` | Member 3 |
| [07 HO check queue](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=12-725) | `/inbox/ho-check` | Member 3 |
| [Components page](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=2-2) (Top Bar, Sidebar, Button, Input, Status Badge, Grid Cell, icons) | shared | Member 1 reviews `src/components/ui` and shell |

## Baseline – established 2026-11-20 from the Figma tokens

Font: **Geist** (sans) for everything, **Geist Mono** for Estimate No where shown alone. Theme: shadcn/ui neutral (`src/app/globals.css`).

| Use | Figma token | Classes |
| --- | --- | --- |
| Page background | `color/bg/default` | `bg-background` |
| Muted surface (table header, filters, read-only cell) | `color/bg/muted` | `bg-muted` |
| Sidebar | `color/bg/sidebar` | `bg-sidebar` |
| Card | `color/bg/default` + border | `bg-card border rounded-lg` (10px) |
| Primary button | `color/bg/primary` | shadcn `<Button>` default |
| Secondary button | outline | `<Button variant="outline">` |
| Toolbar / low-emphasis button | ghost | `<Button variant="ghost">` |
| Destructive (Cancel work, Return to DE, Remove row) | `color/text/error` | `<Button variant="ghost" className="text-destructive">` |
| Text – primary | `color/text/default` | `text-foreground` |
| Text – secondary / hints | `color/text/muted` | `text-muted-foreground` |
| Error text | `color/text/error` | `text-destructive` |
| Link | `color/text/link` | `text-blue-600 hover:underline` (to become a theme token) |
| Border | `color/border/default` | `border` (theme `--border`) |
| Focus ring | `color/border/focus` | shadcn focus-visible ring; grid selected cell `ring-2 ring-blue-600` |
| Radius | `radius/md` 8 · `radius/lg` 10 · full | `rounded-md` inputs/buttons/table · `rounded-lg` cards · `rounded-full` badges/pills |
| Spacing | `space/1–8` (4–32px) | page padding `p-6`, section gap `gap-4`, card padding `p-4`, form field gap `gap-1` |
| Text sizes | H1 24/32 · H2 18/28 · H3 15/22 · Body 14/20 · Small 12/16 | `text-2xl font-semibold` · `text-lg font-semibold` · `text-[15px] font-semibold` · `text-sm` · `text-xs` |

### Status colours (always through `<StatusBadge>`)

| Status | Figma token | Classes (until `--status-*` CSS variables are added by Member 1) |
| --- | --- | --- |
| REG Registered | `color/status/reg-*` | `bg-neutral-100 text-neutral-700` |
| EUP With DE | `color/status/eup-*` | `bg-amber-100 text-amber-800` |
| HO check | `color/status/ho-*` | `bg-blue-100 text-blue-800` |
| EP Sent | `color/status/ep-*` | `bg-green-100 text-green-800` |
| CAN Cancelled | `color/status/can-*` | `bg-red-100 text-red-800` |

Badge shape: `rounded-full px-2 py-0.5 text-xs font-medium`.

### Grid cell states (register and bill grids)

| State | Classes |
| --- | --- |
| Header | `bg-muted text-xs font-medium text-muted-foreground border-b border-r h-8 px-2` |
| Default | `bg-background text-sm border-b border-r h-8 px-2 truncate` |
| Selected (keyboard cursor) | `ring-2 ring-inset ring-blue-600 bg-blue-50` |
| Error | `bg-red-50 ring-1 ring-inset ring-red-500` + tooltip / issues panel message |
| Read-only (calculated, row number) | `bg-muted text-muted-foreground` |

Numbers in tables: `text-right tabular-nums`.

## Components

Entries are added by `/imprint` as components are built (one entry per component type, updated in place).
