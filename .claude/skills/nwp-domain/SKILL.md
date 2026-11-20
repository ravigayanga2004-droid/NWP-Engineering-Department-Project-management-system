---
name: nwp-domain
description: Business rules of the NWP School Works system – Estimate No vs Tender No, the request → DE estimate → Rs 5M HO check → send workflow, status codes, roles, divisions and funds. Use before writing or reviewing any feature code, migration, test data or UI text for this project, or when a question involves estimates, tenders, statuses, divisions or who may do what.
---

# NWP School Works – domain rules

The system replaces the Department of Engineering Services (North Western Province, Sri Lanka) Estimate Register and its 80-sheet monthly progress workbook. Users are internal staff only. The government pays contractors; NWP measures and certifies.

Full spec: https://claude.ai/artifact/Tz5mPsNagmcuqhNkZRn97q · Phase 1 contracts: `docs/phase-1/contracts.md`

## Two different numbers – never mix them

| | Estimate No | Tender No |
| --- | --- | --- |
| Entered by | Subject clerk | Subject clerk |
| When | At registration, **before** the work is sent to the DE office | When the work is given to a company (Phase 2) |
| Format | `NWPEng/E/<year>/<serial>/<institute>/<fund>/<Div> <div serial>` e.g. `NWPEng/E/2026/266/MOE/OTHER/Kul 033` | e.g. `25/CM/PW-NCB/PSDG-03`, `25/E/Kuli/MOE/NCB/R04` |
| Rules | Unique; serial 3–4 digits; parts must match the work's year, institute, fund, division | One tender can cover several works |

The old workbook's "Tender Code" column wrongly held both. Never store a tender number in `estimate_no`.

## Workflow (Phase 1)

1. Request letter arrives with a **budget** (allocation). Subject clerk registers the letter and its works, entering an Estimate No for each. Status `REG`.
2. Design tasks if needed (architectural / structural / electrical + draughtsman; PED approval date).
3. **Every** work is forwarded to its DE office (`forward_to_de`). Status `EUP`. The budget never decides the route.
4. DE TO prepares the estimate under that Estimate No (`submit_estimate`).
5. **Rs 5M rule** – compare the DE **estimate** (not the budget) with `setting_numeric('ho_check_threshold')` (5,000,000):
   - below → the DE office completes it;
   - at or above → returns to HO; an HO TO must approve (`check_estimate`) or return it for a new version.
6. Estimate sent to the requester (`send_to_sender`). Status `EP`.
7. `cancel_work` → `CAN` with a reason.

Later phases: `TC` tender called, `AW` awarded, `WIP`, `WC` completed, `FBTP` final bill, `RTR` retention to release, `RR` released (meanings of TS/FBTP/RTR/RRD still to confirm).

## Roles

`subject_clerk` (HO, scoped by funds) · `designer`, `draughtsman` (HO) · `ho_to` (HO checks ≥ Rs 5M) · `de_to`, `de_engineer` (DE office, scoped by division) · `head_engineer` (reads everything, dashboards) · `admin` (users and settings only, **no** work data).

## Reference values

- Divisions: `Kul` Kuliyapitiya · `Kur` Kurunegala · `Mah` Maho · `Rid` Ridigama · `War` Wariyapola · `Put` Puttalam · `Wen` Wennappuwa.
- Institutes: `CM` Chief Ministry · `PED` Provincial Education Department · `MOE` Ministry of Education · `DoSD` Department of Sports Development.
- Funds: PSDG, CBG, PCSL, NSBS, REC, GEMP, SESSIP, DON, OTHER, OTHER-D, OTHER-S, SPORTS.
- District secretariat is optional on a work.

## Formats

Money `numeric(14,2)`, shown `Rs 1,234,567.00`. Dates `date` / ISO in code, `DD/MM/YYYY` on screen. Languages: English, Sinhala, Tamil.

## Test data

Use made-up schools and people in seeds and tests. Never copy real department files, names or amounts into the repo.
