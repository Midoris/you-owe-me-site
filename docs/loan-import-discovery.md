# Loan import discovery (EXP-011, 20 September 2026)

Nine additional entry points share the original import/review/transfer flow. Page introductions live in `scripts/loan-import-offers.mjs`; mounting, dependencies and offer UI in `scripts/loan-import-entry.mjs`; intake markup in `scripts/loan-import-ui.mjs`. Change the shared formats, CTA, styling or importer once. Each HTML page owns only its intentional placement and copy key.

## Release gate

`loanImportEnabled` in `scripts/loan-import-config.mjs` is **false**. Keep it false until the owner confirms the new iOS version and loan App Clip experience are live and accepted. That single switch controls the original tracker, every new card and the homepage shortcut. Local preview only: `?loan-import=1` on localhost/127.0.0.1. It cannot enable production. Hidden placeholders contain no intake controls; the disabled bootstrap does not load the UI, QR library, image or recovery state. No separate flags per page.

## Placements

- Homepage: quiet hero shortcut; visual card after the existing loan-value section. Primary App Store/QR actions retained.
- Payment-plan and partial-repayment calculators: optional existing-record path before manual calculator inputs; existing calculator anchors still jump directly to the calculator.
- Money-owed solution: after first-minute guidance; existing first-minute and QR handoff preserved.
- Personal-loan solution: after fit guidance, available to lenders and borrowers.
- Loan-history guide: before the copyable record.
- Polite-reminder article: after copyable reminders; does not interrupt the answer or post-copy flow.
- Running-balance article: later, by calculator/app choice; explicitly limited to one loan, not mixed two-way expenses.
- Money-owed record guide: after explaining the required record.

No group-splitting, roommate-ledger, borrowing-request or refusal-page promotion: those tasks do not imply a compatible loan history. No claims that multiple loans, PDF or old XLS/DOC files are supported.

## Analytics

`uomi_web_loan_offer_viewed`: at least half the card intersects the viewport in a visible document, once per page. No dwell requirement; exposure is not reading.
`uomi_web_loan_offer_chosen`: importer successfully opened from the card, once per page. No new parameters. Existing page fields distinguish placements; existing text/CSV/XLSX/DOCX/photo stages distinguish formats. Existing interpretation-ready and transfer-prepared events remain unchanged. Private root exclusion continues to protect generic click tracking. Local preview suppresses these events.

Primary diagnostic: same-page users choosing import among exposed users, then interpretation-ready and transfer-prepared participation. These are browser events, not app installs or a cross-device joined conversion funnel. Keep existing App Store clicks as a guardrail. No uplift is claimed before rollout.

## Verification

Run `node --test scripts/*.test.mjs scripts/*.test.js tests/*.test.cjs`, plus the page-design audit on the ten affected routes. Manual browser checks cover narrow and desktop screens, rollout disabled, all nine new mounts, original direct anchor, duplicate prevention, recovery, missing-name validation and QR loading. Synthetic local API responses verify UI wiring; extraction quality is covered by the earlier EXP-011 live evaluation, not retested with paid calls here.
