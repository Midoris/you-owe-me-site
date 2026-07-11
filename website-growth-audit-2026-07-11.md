# You Owe Me website growth audit — 2026-07-11

Audit scope: Google Search Console exports, the complete repository, every production route, sitemap/robots/canonical/structured-data systems, internal routing, Best Next Step modules, App Store Custom Product Page routing, and representative desktop/mobile rendering. This is a recommendation-only report; no production, content, metadata, route, configuration, or application files were changed.

## 1. Executive verdict

The foundation is strong. The site is technically crawlable, internally coherent, unusually practical for its category, and already gaining material search visibility. Production has 71 live routes: 67 indexable URLs, all 67 present in the sitemap, and four intentional noindex support/legacy routes. The production crawl found no broken route, no broken internal link, no incorrect indexable canonical, no sitemap drift, no duplicate acquisition title/description, no structured-data parse error, and no App Store CPP mismatch. Repository validators also returned zero hard errors.

The strongest assets are the direct-answer guides, genuinely usable calculators/generators/templates, the content registry, the situation-first `/find/` router, the Best Next Step system, the 11 cluster-specific App Store destinations plus default route, the reviews/privacy trust surfaces, and a clear category statement: an iPhone app for “money between people.” The site is not a loose article collection; the clusters and next steps form a real acquisition system.

The largest growth weakness is not missing content or technical repair. It is that several high-impression pages rank well enough to be seen but under-earn clicks, while the supplied exports do not join queries to pages and no App Store/CPP conversion export was supplied. The biggest immediate opportunity is therefore **careful snippet/intent improvement on a handful of existing pages, followed by conversion measurement**, not a broad rewrite. The current priority order should be: CTR improvement → page/query intent validation → conversion measurement → selective ranking improvement → entity consistency. Technical repair, consolidation, and new content are not current priorities.

“Money between people” is positioned clearly enough to be differentiated. The homepage, `/find/`, `llms.txt`, solution pages, product schema, and trust pages explain that You Owe Me is an iPhone record/communication tool—not a bank, lender, payment processor, debt collector, or accounting system. The main qualitative clarity gap is visible product-name variation between “You Owe Me,” “YouOweMe,” and “Loan Tracker: You Owe Me.” Normalize primary visible naming on core product pages while keeping the concatenated name as an alternate search/entity alias.

## 2. Search Console data summary

### Exact export scopes

| Export | Actual date range | Days | Search type | Dimensions/worksheets |
|---|---:|---:|---|---|
| “last 28 days” | 2026-06-11 to 2026-07-08 | 28 | Web | Chart/Dates, Queries, Pages, Countries, Devices, Search appearance, Filters |
| “last 3 months” | 2026-04-09 to 2026-07-08 | 91 | Web | Chart/Dates, Queries, Pages, Countries, Devices, Search appearance, Filters |

No country, device, page, or query filter was applied. The filenames accurately describe relative windows, but the report uses the dates inside the workbooks.

### Property-level performance

| Period | Clicks | Impressions | CTR | Avg. position |
|---|---:|---:|---:|---:|
| Recent 28 days | 392 | 39,392 | 1.00% | 6.98 |
| Previous 28 days derivable from the 91-day daily series (2026-05-14 to 2026-06-10) | 82 | 8,899 | 0.92% | 9.82 |
| Full 91 days | 495 | 50,308 | 0.98% | 7.71 |

Recent versus previous 28 days: clicks increased 378%, impressions 343%, CTR improved about 8% relative, and average position improved 2.84 positions. This is a real property-level acceleration because it is derived from comparable daily rows. It does not prove that any specific edit caused the gain.

### Export structure and limitations

- Recent rows: 493 queries, 62 pages, 195 countries, three devices, and two search-appearance rows. Baseline rows: 574 queries, 63 pages, 204 countries, three devices, and two search-appearance rows.
- The recent Query sheet accounts for only 57 clicks and 8,568 impressions versus property totals of 392 and 39,392. Most property activity is not exposed at query level, consistent with Search Console privacy/aggregation limits. Query-cluster totals in this report are therefore partial.
- The recent Page sheet sums to 395 clicks and 41,962 impressions, above property totals. Page rows are not additive to property totals because Search Console aggregation differs by dimension. Use each page row as page evidence, not as a site total.
- There is no query-to-page join. Observed query themes are never presented here as proof that a particular URL ranked for a particular query.
- There is no measured generative-AI referral/citation export. AI findings below are qualitative website-readiness findings, not measured AI-search performance.
- The 91-day Page/Query aggregates contain the recent 28 days. Subtracting recent counts gives an earlier 63-day remainder; per-day rate comparisons are useful directionally but are not exact equal-period page comparisons.

### Device, country, appearance, and brand observations

- Mobile generated 315 clicks and 27,236 impressions (80.4% of clicks; 69.1% of impressions), with 1.16% CTR and position 5.99. Desktop generated 72 clicks and 11,894 impressions, with 0.61% CTR and position 9.28. Mobile-first snippets and UX deserve priority.
- The United States led with 163 clicks / 17,459 impressions; the United Kingdom 43 / 2,633; Nigeria 29 / 2,608; Australia 16 / 1,082. No country-specific change currently justifies localized content.
- Review snippets produced 2 clicks from 82 impressions; translated results produced 0 from 4. This is too small for a schema strategy change.
- A strict visible branded-query grouping produced 16 clicks / 175 impressions / 9.14% CTR in the recent Query export. Visible non-branded queries produced 41 / 8,393 / 0.49%. Branded visibility is healthy but small; non-branded acquisition is the larger opportunity.

### Strongest recent landing pages

| Page | Clicks | Impressions | CTR | Position | Verdict |
|---|---:|---:|---:|---:|---|
| `/blog/how-to-remind-someone-they-owe-you-money-politely/` | 124 | 12,973 | 0.96% | 6.04 | Strong asset; preserve title/H1/opening/BNS |
| `/tools/split-expense-calculator/` | 61 | 6,199 | 0.98% | 6.95 | Strong tool; controlled snippet test only |
| `/` | 68 | 3,881 | 1.75% | 6.21 | Strong router/category page |
| `/blog/how-to-politely-say-no-when-people-ask-for-money/` | 23 | 4,712 | 0.49% | 7.38 | Meaningful CTR opportunity |
| `/blog/what-is-a-running-balance-between-two-people/` | 17 | 4,252 | 0.40% | 5.56 | Highest-confidence snippet/intent opportunity |
| `/solutions/app-to-track-money-owed/` | 41 | 2,018 | 2.03% | 7.20 | Strong commercial landing page; protect |
| `/tools/payment-plan-calculator/` | 10 | 566 | 1.77% | 7.40 | Strong emerging tool |
| `/tools/roommate-bill-split-calculator/` | 7 | 518 | 1.35% | 8.79 | Healthy; keep maturing |

No established ≥50-impression page showed a clear recent impressions/day decline in the subtraction-based directional view. The blog hub was nearly flat (1.13×), while many newer pages had all or nearly all visibility in the recent window. Do not describe recent-only pages as failures.

### Visible query themes (partial, whole property)

| Theme | Visible recent queries | Clicks | Impressions | CTR | Position | Interpretation |
|---|---:|---:|---:|---:|---:|---|
| Running balance | 38 | 8 | 2,648 | 0.30% | 5.43 | Large, high-ranking, mixed generic/bank/two-person intent; snippet clarity matters |
| Repayment reminders / asking back | 70 | 16 | 1,765 | 0.91% | 8.16 | Strong topic demand; several distinct page formats must stay differentiated |
| Who owes whom / tracking owed money | 64 | 15 | 1,086 | 1.38% | 8.05 | Good product-category fit |
| Saying no / borrowing boundaries | 32 | 1 | 508 | 0.20% | 9.68 | Search promise likely underperforming |
| Product-name / app ambiguity | 26 | 21 | 1,236 | 1.70% | 6.28 | Includes “owe you app” ambiguity; supports clear entity naming |

## 3. Immediate high-confidence wins

| Page/system | Problem and evidence | Exact action | Benefit | Priority | Confidence | Effort | Files |
|---|---|---|---|---|---|---|---|
| Running-balance definition page | 4,252 impressions, 0.40% CTR, position 5.56; visible query theme is heavily generic/bank-adjacent | Keep title/H1/body; replace only the meta description with the proposed wording in section 7; measure 28 days | Better SERP intent clarity without risking rankings | P1 | High | XS | `blog/what-is-a-running-balance-between-two-people/index.html` |
| Ask-for-payback guide | Recent-only 190 impressions, zero clicks, position 8.54; title carries a low-value brand/blog suffix | Remove the suffix and use the exact H1 as the title | Less truncation and a clearer promise | P1 | High | XS | `blog/how-to-ask-someone-to-pay-you-back-without-being-rude/index.html` |
| Family-help guide | 312 impressions, zero clicks, position 7.53; title says broad “money help” while H1/job are “temporary financial help” | Align title to the specific job; keep scripts/body/BNS/CPP | Better intent qualification and CTR | P1 | Medium-high | XS | `blog/how-to-ask-family-for-temporary-financial-help/index.html` |
| Homepage hero proof list | Desktop production rendering visually detaches the fourth proof bullet/link; homepage is the second-largest click source | Fix only the proof-list layout and regression-test desktop plus 390 px mobile | Better first-screen comprehension | P2 | High | S | `index.html`, `styles/landing.css` |

Do not bundle these with full-page rewrites. Change one search-result variable per page, annotate the deployment date, and compare the next complete 28-day window.

## 4. Top 10 overall opportunities

| # | Page/system | Evidence/problem | Recommended action | Business benefit | Confidence | Effort | Priority | Timing |
|---:|---|---|---|---|---|---|---|---|
| 1 | Running-balance definition | 4,252 impressions, 0.40% CTR, position 5.56; 2,648 visible theme impressions at position 5.43 | Clarify meta description for general bank/ledger plus two-person meaning; preserve title/body | More qualified organic clicks | High | XS | P1 | Now |
| 2 | Split expense calculator | 6,199 impressions, 0.98% CTR, position 6.95; excellent tool/UX | After page-query export, test “Free … See Who Owes What” title only | CTR and tool starts | Medium-high | XS | P1 | After data |
| 3 | Saying-no guide | 4,712 impressions, 0.49% CTR, position 7.38 | Test query-natural title; keep scripts and calm tone | More clicks from a proven topic | Medium-high | XS | P1 | Now, one-variable test |
| 4 | Family-help guide | 312 impressions, zero clicks, position 7.53 | Align title to “temporary financial help” and examples | Better intent match | Medium-high | XS | P1 | Now |
| 5 | Ask-for-payback guide | 190 recent-only impressions, zero clicks, position 8.54 | Remove brand/blog suffix; preserve distinct job from reminder guide | Better CTR and less truncation | High | XS | P1 | Now |
| 6 | Conversion feedback loop | App Store click tracking and CPP metadata exist, but no export was supplied | Analyze page → CTA location → intended CPP → App Store open → CPP conversion | Optimize for qualified downloads, not clicks alone | High | S (analysis) | P1 | Now |
| 7 | Product entity naming | 287 `YouOweMe` occurrences across 32 HTML files; canonical human/product name is “You Owe Me” / “Loan Tracker: You Owe Me” | Normalize core visible surfaces; retain `YouOweMe` as alternateName/alias | Better trust and machine entity clarity | High qualitative | M | P2 | Next batch |
| 8 | Four solution pages | Shared, roommate, couples, and client pages have 947 combined recent impressions and zero clicks; positions 11–23 | Obtain page-filtered queries, then sharpen only the one-time-tool-versus-ongoing-record decision where confirmed | Better rankings/CTR and more qualified CPP traffic | Medium | M | P2 | After data |
| 9 | Homepage above-fold QA | Desktop proof-list defect; mobile drives 80.4% of clicks and has no horizontal overflow | Fix desktop component, add desktop/mobile visual regression check | Better category comprehension and trust | High | S | P2 | Now |
| 10 | Low-risk technical hygiene | Legacy event URLs are 200 client redirects; 21 pages use external App Store badge images without explicit dimensions | Convert legacy redirects when hosting config is touched; add stable badge dimensions only if CWV/layout data supports it | Cleaner semantics / lower CLS risk | High technically, low growth impact | S | P3 | Later |

New content is deliberately absent from the top 10. Existing pages are gaining visibility, and no missing page passed the unique-job + evidence + non-cannibalization test.

## 5. Complete URL inventory

Legend: Search is recent clicks/impressions/position; “none” means no row in the recent Page export, not necessarily no Google visibility.

| URL | Type | Indexable | Sitemap | Search | Primary intent / parent | Review | Disposition |
|---|---|---:|---:|---:|---|---|---|
| `/` | home | Yes | Yes | 68/3,881/p6.21 | Introduces You Owe Me as a clear way to track what was paid, repaid, and still open between people. Parent: `/` | Complete | Improve |
| `/blog/` | hub | Yes | Yes | 0/56/p6.59 | Collects answer pages for reminders, repayment updates, family support, roommate costs, and shared expense clarity. Parent: `/` | Complete | Keep unchanged |
| `/blog/am-i-wrong-for-asking-for-my-money-back/` | guide | Yes | Yes | 0/6/p5.33 | Helps someone decide whether it is fair to ask for money back, what to clarify first, and how to ask calmly without turning the relationship tense. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/can-one-person-track-shared-money-without-everyone-installing-an-app/` | guide | Yes | Yes | 0/42/p11.21 | Explains how one person can keep a clear record of shared money, repayments, group paybacks, and running balances, then share the current state through a message, receipt, PDF statement, screenshot, or Live Link. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-do-you-confront-someone-who-owes-you-money-without-ruining-the-relationship/` | guide | Yes | Yes | 4/803/p7.62 | Helps someone approach unpaid money with private scripts, ignored-reminder handling, calm escalation, and boundary-setting without public shaming or threats. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-ask-family-for-temporary-financial-help/` | guide | Yes | Yes | 0/312/p7.53 | Helps someone ask for temporary support with clear expectations, check-ins, and respectful wording. Parent: `/blog/` | Complete | Improve |
| `/blog/how-to-ask-someone-to-pay-you-back-without-being-rude/` | guide | Yes | Yes | 0/190/p8.54 | Shows how to ask for money back with specific wording, context, and a respectful tone. Parent: `/blog/` | Complete | Improve |
| `/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/` | guide | Yes | Yes | 0/15/p7.00 | Helps a person ask a friend for money clearly, respectfully, and without pressure before money moves. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-clarify-if-money-was-a-gift-or-a-loan/` | guide | Yes | Yes | none | Helps two people clarify whether money that already changed hands was a gift, fully repayable, partly repayable, flexible support, or still unresolved before either person records an outstanding balance. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-follow-up-after-a-partial-repayment/` | guide | Yes | Yes | 0/36/p5.00 | Helps someone acknowledge a partial repayment while keeping the remaining balance clear. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-handle-a-friend-who-keeps-borrowing-money/` | guide | Yes | Yes | 0/3/p1.00 | Helps someone separate a current borrowing request from the larger pattern, choose a boundary, write down any open amount, and decide whether a clear record or repayment plan is needed. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-handle-awkward-money-conversations/` | guide | Yes | Yes | 0/30/p9.53 | Gives a broad, relationship-safe framework for common money conversations between people. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-keep-track-of-money-between-family-members/` | guide | Yes | Yes | 0/49/p8.47 | Explains how family members can keep money records clear without making the relationship feel transactional. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-keep-track-of-who-owes-you-money/` | guide | Yes | Yes | 3/77/p16.73 | Shows the minimum record needed to track who owes whom, what the money was for, what has already been repaid, and what is still open now. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-politely-say-no-when-people-ask-for-money/` | guide | Yes | Yes | 23/4,712/p7.38 | Helps someone set a clear boundary with calm wording and less guilt. Parent: `/blog/` | Complete | Improve |
| `/blog/how-to-remind-a-group-to-pay-you-back-without-spamming-everyone/` | guide | Yes | Yes | none | Gives a group payback communication workflow: one neutral group update, then private follow-ups for open balances, partial payments, and payment confirmations. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-remind-someone-they-owe-you-money-politely/` | guide | Yes | Yes | 124/12,973/p6.04 | Helps someone choose a calm way to remind another person about money owed. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-send-a-repayment-update-when-you-need-more-time/` | guide | Yes | Yes | 1/94/p10.05 | Helps someone send a clear, respectful update when repayment timing changes. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-split-a-bill-fairly-when-one-person-ordered-less/` | guide | Yes | Yes | none | Helps a group choose between an equal, itemized, hybrid, or separate-check split when personal orders differ, then move from the agreed shares to calculation and payback tracking without blame. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-split-costs-when-people-pay-at-different-times/` | guide | Yes | Yes | 0/114/p8.66 | Helps readers decide whether they need a split calculator, one-time settlement, running balance, group payback record, partial repayment calculation, or ongoing You Owe Me record. Parent: `/blog/` | Complete | Investigate |
| `/blog/how-to-split-expenses-in-a-relationship-without-fighting/` | guide | Yes | Yes | 0/43/p14.86 | Helps couples choose a calmer way to split costs, track covered expenses, and discuss balances. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-split-rent-utilities-and-groceries-with-roommates/` | guide | Yes | Yes | 2/148/p10.57 | Helps roommates choose fair bill-splitting rules before calculating or tracking balances. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-suggest-a-repayment-plan-to-someone-who-owes-you-money/` | guide | Yes | Yes | none | Helps someone turn an acknowledged open balance into a realistic repayment plan without dictating terms, repeating vague reminders, or relying on memory. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-support-someone-financially-without-confusion/` | guide | Yes | Yes | none | A helper-side guide for supporting someone financially while keeping gift vs repayment expectations, check-ins, partial repayments, and records clear without making the relationship awkward. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-track-money-between-roommates/` | guide | Yes | Yes | 0/57/p27.09 | Explains how roommates can track bills, repayments, previous balances, and settle-ups without rebuilding the month from memory. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-track-money-you-pay-for-elderly-parents/` | guide | Yes | Yes | 2/86/p11.03 | Helps someone keep parent-related costs, sibling shares, repayments, and remaining balances clear. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-track-shared-expenses-without-constantly-reconciling-every-transaction/` | guide | Yes | Yes | 0/38/p16.32 | Explains how a running balance can reduce constant settle-ups after every shared expense. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-track-subscriptions-and-bills-you-pay-for-family/` | guide | Yes | Yes | 0/75/p14.55 | Recurring family bills and subscriptions become hard to track when one person pays first, reimbursements happen later, sibling shares are unclear, and monthly charges repeat silently. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/how-to-track-who-paid-you-back-for-a-group-expense/` | guide | Yes | Yes | 0/103/p9.54 | Turns a delayed group payback into one clear record showing each person's share, what they paid back, what is still open, and what message to send next. Parent: `/blog/` | Complete | Investigate |
| `/blog/i-pay-more-than-my-partner/` | guide | Yes | Yes | 0/57/p17.98 | Helps someone who feels like the default payer decide what the imbalance means before choosing a calculator, running balance, temporary support record, or app workflow. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/what-is-a-running-balance-between-two-people/` | guide | Yes | Yes | 17/4,252/p5.56 | Explains why one running balance is clearer than scattered individual IOUs. Parent: `/blog/` | Complete | Improve |
| `/blog/when-to-ask-for-money-back-or-send-a-repayment-update/` | guide | Yes | Yes | 0/54/p6.98 | Helps someone choose the right next message based on timing, role, and relationship context. Parent: `/blog/` | Complete | Keep unchanged |
| `/blog/why-simple-loans-dont-stay-simple/` | guide | Yes | Yes | 0/5/p5.80 | Explains why partial repayments, changing timing, and new expenses can make an arrangement unclear without a record. Parent: `/blog/` | Complete | Keep unchanged |
| `/compare/` | hub | Yes | Yes | 0/70/p10.21 | Collects comparison pages for choosing between spreadsheets, shared expense apps, calculators, templates, and You Owe Me. Parent: `/` | Complete | Keep unchanged |
| `/compare/best-way-to-track-ious-between-people/` | compare | Yes | Yes | 1/102/p9.28 | Helps the reader choose between notes, chat history, spreadsheets, payment history, calculators, split apps, and You Owe Me for tracking who owes whom. Parent: `/compare/` | Complete | Keep unchanged |
| `/compare/shared-expense-app-vs-running-balance-app/` | compare | Yes | Yes | 0/85/p14.64 | Helps the reader choose between a shared ledger app, shared expense app, and running balance app after household expenses, repayments, partial payments, recurring costs, and group paybacks change what is still owed. Parent: `/compare/` | Complete | Keep unchanged |
| `/compare/splitwise-alternative/` | compare | Yes | Yes | 1/300/p19.57 | Compares Splitwise-style group ledgers with You Owe Me for ongoing expenses, Group Paybacks, per-person balances, partial repayments, repayment history, Live Links, and calmer follow-ups. Parent: `/compare/` | Complete | Investigate |
| `/compare/spreadsheet-vs-app-for-tracking-money-owed/` | compare | Yes | Yes | 0/57/p12.26 | Helps someone track who owes them money without spreadsheets when repayments, reminders, recurring costs, and changing balances need a clearer record. Parent: `/compare/` | Complete | Keep unchanged |
| `/contact/` | support | No | No | none | Gives users a clear support path when they need help from the You Owe Me team. Parent: `/` | Complete | Keep noindex |
| `/events/live-link/` | support | No | No | none | Redirects old event traffic to the main You Owe Me website. Parent: `/` | Complete | Keep noindex; later server redirect |
| `/events/timeline/` | support | No | No | none | Redirects old event traffic to the main You Owe Me website. Parent: `/` | Complete | Keep noindex; later server redirect |
| `/features/` | feature | Yes | Yes | 4/303/p7.04 | Explains the app features that help keep balances, entries, Group Paybacks, reminders, statements, and timelines clear. Parent: `/` | Complete | Improve |
| `/find/` | hub | Yes | Yes | 3/174/p6.80 | Helps visitors choose the right guide, tool, solution, feature, or app path for a money-between-people situation, including Group Paybacks. Parent: `/` | Complete | Keep unchanged |
| `/privacy-and-data/` | feature | Yes | Yes | 0/18/p4.06 | Explains local records, iCloud sync, optional Cloud Accounts, Live Links, statement links, AI features, reminders, exports, App Lock, support, and privacy policy boundaries. Parent: `/features/` | Complete | Keep unchanged |
| `/privacy-policy/` | legal | Yes | Yes | none | Explains how the app and website handle privacy-sensitive information. Parent: `/` | Complete | Keep unchanged |
| `/quick-start/` | quick-start | Yes | Yes | 0/56/p5.27 | Explains how one running balance, entries, repayments, reminders, and timelines work together. Parent: `/` | Complete | Improve |
| `/redeem/` | support | No | No | none | Explains how to redeem an app code through the App Store. Parent: `/` | Complete | Keep noindex |
| `/reviews/` | reviews | Yes | Yes | 4/406/p7.87 | Shows how people use You Owe Me for IOUs, family reimbursements, shared expenses, reminders, and repayment history. Parent: `/` | Complete | Keep unchanged |
| `/solutions/` | hub | Yes | Yes | 1/88/p10.00 | Organizes the main real-life situations You Owe Me supports, from family reimbursements to roommate bills and shared expenses. Parent: `/` | Complete | Keep unchanged |
| `/solutions/app-to-track-money-owed/` | solution | Yes | Yes | 41/2,018/p7.20 | Shows how You Owe Me keeps one clear record so follow-ups can be calmer and more specific. Parent: `/solutions/` | Complete | Keep unchanged |
| `/solutions/client-payment-records/` | solution | Yes | Yes | 0/134/p11.32 | Helps someone keep track of what a client was charged, what they already paid, what remains open, and what has already been confirmed. Parent: `/solutions/` | Complete | Investigate |
| `/solutions/elderly-parent-expense-tracker/` | solution | Yes | Yes | 0/73/p7.53 | Helps someone keep parent bills, subscriptions, groceries, pharmacy purchases, sibling reimbursements, recurring charges, repayments, and remaining balances clear without relying on memory, scattered receipts, or old messages. Parent: `/solutions/` | Complete | Keep unchanged |
| `/solutions/expense-tracker-for-couples/` | solution | Yes | Yes | 0/169/p22.90 | Helps partners track shared spending, repayments, and running balances with less friction. Parent: `/solutions/` | Complete | Investigate |
| `/solutions/family-reimbursement-tracker/` | solution | Yes | Yes | 0/83/p4.98 | Helps family members keep purchases, repayments, partial repayments, and recurring costs clear without relying on memory. Parent: `/solutions/` | Complete | Keep unchanged |
| `/solutions/group-payback-tracker/` | solution | Yes | Yes | 0/14/p3.86 | Shows how Group Paybacks keep one shared cost organized while each person's paid, partly paid, and still-owes status stays clear. Parent: `/solutions/` | Complete | Keep unchanged |
| `/solutions/roommate-expense-tracker/` | solution | Yes | Yes | 0/275/p16.35 | Helps roommates keep shared household costs and repayments clear across repeated bills. Parent: `/solutions/` | Complete | Investigate |
| `/solutions/shared-expense-tracker/` | solution | Yes | Yes | 0/369/p21.08 | Shows how one running balance and Group Paybacks can make shared expenses easier to understand. Parent: `/solutions/` | Complete | Investigate |
| `/solutions/temporary-financial-support-tracker/` | solution | Yes | Yes | 1/103/p13.77 | Helps someone record temporary financial support, repayment expectations, updates, and remaining balance. Parent: `/solutions/` | Complete | Keep unchanged |
| `/tools/` | hub | Yes | Yes | 2/169/p12.61 | Collects practical tools for splitting costs, calculating balances, calculating remaining amounts after partial repayments, planning repayments, and writing calm messages. Parent: `/` | Complete | Keep unchanged |
| `/tools/couple-shared-expense-balance-calculator/` | tool | Yes | Yes | 0/101/p7.20 | Calculates a fair shared expense balance between two partners using 50/50, custom, income-proportional, category-based, or paid-total views, including repayments or transfers already made. Parent: `/tools/` | Complete | Investigate |
| `/tools/family-reimbursement-tracker-template/` | tool | Yes | Yes | 2/36/p4.50 | Gives families a simple template for recording purchases, repayments, and remaining amounts. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/group-payback-calculator/` | tool | Yes | Yes | 1/177/p6.64 | Calculates each person's share, subtracts what each person already paid back, and shows who is paid, partly paid, or still open. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/partial-repayment-calculator/` | tool | Yes | Yes | 2/199/p7.80 | Partial repayments make the remaining balance hard to remember. This tool subtracts one or more partial payments from one known original amount and creates a clear remaining-balance summary. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/payment-plan-calculator/` | tool | Yes | Yes | 10/566/p7.40 | Calculates repayment steps, payoff timing, and remaining balance for informal money arrangements. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/polite-payback-reminder-generator/` | tool | Yes | Yes | 2/175/p14.19 | Generates a calm reminder that matches the relationship, tone, and repayment situation. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/repayment-receipt-generator/` | tool | Yes | Yes | 4/193/p9.58 | Creates a simple confirmation after money is paid back, including remaining balance when relevant. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/repayment-reminder-text-examples/` | tool | Yes | Yes | 0/18/p6.50 | Provides calm message examples for reminding someone about money without sounding confrontational. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/roommate-bill-split-calculator/` | tool | Yes | Yes | 7/518/p8.79 | Helps roommates split a monthly set of bills and see what each person should settle. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/running-balance-calculator/` | tool | Yes | Yes | 4/400/p6.80 | Shows the current balance between two people after a sequence of entries. Parent: `/tools/` | Complete | Keep unchanged |
| `/tools/split-expense-calculator/` | tool | Yes | Yes | 61/6,199/p6.95 | Calculates who should pay whom after a shared expense is divided and points to Group Paybacks when repayment tracking continues. Parent: `/tools/` | Complete | Improve |
| `/tools/temporary-financial-support-record-template/` | tool | Yes | Yes | none | Helps someone record what was covered, what should happen next, and how timing changes should be handled. Parent: `/tools/` | Complete | Keep unchanged |

Inventory reconciliation findings:

- No public route is missing from the registry. No live registry route is missing on disk or production.
- No indexable public page is missing from the sitemap; no noindex page is in the sitemap.
- No indexable page is orphaned. `/events/timeline/` and `/redeem/` have no normal inbound acquisition path, appropriately, because they are noindex legacy/utility routes.
- Search Console included three image URLs. Two live images returned 200. Legacy `/images/main.png` returned 404 but had only one impression in the 91-day export and no recent row; no work is justified unless it reappears materially.
- Seven indexable pages had no row in either Page export: the gift-vs-loan guide, group reminder guide, unfair bill-split guide, repayment-plan guide, financial-support guide, privacy policy, and temporary-support record template. Keep them indexed and allow time; absence of a row is not evidence to remove them.

## 6. Page-by-page audit

The 67 indexable URLs below were reviewed individually. Search evidence uses page rows only. Query themes are kept separate because the supplied export has no query-to-page relationship.

### `/` — Know who owes whom and what to say next

- **Page job / visitor / intent:** Introduces You Owe Me as a clear way to track what was paid, repaid, and still open between people. Intended for People who need a calm record for money between real people. Format: home; parent route: `/`.
- **Search evidence:** 28d 68 clicks / 3,881 impressions / 1.75% CTR / position 6.21; 91d 110 / 5,939 / 1.85% / position 7.07. Recent impressions/day are about 4.2× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page functions as a human and crawler route into the site's main clusters rather than a thin index. Self-canonical, indexable, in the sitemap, valid structured data, 69 distinct internal source pages, and no broken production route. Title: “Track Money Between People | IOU App | YouOweMe”; H1: “Know who owes whom and what to say next”.
- **Meaningful weakness / exact action:** Keep the title, H1, category statement, situation router, and default App Store route. Fix the desktop hero proof-list layout where the fourth benefit breaks into a detached bullet and centered link; verify the same component at desktop and 390 px mobile widths.
- **Expected impact / priority / confidence:** Cleaner above-the-fold comprehension on the highest-authority page without changing its search promise. P2; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 69 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/blog/` — YouOweMe Blog & Guides

- **Page job / visitor / intent:** Collects answer pages for reminders, repayment updates, family support, roommate costs, and shared expense clarity. Intended for People looking for practical guidance on everyday money conversations. Format: hub; parent route: `/`.
- **Search evidence:** 28d 0 clicks / 56 impressions / 0.00% CTR / position 6.59; 91d 0 / 168 / 0.00% / position 8.05. Recent impressions/day are about 1.1× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page functions as a human and crawler route into the site's main clusters rather than a thin index. Self-canonical, indexable, in the sitemap, valid structured data, 67 distinct internal source pages, and no broken production route. Title: “YouOweMe Blog & Guides”; H1: “YouOweMe Blog & Guides”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 67 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/am-i-wrong-for-asking-for-my-money-back/` — Am I Wrong for Asking for My Money Back?

- **Page job / visitor / intent:** Helps someone decide whether it is fair to ask for money back, what to clarify first, and how to ask calmly without turning the relationship tense. Intended for People who feel guilty, rude, petty, or unsure about asking for money that was expected to be repaid. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 6 impressions / 0.00% CTR / position 5.33; 91d 0 / 6 / 0.00% / position 5.33.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 12 distinct internal source pages, and no broken production route. Title: “Am I Wrong for Asking for My Money Back?”; H1: “Am I Wrong for Asking for My Money Back?”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 12 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/am-i-wrong-for-asking-for-my-money-back/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/can-one-person-track-shared-money-without-everyone-installing-an-app/` — Can One Person Track Shared Money Without Everyone Installing an App?

- **Page job / visitor / intent:** Explains how one person can keep a clear record of shared money, repayments, group paybacks, and running balances, then share the current state through a message, receipt, PDF statement, screenshot, or Live Link. Intended for People who want to keep a shared-money record themselves without asking a friend, partner, roommate, family member, client, or group to install another app. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 42 impressions / 0.00% CTR / position 11.21; 91d 0 / 42 / 0.00% / position 11.21. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 18 distinct internal source pages, and no broken production route. Title: “Can One Person Track Shared Money Without Everyone Installing an App?”; H1: “Can One Person Track Shared Money Without Everyone Installing an App?”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 18 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/can-one-person-track-shared-money-without-everyone-installing-an-app/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-do-you-confront-someone-who-owes-you-money-without-ruining-the-relationship/` — How to Confront Someone Who Owes You Money Without Shaming Them or Ruining the Relationship

- **Page job / visitor / intent:** Helps someone approach unpaid money with private scripts, ignored-reminder handling, calm escalation, and boundary-setting without public shaming or threats. Intended for People who need a more direct money conversation while avoiding shaming, online pressure, or relationship damage. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 4 clicks / 803 impressions / 0.50% CTR / position 7.62; 91d 10 / 1,311 / 0.76% / position 8.19. Recent impressions/day are about 3.6× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 19 distinct internal source pages, and no broken production route. Title: “How to Confront Someone Who Owes You Money Without Shaming Them”; H1: “How to Confront Someone Who Owes You Money Without Shaming Them or Ruining the Relationship”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 19 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-do-you-confront-someone-who-owes-you-money-without-ruining-the-relationship/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-ask-family-for-temporary-financial-help/` — How to Ask Family for Temporary Financial Help Without Making It Awkward

- **Page job / visitor / intent:** Helps someone ask for temporary support with clear expectations, check-ins, and respectful wording. Intended for People asking family for temporary help while protecting clarity and dignity. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 312 impressions / 0.00% CTR / position 7.53; 91d 0 / 422 / 0.00% / position 7.35. Recent impressions/day are about 6.4× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 20 distinct internal source pages, and no broken production route. Title: “How to Ask Family for Money Help Without Making It Awkward”; H1: “How to Ask Family for Temporary Financial Help Without Making It Awkward”.
- **Meaningful weakness / exact action:** Align the title with the page's precise job and H1: `How to Ask Family for Temporary Financial Help | Examples`. Keep the page's gift/loan distinction, scripts, record template, and support CPP unchanged.
- **Expected impact / priority / confidence:** A clearer search promise on a page with 312 recent impressions, zero clicks, and average position 7.53. P1; Medium-high.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 20 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-ask-family-for-temporary-financial-help/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/blog/how-to-ask-someone-to-pay-you-back-without-being-rude/` — How to Ask Someone to Pay You Back Without Being Rude

- **Page job / visitor / intent:** Shows how to ask for money back with specific wording, context, and a respectful tone. Intended for People who want to ask for repayment clearly without sounding harsh. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 190 impressions / 0.00% CTR / position 8.54; 91d 0 / 190 / 0.00% / position 8.54. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 13 distinct internal source pages, and no broken production route. Title: “How to Ask Someone to Pay You Back Without Being Rude | YouOweMe Blog”; H1: “How to Ask Someone to Pay You Back Without Being Rude”.
- **Meaningful weakness / exact action:** Shorten the title to the exact H1, `How to Ask Someone to Pay You Back Without Being Rude`, removing the low-value `| YouOweMe Blog` suffix. Preserve the distinct job: broader asking guidance, not the reminder page's copy-first text workflow.
- **Expected impact / priority / confidence:** A less truncated, more complete search promise for a recent-only page at position 8.54 with 190 impressions and no clicks. P1; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 13 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-ask-someone-to-pay-you-back-without-being-rude/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/` — How to Ask to Borrow Money From a Friend Without Making It Awkward

- **Page job / visitor / intent:** Helps a person ask a friend for money clearly, respectfully, and without pressure before money moves. Intended for Someone who needs to ask a friend to borrow money or cover them temporarily. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 15 impressions / 0.00% CTR / position 7.00; 91d 0 / 15 / 0.00% / position 7.00.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 10 distinct internal source pages, and no broken production route. Title: “How to Ask to Borrow Money From a Friend | Text Examples | You Owe Me”; H1: “How to Ask to Borrow Money From a Friend Without Making It Awkward”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 10 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-clarify-if-money-was-a-gift-or-a-loan/` — Was the Money a Gift or a Loan? How to Clarify Calmly

- **Page job / visitor / intent:** Helps two people clarify whether money that already changed hands was a gift, fully repayable, partly repayable, flexible support, or still unresolved before either person records an outstanding balance. Intended for Friends, family members, partners, roommates, or other people trying to clarify an informal money arrangement after the money already changed hands. Format: guide; parent route: `/blog/`.
- **Search evidence:** No row in either Page export; this is not evidence of failure. Check publication/indexing age and demand before changing it.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 12 distinct internal source pages, and no broken production route. Title: “Was It a Gift or a Loan? How to Clarify Calmly | You Owe Me”; H1: “Was the Money a Gift or a Loan? How to Clarify Calmly”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 12 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-clarify-if-money-was-a-gift-or-a-loan/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-follow-up-after-a-partial-repayment/` — How to Follow Up After a Partial Repayment

- **Page job / visitor / intent:** Helps someone acknowledge a partial repayment while keeping the remaining balance clear. Intended for People clarifying what a partial repayment covered and what remains. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 36 impressions / 0.00% CTR / position 5.00; 91d 0 / 71 / 0.00% / position 6.73. Recent impressions/day are about 2.3× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 24 distinct internal source pages, and no broken production route. Title: “How to Follow Up After a Partial Repayment”; H1: “How to Follow Up After a Partial Repayment”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 24 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-follow-up-after-a-partial-repayment/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-handle-a-friend-who-keeps-borrowing-money/` — How to Handle a Friend Who Keeps Borrowing Money

- **Page job / visitor / intent:** Helps someone separate a current borrowing request from the larger pattern, choose a boundary, write down any open amount, and decide whether a clear record or repayment plan is needed. Intended for People whose friend keeps asking to borrow money, especially when old balances, small repeated amounts, or vague repayment expectations are already creating tension. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 3 impressions / 0.00% CTR / position 1.00; 91d 0 / 3 / 0.00% / position 1.00.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 10 distinct internal source pages, and no broken production route. Title: “How to Handle a Friend Who Keeps Borrowing Money”; H1: “How to Handle a Friend Who Keeps Borrowing Money”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 10 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-handle-a-friend-who-keeps-borrowing-money/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-handle-awkward-money-conversations/` — How to Handle Awkward Money Conversations: Ask, Follow Up, and Repay Clearly

- **Page job / visitor / intent:** Gives a broad, relationship-safe framework for common money conversations between people. Intended for People who need help asking, following up, replying, or setting a boundary around money. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 30 impressions / 0.00% CTR / position 9.53; 91d 1 / 129 / 0.78% / position 8.42. Recent impressions/day are about 0.7× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 13 distinct internal source pages, and no broken production route. Title: “How to Handle Awkward Money Conversations | Ask, Follow Up, Repay”; H1: “How to Handle Awkward Money Conversations: Ask, Follow Up, and Repay Clearly”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 13 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-handle-awkward-money-conversations/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-keep-track-of-money-between-family-members/` — How to Keep Track of Money Between Family Members (Without Damaging the Relationship)

- **Page job / visitor / intent:** Explains how family members can keep money records clear without making the relationship feel transactional. Intended for Families tracking shared costs, reimbursements, recurring help, or sibling shares. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 49 impressions / 0.00% CTR / position 8.47; 91d 0 / 124 / 0.00% / position 7.35. Recent impressions/day are about 1.5× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 10 distinct internal source pages, and no broken production route. Title: “How to Keep Track of Money Between Family Members | YouOweMe Blog”; H1: “How to Keep Track of Money Between Family Members (Without Damaging the Relationship)”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** family reimbursements CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=bc366b6c-90ff-4cde-9ae7-d420c6512e7a. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 10 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-keep-track-of-money-between-family-members/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-keep-track-of-who-owes-you-money/` — How to Keep Track of Who Owes You Money

- **Page job / visitor / intent:** Shows the minimum record needed to track who owes whom, what the money was for, what has already been repaid, and what is still open now. Intended for Someone who knows money is owed but is not sure what to record, how to handle repayments, or which simple tracking method is enough. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 3 clicks / 77 impressions / 3.90% CTR / position 16.73; 91d 3 / 77 / 3.90% / position 16.73. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 17 distinct internal source pages, and no broken production route. Title: “How to Keep Track of Who Owes You Money | You Owe Me”; H1: “How to Keep Track of Who Owes You Money”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 17 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-keep-track-of-who-owes-you-money/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-politely-say-no-when-people-ask-for-money/` — How to Say No to Someone Asking for Money: Examples and Scripts

- **Page job / visitor / intent:** Helps someone set a clear boundary with calm wording and less guilt. Intended for People who need to decline a money request while keeping the relationship respectful. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 23 clicks / 4,712 impressions / 0.49% CTR / position 7.38; 91d 28 / 6,547 / 0.43% / position 7.89. Recent impressions/day are about 5.8× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 16 distinct internal source pages, and no broken production route. Title: “How to Say No to Someone Asking for Money | Scripts”; H1: “How to Say No to Someone Asking for Money: Examples and Scripts”.
- **Meaningful weakness / exact action:** Keep the direct answer, quick example, scripts, boundary-safe tone, and BNS. Test the more query-natural title `How to Say No When Someone Asks for Money | Text Scripts`; leave the H1 and body unchanged during the test.
- **Expected impact / priority / confidence:** Potential CTR lift for a page with 4,712 recent impressions and a strong position but only 0.49% CTR. P1; Medium-high.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 16 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-politely-say-no-when-people-ask-for-money/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/blog/how-to-remind-a-group-to-pay-you-back-without-spamming-everyone/` — How to Remind a Group to Pay You Back Without Spamming Everyone

- **Page job / visitor / intent:** Gives a group payback communication workflow: one neutral group update, then private follow-ups for open balances, partial payments, and payment confirmations. Intended for Someone who paid first for a group cost and needs to send one calm public update before following up individually with only the people whose shares are still open. Format: guide; parent route: `/blog/`.
- **Search evidence:** No row in either Page export; this is not evidence of failure. Check publication/indexing age and demand before changing it.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 13 distinct internal source pages, and no broken production route. Title: “How to Remind a Group to Pay You Back Without Spamming”; H1: “How to Remind a Group to Pay You Back Without Spamming Everyone”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** group paybacks CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 13 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-remind-a-group-to-pay-you-back-without-spamming-everyone/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-remind-someone-they-owe-you-money-politely/` — How to Remind Someone They Owe You Money by Text

- **Page job / visitor / intent:** Helps someone choose a calm way to remind another person about money owed. Intended for People who need to follow up without making the relationship feel tense. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 124 clicks / 12,973 impressions / 0.96% CTR / position 6.04; 91d 132 / 14,918 / 0.88% / position 6.33. Recent impressions/day are about 15.0× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 24 distinct internal source pages, and no broken production route. Title: “How to Remind Someone Who Promised You Money by Text”; H1: “How to Remind Someone They Owe You Money by Text”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 24 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-remind-someone-they-owe-you-money-politely/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-send-a-repayment-update-when-you-need-more-time/` — How to Send a Repayment Update When You Need More Time

- **Page job / visitor / intent:** Helps someone send a clear, respectful update when repayment timing changes. Intended for People who need to update someone about repayment timing. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 1 clicks / 94 impressions / 1.06% CTR / position 10.05; 91d 1 / 111 / 0.90% / position 9.72. Recent impressions/day are about 12.4× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 20 distinct internal source pages, and no broken production route. Title: “How to Send a Repayment Update When You Need More Time”; H1: “How to Send a Repayment Update When You Need More Time”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 20 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-send-a-repayment-update-when-you-need-more-time/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-split-a-bill-fairly-when-one-person-ordered-less/` — How to Split a Bill Fairly When One Person Ordered Less

- **Page job / visitor / intent:** Helps a group choose between an equal, itemized, hybrid, or separate-check split when personal orders differ, then move from the agreed shares to calculation and payback tracking without blame. Intended for Someone splitting a restaurant or group bill where personal orders differ and who wants a fair method without making the conversation awkward. Format: guide; parent route: `/blog/`.
- **Search evidence:** No row in either Page export; this is not evidence of failure. Check publication/indexing age and demand before changing it.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 10 distinct internal source pages, and no broken production route. Title: “How to Split a Bill Fairly When One Person Ordered Less”; H1: “How to Split a Bill Fairly When One Person Ordered Less”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** group paybacks CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 10 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-split-a-bill-fairly-when-one-person-ordered-less/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-split-costs-when-people-pay-at-different-times/` — How to Split Costs When People Pay at Different Times

- **Page job / visitor / intent:** Helps readers decide whether they need a split calculator, one-time settlement, running balance, group payback record, partial repayment calculation, or ongoing You Owe Me record. Intended for People trying to split or settle shared costs when payments, payers, or repayments happened at different times. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 114 impressions / 0.00% CTR / position 8.66; 91d 0 / 114 / 0.00% / position 8.66. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 16 distinct internal source pages, and no broken production route. Title: “How to Split Costs When People Pay at Different Times | You Owe Me”; H1: “How to Split Costs When People Pay at Different Times”.
- **Meaningful weakness / exact action:** Keep the case-based structure and routing to split, group-payback, and running-balance tools. Wait for page-filtered queries before altering the title; this is recent-only visibility with 114 impressions and no clicks.
- **Expected impact / priority / confidence:** Protects a uniquely useful timing-based guide while collecting enough evidence for a snippet decision. P2; Medium.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 16 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-split-costs-when-people-pay-at-different-times/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/blog/how-to-split-expenses-in-a-relationship-without-fighting/` — How to Split Expenses in a Relationship Without Fighting

- **Page job / visitor / intent:** Helps couples choose a calmer way to split costs, track covered expenses, and discuss balances. Intended for Partners who want shared spending to feel clear and fair. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 43 impressions / 0.00% CTR / position 14.86; 91d 0 / 53 / 0.00% / position 13.11. Recent impressions/day are about 9.7× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 10 distinct internal source pages, and no broken production route. Title: “How to Split Expenses in a Relationship Without Fighting | YouOweMe Blog”; H1: “How to Split Expenses in a Relationship Without Fighting”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** couples / relationship spending CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=8e720a01-7489-4044-9f6a-0080793442a0. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 10 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-split-expenses-in-a-relationship-without-fighting/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-split-rent-utilities-and-groceries-with-roommates/` — How to Split Rent, Utilities, and Groceries With Roommates Without Confusion

- **Page job / visitor / intent:** Helps roommates choose fair bill-splitting rules before calculating or tracking balances. Intended for Roommates deciding fair rules for rent, utilities, groceries, and shared supplies. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 2 clicks / 148 impressions / 1.35% CTR / position 10.57; 91d 2 / 203 / 0.99% / position 9.95. Recent impressions/day are about 6.1× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 11 distinct internal source pages, and no broken production route. Title: “How to Split Rent, Utilities, and Groceries With Roommates”; H1: “How to Split Rent, Utilities, and Groceries With Roommates Without Confusion”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** roommates / household costs CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 11 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-split-rent-utilities-and-groceries-with-roommates/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-suggest-a-repayment-plan-to-someone-who-owes-you-money/` — How to Suggest a Repayment Plan to Someone Who Owes You Money

- **Page job / visitor / intent:** Helps someone turn an acknowledged open balance into a realistic repayment plan without dictating terms, repeating vague reminders, or relying on memory. Intended for People who are owed money and need to agree on smaller repayments when paying the full balance at once is not realistic. Format: guide; parent route: `/blog/`.
- **Search evidence:** No row in either Page export; this is not evidence of failure. Check publication/indexing age and demand before changing it.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 8 distinct internal source pages, and no broken production route. Title: “How to Suggest a Repayment Plan for Money Owed”; H1: “How to Suggest a Repayment Plan to Someone Who Owes You Money”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 8 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-suggest-a-repayment-plan-to-someone-who-owes-you-money/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-support-someone-financially-without-confusion/` — How to Support Someone Financially Without Confusion Later

- **Page job / visitor / intent:** A helper-side guide for supporting someone financially while keeping gift vs repayment expectations, check-ins, partial repayments, and records clear without making the relationship awkward. Intended for Helpers and supporters considering financial help for someone close while keeping expectations clear. Format: guide; parent route: `/blog/`.
- **Search evidence:** No row in either Page export; this is not evidence of failure. Check publication/indexing age and demand before changing it.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 14 distinct internal source pages, and no broken production route. Title: “How to Support Someone Financially Without Confusion | You Owe Me”; H1: “How to Support Someone Financially Without Confusion Later”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 14 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-support-someone-financially-without-confusion/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-track-money-between-roommates/` — How to Track Money Between Roommates Without Rebuilding Bills Every Month

- **Page job / visitor / intent:** Explains how roommates can track bills, repayments, previous balances, and settle-ups without rebuilding the month from memory. Intended for Roommates who share repeated bills and need a clear household record. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 57 impressions / 0.00% CTR / position 27.09; 91d 0 / 104 / 0.00% / position 22.46. Recent impressions/day are about 2.7× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 13 distinct internal source pages, and no broken production route. Title: “How to Track Money Between Roommates | Shared Bills & Settle-Ups”; H1: “How to Track Money Between Roommates Without Rebuilding Bills Every Month”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** roommates / household costs CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 13 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-track-money-between-roommates/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-track-money-you-pay-for-elderly-parents/` — How to Track Money You Pay for Elderly Parents

- **Page job / visitor / intent:** Helps someone keep parent-related costs, sibling shares, repayments, and remaining balances clear. Intended for Adult children or relatives covering parent bills, pharmacy, groceries, subscriptions, or appointments. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 2 clicks / 86 impressions / 2.33% CTR / position 11.03; 91d 4 / 141 / 2.84% / position 10.52. Recent impressions/day are about 3.5× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 11 distinct internal source pages, and no broken production route. Title: “How to Track Money You Pay for Elderly Parents | YouOweMe”; H1: “How to Track Money You Pay for Elderly Parents”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** elderly parent caregiving CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=794c6086-e032-4408-ab2f-acb4ad23ec98. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 11 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-track-money-you-pay-for-elderly-parents/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-track-shared-expenses-without-constantly-reconciling-every-transaction/` — How to Track Shared Expenses Without Constantly Reconciling Every Transaction

- **Page job / visitor / intent:** Explains how a running balance can reduce constant settle-ups after every shared expense. Intended for People sharing expenses repeatedly with friends, partners, roommates, or family. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 38 impressions / 0.00% CTR / position 16.32; 91d 0 / 131 / 0.00% / position 21.80. Recent impressions/day are about 0.9× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 9 distinct internal source pages, and no broken production route. Title: “How to Track Shared Expenses Without Constant Reconciliation | YouOweMe Blog”; H1: “How to Track Shared Expenses Without Constantly Reconciling Every Transaction”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 9 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-track-shared-expenses-without-constantly-reconciling-every-transaction/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-track-subscriptions-and-bills-you-pay-for-family/` — How to Track Subscriptions and Bills You Pay for Family

- **Page job / visitor / intent:** Recurring family bills and subscriptions become hard to track when one person pays first, reimbursements happen later, sibling shares are unclear, and monthly charges repeat silently. Intended for Adult children, caregivers, family members, siblings, partners, parents, and people paying recurring family bills or subscriptions. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 75 impressions / 0.00% CTR / position 14.55; 91d 0 / 75 / 0.00% / position 14.55. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 12 distinct internal source pages, and no broken production route. Title: “How to Track Subscriptions and Bills You Pay for Family”; H1: “How to Track Subscriptions and Bills You Pay for Family”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** family reimbursements CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=bc366b6c-90ff-4cde-9ae7-d420c6512e7a. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 12 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-track-subscriptions-and-bills-you-pay-for-family/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/how-to-track-who-paid-you-back-for-a-group-expense/` — How to Track Who Paid You Back for a Group Expense

- **Page job / visitor / intent:** Turns a delayed group payback into one clear record showing each person's share, what they paid back, what is still open, and what message to send next. Intended for Someone who paid first for a group gift, tickets, dinner, booking, deposit, or shared purchase and needs a clear payback list. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 103 impressions / 0.00% CTR / position 9.54; 91d 0 / 103 / 0.00% / position 9.54. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 18 distinct internal source pages, and no broken production route. Title: “How to Track Who Paid You Back for a Group Expense”; H1: “How to Track Who Paid You Back for a Group Expense”.
- **Meaningful weakness / exact action:** Keep the method-first table/status job and group-paybacks CPP. Use page-filtered queries to determine whether zero clicks come from wording or from Google testing the page against generic group-expense intent.
- **Expected impact / priority / confidence:** Improves decision quality for a recent-only page at position 9.54 without merging it with the reminder guide or calculator. P2; Medium.
- **Conversion route:** group paybacks CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 18 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/how-to-track-who-paid-you-back-for-a-group-expense/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/blog/i-pay-more-than-my-partner/` — I Pay More Than My Partner for Shared Expenses. What Should We Do?

- **Page job / visitor / intent:** Helps someone who feels like the default payer decide what the imbalance means before choosing a calculator, running balance, temporary support record, or app workflow. Intended for People in a relationship who pay more often for shared expenses and want a calm way to decide what should be split, ignored, reimbursed, carried forward, or treated as support. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 57 impressions / 0.00% CTR / position 17.98; 91d 0 / 57 / 0.00% / position 17.98. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 12 distinct internal source pages, and no broken production route. Title: “I Pay More Than My Partner for Shared Expenses &mdash; What to Do”; H1: “I Pay More Than My Partner for Shared Expenses. What Should We Do?”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** couples / relationship spending CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=8e720a01-7489-4044-9f6a-0080793442a0. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 12 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/i-pay-more-than-my-partner/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/what-is-a-running-balance-between-two-people/` — What Is a Running Balance? Meaning Between Two People

- **Page job / visitor / intent:** Explains why one running balance is clearer than scattered individual IOUs. Intended for People trying to understand why one current total is clearer than scattered individual entries. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 17 clicks / 4,252 impressions / 0.40% CTR / position 5.56; 91d 17 / 5,234 / 0.32% / position 6.17. Recent impressions/day are about 9.7× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 29 distinct internal source pages, and no broken production route. Title: “What Is a Running Balance? Meaning and Simple Example”; H1: “What Is a Running Balance? Meaning Between Two People”.
- **Meaningful weakness / exact action:** Preserve the title, H1, definition, example, and calculator links. Change only the meta description so the snippet explicitly covers both the general bank/ledger meaning and the two-person use case; measure for 28 days before any title change.
- **Expected impact / priority / confidence:** A better match to the visible generic and bank-adjacent query mix while protecting a page already ranking around position 5.6. P1; High.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 29 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/what-is-a-running-balance-between-two-people/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/blog/when-to-ask-for-money-back-or-send-a-repayment-update/` — How to Know When to Ask for Money Back or Send a Repayment Update

- **Page job / visitor / intent:** Helps someone choose the right next message based on timing, role, and relationship context. Intended for People deciding whether to send a reminder or an update from the other side of the balance. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 54 impressions / 0.00% CTR / position 6.98; 91d 1 / 138 / 0.72% / position 6.86. Recent impressions/day are about 1.4× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 21 distinct internal source pages, and no broken production route. Title: “How to Know When to Ask for Money Back or Send a Repayment Update”; H1: “How to Know When to Ask for Money Back or Send a Repayment Update”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 21 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/when-to-ask-for-money-back-or-send-a-repayment-update/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/blog/why-simple-loans-dont-stay-simple/` — Why Simple Loans Don't Stay Simple (And Why It's Not Really About the Money)

- **Page job / visitor / intent:** Explains why partial repayments, changing timing, and new expenses can make an arrangement unclear without a record. Intended for People whose informal repayment arrangement has become harder to remember over time. Format: guide; parent route: `/blog/`.
- **Search evidence:** 28d 0 clicks / 5 impressions / 0.00% CTR / position 5.80; 91d 0 / 24 / 0.00% / position 5.67. Recent impressions/day are about 0.6× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page has a specific situation, direct opening, practical examples/scripts or decision rules, and a distinct editorial job. Self-canonical, indexable, in the sitemap, valid structured data, 8 distinct internal source pages, and no broken production route. Title: “Why Simple Loans Don't Stay Simple | Money Between Friends”; H1: “Why Simple Loans Don't Stay Simple (And Why It's Not Really About the Money)”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** long-term balances CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=07350272-1b8a-4f9f-a267-dc72c33b4404. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 8 distinct source pages link in; parent is `/blog/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `blog/why-simple-loans-dont-stay-simple/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/compare/` — Compare ways to track money owed, shared expenses, and repayments

- **Page job / visitor / intent:** Collects comparison pages for choosing between spreadsheets, shared expense apps, calculators, templates, and You Owe Me. Intended for People comparing tools before deciding how to track money between people. Format: hub; parent route: `/`.
- **Search evidence:** 28d 0 clicks / 70 impressions / 0.00% CTR / position 10.21; 91d 0 / 70 / 0.00% / position 10.21. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page functions as a human and crawler route into the site's main clusters rather than a thin index. Self-canonical, indexable, in the sitemap, valid structured data, 67 distinct internal source pages, and no broken production route. Title: “Compare Ways to Track Money Owed, Shared Expenses, and Repayments | You Owe Me”; H1: “Compare ways to track money owed, shared expenses, and repayments”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 67 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `compare/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/compare/best-way-to-track-ious-between-people/` — Best Way to Track IOUs Between People

- **Page job / visitor / intent:** Helps the reader choose between notes, chat history, spreadsheets, payment history, calculators, split apps, and You Owe Me for tracking who owes whom. Intended for People deciding how to track IOUs, money owed, partial repayments, running balances, or shared money between real people. Format: compare; parent route: `/compare/`.
- **Search evidence:** 28d 1 clicks / 102 impressions / 0.98% CTR / position 9.28; 91d 1 / 102 / 0.98% / position 9.28. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page states the decision criteria instead of presenting a one-sided sales pitch and connects to tools/solutions for the next job. Self-canonical, indexable, in the sitemap, valid structured data, 18 distinct internal source pages, and no broken production route. Title: “Best Way to Track IOUs Between People | You Owe Me”; H1: “Best Way to Track IOUs Between People”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 18 distinct source pages link in; parent is `/compare/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `compare/best-way-to-track-ious-between-people/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/compare/shared-expense-app-vs-running-balance-app/` — Shared Expense App vs Running Balance App

- **Page job / visitor / intent:** Helps the reader choose between a shared ledger app, shared expense app, and running balance app after household expenses, repayments, partial payments, recurring costs, and group paybacks change what is still owed. Intended for People deciding whether they need a collaborative shared expense ledger, a running balance app, a calculator, or You Owe Me for shared money that changes over time. Format: compare; parent route: `/compare/`.
- **Search evidence:** 28d 0 clicks / 85 impressions / 0.00% CTR / position 14.64; 91d 0 / 85 / 0.00% / position 14.64. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page states the decision criteria instead of presenting a one-sided sales pitch and connects to tools/solutions for the next job. Self-canonical, indexable, in the sitemap, valid structured data, 18 distinct internal source pages, and no broken production route. Title: “Shared Ledger App vs Running Balance App | You Owe Me”; H1: “Shared Expense App vs Running Balance App”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 18 distinct source pages link in; parent is `/compare/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `compare/shared-expense-app-vs-running-balance-app/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/compare/splitwise-alternative/` — Splitwise Alternative for Ongoing Expenses, IOUs, and Group Paybacks

- **Page job / visitor / intent:** Compares Splitwise-style group ledgers with You Owe Me for ongoing expenses, Group Paybacks, per-person balances, partial repayments, repayment history, Live Links, and calmer follow-ups. Intended for People comparing Splitwise-style shared expense tracking with a private running balance ledger for ongoing expenses, IOUs, and group paybacks. Format: compare; parent route: `/compare/`.
- **Search evidence:** 28d 1 clicks / 300 impressions / 0.33% CTR / position 19.57; 91d 1 / 348 / 0.29% / position 19.40. Recent impressions/day are about 14.1× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page states the decision criteria instead of presenting a one-sided sales pitch and connects to tools/solutions for the next job. Self-canonical, indexable, in the sitemap, valid structured data, 27 distinct internal source pages, and no broken production route. Title: “Splitwise Alternative for Ongoing Expenses | You Owe Me”; H1: “Splitwise Alternative for Ongoing Expenses, IOUs, and Group Paybacks”.
- **Meaningful weakness / exact action:** Keep the honest collaborative-ledger-versus-private-running-balance comparison. Use page-filtered queries and CPP click data before expanding or changing the title; ranking, not CTR, is the main constraint at position 19.57.
- **Expected impact / priority / confidence:** Focuses work on the right constraint and avoids turning a differentiated comparison into generic competitor copy. P2; Medium.
- **Conversion route:** group paybacks CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 27 distinct source pages link in; parent is `/compare/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `compare/splitwise-alternative/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/compare/spreadsheet-vs-app-for-tracking-money-owed/` — How to Track Who Owes You Money Without Spreadsheets

- **Page job / visitor / intent:** Helps someone track who owes them money without spreadsheets when repayments, reminders, recurring costs, and changing balances need a clearer record. Intended for People choosing between spreadsheets, notes, calculators, and app-based tracking. Format: compare; parent route: `/compare/`.
- **Search evidence:** 28d 0 clicks / 57 impressions / 0.00% CTR / position 12.26; 91d 0 / 105 / 0.00% / position 11.21. Recent impressions/day are about 2.7× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page states the decision criteria instead of presenting a one-sided sales pitch and connects to tools/solutions for the next job. Self-canonical, indexable, in the sitemap, valid structured data, 25 distinct internal source pages, and no broken production route. Title: “How to Track Who Owes You Money Without Spreadsheets”; H1: “How to Track Who Owes You Money Without Spreadsheets”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 25 distinct source pages link in; parent is `/compare/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `compare/spreadsheet-vs-app-for-tracking-money-owed/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/features/` — You Owe Me App Features

- **Page job / visitor / intent:** Explains the app features that help keep balances, entries, Group Paybacks, reminders, statements, and timelines clear. Intended for People comparing what the app can do before installing it. Format: feature; parent route: `/`.
- **Search evidence:** 28d 4 clicks / 303 impressions / 1.32% CTR / position 7.04; 91d 5 / 413 / 1.21% / position 6.73. Recent impressions/day are about 6.2× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page adds product proof, trust, limitations, and crawlable product facts. Self-canonical, indexable, in the sitemap, valid structured data, 67 distinct internal source pages, and no broken production route. Title: “You Owe Me App Features | IOUs, Reminders, Live Links”; H1: “You Owe Me App Features”.
- **Meaningful weakness / exact action:** Preserve the feature coverage, screenshots, claims, schema, and default conversion route. Include this page only in the targeted visible-name consistency batch (`You Owe Me` primary; `YouOweMe` alternate), not a content overhaul.
- **Expected impact / priority / confidence:** Stronger product-name consistency on the main feature authority page. P2; High (qualitative).
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 67 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `features/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/find/` — Find your money situation

- **Page job / visitor / intent:** Helps visitors choose the right guide, tool, solution, feature, or app path for a money-between-people situation, including Group Paybacks. Intended for People who know their money situation but do not know which guide, tool, or solution to start with. Format: hub; parent route: `/`.
- **Search evidence:** 28d 3 clicks / 174 impressions / 1.72% CTR / position 6.80; 91d 3 / 186 / 1.61% / position 6.73. Recent impressions/day are about 32.6× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page functions as a human and crawler route into the site's main clusters rather than a thin index. Self-canonical, indexable, in the sitemap, valid structured data, 6 distinct internal source pages, and no broken production route. Title: “Find Your Money Situation | You Owe Me”; H1: “Find your money situation”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 6 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `find/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/privacy-and-data/` — Privacy and Data in You Owe Me

- **Page job / visitor / intent:** Explains local records, iCloud sync, optional Cloud Accounts, Live Links, statement links, AI features, reminders, exports, App Lock, support, and privacy policy boundaries. Intended for People who want plain-English privacy and data clarity before using You Owe Me or sharing money records. Format: feature; parent route: `/features/`.
- **Search evidence:** 28d 0 clicks / 18 impressions / 0.00% CTR / position 4.06; 91d 0 / 18 / 0.00% / position 4.06.
- **Already strong:** The page adds product proof, trust, limitations, and crawlable product facts. Self-canonical, indexable, in the sitemap, valid structured data, 66 distinct internal source pages, and no broken production route. Title: “Privacy and Data | You Owe Me”; H1: “Privacy and Data in You Owe Me”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 66 distinct source pages link in; parent is `/features/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `privacy-and-data/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Keep unchanged.**

### `/privacy-policy/` — Privacy Policy

- **Page job / visitor / intent:** Explains how the app and website handle privacy-sensitive information. Intended for People who want to understand the privacy terms for You Owe Me. Format: legal; parent route: `/`.
- **Search evidence:** No row in either Page export; this is not evidence of failure. Check publication/indexing age and demand before changing it.
- **Already strong:** Self-canonical, indexable, in the sitemap, valid structured data, 67 distinct internal source pages, and no broken production route. Title: “Privacy Policy for the YouOweMe iOS App”; H1: “Privacy Policy”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 67 distinct source pages link in; parent is `/`; 0 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `privacy-policy/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/quick-start/` — How YouOweMe works

- **Page job / visitor / intent:** Explains how one running balance, entries, repayments, reminders, and timelines work together. Intended for New or prospective users who want to understand the basic workflow. Format: quick-start; parent route: `/`.
- **Search evidence:** 28d 0 clicks / 56 impressions / 0.00% CTR / position 5.27; 91d 0 / 73 / 0.00% / position 5.93. Recent impressions/day are about 7.4× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page adds product proof, trust, limitations, and crawlable product facts. Self-canonical, indexable, in the sitemap, valid structured data, 9 distinct internal source pages, and no broken production route. Title: “Quick Start Guide: How YouOweMe Works”; H1: “How YouOweMe works”.
- **Meaningful weakness / exact action:** As part of a small entity-consistency batch, use visible `You Owe Me` on the title/H1/body while retaining `YouOweMe` as a schema alternate name and search alias. Do not otherwise rewrite this effective onboarding page.
- **Expected impact / priority / confidence:** Clearer product entity consistency for humans and AI systems. P2; High (qualitative).
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 9 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `quick-start/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/reviews/` — You Owe Me App Reviews: Is It Legit?

- **Page job / visitor / intent:** Shows how people use You Owe Me for IOUs, family reimbursements, shared expenses, reminders, and repayment history. Intended for People looking for trust signals from real app users. Format: reviews; parent route: `/`.
- **Search evidence:** 28d 4 clicks / 406 impressions / 0.99% CTR / position 7.87; 91d 5 / 548 / 0.91% / position 8.19. Recent impressions/day are about 6.4× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page adds product proof, trust, limitations, and crawlable product facts. Self-canonical, indexable, in the sitemap, valid structured data, 67 distinct internal source pages, and no broken production route. Title: “You Owe Me App Reviews: Is It Legit?”; H1: “You Owe Me App Reviews: Is It Legit?”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 67 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `reviews/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/solutions/` — Find the Right Money-Tracking Setup for Your Situation

- **Page job / visitor / intent:** Organizes the main real-life situations You Owe Me supports, from family reimbursements to roommate bills and shared expenses. Intended for People choosing the most relevant You Owe Me use case. Format: hub; parent route: `/`.
- **Search evidence:** 28d 1 clicks / 88 impressions / 1.14% CTR / position 10.00; 91d 1 / 202 / 0.50% / position 8.31. Recent impressions/day are about 1.7× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page functions as a human and crawler route into the site's main clusters rather than a thin index. Self-canonical, indexable, in the sitemap, valid structured data, 67 distinct internal source pages, and no broken production route. Title: “Solutions for Shared Expenses, Money Owed, and Repayments | YouOweMe”; H1: “Find the Right Money-Tracking Setup for Your Situation”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 67 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/solutions/app-to-track-money-owed/` — Simple App to Track Who Owes You Money

- **Page job / visitor / intent:** Shows how You Owe Me keeps one clear record so follow-ups can be calmer and more specific. Intended for People tracking personal balances, IOUs, repayments, and partial repayments. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 41 clicks / 2,018 impressions / 2.03% CTR / position 7.20; 91d 50 / 3,101 / 1.61% / position 7.84. Recent impressions/day are about 4.2× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 44 distinct internal source pages, and no broken production route. Title: “Simple App to Track Who Owes You Money | You Owe Me”; H1: “Simple App to Track Who Owes You Money”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 44 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/app-to-track-money-owed/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/solutions/client-payment-records/` — Simple Client Payment Records

- **Page job / visitor / intent:** Helps someone keep track of what a client was charged, what they already paid, what remains open, and what has already been confirmed. Intended for Freelancers, tutors, private teachers, coaches, consultants, small service providers, and people who need lightweight records of client payments without a full accounting system. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 0 clicks / 134 impressions / 0.00% CTR / position 11.32; 91d 0 / 134 / 0.00% / position 11.32. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 17 distinct internal source pages, and no broken production route. Title: “Simple Client Payment Records App | You Owe Me”; H1: “Simple Client Payment Records”.
- **Meaningful weakness / exact action:** Request page-filtered queries to learn whether Google is matching lightweight client balance tracking or formal invoicing/accounting intent. Keep the strong product-boundary language; change the title/opening only if the query mix confirms the lightweight record job.
- **Expected impact / priority / confidence:** Prevents unqualified traffic while giving a position-11.3 page a path to clearer intent alignment. P2; Medium.
- **Conversion route:** client payment records CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=15af0298-82ca-4a0e-8230-d12774916992. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 17 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/client-payment-records/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/solutions/elderly-parent-expense-tracker/` — Elderly Parent Expense Tracker

- **Page job / visitor / intent:** Helps someone keep parent bills, subscriptions, groceries, pharmacy purchases, sibling reimbursements, recurring charges, repayments, and remaining balances clear without relying on memory, scattered receipts, or old messages. Intended for Adult children, caregivers, and family members who pay for or manage expenses for elderly parents. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 0 clicks / 73 impressions / 0.00% CTR / position 7.53; 91d 0 / 73 / 0.00% / position 7.53. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 18 distinct internal source pages, and no broken production route. Title: “Elderly Parent Expense Tracker | Track Parent Bills and Reimbursements”; H1: “Elderly Parent Expense Tracker”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** elderly parent caregiving CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=794c6086-e032-4408-ab2f-acb4ad23ec98. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 18 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/elderly-parent-expense-tracker/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/solutions/expense-tracker-for-couples/` — Expense Tracker for Couples Who Want Clarity Without Fighting

- **Page job / visitor / intent:** Helps partners track shared spending, repayments, and running balances with less friction. Intended for Couples who share expenses but want clarity without turning money into a fight. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 0 clicks / 169 impressions / 0.00% CTR / position 22.90; 91d 0 / 310 / 0.00% / position 19.66. Recent impressions/day are about 2.7× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 24 distinct internal source pages, and no broken production route. Title: “Expense Tracker for Couples | Shared Spending Without Fights”; H1: “Expense Tracker for Couples Who Want Clarity Without Fighting”.
- **Meaningful weakness / exact action:** Obtain page-filtered queries before changing copy. Preserve the relationship-safe positioning and couples CPP; if queries are calculator-led, lead more clearly to the couple balance calculator instead of expanding the solution page.
- **Expected impact / priority / confidence:** More qualified traffic and downloads from a page with 169 impressions at position 22.9, without cannibalizing the calculator or advice guide. P2; Medium.
- **Conversion route:** couples / relationship spending CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=8e720a01-7489-4044-9f6a-0080793442a0. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 24 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/expense-tracker-for-couples/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/solutions/family-reimbursement-tracker/` — Family Reimbursement Tracker for Money Between Relatives

- **Page job / visitor / intent:** Helps family members keep purchases, repayments, partial repayments, and recurring costs clear without relying on memory. Intended for People paying for parents, relatives, siblings, or shared family costs. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 0 clicks / 83 impressions / 0.00% CTR / position 4.98; 91d 1 / 216 / 0.46% / position 5.90. Recent impressions/day are about 1.4× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 33 distinct internal source pages, and no broken production route. Title: “Family Reimbursement Tracker App for Relatives | You Owe Me”; H1: “Family Reimbursement Tracker for Money Between Relatives”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** family reimbursements CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=bc366b6c-90ff-4cde-9ae7-d420c6512e7a. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 33 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/family-reimbursement-tracker/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/solutions/group-payback-tracker/` — Group Payback Tracker

- **Page job / visitor / intent:** Shows how Group Paybacks keep one shared cost organized while each person's paid, partly paid, and still-owes status stays clear. Intended for People who paid first for a group gift, tickets, dinner, deposit, booking, or shared purchase and need to track paybacks. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 0 clicks / 14 impressions / 0.00% CTR / position 3.86; 91d 0 / 14 / 0.00% / position 3.86.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 19 distinct internal source pages, and no broken production route. Title: “Group Payback Tracker for Shared Costs | You Owe Me”; H1: “Group Payback Tracker”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** group paybacks CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 19 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/group-payback-tracker/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/solutions/roommate-expense-tracker/` — Roommate Expense Tracker for Bills, Payments, and Monthly Settle-Ups

- **Page job / visitor / intent:** Helps roommates keep shared household costs and repayments clear across repeated bills. Intended for Roommates sharing rent, utilities, groceries, supplies, subscriptions, or move-out costs. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 0 clicks / 275 impressions / 0.00% CTR / position 16.35; 91d 0 / 492 / 0.00% / position 21.61. Recent impressions/day are about 2.9× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 30 distinct internal source pages, and no broken production route. Title: “Roommate Expense Tracker App | Track Bills Without a Spreadsheet”; H1: “Roommate Expense Tracker for Bills, Payments, and Monthly Settle-Ups”.
- **Meaningful weakness / exact action:** Allow the recent ranking improvement to mature and obtain page-filtered queries. If queries are spreadsheet/calculator-led, emphasize the existing calculator-versus-tracker decision above the fold rather than adding more generic roommate content.
- **Expected impact / priority / confidence:** Better intent alignment for 275 recent impressions at position 16.35 without competing with the roommate calculator. P2; Medium.
- **Conversion route:** roommates / household costs CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 30 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/roommate-expense-tracker/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/solutions/shared-expense-tracker/` — Shared Expense Tracker That Shows Who Owes Whom

- **Page job / visitor / intent:** Shows how one running balance and Group Paybacks can make shared expenses easier to understand. Intended for Friends, couples, roommates, and families sharing costs over time. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 0 clicks / 369 impressions / 0.00% CTR / position 21.08; 91d 1 / 689 / 0.15% / position 26.41. Recent impressions/day are about 2.6× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 32 distinct internal source pages, and no broken production route. Title: “Shared Expense Tracker for Friends, Couples, Roommates | YouOweMe”; H1: “Shared Expense Tracker That Shows Who Owes Whom”.
- **Meaningful weakness / exact action:** Do not rewrite yet. Request page-filtered queries and verify whether impressions are for generic split-app intent or ongoing-balance intent. If the latter, strengthen only the above-the-fold one-time-split-versus-ongoing-record decision rule; the existing calculator, comparison, and CPP links are already correct.
- **Expected impact / priority / confidence:** Could move a zero-click page at position 21 toward a better-matched query set without creating overlap with the split calculator. P2; Medium.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 32 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/shared-expense-tracker/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/solutions/temporary-financial-support-tracker/` — Temporary Financial Support Tracker

- **Page job / visitor / intent:** Helps someone record temporary financial support, repayment expectations, updates, and remaining balance. Intended for Friends, family members, partners, or roommates handling temporary support that should stay clear. Format: solution; parent route: `/solutions/`.
- **Search evidence:** 28d 1 clicks / 103 impressions / 0.97% CTR / position 13.77; 91d 1 / 114 / 0.88% / position 12.75. Recent impressions/day are about 21.1× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page names the audience and use case, distinguishes product fit from lighter alternatives, and uses a situation-matched CPP. Self-canonical, indexable, in the sitemap, valid structured data, 38 distinct internal source pages, and no broken production route. Title: “Temporary Financial Support Tracker for Friends and Family | You Owe Me”; H1: “Temporary Financial Support Tracker”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 38 distinct source pages link in; parent is `/solutions/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `solutions/temporary-financial-support-tracker/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/` — Money Tools for Shared Expenses, IOUs, and Repayments

- **Page job / visitor / intent:** Collects practical tools for splitting costs, calculating balances, calculating remaining amounts after partial repayments, planning repayments, and writing calm messages. Intended for People who want a free calculator, template, example, or generator before using the app. Format: hub; parent route: `/`.
- **Search evidence:** 28d 2 clicks / 169 impressions / 1.18% CTR / position 12.61; 91d 4 / 321 / 1.25% / position 8.95. Recent impressions/day are about 2.5× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page functions as a human and crawler route into the site's main clusters rather than a thin index. Self-canonical, indexable, in the sitemap, valid structured data, 67 distinct internal source pages, and no broken production route. Title: “Money Tools and Templates | You Owe Me”; H1: “Money Tools for Shared Expenses, IOUs, and Repayments”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** default App Store page — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 67 distinct source pages link in; parent is `/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/couple-shared-expense-balance-calculator/` — Couple Shared Expense Balance Calculator

- **Page job / visitor / intent:** Calculates a fair shared expense balance between two partners using 50/50, custom, income-proportional, category-based, or paid-total views, including repayments or transfers already made. Intended for Partners who share expenses and want to understand uneven spending without scorekeeping. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 0 clicks / 101 impressions / 0.00% CTR / position 7.20; 91d 0 / 101 / 0.00% / position 7.20. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 12 distinct internal source pages, and no broken production route. Title: “Couple Shared Expense Balance Calculator | You Owe Me”; H1: “Couple Shared Expense Balance Calculator”.
- **Meaningful weakness / exact action:** Keep the functioning calculator, split-method explanation, privacy behavior, and couples CPP. Obtain page-filtered queries before changing its already-specific title; measure tool-start and result events by landing page.
- **Expected impact / priority / confidence:** Separates a snippet problem from a demand/sample-size problem for 101 recent impressions at position 7.2. P2; Medium.
- **Conversion route:** couples / relationship spending CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=8e720a01-7489-4044-9f6a-0080793442a0. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 12 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/couple-shared-expense-balance-calculator/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Investigate.**

### `/tools/family-reimbursement-tracker-template/` — Family Reimbursement Tracker Template

- **Page job / visitor / intent:** Gives families a simple template for recording purchases, repayments, and remaining amounts. Intended for People tracking parent bills, sibling reimbursements, or shared family purchases. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 2 clicks / 36 impressions / 5.56% CTR / position 4.50; 91d 2 / 68 / 2.94% / position 6.15. Recent impressions/day are about 2.5× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 21 distinct internal source pages, and no broken production route. Title: “Family Reimbursement Tracker Template | Track Money Paid for Family”; H1: “Family Reimbursement Tracker Template”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** family reimbursements CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=bc366b6c-90ff-4cde-9ae7-d420c6512e7a. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 21 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/family-reimbursement-tracker-template/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/group-payback-calculator/` — Group Payback Calculator

- **Page job / visitor / intent:** Calculates each person's share, subtracts what each person already paid back, and shows who is paid, partly paid, or still open. Intended for People who paid first for a group gift, tickets, dinner, deposit, booking, or shared purchase and need a clear payback status list. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 1 clicks / 177 impressions / 0.56% CTR / position 6.64; 91d 1 / 177 / 0.56% / position 6.64. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 20 distinct internal source pages, and no broken production route. Title: “Group Payback Calculator | Track Who Paid You Back”; H1: “Group Payback Calculator”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** group paybacks CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 20 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/group-payback-calculator/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/partial-repayment-calculator/` — Partial Repayment Calculator

- **Page job / visitor / intent:** Partial repayments make the remaining balance hard to remember. This tool subtracts one or more partial payments from one known original amount and creates a clear remaining-balance summary. Intended for People who know the original amount owed and need to calculate what remains after one or more partial repayments. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 2 clicks / 199 impressions / 1.01% CTR / position 7.80; 91d 2 / 199 / 1.01% / position 7.80. Visibility is concentrated entirely in the recent window; treat it as new.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 29 distinct internal source pages, and no broken production route. Title: “Partial Repayment Calculator | See What Is Still Owed”; H1: “Partial Repayment Calculator”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 29 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/partial-repayment-calculator/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/payment-plan-calculator/` — Payment Plan Calculator for Money Owed Between People

- **Page job / visitor / intent:** Calculates repayment steps, payoff timing, and remaining balance for informal money arrangements. Intended for People turning an open balance into weekly, biweekly, or monthly repayment steps. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 10 clicks / 566 impressions / 1.77% CTR / position 7.40; 91d 12 / 692 / 1.73% / position 7.05. Recent impressions/day are about 10.1× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 34 distinct internal source pages, and no broken production route. Title: “Payment Plan Calculator for Money Owed Between People | You Owe Me”; H1: “Payment Plan Calculator for Money Owed Between People”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 34 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/payment-plan-calculator/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/polite-payback-reminder-generator/` — Polite Payback Reminder Generator

- **Page job / visitor / intent:** Generates a calm reminder that matches the relationship, tone, and repayment situation. Intended for People who want a personalized repayment reminder message. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 2 clicks / 175 impressions / 1.14% CTR / position 14.19; 91d 2 / 283 / 0.71% / position 15.50. Recent impressions/day are about 3.6× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 41 distinct internal source pages, and no broken production route. Title: “Polite Payback Reminder Generator | Ask to Be Paid Back | You Owe Me”; H1: “Polite Payback Reminder Generator”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 41 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/polite-payback-reminder-generator/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/repayment-receipt-generator/` — Repayment Receipt Generator

- **Page job / visitor / intent:** Creates a simple confirmation after money is paid back, including remaining balance when relevant. Intended for People who want to confirm a repayment and what it covered. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 4 clicks / 193 impressions / 2.07% CTR / position 9.58; 91d 6 / 249 / 2.41% / position 8.89. Recent impressions/day are about 7.8× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 29 distinct internal source pages, and no broken production route. Title: “Repayment Receipt Generator | Confirm Money Paid Back”; H1: “Repayment Receipt Generator”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 29 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/repayment-receipt-generator/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/repayment-reminder-text-examples/` — Repayment Reminder Text Examples for Asking Someone to Pay You Back

- **Page job / visitor / intent:** Provides calm message examples for reminding someone about money without sounding confrontational. Intended for People who need careful wording for a repayment reminder. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 0 clicks / 18 impressions / 0.00% CTR / position 6.50; 91d 1 / 121 / 0.83% / position 12.21. Recent impressions/day are about 0.4× the earlier 63-day remainder; direction is modest and should not trigger a rewrite by itself.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 36 distinct internal source pages, and no broken production route. Title: “Repayment Reminder Text Examples | Ask to Be Paid Back Politely”; H1: “Repayment Reminder Text Examples for Asking Someone to Pay You Back”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** money owed / follow-ups CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 36 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/repayment-reminder-text-examples/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/roommate-bill-split-calculator/` — Roommate Bill Split Calculator

- **Page job / visitor / intent:** Helps roommates split a monthly set of bills and see what each person should settle. Intended for Roommates splitting rent, utilities, groceries, supplies, or monthly household costs. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 7 clicks / 518 impressions / 1.35% CTR / position 8.79; 91d 8 / 735 / 1.09% / position 9.17. Recent impressions/day are about 5.4× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 20 distinct internal source pages, and no broken production route. Title: “Roommate Bill Split Calculator | Rent, Utilities & Groceries”; H1: “Roommate Bill Split Calculator”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** roommates / household costs CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 20 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/roommate-bill-split-calculator/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/running-balance-calculator/` — Running Balance Calculator

- **Page job / visitor / intent:** Shows the current balance between two people after a sequence of entries. Intended for People adding expenses, repayments, partial repayments, and adjustments over time. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 4 clicks / 400 impressions / 1.00% CTR / position 6.80; 91d 11 / 772 / 1.42% / position 6.51. Recent impressions/day are about 2.4× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 42 distinct internal source pages, and no broken production route. Title: “Running Balance Calculator for Money Between Two People | You Owe Me”; H1: “Running Balance Calculator”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 42 distinct source pages link in; parent is `/tools/`; 3 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/running-balance-calculator/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

### `/tools/split-expense-calculator/` — Split Expense Calculator

- **Page job / visitor / intent:** Calculates who should pay whom after a shared expense is divided and points to Group Paybacks when repayment tracking continues. Intended for People splitting one shared bill, event, trip, meal, or purchase. Format: tool; parent route: `/tools/`.
- **Search evidence:** 28d 61 clicks / 6,199 impressions / 0.98% CTR / position 6.95; 91d 73 / 7,299 / 1.00% / position 7.63. Recent impressions/day are about 12.7× the earlier 63-day remainder; directional growth, not an equal-period page comparison.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 36 distinct internal source pages, and no broken production route. Title: “Split Expense Calculator | Split Bills & See Who Owes What”; H1: “Split Expense Calculator”.
- **Meaningful weakness / exact action:** Keep the calculator, H1, opening, privacy statement, examples, and shared-expenses CPP unchanged. Run a one-variable SERP test after obtaining page-filtered queries: title candidate `Free Split Expense Calculator | See Who Owes What`; do not simultaneously rewrite the page.
- **Expected impact / priority / confidence:** Potential CTR lift on the second-largest non-home landing page while preserving a strong, immediately useful tool. P1; Medium-high.
- **Conversion route:** shared expenses over time CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 36 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/split-expense-calculator/index.html`, `content/content-registry.mjs`, `scripts/analytics.js`. **Improve.**

### `/tools/temporary-financial-support-record-template/` — Temporary Financial Support Record Template

- **Page job / visitor / intent:** Helps someone record what was covered, what should happen next, and how timing changes should be handled. Intended for People writing down temporary support, expectations, check-ins, and updates. Format: tool; parent route: `/tools/`.
- **Search evidence:** No row in either Page export; this is not evidence of failure. Check publication/indexing age and demand before changing it.
- **Already strong:** The page provides an immediate browser utility before promotion, explains the job and limits, and routes the next action through a focused BNS. Self-canonical, indexable, in the sitemap, valid structured data, 21 distinct internal source pages, and no broken production route. Title: “Temporary Financial Support Record Template | You Owe Me”; H1: “Temporary Financial Support Record Template”.
- **Meaningful weakness / exact action:** No material change supported by current evidence. Preserve the current page job, search promise, useful content, internal routes, and conversion destination while visibility matures.
- **Expected impact / priority / confidence:** Avoids unnecessary churn and cannibalization risk. —; High.
- **Conversion route:** temporary financial support CPP — https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049. This matches the registry and production link set. The app is promoted through the page-specific useful path/BNS rather than replacing the answer.
- **Internal links:** 21 distinct source pages link in; parent is `/tools/`; 4 BNS destinations are rendered. No broken destination or orphan condition was found.
- **Implementation files / final disposition:** `tools/temporary-financial-support-record-template/index.html`, `content/content-registry.mjs`. **Keep unchanged.**

## 7. High-confidence copy recommendations

Only changes with a credible material rationale are included. Do not rewrite surrounding body copy in the same deployment.

| Page | Element | Current | Proposed | Why / evidence | Benefit | Confidence |
|---|---|---|---|---|---|---|
| `/blog/what-is-a-running-balance-between-two-people/` | Meta description | “A running balance is the current total after each expense, repayment, or adjustment. See a simple example for money between two people and when a calculator helps.” | “Running balance means the total after each debit, credit, expense, or repayment. See the bank/ledger definition, a two-person example, and a calculator.” | 4,252 page impressions at 0.40% CTR/p5.56; visible property queries include generic, definition, and bank-account wording. The page already answers both. | Better snippet qualification without title risk | High |
| `/blog/how-to-ask-someone-to-pay-you-back-without-being-rude/` | Title | “How to Ask Someone to Pay You Back Without Being Rude | YouOweMe Blog” | “How to Ask Someone to Pay You Back Without Being Rude” | 190 recent-only impressions, zero clicks, p8.54; exact H1 already communicates the full job and the suffix can cause truncation. | Clearer SERP promise | High |
| `/blog/how-to-ask-family-for-temporary-financial-help/` | Title | “How to Ask Family for Money Help Without Making It Awkward” | “How to Ask Family for Temporary Financial Help | Examples” | 312 impressions, zero clicks, p7.53; the H1 and page content are specifically about temporary help and copyable examples. | Better intent specificity | Medium-high |
| `/blog/how-to-politely-say-no-when-people-ask-for-money/` | Title test | “How to Say No to Someone Asking for Money | Scripts” | “How to Say No When Someone Asks for Money | Text Scripts” | 4,712 impressions, 0.49% CTR, p7.38; visible property queries use “when someone asks” and “examples.” | Potential CTR lift | Medium-high; measure as a test |

Do **not** change the title, H1, opening, or quick example on `/blog/how-to-remind-someone-they-owe-you-money-politely/`. Its title closely reflects visible high-performing wording (“promised you money … by text”), it is the largest landing page, and no stronger alternative is supported.

## 8. Internal-linking and navigation findings

- Indexable orphans: **none**. Weak inbound paths (≤2 distinct source pages): **none**. The least-linked indexable route, `/find/`, still has six distinct inbound sources and is prominently linked from the homepage.
- Production internal paths checked: 73. Broken internal destinations: **none**.
- Every strategic guide/tool/solution/comparison has rendered Best Next Step output. The system contains 263 BNS cards and routes through the registry.
- The strongest pages already link to the right next jobs. Examples: the reminder guide → reminder generator, text examples, partial-repayment calculator, and money-owed solution; running-balance guide → calculator, one-off split, shared-expense solution, and money-owed solution; split calculator → message, group payback, running balance, and shared-expenses CPP.
- No new source→destination link passed the meaningful-impact filter. Adding more links would be more likely to dilute decisions than close an authority gap.
- The routing audit produced eight “many related links” warnings for `/find/`, `/tools/`, `/solutions/app-to-track-money-owed/`, `/solutions/group-payback-tracker/`, `/blog/how-to-track-who-paid-you-back-for-a-group-expense/`, `/blog/how-to-keep-track-of-who-owes-you-money/`, `/compare/best-way-to-track-ious-between-people/`, and `/compare/splitwise-alternative/`. These are warnings, not defects. Do not prune without click-path data; the visible BNS remains limited and purposeful.
- Navigation/hubs: the seven-item primary navigation, homepage situation router, `/find/`, and four main hubs form sensible human paths. Keep the systems; do not replace them.

## 9. Technical findings

### Critical technical issues (P0)

None found.

### Template/system findings

- All 71 production routes returned 200. All 67 indexable routes are self-canonical, index/follow, and in the sitemap. HTTP and `www` home variants 301 to the canonical HTTPS non-`www` origin.
- Production and repository matched on title, description, robots, canonical, H1, and App Store destination. Small word-count differences were server-injected/encoding differences, not substantive content drift.
- Repository audits: content registry 71/71 passed; routing had zero hard errors and eight link-count warnings; SEO/AI hygiene had zero hard errors and one low-priority generic-CTA-label warning on the gift-vs-loan guide.
- Structured data parses on every indexable page and matches visible content categories: 31 Article/BlogPosting pages, 55 BreadcrumbList, 51 FAQPage, 30 WebPage, seven WebApplication tools, product/review schema on core pages. Do not add schema for schema's sake.
- Images: no missing alt attributes. External App Store badge images lack explicit dimensions on 21 pages; address only alongside Core Web Vitals evidence or a template touch. This did not produce visible breakage in sampled mobile pages.

### Page-specific findings

- Homepage desktop hero: fourth proof-list item is visually detached. P2 UI defect; mobile sample had no horizontal overflow.
- `/events/live-link/` and `/events/timeline/`: 200 noindex pages with meta refresh + JavaScript redirect and homepage canonical. Prefer server 301 eventually; no current GSC demand makes this P3, not P0.
- `/images/main.png`: 404 with one historical impression and no recent row. Monitor; do not restore an obsolete image only for one impression.
- `/redeem/`: uses a valid generic App Store ID URL rather than the canonical marketing URL. It is noindex and task-specific; no growth impact.

### Low-priority observations that do not justify work now

- Duplicate title exists only across the two noindex legacy redirect stubs.
- The gift-vs-loan page has two generic App Store CTA labels. Improve when that page is next touched, not as a standalone growth batch.
- No measured Core Web Vitals export was supplied; response timing from this crawl is not a substitute. Do not start performance infrastructure work from synthetic impressions alone.

## 10. Content overlap and cannibalization

| Page group | Relationship | Verdict |
|---|---|---|
| Reminder guide, ask-for-payback guide, reminder examples, reminder generator | Explanation vs broader asking guidance vs copy library vs interactive generator | Correctly distinct. Preserve; request joined page-filtered queries before any consolidation. |
| Running-balance definition and calculator | Definition/education vs calculation | Correctly distinct; link both ways and keep. |
| Split calculator, group-payback calculator, roommate calculator, couples calculator | One-time multi-payer split vs one-payer collection status vs household monthly settle-up vs two-partner balance | Correctly distinct; no consolidation. |
| Shared-expense, roommate, couples, family, caregiving solutions | Common product core but different audiences and decision rules | Correctly audience-specific; no consolidation. |
| Splitwise alternative, generic IOU methods, spreadsheet comparison, shared-ledger-vs-running-balance | Brand comparison vs broad method choice vs spreadsheet decision vs product-model decision | Correctly distinct. Ranking is the Splitwise page's issue, not duplication. |
| Family reimbursement and elderly-parent content | General relatives/reimbursements vs caregiving/parent costs | Correctly distinct. |

Possible cannibalization cannot be proven from whole-property exports. The highest-value check is a page-filtered Queries export for the four reminder/asking assets and for the two running-balance assets. Until then, differentiation and internal routing are strong enough that consolidation would be premature and risky.

## 11. AI-search and entity clarity findings

### Strong and realistic

- The homepage directly defines You Owe Me as an iPhone app for tracking money between people and states when it is useful.
- Product boundaries are explicit: not a bank, lender, debt collector, payment processor, cash advance provider, or accounting system.
- Direct answers, definitions, examples, calculations, scripts, and visible tool fallback text are crawlable without requiring interaction. Important content is not hidden behind JavaScript.
- Product features, privacy explanations, reviews, screenshots, structured data, `llms.txt`, robots policy, and App Store links reinforce the same entity and use cases.
- Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot/Search/User, Google-Extended, and wildcard agents are intentionally allowed. This enables access; it does not guarantee citation or ranking.
- Original practical value is credible: calculators, generators, downloadable family templates, relationship-safe scripts, decision frameworks, product-informed workflows, and explicit “when not to use the app” guidance.

### Meaningful improvement

Adopt a small entity naming contract:

1. Visible primary product name: **You Owe Me**.
2. App Store/formal schema name: **Loan Tracker: You Owe Me**.
3. Schema/search alias: **YouOweMe**.
4. Category definition: **an iPhone app for tracking money between people**.

Apply first to homepage, features, quick start, reviews, and the main money-owed solution; do not mechanically rewrite every historic occurrence. This is an entity-consistency improvement, not an AI-ranking trick.

### Do not do

Do not add machine-only text, fake citations, speculative “AI Overview” schema, generated filler, or more `llms.txt` content without a human-facing information need. No measured AI referral/citation data was supplied, so citation likelihood remains a qualitative judgment.

## 12. Conversion findings

### Strong

- Information/tool value comes first on guides and tools; the app route appears after the user understands the amount, message, record, or ongoing need.
- The registry defines 11 active CPP themes plus the default page; production links matched their intended clusters across all 71 routes.
- BNS cards describe what happens after the click and avoid duplicating App Store badges.
- `scripts/analytics.js` records page visits, App Store opens, CTA location, button variant, current/intended CPP, destination URL, cluster, and BNS/tool events. The measurement foundation already exists.
- The money-owed solution converts through the money-owed CPP and is the strongest product landing page (41 clicks / 2,018 impressions / 2.03% CTR).

### Gap

No analytics or App Store Connect conversion export was supplied, so this audit cannot identify which page/CTA/CPP produces qualified downloads. Do not infer conversion quality from Search Console clicks. The next CRO decision should use existing event data rather than add CTAs.

### Correct App Store destinations

| Registry key | Production destination |
|---|---|
| `client-payment-records` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=15af0298-82ca-4a0e-8230-d12774916992 |
| `couples-relationship-spending` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=8e720a01-7489-4044-9f6a-0080793442a0 |
| `elderly-parent-caregiving` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=794c6086-e032-4408-ab2f-acb4ad23ec98 |
| `family-reimbursements` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=bc366b6c-90ff-4cde-9ae7-d420c6512e7a |
| `general` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670 |
| `group-paybacks` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043 |
| `long-term-balances` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=07350272-1b8a-4f9f-a267-dc72c33b4404 |
| `money-owed-followups` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db |
| `roommates-shared-household-costs` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12 |
| `shared-expenses-over-time` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc |
| `temporary-financial-support` | https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049 |

No incorrect default-route substitution was found. Keep CTA density and placement unchanged until page-level App Store-open and CPP conversion data identifies a problem.

## 13. Pages and systems that should not be changed

- **Polite reminder guide:** preserve title, H1, quick example, direct formula, script library, and BNS. It is the largest search landing page and closely matches visible query wording.
- **Money-owed solution:** preserve current title/opening, product boundaries, one-person-use explanation, and money-owed CPP. It already combines strong CTR with rapid visibility growth.
- **Split calculator functionality and on-page copy:** the useful tool, privacy statement, examples, mobile layout, and post-result routes are strong. Only a controlled title test is justified.
- **Homepage category positioning and situation router:** “money between people,” iPhone clarity, immediate category definition, and situation paths are differentiated. Fix the layout defect only.
- **`/find/`:** keep the situation-first router. It is not thin and does not need replacement by search or a new taxonomy.
- **Content registry, BNS renderer, related-resource model, analytics taxonomy, and CPP routing:** zero hard errors, complete route coverage, purposeful conversion routes. Improve entries, not architecture, when evidence supports a page change.
- **Sitemap, robots policy, canonical system, and visible-content-backed schema:** all work. Do not replace or expand them for novelty.
- **Reviews and privacy/data pages:** strong trust, factual boundaries, App Store evidence, and product schema. No search-driven rewrite is warranted.
- **Distinct tools/guides/solutions/comparisons:** retain the format-specific jobs described in section 10; consolidation is unsupported.
- **Pages with no GSC row:** keep indexed and unchanged while they mature. No-data is not a removal signal.

## 14. Prioritized implementation plan

### Batch 1 — P0 critical issues

- **Scope/pages:** None.
- **Expected files:** None.
- **Validation:** Continue production crawl, sitemap, registry, routing, and SEO/AI hygiene checks in normal releases.
- **Benefit:** Avoids manufacturing critical work where none exists.
- **Risks:** None.
- **Excluded:** Legacy client redirects and badge dimensions; they are not P0.

### Batch 2 — Highest-confidence immediate P1 wins

- **Scope/pages:** running-balance meta description; ask-for-payback title; family-help title.
- **Expected files:** the three route `index.html` files; sitemap only if a genuine dateModified policy requires it (do not change lastmod for cosmetic metadata without content policy support).
- **Validation:** `node scripts/validate-content-registry.js`; `node scripts/audit-content-routing.mjs`; `node scripts/audit-seo-ai-hygiene.mjs`; production title/meta/canonical check; mobile/desktop smoke check; annotate deployment date; compare the next full 28-day page export.
- **Expected benefit:** More qualified organic clicks from pages already ranking on page one.
- **Risks:** Search snippets may be rewritten by Google; small samples on two pages.
- **Excluded:** Body rewrites, new sections, schema additions, new pages, and reminder-page changes.

### Batch 3 — Remaining P1 improvements

- **Scope/pages:** saying-no title test; split-calculator title test after page-filtered queries; conversion analysis using existing analytics and CPP data.
- **Expected files:** two route HTML files only if tests proceed; analysis may require no code. `scripts/analytics.js` only if the export proves a missing event dimension.
- **Validation:** one-variable tests, page-filtered query baselines, tool-start/result checks, CTA/CPP event reconciliation.
- **Expected benefit:** CTR and tool engagement gains on two high-impression pages; connects search acquisition to downloads.
- **Risks:** Concurrent changes make attribution impossible; do not test both title and meta at once.
- **Excluded:** Calculator behavior changes, CTA-density increases, and broad template rewrites.

### Batch 4 — Selected P2 improvements

- **Scope/pages:** homepage hero proof-list layout; targeted entity naming on homepage/features/quick-start/reviews/money-owed solution; query-led refinement of shared/roommate/couples/client solution pages only when exports support it.
- **Expected files:** `index.html`, `styles/landing.css`, selected route HTML, `content/content-registry.mjs`, possibly `llms.txt` and schema blocks for consistent naming.
- **Validation:** page design audit on every touched route; desktop and 390 px mobile screenshots; schema-visible text consistency; registry/routing/SEO audits; App Store link reconciliation.
- **Expected benefit:** clearer first-screen experience, stronger entity consistency, better intent qualification for solution pages.
- **Risks:** mechanical renaming can create awkward brand copy; solution expansion can cannibalize tools/guides.
- **Excluded:** all-site search/replace, new schema types, new clusters, and unvalidated content expansion.

### Batch 5 — Longer-term or data-dependent work

- **Scope/pages:** server-side 301s for legacy event routes when hosting rules are touched; Apple badge dimensions if CWV/layout-shift data supports it; any new content only after current pages mature.
- **Expected files:** hosting/config rules if available, shared badge markup/template, affected HTML.
- **Validation:** redirect-chain tests, robots/sitemap verification, Lighthouse/CrUX or field CWV comparison, production link crawl.
- **Expected benefit:** technical cleanliness and lower layout-shift risk; limited near-term growth.
- **Risks:** spending time on low-impact work.
- **Excluded:** restoring obsolete `/images/main.png` without renewed demand and replacing working site architecture.

## 15. Additional data requested

Request only these datasets because each changes a real decision:

1. **Page-filtered Search Console Queries exports for the reminder/asking group**: `/blog/how-to-remind-someone-they-owe-you-money-politely/`, `/blog/how-to-ask-someone-to-pay-you-back-without-being-rude/`, `/tools/repayment-reminder-text-examples/`, and `/tools/polite-payback-reminder-generator/`. Decision: confirm whether jobs are distinct in Google or whether title-level cannibalization exists before any consolidation.
2. **Page-filtered Queries exports for the running-balance guide and calculator.** Decision: verify generic bank/ledger versus two-person/calculator intent before touching the title or routing.
3. **Page-filtered Queries exports for the split calculator, saying-no guide, family-help guide, and the four zero-click solution pages** (shared, roommate, couples, client). Decision: choose between snippet change, content-intent refinement, or simply allowing new visibility to mature.
4. **Firebase/GA App Store-open export** by landing page, CTA location, button variant, intended CPP, and date, plus tool-start/result events. Decision: identify which useful pages and next steps actually move qualified users toward the App Store.
5. **App Store Connect CPP impressions/product-page views/downloads/conversion** for all 11 CPPs plus default, aligned to the same dates. Decision: determine whether a website route sends the right audience and whether CPP creative—not the website—is the conversion constraint.
6. **URL Inspection/indexing details only for a page that remains zero-impression after at least another complete 28-day window**, starting with the gift-vs-loan guide or temporary-support record template. Decision: distinguish indexing/deployment delay from genuinely low demand. Do not request inspection exports for every page now.

No dedicated AI-performance export is required to act on the qualitative clarity finding, but future server-log or analytics referral data from AI assistants would allow measured citation/referral reporting. Until then, do not claim AI visibility gains.

