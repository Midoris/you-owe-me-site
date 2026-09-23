# Loan import discovery (EXP-011, 20 September 2026)

Nine additional entry points share the original import/review/transfer flow. Page introductions, shared offer text and route mappings live in `scripts/loan-import-offers.mjs`. `scripts/render-loan-import-offers.mjs` generates the nine marked HTML blocks, and those blocks are committed so their explanations and guide links are present in the initial response. `scripts/loan-import-entry.mjs` enhances each existing block with a working button; intake markup remains in `scripts/loan-import-ui.mjs`. Each HTML page owns its intentional placement.

## Release gate

The original September 20 release note kept `loanImportEnabled` false pending owner acceptance. **Correction, September 23, 2026:** public rollout was authorized September 22, and `loanImportEnabled` is now **true**. The switch controls the direct intake, the nine offer buttons and the homepage shortcut. The visible public explanations and guide links remain in HTML even if interaction is disabled or JavaScript fails. With the switch off, the bootstrap does not access the DOM, read recovery state, load importer dependencies or emit events. `?loan-import=1` on localhost/127.0.0.1 selects the local preview endpoint and suppresses import analytics; it does not enable a disabled production flag. No separate flags per page.

To change an offer, edit `scripts/loan-import-offers.mjs`, then run `node scripts/render-loan-import-offers.mjs --write` and commit its nine marked HTML blocks. Run `node scripts/render-loan-import-offers.mjs --check` in verification. The generator validates every target before writing and leaves all other page content alone. The direct tracker guide and three supporting pages are authored in their HTML files; the generator does not own them.

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

Run `node --test scripts/*.test.mjs scripts/*.test.js tests/*.test.cjs`, `node scripts/render-loan-import-offers.mjs --check`, and the page-design audit on all thirteen affected routes. Local browser verification should cover visible text without JavaScript, narrow and desktop screens, the nine enhanced offers, the original direct anchor, disabled and load-failure fixtures, and existing page actions. Use `?loan-import=1` when opening intake locally; do not send an interpretation or transfer request for this presentation change. Extraction quality is covered by the earlier EXP-011 live evaluation.
