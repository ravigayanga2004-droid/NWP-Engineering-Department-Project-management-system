# Analysis: formulas in the progress workbook

Source: *Progress at End of July 2026.xlsx* (80 sheets, 48,785 formulas). Analysed 20 Nov 2026. The file itself is not in the repo.

The formulas hold business rules nobody wrote down, and several bugs that make today's printed totals wrong. This page records both, so the system copies the rules and not the bugs.

## Rules found in the formulas

### 1. Estimate No generator

A leftover Google Sheets formula (now broken with `#REF!`) shows how the original register built the number:

```
"NWPEng/" & SectionCode & "/" & Year & "/" & TEXT(Serial,"000") & "/"
& Initials(RequestingInstitute) & "/" & UPPER(Fund) & "/"
& LEFT(Division,3) & " " & TEXT(COUNTIF(division so far),"000")
```

| Part | Rule | Example |
| --- | --- | --- |
| Section code | Education → `E`, Health → `H`, Other Department → `O` | `E` |
| Year | Was typed as "2025" in the formula; must come from the registration date | `2026` |
| Serial | Running number for the section and year, 3 digits minimum | `266`, `1072` |
| Institute | First letter of each word | Chief Ministry → `CM`, Provincial Education Department → `PED`, Department of Sports Development → `DoSD` |
| Fund | Upper case | `PSDG`, `OTHER-D` |
| Division | First 3 letters + running count of works in that division (3 digits) | `Kul 033` |

**Consequence:** the register is not only for schools – **Health and Other Department works use the same numbering**. Phase 1 shows Education, but the data model carries a Section.

### 2. Stage funnel (the five count columns)

The nested IFs in *No of Works / Estimated / Tendered / Awarded / Completed* list which statuses count at each stage. Status order:

```
EUP → EP → TC (called "PC" on some sheets) → AW → WIP → WC → FBTP → RTR → RR → RRD
side states after award: TS, Terminated
```

| Count | Statuses included |
| --- | --- |
| No of works | all except Cancelled and blank |
| Estimated | EP and later |
| Tendered | TC/PC and later |
| Awarded | AW and later, incl. TS and Terminated |
| Completed | physical progress = 100% (most sheets) |

`PC` and `TC` are the same stage. Cancelled and blank works are excluded from every count (32 works had a blank status in July 2026).

### 3. Cost for Estimation (DON works)

`Cost for Estimation = Total Estimated Cost × 1%` in 315 cells of the DON (donation) sheets. Purpose to confirm with the department (likely a fee for preparing the estimate).

### 4. Retention due date

`Due date of Retention = Actual completion + 180` in the few cells that use a formula; most are typed. Matches the 6-month defects period for repairs (new buildings use 365 days).

### 5. Bill components

50 cells hold hand-typed sums such as `=3112191.05+465432.36+83777.82` instead of formulas. Detected patterns:

- one part is **18% of another** (VAT 18%) – 3 cells;
- one part is **15/85 of another** (an 85% / 15% split) – 10 cells; meaning to confirm with the department;
- one part is 10% of another – 1 cell.

So a monthly bill has components (work value, VAT, deductions or additions). Phase 2 stores them as separate fields.

## Bugs found (the system must not repeat them)

| Bug | Size (July 2026) | System rule |
| --- | --- | --- |
| Sub Total `SUM` ranges skip work rows (e.g. `=SUM(G115:G134)` on a section that runs to row 176) | **195 works missing from totals: Rs 902.6M estimates, Rs 208.6M contracts, Rs 69.7M bills** (9 of them cancelled) | Totals are always calculated from all records |
| Summary rows pointing at a subtotal of mixed divisions (heuristic – check by hand) | 9 of 237 | Group by the division field, never by cell address |
| "Completed" formula on some sheets counts Awarded/WIP as completed | 5 works shown complete at 0–85% progress | One definition of completed |
| `WC` tested in the wrong column in every counter | 5,690 formulas (no work has WC yet) | Status is a single field |
| Counter cells overwritten with typed numbers | 25 cells | Counts are never typed |
| Item numbers `=#REF!+1` | 112 cells | Order comes from data |
| Links to an external "ADB" workbook in hidden sheets | 53 formulas | No file links |
| Month headers chained sheet to sheet ("July" copied across ~15 sheets) | – | Reporting month is one setting |
| Estimate No formula with the year typed in | – | Year from the date |

## Where these rules are used

- `docs/phase-1/contracts.md` – Section, Estimate No generation, status order, cost for estimation.
- `.claude/skills/nwp-domain/SKILL.md` – the same rules for AI agents.
- Member 2 (register), Member 4 (import, totals reconciliation), Phase 3 dashboards (funnel).

## Questions for the department

1. What is the 1% "Cost for Estimation" on DON works, and who pays it?
2. What is the 15% part in the hand-typed bill sums?
3. Does the Health / Other Department register use the same workflow (DE estimate, Rs 5M HO check)?
4. Meanings of TS, RTR, RR, RRD.
