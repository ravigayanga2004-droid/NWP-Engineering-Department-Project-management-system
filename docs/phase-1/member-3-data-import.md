# Member 3 – Reference data, import & exports

**Name:** ______________ · **Phase 1, 8 weeks** · Read first: [Phase 1 overview](00-overview.md)

You make sure the system starts with **clean, correct data**: the reference lists, the Estimate No helpers, the duplicate search, the import of today's register and workbook, the cleanup report staff must resolve, and Excel export.

## Deliverables

| # | Deliverable | Week |
| --- | --- | --- |
| 1 | Reference lists collected (divisions, district secretariats, funds, programs, institutes, schools) | 1 |
| 2 | Seed scripts + Estimate No parser/validator | 2 |
| 3 | Next-serial suggestion + duplicate search | 3 |
| 4 | Import: 2026 Estimate Register (dry run) | 4 |
| 5 | Import: July 2026 workbook rows at EUP/EP (dry run) | 5 |
| 6 | Cleanup report + works Excel export | 6 |
| 7 | Real import into staging | 7 |
| 8 | Production import | 8 |

## 1. Reference data (`supabase/seed.sql` + `scripts/seed/`)

| List | Source | Notes |
| --- | --- | --- |
| Divisions | Fixed | Kul Kuliyapitiya · Kur Kurunegala · Mah Maho · Rid Ridigama · War Wariyapola · Put Puttalam · Wen Wennappuwa |
| Institutes | Workbook codes | CM Chief Ministry · PED Provincial Education Department · MOE Ministry of Education · DoSD Department of Sports Development |
| Funds | Workbook codes | PSDG, CBG, PCSL, NSBS, REC, GEMP, SESSIP, DON, OTHER, OTHER-D, OTHER-S, SPORTS (confirm CBG-R) |
| Programs | Workbook sheet names | Primary Building, Secondary Building, NCOE, Teachers' Centre, Sanitation, Sport, Repair, Dental Unit, Partially Completed Building, Damage Building, Other |
| District secretariats | Department (only some divisions use them) | Seen so far: Kurunegala, Narammala, Alawwa, Polgahawela – get the full list per division |
| Schools | Extract from workbook + register | Merge spellings (e.g. "Vidyachakrawarthi M.V." / "Vidya Chakrawarthi M.V.", "Sandalankawa" / "Sandalanakawa"); keep a mapping file of every original spelling → school id |

The workbook is `Progress at End of July 2026.xlsx` (80 sheets). Detail sheets have a header row containing "Tender Code"; Sum/Cover/Grand Sum sheets are formulas only – skip them. Do **not** commit real department files to Git; keep them in a shared drive and point the script at a local path.

## 2. Estimate No helpers (`src/lib/estimate-no/`)

```ts
parseEstimateNo('NWPEng/E/2026/266/MOE/OTHER/Kul 033')
// → { year: 2026, serial: 266, institute: 'MOE', fund: 'OTHER', division: 'Kul', divisionSerial: 33 }

validateEstimateNo(value, { year, instituteCode, fundCode, divisionCode })
// → list of problems: bad format, wrong year, institute/fund/division mismatch, already used

suggestEstimateNo({ year, instituteCode, fundCode, divisionCode })
// → next serial for the year (DB function next_estimate_serial) + next serial in that division
```

- Unit tests (Vitest) with real examples from the workbook, including 4-digit serials (`2025/1072`) and the bad ones (`OTHER -D`, lowercase `war`, `kur`).
- The same rules exist in the database (Member 1); keep them in sync.

## 3. Duplicate search

- Enable `pg_trgm`; Postgres function `find_similar_works(school_id, description)` returns open works at the same school whose description similarity > 0.4 (tune with real data).
- Must catch the struck-out register rows: "Maddegama K.V." (marked "Same 421") and Al-Falah ("Moved to No. 97").

## 4. Import scripts (`scripts/import/`)

Run from a developer machine with the **secret key in a local `.env`**, never from the app. Each script has `--dry-run` (writes nothing, prints the report) and is safe to run twice (upsert by Estimate No).

**A. 2026 Estimate Register** (get the digital copy from Member 4)
Columns → tables: Section, Requested Institute, Fund, Division, Estimate No, Location (school), Work, Budget, Date Received to HO → `request_letters` + `works` · design columns → `design_tasks` · Forwarded Date to DE, Expected Date, Prepared TO, Submitted Date to HO, Checked TO, Date Sent to Sender, Total Estimate Cost → `estimates`.

**B. July 2026 workbook – estimate stage only**
Rows with Remarks `EUP` or `EP` (≈ 720 rows) whose Tender Code starts with `NWPEng/E/` → `works` + `estimates`. Rows with a tender-style code or later statuses wait for Phase 2.

**Known problems to handle**

| Problem | Count (July 2026) | Handling |
| --- | --- | --- |
| Same work in 2–3 program sheets | 9 works | Import once; list for staff to choose the program |
| One Estimate No on two different works (2026/362) | 1 | Import the first; report the second |
| Division in code ≠ Division column | 8 | Report; staff decide |
| Division spellings (Puttalam / Puttalama / Puttlam) | 3 variants | Map to `Put` |
| Status spellings / blanks | 5 "Cancelled" variants, 32 blank | Map to codes; blanks → report |
| Dates typed as text (`2026.05.26`) | 41+ | Parse `YYYY.MM.DD`, `YYYY-MM-DD`, `DD/MM/YYYY`; unreadable → report |
| Register vs workbook disagree (e.g. estimate or award amounts) | several | Register wins for estimate data; report differences |

## 5. Cleanup report

Output `cleanup-report-<date>.xlsx` (ExcelJS) with one sheet per problem type: row source (sheet + row number), Estimate No, school, what is wrong, suggested fix, and an empty "Decision" column for staff. Re-running the import reads the decisions back.

## 6. Excel export of the works list

Server action `exportWorks(filters)` → `.xlsx` with the visible columns, respecting RLS (export what the user can see). Log every export in `audit.log` (who, filters, row count).

## Done when

- [ ] `npx supabase db reset` loads all reference lists.
- [ ] Estimate No helpers have tests covering every format seen in the real data.
- [ ] Dry runs of both imports finish with a cleanup report and no crashes.
- [ ] Staging holds the imported 2026 register; staff have resolved the cleanup report.
- [ ] Excel export matches what the user sees and is logged.
