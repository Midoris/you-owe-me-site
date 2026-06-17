# Registry / Routing / Best Next Step Verification Report

I did not make any new manual changes during verification. `node scripts/build-best-next-steps.mjs` reported `0 file(s) changed`.

## 1. Sitemap Mismatch

Audit counts are consistent:

- Live route files: `53`
- Registry entries: `53`
- Sitemap URLs: `49`

The 4 live routes missing from `sitemap.xml` are all `noindex`, so the omissions are intentional:

| Route | Status |
|---|---|
| `/contact/` | Intentional. `noindex, follow` support page. |
| `/events/live-link/` | Intentional. `noindex, follow` legacy redirect to `/`. |
| `/events/timeline/` | Intentional. `noindex, follow` legacy redirect to `/`. |
| `/redeem/` | Intentional. `noindex, follow` utility redemption page. |

## 2. Registry Validation Warnings

`node scripts/validate-content-registry.js` passed with these 20 warnings:

```text
- /quick-start/: no Best Next Step config yet; review before the page is considered complete
- /blog/: no Best Next Step config yet; review before the page is considered complete
- /compare/: no Best Next Step config yet; review before the page is considered complete
- /privacy-policy/: no Best Next Step config yet; review before the page is considered complete
- /contact/: no Best Next Step config yet; review before the page is considered complete
- /solutions/client-payment-records/: App Store step "Track client records in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /solutions/temporary-financial-support-tracker/: App Store step "Save the support history in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /solutions/expense-tracker-for-couples/: no Best Next Step config yet; review before the page is considered complete
- /tools/family-reimbursement-tracker-template/: no Best Next Step config yet; review before the page is considered complete
- /tools/payment-plan-calculator/: App Store step "Save the repayment plan in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /tools/temporary-financial-support-record-template/: App Store step "Save the support history in You Owe Me" falls back to the general App Store URL because the CPP mapping is missing
- /blog/how-to-track-money-between-roommates/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-split-rent-utilities-and-groceries-with-roommates/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-ask-someone-to-pay-you-back-without-being-rude/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-track-shared-expenses-without-constantly-reconciling-every-transaction/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-keep-track-of-money-between-family-members/: no Best Next Step config yet; review before the page is considered complete
- /blog/how-to-split-expenses-in-a-relationship-without-fighting/: no Best Next Step config yet; review before the page is considered complete
- /blog/why-simple-loans-dont-stay-simple/: no Best Next Step config yet; review before the page is considered complete
- /compare/spreadsheet-vs-app-for-tracking-money-owed/: no Best Next Step config yet; review before the page is considered complete
- /compare/splitwise-alternative/: no Best Next Step config yet; review before the page is considered complete
```

## 3. Routing Audit Warnings

`node scripts/audit-content-routing.mjs` passed with 0 hard errors and these 8 warnings:

```text
- /solutions/client-payment-records/: intended App Store CPP client-payment-records is planned; live app cards will fall back to the default App Store URL
- /solutions/temporary-financial-support-tracker/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /tools/payment-plan-calculator/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /tools/partial-repayment-calculator/: registry has 18 related links; confirm the page is not over-linked
- /tools/temporary-financial-support-record-template/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /blog/how-to-ask-family-for-temporary-financial-help/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /blog/how-to-support-someone-financially-without-confusion/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
- /blog/how-to-send-a-repayment-update-when-you-need-more-time/: intended App Store CPP temporary-financial-support is planned; live app cards will fall back to the default App Store URL
```

## 4. 34 Strategic BNS URLs

| URL | Type | Cluster | First card | Destination | Why lowest-friction | App CTA |
|---|---|---|---|---|---|---|
| `/` | home | homepage | Find your money situation | `/find/` | Helps choose the right path before committing. | Not at all |
| `/find/` | hub | homepage | Track money owed between people | `/solutions/app-to-track-money-owed/` | Best general record route for owed-money use cases. | Not at all |
| `/solutions/` | hub | money-owed | Find the closest money situation | `/find/` | Lets overlapping situations self-sort first. | Not at all |
| `/tools/split-expense-calculator/` | tool | shared-expenses | Share the split in a message | `/tools/polite-payback-reminder-generator/` | Amount is known; wording is next. | Not at all |
| `/blog/how-do-you-confront-someone-who-owes-you-money-without-ruining-the-relationship/` | guide | money-owed | Try a polite reminder first | `/blog/how-to-remind-someone-they-owe-you-money-politely/` | Softest next step before escalation. | Not at all |
| `/tools/running-balance-calculator/` | tool | running-balance | Send a repayment update or reminder | `/blog/when-to-ask-for-money-back-or-send-a-repayment-update/` | Balance is clear; communication is next. | Not at all |
| `/blog/what-is-a-running-balance-between-two-people/` | guide | running-balance | Calculate a running balance | `/tools/running-balance-calculator/` | Turns concept into a number. | Not at all |
| `/tools/partial-repayment-calculator/` | tool | repayments | Confirm a payment that already happened | `/tools/repayment-receipt-generator/` | Payment event is done; receipt is next. | Later |
| `/solutions/client-payment-records/` | solution | client-records | Calculate a changing client balance | `/tools/running-balance-calculator/` | Establishes current amount before follow-up. | Later |
| `/blog/how-to-remind-someone-they-owe-you-money-politely/` | guide | money-owed | Generate a polite reminder | `/tools/polite-payback-reminder-generator/` | Converts advice into a usable message. | Not at all |
| `/blog/how-to-politely-say-no-when-people-ask-for-money/` | guide | temporary-support | Use a clear no script | `#polite-no-scripts` | Keeps the user on-page for immediate scripts. | Not at all |
| `/solutions/app-to-track-money-owed/` | solution | money-owed | Calculate a changing balance | `/tools/running-balance-calculator/` | Clarifies amount before app action. | Later |
| `/solutions/temporary-financial-support-tracker/` | solution | temporary-support | Create a temporary support record | `/tools/temporary-financial-support-record-template/` | Written record before app save. | Later |
| `/blog/how-to-track-money-you-pay-for-elderly-parents/` | guide | caregiving | Download the family reimbursement template | `/tools/family-reimbursement-tracker-template/` | Manual record is the lowest lift. | Not at all |
| `/solutions/shared-expense-tracker/` | solution | shared-expenses | Split one shared expense | `/tools/split-expense-calculator/` | Solves the immediate calculation first. | Later |
| `/solutions/roommate-expense-tracker/` | solution | roommates | Calculate this month's roommate bills | `/tools/roommate-bill-split-calculator/` | Month-end settle-up is the concrete task. | Later |
| `/tools/roommate-bill-split-calculator/` | tool | roommates | Write a roommate-safe settle-up message | `/tools/polite-payback-reminder-generator/` | Amount is known; message is next. | Not at all |
| `/tools/` | hub | tools | Calculate a bill, balance, or partial repayment | `#calculate` | Keeps tool choice inside the hub. | Not at all |
| `/tools/payment-plan-calculator/` | tool | repayments | Track temporary support over time | `/solutions/temporary-financial-support-tracker/` | Plan belongs in an ongoing support record. | Later |
| `/tools/temporary-financial-support-record-template/` | tool | temporary-support | Create a repayment plan | `/tools/payment-plan-calculator/` | Record exists; repayment schedule is next. | Later |
| `/tools/repayment-receipt-generator/` | tool | repayments | Calculate what is still open | `/tools/partial-repayment-calculator/` | Remaining balance must be clear. | Not at all |
| `/tools/polite-payback-reminder-generator/` | tool | repayments | Compare ready-made reminder examples | `/tools/repayment-reminder-text-examples/` | Lets user choose wording before sending. | Not at all |
| `/solutions/family-reimbursement-tracker/` | solution | family | Start with a family reimbursement template | `/tools/family-reimbursement-tracker-template/` | Manual template before app workflow. | Later |
| `/solutions/elderly-parent-expense-tracker/` | solution | caregiving | Start with a manual parent-expense record | `/tools/family-reimbursement-tracker-template/` | Low-friction record for parent costs. | Not at all |
| `/blog/how-to-track-subscriptions-and-bills-you-pay-for-family/` | guide | family | Start with a family reimbursement template | `/tools/family-reimbursement-tracker-template/` | Recurring bills need a simple record first. | Later |
| `/blog/how-to-ask-family-for-temporary-financial-help/` | guide | temporary-support | Create a temporary support record | `/tools/temporary-financial-support-record-template/` | Captures agreed support details. | Not at all |
| `/blog/how-to-support-someone-financially-without-confusion/` | guide | temporary-support | Create a support record | `/tools/temporary-financial-support-record-template/` | Makes help concrete and trackable. | Not at all |
| `/blog/how-to-send-a-repayment-update-when-you-need-more-time/` | guide | temporary-support | Create a realistic repayment plan | `/tools/payment-plan-calculator/` | Plan comes before update wording. | Not at all |
| `/blog/how-to-follow-up-after-a-partial-repayment/` | guide | repayments | Calculate what remains | `/tools/partial-repayment-calculator/` | Current balance before message. | Not at all |
| `/tools/repayment-reminder-text-examples/` | tool | repayments | Generate a repayment reminder | `/tools/polite-payback-reminder-generator/` | Examples turn into custom copy. | Not at all |
| `/blog/how-to-handle-awkward-money-conversations/` | guide | money-owed | Remind someone they owe you money | `/blog/how-to-remind-someone-they-owe-you-money-politely/` | Starts with the closest practical guide. | Not at all |
| `/features/` | feature | features | Understand one balance per person | `/blog/what-is-a-running-balance-between-two-people/` | Explains the core app concept first. | Not at all |
| `/reviews/` | reviews | reviews | Match your situation to the right page | `/find/` | Reviews are trust proof; route next. | Not at all |
| `/blog/when-to-ask-for-money-back-or-send-a-repayment-update/` | guide | repayments | Send a polite repayment reminder | `/tools/polite-payback-reminder-generator/` | Clear amount can become a message. | Not at all |

## 5. Strategic/Semi-Strategic Pages Without BNS

These are intentionally left as warnings/backlog, except noindex/support pages where omission is intentional:

| URL | Decision |
|---|---|
| `/quick-start/` | Consider later; core conversion/onboarding page needs a more app-led module. |
| `/blog/` | Consider later; hub navigation exists, but no BNS module yet. |
| `/compare/` | Consider later; compare hub needs a compare-specific router. |
| `/privacy-policy/` | Intentional; legal/support surface. |
| `/contact/` | Intentional; noindex support page. |
| `/solutions/expense-tracker-for-couples/` | Consider later; couples cluster not in this BNS pass. |
| `/tools/family-reimbursement-tracker-template/` | Consider later; core tool/template should get a follow-up module. |
| `/blog/how-to-track-money-between-roommates/` | Consider later; roommate guide backlog. |
| `/blog/how-to-split-rent-utilities-and-groceries-with-roommates/` | Consider later; roommate guide backlog. |
| `/blog/how-to-ask-someone-to-pay-you-back-without-being-rude/` | Consider later; overlaps money-owed reminder flow. |
| `/blog/how-to-track-shared-expenses-without-constantly-reconciling-every-transaction/` | Consider later; shared-expense guide backlog. |
| `/blog/how-to-keep-track-of-money-between-family-members/` | Consider later; family guide backlog. |
| `/blog/how-to-split-expenses-in-a-relationship-without-fighting/` | Consider later; couples guide backlog. |
| `/blog/why-simple-loans-dont-stay-simple/` | Consider later; long-term balance CPP is still planned. |
| `/compare/spreadsheet-vs-app-for-tracking-money-owed/` | Consider later; compare page should get method-choice routing. |
| `/compare/splitwise-alternative/` | Consider later; compare page should get product-choice routing. |
| `/events/live-link/` | Intentional; noindex legacy redirect. |
| `/events/timeline/` | Intentional; noindex legacy redirect. |
| `/redeem/` | Intentional; single-purpose noindex redemption page. |

## 6. Static Hubs

`/find/` and `/solutions/` were updated by the generator with static BNS HTML plus the BNS stylesheet. Their existing hub card grids were not manually rewritten.

`/tools/` was not changed in the current diff; it already had static BNS output aligned with the registry, and audit/build confirmed it.

## 7. App Store Routing States

### Active CPPs

| Key | Cluster | URL |
|---|---|---|
| `money-owed-followups` | money-owed | Real CPP URL present |
| `family-reimbursements` | family | Real CPP URL present |
| `roommates-shared-household-costs` | roommates | Real CPP URL present |
| `couples-relationship-spending` | couples | Real CPP URL present |
| `shared-expenses-over-time` | shared-expenses | Real CPP URL present |
| `elderly-parent-caregiving` | caregiving | Real CPP URL present |

### Planned CPPs

| Key | Cluster | URL |
|---|---|---|
| `temporary-financial-support` | temporary-support | `null` |
| `client-payment-records` | client-records | `null` |
| `long-term-balances` | long-term-balances | `null` |

### Default App Store

| Key | Cluster | URL |
|---|---|---|
| `general` | general | Default App Store URL |

Confirmed: no fake CPP URL was added for any planned CPP. Planned CPP cards fall back to the default App Store URL.

## 8. Over-Linked Warning

Exact warning:

```text
- /tools/partial-repayment-calculator/: registry has 18 related links; confirm the page is not over-linked
```

The URL is `/tools/partial-repayment-calculator/`, with `18` registry related links. I left this as a warning because it is not a broken route or invalid link; it is an editorial density concern. Fixing it would require pruning relationship strategy, not a hard correctness patch.

## 9. Static HTML BNS Output Confirmed

Each of these has BNS markers, a rendered `<section class="best-next-step...">`, and 4 cards:

| URL | Result |
|---|---|
| `/` | Present |
| `/find/` | Present |
| `/solutions/` | Present |
| `/tools/` | Present |
| `/reviews/` | Present |
| `/solutions/temporary-financial-support-tracker/` | Present |
| `/tools/payment-plan-calculator/` | Present |
| `/solutions/roommate-expense-tracker/` | Present |
| `/blog/how-to-track-subscriptions-and-bills-you-pay-for-family/` | Present |

## 10. Build/Test/Validation Sequence

There is no `package.json`, so there is no npm build/test script to run. I ran the local validation surface present in the repo:

```text
node scripts/build-best-next-steps.mjs
=> Best Next Step modules built for 34 page(s); 0 file(s) changed.

node scripts/validate-content-registry.js
=> passed for 53 page(s), with 20 warnings.

node scripts/audit-content-routing.mjs
=> 53 live routes, 53 registry entries, 49 sitemap URLs, 34 strategic BNS URLs, 0 hard errors, 8 warnings.

node scripts/partial-repayment-calculator.test.js
=> partial-repayment-calculator tests passed.

python3 scripts/validate-family-reimbursement-assets.py
=> failed on system Python: ModuleNotFoundError: No module named 'openpyxl'.

/Users/ievgeniiiablonskyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate-family-reimbursement-assets.py
=> validated workbook/csv/pdf/html downloads.

git diff --check
=> passed, no whitespace errors.
```

## 11. Git Diff Stat And File Summary

`git diff --stat`:

```text
16 files changed, 1278 insertions(+), 2 deletions(-)
```

Tracked changed files:

- 14 HTML files: generated static BNS block and stylesheet link where needed.
- `content/content-registry.mjs`: registry/routing/BNS metadata expanded.
- `docs/best-next-steps.md`: audit command documented.

Untracked new file:

```text
scripts/audit-content-routing.mjs | 447 insertions(+)
```

Short file summary:

- `content/content-registry.mjs`: added CPP routing states, analytics/conversion metadata, strategic BNS URL list, BNS defaults, and page-specific BNS routing.
- `docs/best-next-steps.md`: added routing audit command and purpose.
- `scripts/audit-content-routing.mjs`: new hard-error/warning audit for routes, registry coverage, sitemap, hub links, BNS output, and App Store routing.
- Changed HTML files: generated crawlable BNS sections only; no full-page rewrites.

## 12. Final Confirmations

Confirmed:

- No new pages were created.
- No full article rewrites were done.
- No title/meta CTR work was repeated.
- The running balance pillar was not rebuilt again.
- No fake CPP URLs were invented.
- BNS modules are crawlable/static where the current architecture allows it.
- BNS first cards follow lowest-friction useful-action logic: choose route, calculate amount, create record, or write message before pushing app download.
