# French personal-loan solution inventory — 20 October 2026

Direct English source: all 498 lines of `/solutions/personal-loan-repayment-tracker/index.html`. French target: `/fr/solutions/suivi-remboursement-pret-personnel/index.html`. This is the solution page, not the separate browser loan calculator/import tool. Native French/professional vous terminology applies; first-person lender/borrower cards describe the visitor’s situation. Accepted Arabic architecture only informs implementation. Translator owns new page/inventory/author evidence, not shared CSS/runtime/config/existing-language changes.

## Authored content and product boundaries

| Area | Scope retained and translated |
| --- | --- |
| Metadata/schema | Title, description, OG/Twitter, canonical, French/LTR, WebPage and BreadcrumbList text/current/home URLs; truthful 20 October localization date. Original publisher/app identities retained. No FAQ/schema claims added. |
| Navigation/breadcrumb | All labels/accessibility text and accepted French home/money-owed links. English hubs/tools/guides labeled. Generator owns reviewed cluster links/switch on admission; unfinished calculator not linked as French. |
| Hero | Named loan, realistic repayment, actual partial/extra/early/late payments, remaining balance/next payment/reminder/projection, both lender/borrower views. Friends/family/partners/roommates scope and formal-bank-loan/automatic-collection exclusion. Formal lender manual-reconciliation route retained. One active repayment plan free, iPhone app, neutral Store CTA, original campaign IDs and example fragment. |
| Loan-fit/roles | Identifiable ongoing loan, repayment already understood, complete lender and borrower needs. Four simpler routes for no clear agreement, one-off schedule, mixed bilateral expenses and known payments. Loan-vs-plan distinction retained twice. |
| Import | Both lending/borrowing, existing loan/history/compatible interest-free schedule, full formats, one-loan limit, review/correct, no spreadsheet sync and iPhone continuation. Import/guide remain labeled English working links; no English inline importer initialized. |
| Connected example | Payment recorded, whole-loan balance vs remaining installment vs enabled reminder clearly distinct. Conditional reminder language retained; original due date unchanged. See exact math below. French QR/camera instruction, free-plan reassurance and source synthetic/as-of/currency/no-interest labels. |
| Separate loans/map | Separate names/balances/history/state/optional plan still contribute to person total. Currency/start date/note/visual identity/updates/interest/settled state retained. Native HTML relationship diagram translated rather than rasterized. Snapshot explicitly after first payment, separate from later continuation. |
| Loan Outlook | Recorded dates across selected Space/local records/person, pay-vs-receive directions, chosen range, overdue separate from upcoming, no agreed date separate, no currency conversion, records/plans same source. |
| Plan choices | Lower/balanced/faster comparison; chosen payment/date/count; weekly/every two weeks/monthly/first date; regular/count/final/projected payoff/interest/total projection; no-new-interest/fixed-total/reducing-balance annual interest if agreed; no interest advice. Calculator/manual-guide/agree-schedule routes retained. |
| Same financial record | Actual payment entry from plan/loan/normal selected-loan flow, edit/delete rebuilding, changing/ending plan preserves loan/payments/old versions/history. |
| Reminders | Explicitly enabled, next unpaid installment’s remainder and original due date after partial/full/extra, lender-vs-borrower action, record payment from reminder updates loan/schedule/following reminder. |
| Already in progress | Current balance/real start date/paid-before-tracking context/uncertain note/agreed future steps, complete five-row table. Strong no-double-deduction rule and no fabricated history retained. Both visible headers AND mobile data-label pseudo-headings translated. |
| Relationship timeline | Full loan/plan/payment/next/today/overdue/follow-up/shared-document/settled contexts; exact plan or communication action; may state no action needed, no pressure. |
| PDF sharing | All nine listed loan/people/initial/current/direction/history/frequency/next/projection/interest-plan fields retained. Optional active/completed plan summary; personal/shared context. Explicitly not binding contract or regulated bank statement. |
| Method table | All five situations, matching note/one-off schedule/known-payment/mixed-balance/ongoing-app options, visible headings and all mobile data-label strings translated. |
| Capability boundaries | Full seven can-do and eight cannot-do source lists, including no lending/underwriting, transfers/collection, bank detection, enforcement, legal replacement, guarantee, bank statement or two-party repayment contract via Balance Sync. People still make decisions/payments. |
| Next steps/final/footer | Four complete source cards with stable tracking IDs/French ownership marker; full final ongoing-history logic, one-active-plan free/iPhone/no-money-transfer qualifier; both final CTAs/date and all footer labels. |

## Financial examples — explicit USD, no conversion

- Connected first stage: original loan **1,200 USD**, actual payment **150 USD**, whole loan **1,050 USD** remaining. Monthly installment **200 USD**, so **50 USD** remains on that installment. The **enabled** reminder follows that **50 USD**, still due **1 November 2026**.
- Later payment: Jordan pays **300 USD**. Allocation **50 + 200 + 50 = 300** completes the current remainder, covers the next installment and carries 50 forward. Whole loan **1,050 − 300 = 750 USD**.
- Additional borrowing: **100 USD**, so **750 + 100 = 850 USD**. Past payments stay in history; future schedule, enabled reminder and payoff projection recalculate.
- Separate two-loan snapshot is explicitly **after the first payment**, not after later events: computer **1,050 USD** + moving deposit **400 USD** = Jordan overall **1,450 USD**. Both textual mini-record and HTML map use this same snapshot.
- French grouping and nonbreaking value/currency spacing are presentation only. Date/calendar and source values remain unchanged.

## Assets and runtime

Three English screenshots (separate loan records, choose a payback plan, relationship timeline) become French HTML illustrations. Each visibly says « Exemple illustratif » and « Ceci n’est pas une capture de l’application. » The source relationship map and connected-payment artifact are native HTML and fully translated, including accessibility labels. No new SVG/raster recreation is required. All original-language assets remain intact.

English Apple badges become French text buttons using nonbreaking App Store and neutral `https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_cta&mt=8`. Reuse `/images/fr/iphone-handoff/app-store.png` (376×376), preserving neutral Store URL and `website_qr_exp006` campaign. No national storefront, fake native screenshot or converted currency.

Root-owned shared runtime covers French mobile Menu/Close, app-language-support panel, analytics locale and desktop/mobile QR visibility/failure recovery. No copy/calculator/financial upload controls are introduced. English importer remains a link. No new shared CSS required at authoring time; verify explicit USD labels in connected results and desktop download text button during real rendering, and translate mobile `content:attr(data-label)` via this page’s attributes.

## Acceptance

Required scoped design audit: zero hard errors. Author static checks cover all local targets/fragments/IDs, substantial main-only French, mobile table labels, no English image/badge/custom-product pixels, the exact staged financial invariants and separate snapshot. Independent reviews must inspect 320/390/600/1440 rendering, numeric wrapping, keyboard/focus/fragment behavior, QR failure/recovery and neutral journey, no-JS content, accepted counterparts, cache/generation/metadata and Arabic↔French direction/font transitions. These author checks are not independent acceptance.
