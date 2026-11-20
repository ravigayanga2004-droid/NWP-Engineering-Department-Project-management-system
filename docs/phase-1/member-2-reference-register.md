# Member 2 – Reference data & register

**Name:** ______________ · Read first: [overview](00-overview.md), [contracts](contracts.md) · Skills: `nwp-domain`, `nwp-supabase-migration`, `nwp-server-action`, `nwp-feature-slice`

You build how a request enters the system: the reference lists, the request letter, its works and their **Estimate No** – replacing the first half of the paper Estimate Register. Your `register` migration (week 3, day 2) unblocks Member 3 and 4.

## Your Figma screens

- [03 Register letters – Excel-style grid](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=7-17)
- Components: [Grid Cell](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=5-49) · [Input](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=5-17) · [all components](https://www.figma.com/design/scdj35S8ZQipZ9aM12foIY?node-id=2-2)
- Styling rules: [docs/ui-registry.md](../ui-registry.md)

## Your folders

`src/app/(app)/admin/reference/**` · `src/app/(app)/letters/**` · `src/features/reference/**` · `src/features/register/**` · `src/lib/estimate-no/**` · `messages/*/{reference,register}.json` · `supabase/migrations/*_ref_*.sql`, `*_register_*.sql` · `supabase/tests/{ref,register}_*.sql` · reference rows in `supabase/seed.sql` (below Member 1's section)

## Tasks

### Week 1 – Estimate No library (no database needed)

- [ ] `src/lib/estimate-no/`: `parseEstimateNo`, `validateEstimateNo`, `formatEstimateNo`, `instituteInitials` – same rule as the department's original Google Sheet formula (see [contracts](contracts.md#estimate-no-format-same-rule-as-the-departments-original-google-sheet) and [workbook formula analysis](../analysis/workbook-formulas.md)). Vitest tests: `NWPEng/E/2026/266/MOE/OTHER/Kul 033`, 4-digit serial `NWPEng/E/2025/1072/DoSD/SPORTS/Wen 113`, section `H` and `O` examples, `instituteInitials('Department of Sports Development') === 'DoSD'`, bad ones `OTHER -D`, lowercase `war`.
- [ ] Collect reference lists: institutes (CM, PED, MOE, DoSD), programs (from workbook sheet names), district secretariats per division (ask Member 4 to get the list), schools (Member 4's import parser gives you the names).

### Week 2 – reference data

- [ ] `ref` migration: `sections` (`E` Education, `H` Health, `O` Other Department), `institutes` (with initials `code`), `programs`, `district_secretariats`, `schools` (+ `division_id`), RLS (all signed-in users read; admin writes), audit triggers.
- [ ] Seed rows; `/admin/reference/*` pages (list + add/edit/deactivate) for admin.
- [ ] `src/features/reference/index.ts`: getters + `<DivisionSelect>`, `<FundSelect>`, `<SchoolCombobox>` (searchable).

### Week 3 – register migration (merge by day 2)

- [ ] Enum `work_status` (`REG`, `EUP`, `EP`, `CAN`).
- [ ] `request_letters`, `works` as in [contracts](contracts.md) (incl. `section_id`, `division_serial`); `unique(estimate_no)`, `unique(section_id, estimate_year, estimate_serial)`, format `check` (`^NWPEng/[EHO]/…`), trigger that the Estimate No parts match section/year/institute/fund/division.
- [ ] `work_status` enum with **all** values in workflow order (see contracts – Phase 1 uses REG, EUP, EP, CAN).
- [ ] Revoke direct update of `works.status` (only Member 3's functions change it).
- [ ] RLS: subject clerk reads/inserts works of their funds; DE staff read their division; head engineer reads all.
- [ ] `next_estimate_serial(section, year)` and `suggest_estimate_no(section, year, institute, fund, division)` – the full suggested number, including the running count in the division; Storage bucket `letters` (private) with policies.

### Weeks 4–6 – register screens

- [ ] `/letters/new`: letter details + upload scan, then the works in an **Excel-style grid** (Figma screen 03): one row per work – fund, program, division, district secretariat optional, school, description, New/Repair, budget, **Estimate No** pre-filled by `suggest_estimate_no` and validated live; keyboard navigation, paste from Excel, fill down, **Save all** in one transaction with per-row errors. Section defaults to Education. On save, optionally call `forward_to_de` (Member 3) for each work.
- [ ] Duplicate warning via `find_similar_works` (`pg_trgm`); must catch the register's "Same 421" case.
- [ ] `/letters/[id]`: letter, its works, links to `/works/[id]`; edit while status is `REG` only.
- [ ] pgTAP: clerk without a fund cannot insert; duplicate Estimate No refused; part mismatch refused.
- [ ] Feature doc `docs/features/register.md`.

## Done when

- A subject clerk registers a letter with three works in under two minutes, with correct Estimate Nos.
- Invalid, duplicate or mismatched Estimate Nos are refused by the database, not only the form.
- Reference lists are editable by admin and used by every form.
