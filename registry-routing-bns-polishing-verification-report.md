# Registry / Routing / BNS Polishing Verification Report

This was a small polishing pass. I did not create new pages, rewrite full articles, redo title/meta CTR work, rebuild the running-balance pillar, or invent any fake CPP URLs.

## 1. What Changed In This Polishing Pass

- Added strategic Best Next Step coverage for 5 previously warning/high-value pages:
  - `/compare/splitwise-alternative/`
  - `/compare/spreadsheet-vs-app-for-tracking-money-owed/`
  - `/solutions/expense-tracker-for-couples/`
  - `/tools/family-reimbursement-tracker-template/`
  - `/quick-start/`
- Added those 5 URLs to `bestNextStepStrategicUrls`, increasing strategic BNS coverage from 34 to 39 pages.
- Added generated static BNS output to those 5 page HTML files.
- Pruned `/tools/partial-repayment-calculator/` related registry links from 18 related links down to 6 focused related paths.
- Reordered `/tools/running-balance-calculator/` BNS so ongoing tracking is now first.
- Reordered `/tools/split-expense-calculator/` BNS so one-time sharing remains first, ongoing tracking is second, running balance is third, and App Store is fourth.

## 2. Previously Missing BNS Modules Added

| URL | First card | Destination | App CTA position |
|---|---|---|---|
| `/compare/splitwise-alternative/` | Understand running balances over time | `/blog/what-is-a-running-balance-between-two-people/` | Later, 4th card, active shared-expenses CPP |
| `/compare/spreadsheet-vs-app-for-tracking-money-owed/` | Calculate a running balance | `/tools/running-balance-calculator/` | Later, 4th card, active money-owed CPP |
| `/solutions/expense-tracker-for-couples/` | Split expenses without turning it into a fight | `/blog/how-to-split-expenses-in-a-relationship-without-fighting/` | Later, 4th card, active couples CPP |
| `/tools/family-reimbursement-tracker-template/` | Track family subscriptions and bills | `/blog/how-to-track-subscriptions-and-bills-you-pay-for-family/` | Later, 4th card, active family CPP |
| `/quick-start/` | Find the situation that matches your record | `/find/` | Later, 4th card, default App Store |

## 3. Remaining Warnings And Why

`node scripts/validate-content-registry.js` now passes with 15 warnings, down from 20:

```text
- /blog/: no Best Next Step config yet; review before the page is considered complete
- /compare/: no Best Next Step config yet; review before the page is considered complete
- /privacy-policy/: no Best Next Step config yet; review before the page is considered complete
- /contact/: no Best Next Step config yet; review before the page is considered complete
- /solutions/client-payment-records/: App Store step "Track client records in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /solutions/temporary-financial-support-tracker/: App Store step "Save the support history in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /tools/payment-plan-calculator/: App Store step "Save the repayment plan in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /tools/temporary-financial-support-record-template/: App Store step "Save the support history in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /blog/how-to-track-money-between-roommates/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-split-rent-utilities-and-groceries-with-roommates/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-ask-someone-to-pay-you-back-without-being-rude/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-track-shared-expenses-without-constantly-reconciling-every-transaction/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-keep-track-of-money-between-family-members/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-split-expenses-in-a-relationship-without-fighting/: no Best Next Step config yet; review before the page is considered complete
- /blog/why-simple-loans-dont-stay-simple/: no Best Next Step config yet; review before the page is considered complete
```

Why these remain acceptable:

- Planned CPP warnings remain because the real CPP URLs do not exist yet. The registry keeps those CPP keys as `null` and falls back to the default App Store URL.
- `/privacy-policy/` and `/contact/` are legal/support surfaces.
- `/blog/`, `/compare/`, and the listed blog guides are lower-priority or hub/backlog BNS opportunities after this pass.

`node scripts/audit-content-routing.mjs` now passes with 7 warnings, down from 8:

```text
- /solutions/client-payment-records/: intended App Store CPP client-payment-records is planned; live app cards will fall back to the default App Store URL
- /solutions/temporary-financial-support-tracker/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /tools/payment-plan-calculator/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /tools/temporary-financial-support-record-template/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /blog/how-to-ask-family-for-temporary-financial-help/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /blog/how-to-support-someone-financially-without-confusion/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /blog/how-to-send-a-repayment-update-when-you-need-more-time/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
```

## 4. Partial Repayment Over-Link Warning

Fixed. The previous audit warning was:

```text
- /tools/partial-repayment-calculator/: registry has 18 related links; confirm the page is not over-linked
```

That warning no longer appears. The registry entry now keeps only 6 focused related paths:

- `/blog/how-to-follow-up-after-a-partial-repayment/`
- `/blog/when-to-ask-for-money-back-or-send-a-repayment-update/`
- `/blog/what-is-a-running-balance-between-two-people/`
- `/tools/repayment-receipt-generator/`
- `/tools/payment-plan-calculator/`
- `/solutions/app-to-track-money-owed/`

## 5. Running Balance Calculator First-Card Decision

Changed.

Previous first card:

- Send a repayment update or reminder -> `/blog/when-to-ask-for-money-back-or-send-a-repayment-update/`

New order:

1. Keep the running balance in You Owe Me -> `/solutions/app-to-track-money-owed/`
2. Send a repayment update or reminder -> `/blog/when-to-ask-for-money-back-or-send-a-repayment-update/`
3. Compare a calculator, spreadsheet, and app -> `/compare/`

Reason: after a running balance calculation, the strongest strategic next step is ongoing tracking because running balance is the product's core concept. Communication still remains second for users who only needed the amount in order to send an update.

## 6. Split Expense Calculator First-Card Decision

Changed, but the first card stayed the same.

Current order:

1. Share the split in a message -> `/tools/polite-payback-reminder-generator/`
2. Track repeated shared expenses -> `/solutions/shared-expense-tracker/`
3. Calculate a running balance -> `/tools/running-balance-calculator/`
4. Track shared expenses in You Owe Me -> active shared-expenses CPP

Reason: the page intent is a one-off split calculation, so the lowest-friction action is still sharing the result. The product path is now much stronger because repeated shared-expense tracking is second, running balance is third, and the app CTA appears later instead of first.

## 7. Hub Alignment Result

Checked `/find/`, `/solutions/`, and `/tools/` source/static output.

- `/find/`: newly important pages are represented in the existing hub cards, including compare pages, couples, family template, and quick start. BNS appears after the primary router cards and does not duplicate them confusingly; it acts as a concise next-step chooser.
- `/solutions/`: couples solution and family template are already represented in solution cards/support links. BNS appears after the solution router section and before broad supporting content, which is a reasonable placement.
- `/tools/`: groups still make sense after registry changes. BNS points to existing anchors `#calculate`, `#messages`, and `#records`, plus the repayment receipt tool. No planned pages are shown as live.

## 8. App Store CPP Routing State Confirmation

Active CPPs are still used only where real URLs exist:

- `money-owed-followups`
- `family-reimbursements`
- `roommates-shared-household-costs`
- `couples-relationship-spending`
- `shared-expenses-over-time`
- `elderly-parent-caregiving`

Planned CPP keys remain `null`, with no fake CPP URLs invented:

- `temporary-financial-support`
- `client-payment-records`
- `long-term-balances`

Default App Store remains:

- `general`

## 9. Static/Crawlable BNS Output Confirmation

Confirmed static marker and rendered section output:

| URL | Result |
|---|---|
| `/quick-start/` | BNS markers, rendered section, 4 cards |
| `/compare/splitwise-alternative/` | BNS markers, rendered section, 4 cards |
| `/compare/spreadsheet-vs-app-for-tracking-money-owed/` | BNS markers, rendered section, 4 cards |
| `/solutions/expense-tracker-for-couples/` | BNS markers, rendered section, 4 cards |
| `/tools/family-reimbursement-tracker-template/` | BNS markers, rendered section, 4 cards |
| `/tools/running-balance-calculator/` | BNS markers, rendered section, 3 cards |
| `/tools/split-expense-calculator/` | BNS markers, rendered section, 4 cards |

The generated BNS cards are static HTML anchors and therefore crawlable where the current architecture allows it.

## 10. Commands Run And Results

```text
node scripts/build-best-next-steps.mjs
=> Best Next Step modules built for 39 page(s); 0 file(s) changed.

node scripts/validate-content-registry.js
=> Content registry validation passed for 53 page(s), with 15 warning(s).

node scripts/audit-content-routing.mjs
=> Live route files: 53
=> Registry entries: 53
=> Sitemap URLs: 49
=> Strategic BNS URLs: 39
=> Hard errors: 0
=> Warnings: 7

node scripts/partial-repayment-calculator.test.js
=> partial-repayment-calculator tests passed

/Users/ievgeniiiablonskyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate-family-reimbursement-assets.py
=> validated workbook/csv/pdf/html downloads

git diff --check
=> passed, no whitespace errors
```

There is still no `package.json`, so there are no npm project scripts to run.

## 11. Git Diff Stat

```text
 .../index.html                                     |   32 +
 .../index.html                                     |   32 +
 .../index.html                                     |   32 +
 .../index.html                                     |   32 +
 compare/splitwise-alternative/index.html           |   32 +
 .../index.html                                     |   32 +
 content/content-registry.mjs                       | 1199 +++++++++++++++++++-
 docs/best-next-steps.md                            |    3 +
 find/index.html                                    |   32 +
 index.html                                         |   32 +
 quick-start/index.html                             |   32 +
 reviews/index.html                                 |   32 +
 solutions/expense-tracker-for-couples/index.html   |   32 +
 solutions/index.html                               |   32 +
 solutions/roommate-expense-tracker/index.html      |   32 +
 .../temporary-financial-support-tracker/index.html |   32 +
 .../index.html                                     |   32 +
 tools/payment-plan-calculator/index.html           |   32 +
 tools/polite-payback-reminder-generator/index.html |   32 +
 tools/repayment-receipt-generator/index.html       |   32 +
 tools/running-balance-calculator/index.html        |   19 +-
 tools/split-expense-calculator/index.html          |   20 +-
 .../index.html                                     |   32 +
 23 files changed, 1765 insertions(+), 84 deletions(-)
```

Note: `scripts/audit-content-routing.mjs` remains an untracked new file from the earlier registry/routing pass. The previous verification report markdown also remains untracked in the workspace.

## 12. Final Confirmations

Confirmed:

- No new pages were created.
- No full article rewrites were done.
- No title/meta CTR work was repeated.
- The running-balance pillar was not rebuilt again.
- No fake CPP URLs were invented.
- BNS modules remain static/crawlable.
- App CTAs are not pushed as the first card by default.
