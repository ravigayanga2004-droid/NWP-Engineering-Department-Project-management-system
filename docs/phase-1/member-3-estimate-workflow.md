# Member 3 – Estimate workflow

**Name:** ______________ · Read first: [overview](00-overview.md), [contracts](contracts.md) · Skills: `nwp-domain`, `nwp-supabase-migration`, `nwp-server-action`, `nwp-feature-slice`, `nwp-security-checklist`

You build what happens after registration: design tasks, forwarding to the DE office, the DE estimate under the Estimate No, the **Rs 5M routing** with the HO check, sending to the requester, and the work page that shows it all. This replaces the second half of the paper Estimate Register.

## Your folders

`src/app/(app)/works/[id]/**` · `src/app/(app)/inbox/**` · `src/features/estimates/**` · `messages/*/estimates.json` · `supabase/migrations/*_estimate_*.sql` · `supabase/tests/estimate_*.sql`

## Workflow you implement

```
REG ── forward_to_de ──► EUP ── submit_estimate ──┬─ total < threshold ─────────────► send_to_sender ──► EP
                                                  └─ total ≥ threshold ─► check_estimate ─┬─ approved ─► send_to_sender ──► EP
                                                                                          └─ returned ─► back to DE (new version)
any non-EP status ── cancel_work ──► CAN
```

Threshold = `setting_numeric('ho_check_threshold')` (Rs 5,000,000), never a literal.

## Tasks

### Weeks 1–2 – UI on mock data + migration draft

- [ ] Agree function signatures in [contracts](contracts.md) with Members 2 and 4 (day 1–2).
- [ ] `src/features/estimates/mock.ts`; build `/inbox/de`, `/inbox/ho-check` and `/works/[id]` layouts against it.
- [ ] `<StatusBadge>`, `statusLabel()`, `statusRank()` and `FUNNEL_STAGES` (exported – Member 4 uses them in the list, Phase 3 dashboards use the funnel).
- [ ] Draft the `estimate` migration (merge after Member 2's `register` migration).

### Week 3 – `estimate` migration

- [ ] `design_tasks`, `estimates` (versions, `is_current`), `work_status_history`, `status_rank(work_status)` (order and funnel from the old count formulas – see [contracts](contracts.md#status-order-and-stage-funnel)), the `works_overview` view (`security_invoker = true`) with `status_rank` and `cost_for_estimation` (DON works: estimate × `estimation_fee_rate_don`).
- [ ] RLS: DE staff read/write estimates of their division (through functions); HO TO reads works waiting for check; designers read their tasks; head engineer reads all.

### Weeks 4–5 – workflow functions + inboxes

- [ ] `forward_to_de`, `submit_estimate`, `check_estimate`, `send_to_sender`, `cancel_work` – each checks role, scope and current status, writes `work_status_history`, raises readable errors.
- [ ] `submit_estimate` with total ≥ threshold sets `submitted_to_ho_on` and puts the work in the HO queue; `send_to_sender` refuses until HO approved.
- [ ] `/inbox/de`: works forwarded to my division, sorted by expected date, overdue highlighted; estimate form (total, stage note e.g. "Up to DPC", file upload to private bucket `estimates`).
- [ ] `/inbox/ho-check`: approve / return with note.
- [ ] Server actions in `src/features/estimates/actions.ts` (pattern in the `nwp-server-action` skill).

### Week 6 – work page

- [ ] `/works/[id]`: header (Estimate No, school, status), registration details (from Member 2's `getWorkRegistration`), design tasks panel (assign, dates, PED approval), `<EstimateStageTimeline>` (forwarded → prepared → submitted to HO → checked → sent), status history, available actions for the current user.
- [ ] pgTAP: both 5M paths; DE of another division refused; wrong status refused; `send_to_sender` blocked before HO approval.
- [ ] Feature doc `docs/features/estimate-workflow.md`.

## Done when

- A work moves REG → EUP → EP on both paths (< Rs 5M and ≥ Rs 5M) using only the functions.
- Changing the threshold in `settings` changes routing without a code change.
- Every transition is in `work_status_history` and `audit.log`.
