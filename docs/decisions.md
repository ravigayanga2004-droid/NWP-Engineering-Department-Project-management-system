# Decisions log

Newest first. Record department answers and team decisions here so nobody has to search the chat.

| Date | Decision | Source |
| --- | --- | --- |
| 2026-11-20 | Estimate No is generated with the department's original Google Sheet rule (section E/H/O, year, serial, institute initials, fund, division + division count); the clerk can edit it | Workbook formula analysis |
| 2026-11-20 | Data model carries a Section (Education, Health, Other Department); Phase 1 screens show Education | Workbook formula analysis |
| 2026-11-20 | Status order and counts follow the workbook's count formulas; `PC` = `TC`; cancelled works are excluded from counts | Workbook formula analysis |
| 2026-11-20 | DON works: cost for estimation = estimate × 1% (setting; purpose to confirm) | Workbook formula analysis |
| 2026-11-20 | Totals are calculated from records; the import produces a reconciliation against the workbook's (partly wrong) printed totals | Workbook formula analysis |
| 2026-11-20 | Subject clerks enter works in an Excel-style grid, not one form per work | Project lead |
| 2026-11-20 | Stack: Next.js on Vercel + Supabase (Mumbai region) | Team |
| 2026-11-20 | Estimate No and Tender No are separate; the subject clerk enters both (Estimate No before sending to the division, Tender No when the work is given to a company) | Department (via project lead) |
| 2026-11-20 | Phase 1 split into four feature slices with folder ownership (see `phase-1/00-overview.md`) | Team |
| 2026-11-17 | Every work goes to its DE office; estimates ≥ Rs 5M return to HO for a TO check | Department (via project lead), Estimate Register |
