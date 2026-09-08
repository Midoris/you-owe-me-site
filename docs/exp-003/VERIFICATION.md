# EXP-003 website verification — 2026-09-08

Base `2eb636cc770dd31192e756a100a150c28411dbfa`; task branch `codex/exp-003`. The original checkout's pre-existing `.codex-business-pack/` was preserved. Production activation remains **false** in `scripts/tool-transfer.js`.

`node --test tests/tool-transfer.test.cjs`: **8 passed, zero failures/skips** on the final source. Covers activation off, stable identities/costs/currency label, invalid/multi-payer fallback, precision/capacity, rounding reconciliation, private-page privacy and shared cross-language fixtures. The existing calculator's 0.29 / 2 floating-point display can differ from native half-up rounding; such a draft is excluded instead of changing the visitor's answer. The fixture file is byte-identical to the native/backend fixture. Both contracts use exact integer aggregation for eligibility.

`node scripts/audit-page-design.mjs /tools/split-expense-calculator/`: **0 hard errors**. The private continuation route has seven deliberate public-page-shell/design exceptions, explained in [CONTINUATION-DESIGN.md](CONTINUATION-DESIGN.md). JavaScript syntax and Git whitespace checks pass.

Computer Use exercised the actual calculator at a 390×844 viewport through a task-local server and Firebase emulator. Local serving enabled the otherwise-disabled offer and iPhone eligibility for desktop QA; these changes are not in production source. Verified:

- Real edits, Alex/Mia/Sam and Dinner 90 expose the inline offer; Use example alone does not.
- Quota/upload failure preserves all inputs and Copy/Share; retry reaches the private continuation.
- Back restores the original split; Copy returns the complete answer.
- EUR 10 dinner shared three ways plus EUR 6 taxi for Alex/Mia preserves both costs/inclusions and returns Mia 6.33 / Sam 3.33. Native review shows reconciled own share 6.34.
- The continuation displays no names, amounts, tokenized preview, analytics or third-party resources. Its explicit fallback is usable at narrow width.

Source review also verifies a 15-second upload timeout and rejection of a stale response after editing the split. That specific in-flight race was not separately UI-tested. Browser emulation does not validate physical Safari eligibility, Apple's Clip card, public cold invocation or TestFlight replacement.

Final offer heading: **Keep track of repayments**; button: **Track this split**. Supporting copy/disclosure and exact fallback are in `tools/split-expense-calculator/index.html`. The native review confirms payer identity and currency before acceptance. Full architecture, identifiers, deployment commands, device cases and activation/rollback are in the paired native `docs/exp-003` release package and the Business EXP-003 implementation report.

Only two website events were added: `uomi_web_split_transfer_offer_viewed` once per eligible page exposure and `uomi_web_split_transfer_chosen` for an explicit attempt. Existing analytics host guards remain; no event parameters/user properties were added. A Clip choice is not an App Store click. The continuation carries no analytics. No public deployment, experiment exposure or business outcome is claimed.
