# EXP-011 website review refinement — 2026-10-18

Local technical review checkpoint. This refines EXP-011; it does not create a new experiment. No production publication has occurred at this checkpoint. The native application is outside this change.

## Behavior

The review begins with one sticky action row. Its short correction message is an accessible button that focuses the next required control; the row contains Continue on iPhone and, when appropriate, Use history only. Continue also focuses a rejected correction. Ready guidance and correction guidance both call the same strict `validate` function; there is no second financial validator or mandatory checklist. Field edits update guidance without replacing the controls or moving focus.

Detected schedules remain included by default. Use history only explicitly switches `plan.include` off, retains all entered terms, and returns focus to Continue. Re-enabling the schedule restores its terms. Missing optional terms can therefore stop blocking valid history in one action. Malformed plan amount/timezone strings must first be corrected or explicitly cleared, as required by the existing transfer/recovery contract; the shortcut is not offered for that case. Plan well-formedness is checked independently so a history error cannot mask an invalid plan. A currency must be chosen before a nonempty schedule payment can be assessed. An excluded malformed plan can still be reached through the correction message without silently enabling it.

Free-form unresolved questions require explicit Confirm resolved after the user checks the facts. Editing alone does not confirm financial ambiguity. Confirmation moves focus to the next remaining question, or Continue when all are resolved. Removing/adding a history row keeps focus on a corresponding record control. An overpayment targets the offending record's amount, retaining the existing financial arithmetic.

Editable local/session recovery and `loan-review-recovery` JSON retain unfinished amount/timezone strings through the new `editableDraft` reader. It shares the existing structural, text, date shape, enumeration, identifier and size checks with `reviewDraft`. Strict `reviewDraft`, `validate`, `envelope`, interpreted input and signed `recoveryState` remain strict. The schema and serialized field names are unchanged. Invalid editable terms cannot prepare a handoff, become a signed recovery, or reuse mismatched prepared data from session recovery. Validated original recovery state is preserved independently of fresh-transfer readiness: an overdue included schedule does not discard the original native import identity or prevent its backup. Original recovery state is validated and downloaded before fresh-transfer validation; editing financial details still invalidates the prepared identity. Cached prepared state must validate and match both the current draft and its cached envelope. No backend, native, financial arithmetic, quotas, pricing or transport changes are included.

## Event contract

Exactly three new event names, all at most 40 characters. The controller dispatches only `{name}` to the existing import bridge. The bridge uses the existing safe page context (`page_type`, `cluster`, `app_store_cpp`, `page_path`, `site_platform`, `experience_surface`) with their existing meanings. No new parameters, GA custom definitions, reason strings, identifiers or financial/source content.

| Event | Exact user-action boundary |
| --- | --- |
| `uomi_web_loan_continue_attempt` | An accepted Continue on iPhone activation for an unprepared review, immediately before strict validation. Not guidance rendering, field edits, backup validation, a busy activation or redisplaying an already prepared transfer. |
| `uomi_web_loan_continue_rejected` | That attempt fails strict client validation. Exactly one event following the attempt; no reason or field is attached. A server/network failure is not a validation rejection. |
| `uomi_web_loan_import_cancelled` | Either explicit Stop waiting during an active interpretation, or explicit Discard draft and start again for an existing review. Once per accepted action. It does not distinguish these two phases, and does not assert a native import was cancelled. |

Same-task repeated activation is coalesced; a browser's second double-click activation (`detail > 1`) is ignored. A pending request is protected by the existing controller lock. A retry after failure is a fresh attempt. A stopped request cannot emit ready/failed even when a late response ignores abort. Disclosure, navigation, reload, tab closure, loss of focus, history-only selection, editing a prepared transfer and source changes emit no cancellation. Local `?loan-import=1` preview suppresses all import events.

Existing `uomi_web_loan_transfer_prepared` still means only that a web transfer link has been prepared. There is no website committed-import event. Native save completion and native diagnostics require separate iOS work.

## Cache and affected routes

Release cache key: `20261018-review1`.

All ten existing import routes pin the updated `loan-import-entry.mjs` and `analytics.js` URLs. The entry pins the changed controller and CSS; the direct tracker CSS link uses the same key. The controller pins the changed model and analytics allowlist, and the analytics bridge pins that same allowlist. Unchanged UI/config/image/error/QR modules retain their existing URLs. Tests check this graph so new code cannot import a cached model without `reviewIssue`/`editableDraft`, or use a cached allowlist that omits the new events. Existing open documents can finish their loaded version; refreshed HTML loads the new versioned graph. This does not change unrelated page scripts or page content.

Affected routes (HTML changes are only these resource URL pins):

- `/`
- `/tools/personal-loan-payment-tracker/`
- `/tools/payment-plan-calculator/`
- `/tools/partial-repayment-calculator/`
- `/solutions/app-to-track-money-owed/`
- `/solutions/personal-loan-repayment-tracker/`
- `/blog/how-to-track-a-personal-loan-between-friends-or-family/`
- `/blog/how-to-remind-someone-they-owe-you-money-politely/`
- `/blog/what-is-a-running-balance-between-two-people/`
- `/blog/how-to-keep-track-of-who-owes-you-money/`

## Verification

- Full existing site suite plus focused additions: `node --test scripts/*.test.mjs scripts/*.test.js tests/*.test.cjs` — 193 passed, zero failed.
- Focused import suite: `node --test scripts/loan-import*.test.mjs` — 45 passed, zero failed.
- Additional offline baseline comparison: 576 combinations of missing facts, precision, malformed content, date, history, unresolved questions and schedule mutations produced identical strict accept/reject results and balances before/after.
- `node scripts/render-loan-import-offers.mjs --check` — nine committed blocks match the renderer.
- `git diff --check` — passed.
- Page-design route audits on all ten affected routes — zero hard errors. `loan-import.css` is an inset tool stylesheet, not a page shell. Its deliberate inherited-shell exception already existed: standalone CSS auditing reports the same six missing page/hero tokens on the baseline and modified files (page wash/base gradient, hero gradient, eyebrow color, hero shadow and visual-card shadow). Those tokens belong to each host stylesheet; duplicating a page shell inside this tool would be incorrect. The new row uses canonical border/radius/shadow/CTA/focus tokens. No new standalone audit drift.

CUA browser interaction used a local synthetic fixture with the real importer, page styles and model, plus a localhost transfer stub. No paid interpretation, real customer content, production transfer or production analytics was used. Tested at 1440×1000, 390×844 and 320×568. These are viewport overrides in the desktop in-app browser, not physical iPhone/Safari, touch or software-keyboard tests. QR rendering and the QR-unavailable private-link/backup fallback both worked; the QR was not scanned into an actual device.

At 390px the blocking-plan row is approximately 136px tall after simplifying the correction message into the navigation control. In a 26-record history, the final amount receives focus at y=400px below the sticky row ending at y=124px. At 320×568, focus is at y=262px below a row ending at y=117px. No horizontal overflow. The `[hidden]` controls remain `display:none`; the new sticky/flex styles do not override the scoped `!important` hidden rule. Editing facts still leaves a pending question; keyboard Enter confirms it and returns focus to Continue.

Evidence under `docs/verification/loan-import-review-2026-10-18/`:

- `desktop-plan.png`, `mobile-plan.png`, `mobile-history-only.png`
- `mobile-long-history-focus.png`, `mobile-320-long-history-focus.png`
- `mobile-question-after-edit.png`
- `desktop-transfer-qr.png`, `mobile-transfer-fallback.png`
- `browser-metrics.json`, `checks.json`, `page-design-audits.txt`

## Release checkpoint and rollback

Baseline and rollback revision: `1a2ca53c5ba9cf830311f40d9cf1ac880e1030b0`. Existing branch is `master`, remote is `https://github.com/Midoris/you-owe-me-site.git`, and established publication is GitHub Pages from `master`. Firebase configuration in this checkout is for the separate private continuation host; it is not the marketing-site publication path.

Push/publication waits for the coordinator's technical acceptance. After acceptance, commit only the reviewed files, excluding the pre-existing untracked `audits/` directory. Verify the exact pushed SHA through the GitHub Pages deployment/build receipt, public resource byte hashes for the versioned graph and affected HTML, and a public browser smoke. Build success alone does not establish publication. Record actual live UTC/Bangkok time and receipts separately after deployment. Roll back with a reviewed revert of this change on `master` and verify that deployment and public bytes again; do not reset or include unrelated work.
