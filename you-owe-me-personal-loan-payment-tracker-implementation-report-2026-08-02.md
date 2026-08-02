# You Owe Me — Personal Loan Payment Tracker Implementation Report

## 1. Executive summary

Classification: **Ready for review; not released.** The canonical browser-tool route exists at `/tools/personal-loan-payment-tracker/`, is present in the content registry, sitemap, analytics page-metadata map, `llms.txt`, Tools hub, Find router, and the specified contextual source pages. The current implementation has a working planned-versus-actual reconciliation engine, result states, outputs, explicit local saving, and one later-page App Store CTA.

This report distinguishes source/static evidence from observed local-browser evidence. All current required automated checks passed with zero hard errors. The routing and SEO audits still emit warnings; they are listed in section 15 and do not include a broken tracker route or a hard validation failure.

The repository does not contain an auditable record that identifies the author or exact time of each existing worktree change. The file inventory in section 15 is therefore a current-state worktree inventory, not an attribution claim. This reporting pass did not intentionally modify implementation files, run a deployment, create a commit, publish, or request indexing.

## 2. Source inputs and evidence boundary

Inputs reviewed:

- The page-build specification attached in the current Codex thread.
- The integration specification attached in the current Codex thread.
- The later thread instruction to add the generated hero illustration.
- `AGENTS.md`, `docs/page-design-contract.md`, `docs/best-next-steps.md`, and `docs/ai-search-access-policy.md`.
- The current local route, tracker script and tests, page-local CSS, content registry, generated sitemap and Best Next Step output, analytics map, hubs, Find router, inbound source pages, `llms.txt`, and `robots.txt`.

Evidence labels used below:

- **[Source]** means the current repository file, a deterministic command, or a custom read-only static inspection was checked.
- **[Browser]** means the route was run from a local HTTP server and inspected through the browser at the recorded viewport or interaction state.
- **[Unverified]** means a fact that cannot be established from the current worktree, the supplied briefs, or the local browser session.

No remote production deployment, analytics console, App Store console, search console, generated-image job history, printer dialog output, or downloaded CSV file was inspected. Those systems are outside the evidence available for this report.

## 3. Requirements-compliance ledger

| Requirement area | Status | Evidence and material notes |
| --- | --- | --- |
| 1. Route, identity, and scope | Implemented | [Source] Required canonical route, title, H1, tool positioning, one-loan scope, and stated boundaries are in `tools/personal-loan-payment-tracker/index.html:4-65, 98-123`. |
| 2. Hero | Implemented with later approved illustration change | [Source][Browser] The later image request supersedes the earlier build brief’s “No decorative hero image” direction. The hero retains the required copy and no hero App Store CTA; the illustration is one bounded visual column. |
| 3. Starting details and agreed plan | Implemented | [Source][Browser] Supports lent/borrowed perspective, new/in-progress starting state, currency, current balance, paid-before context, optional plan, weekly/biweekly/monthly cadence, first unpaid due date, validation, and plan-calculator routing. |
| 4. Actual activity and reconciliation | Implemented | [Source][Browser] Payment and additional-borrowing entries are date ordered; payments apply to the oldest unpaid scheduled amount; edit/delete recalculates the results. |
| 5. Results and outputs | Implemented | [Source][Browser] Snapshot cards, schedule, history, no-plan, paid-in-full, overpayment, copy, print/PDF activation, CSV activation, explicit local save/restore/remove, and state-aware next step are present. |
| 6. Product bridge and boundaries | Implemented | [Source][Browser] The first product-learning content is after a useful result and output actions. The single direct App Store CTA is in the later product-proof section. |
| 7. Metadata, schema, and crawlability | Implemented | [Source] One canonical, title, description, robots directive, Smart App Banner, four visible-backed schema types, sitemap entry, and `llms.txt` entry were verified. |
| 8. Hero illustration | Implemented; generation provenance not independently verifiable | [Source][Browser] Decodable WebP asset is used once in the hero with intrinsic dimensions and required alt text. No local job/result artifact identifies the image-generation model or prompt execution. |
| 9. Registry and App Store routing | Implemented | [Source] Registry uses `appStoreCpp: "general"`; its resolver points to the default product page, not an invented personal-loan CPP. |
| 10. Best Next Step | Implemented | [Source][Browser] One generated module follows result/output/state-aware sections, has four requested cards in the requested order, and uses existing click tracking. |
| 11. Outbound page relationships | Implemented | [Source] Parent, related tools, three contextual solution links, and exactly one direct App Store anchor are present; 43 non-external page `href` values resolved locally. |
| 12. Inbound, hub, and Find relationships | Implemented | [Source][Browser] Seven contextual inbound routes plus Tools and two Find placements point to the new route. |
| 13. Analytics and privacy | Implemented within existing taxonomy | [Source] Existing page metadata gets `tool`, `money_owed_followups`, and `default`; no page-specific event, parameter, or financial-input collection was added. |
| 14. Design, accessibility, and responsive behavior | Implemented | [Source][Browser] Page-design audit has zero hard errors; responsive measurements at 320, 390, 768, 1024, and 1440px had no document horizontal overflow. |
| 15. Validation and delivery boundaries | Implemented, with release intentionally not performed | [Source][Browser] Required checks pass; no commit, deploy, publication, or indexing action was performed. |

## 4. Page implementation and tracker behavior

### Route, page structure, and boundaries

[Source] The current page title is `Personal Loan Payment Log | Track Actual Repayments`, and it has one H1: `Record Actual Loan Payments and See What Is Still Owed` (`tools/personal-loan-payment-tracker/index.html:4, 101`). Breadcrumbs are `You Owe Me / Tools / Personal Loan Payment Tracker` (`:94-96`). The page says the tool does not lend money, move payments, create a legal agreement, or enforce repayment (`:104`), and exposes no app-download gate before calculation.

[Source] The implementation separates the planned schedule from actual activity:

- `calculateTracker` uses integer minor units, not floating-point arithmetic; `parseMoney` rejects third decimal places rather than silently rounding (`scripts/personal-loan-payment-tracker.js:24-42, 225-341`).
- Activities are sorted by date and then original insertion order (`:137-142`), preserving same-day ordering.
- Payments reduce the raw balance and allocate to scheduled installments from oldest unpaid forward (`:253-270`).
- Additional borrowing increases the balance, preserves prior allocations, consumes recorded forward credit where applicable, and appends future principal to the projection (`:271-292`).
- Result states include no regular plan, on track, ahead, due today, overdue, paid in full, and a visible check-recorded-amounts overpayment state (`:298-341, 581-621`).

[Source] The UI is split into visible steps: starting details, agreed repayment rhythm, actual activity after creation, a current snapshot, schedule, activity history, outputs, state-aware next step, Best Next Step, rules, example, decision explanation, product proof, related tools, FAQ, and final in-page CTA. The result-only wrapper is initially `hidden` (`tools/personal-loan-payment-tracker/index.html:224`) and is revealed by successful tracker creation (`scripts/personal-loan-payment-tracker.js:623-646`).

### Deterministic calculation coverage

[Source] `scripts/personal-loan-payment-tracker.test.js:1-75` covers the following fixtures and assertions:

| Fixture | Verified behavior |
| --- | --- |
| A | No-plan payment reduces a 500 balance to 375 and has no schedule, next payment, or payoff. |
| B | 150 partial plus 300 extra payment allocates 200/200/50 across installments; later 100 borrowing keeps prior allocations and extends payoff. |
| C | A 450 payment flows through 200/200/50 installments and leaves 150. |
| D | A paid installment remains paid after later borrowing, which adds future projected principal. |
| E | A 120 payment against a 100 balance exposes 20 overpayment and `Check recorded amounts`. |
| F | Paid-before context is retained without subtracting it a second time. |
| G | A 100 balance at 33.33 uses `33.33, 33.33, 33.33, 0.01`; no cumulative minor-unit loss. |
| H | Month-end monthly dates preserve 31st where possible and use February 28 / April 30. |
| I | Plan-status transitions are on-track, due-today, and overdue. |
| J | Editing and deleting activity recalculate later results. |
| K | Same-day payment then borrowing preserves creation order in balance history. |

### Browser interaction evidence

[Browser] A local worked example produced a current remaining balance of `$850.00`, plan status `Ahead of plan`, three activity rows, seven schedule rows, a next payment of `$150.00 on October 12, 2026`, and projected payoff `February 12, 2027`.

[Browser] Separate manual states produced:

| State exercised | Observed result |
| --- | --- |
| No regular plan, 500 starting balance | `$500.00`, `No regular plan`, next payment `Not set`, payoff `Not available`, and the no-plan schedule explanation. |
| Regular plan, 100 starting balance, 100 payment | `$0.00`, `Paid in full`, paid notice visible, one schedule row marked `Paid`. |
| No regular plan, 100 starting balance, 120 payment | `$0.00`, `Check recorded amounts`, and the visible 20.00 overpayment notice. |
| Worked example then edit first payment 150 → 100 | Recalculated balance was `$900.00`. |
| Then delete that first activity | Recalculated balance was `$1,000.00` with two activity rows remaining. |
| Copy summary | Status read `Loan summary copied.` |
| Explicit local save | Button changed to `Update saved tracker`, remove control appeared, status read `Saved on this device.` |
| Explicit local remove | Button reverted to `Save this tracker on this device`, remove control hid, status read `Saved tracker removed from this device.` |

[Browser] CSV and print controls were activated without a browser console error. The local browser automation surface did not produce a downloadable-file or printer-dialog artifact; source inspection confirms CSV construction/download and `window.print()` wiring (`scripts/personal-loan-payment-tracker.js:798-840, 1004-1006`) and print CSS is reviewed in section 7.

[Browser] The simple-next-step state was visible for a simple no-plan result and the ongoing-record state was visible for the worked example. This agrees with the trigger implementation in `scripts/personal-loan-payment-tracker.js:611-621`.

## 5. Responsive layout, mobile behavior, and product-journey hierarchy

[Browser] Measurements from the local route are below. `scrollWidth` equalled viewport width at every requested width, so the document itself had no horizontal overflow. Off-canvas navigation elements have layout boxes outside the viewport at mobile widths, but did not increase document scroll width.

| Viewport | Hero layout | Illustration geometry | Tool start | Overflow observation |
| --- | --- | --- | --- | --- |
| 320 × 700 | One column | 260 × 114px, after copy/actions | y=968px | 320px scroll width |
| 390 × 844 | One column | 315 × 138px, after copy/actions | y=967px | 390px scroll width |
| 768 × 900 | One column | 315 × 138px, after copy/actions | y=895px | 768px scroll width |
| 1024 × 900 | Two columns | 367 × 276px, right of copy | y=837px | 1024px scroll width |
| 1440 × 1000 | Two columns | 416 × 313px, right of copy | y=884px | 1440px scroll width |

[Source] The CSS switches the hero to a single column at `max-width: 780px`, constrains the image to 21.5rem, crops it to `16 / 7`, and sets `object-fit: cover` (`styles/personal-loan-payment-tracker.css:490-493`). At `max-width: 480px`, hero actions expand to full width (`:527-546`). This explains the shallow visual seen at 390px: it follows hero copy and actions but precedes the tool, and the tool begins about 123px below the 844px initial viewport rather than being moved far down the page.

[Source] The 1024px and 1440px hero uses a two-column grid with copy first and a capped visual column second (`styles/personal-loan-payment-tracker.css:52-64`). The responsive tool workspace becomes single-column at 1100px (`:484-488`), while mobile tables become labelled cards at 780px (`:508-524`).

[Browser] At desktop, the H1 is visually larger and more prominent than the illustration. At 390px, the actions are visible before the shallow image and the image is immediately followed by the tracker section. The worked example rendered result cards without document overflow at 390px.

## 6. Hero visual and asset references

### Current hero asset

| Item | Verified value |
| --- | --- |
| Asset | `images/tools/personal-loan-payment-tracker-hero.webp` |
| File format / dimensions | WebP, VP8 encoding, 1600 × 1200px (4:3) |
| File size | 116,108 bytes (about 113 KiB) |
| HTML placement | `tools/personal-loan-payment-tracker/index.html:98-113`, as the second child of the hero section |
| HTML intrinsic dimensions | `width="1600" height="1200"` |
| HTML loading behavior | `loading="eager" fetchpriority="high" decoding="async"` |
| Alt text | `Illustration of planned loan installments and real payments being reconciled into one clear remaining balance.` |

[Browser] The image loaded from `/images/tools/personal-loan-payment-tracker-hero.webp` and rendered correctly in the hero at 390px and 1440px. Desktop visual inspection showed orderly installment cards, differently sized payment tokens and merging paths, without embedded text, logo, mock phone UI, contract, cash pile, confrontation, or warning imagery. The personal-object cues are understated tabletop items rather than faces or a handshake.

Generation result: **artifact verified; model/job provenance unverified.** The later instruction requested image generation, and the final decodable file is present and used exactly once in the hero. The current repository and supplied attachments do not preserve an image-generation result ID, model name, or raw prompt execution record, so those facts cannot be independently reported as verified.

### Product-proof screenshot

[Source] A separate pre-existing app screenshot is referenced once in the later product-proof section, not in the hero: `images/shared/app-screenshots/EN_AppStore_Separate_Loan_Records.webp` (WebP VP8, 1290 × 2796px) at `tools/personal-loan-payment-tracker/index.html` in the product-proof section. Static count check found one hero illustration reference and one product-screenshot reference; no additional generated image was found on the route.

## 7. Design, accessibility, privacy, and print behavior

### Design-system evidence

[Source] The page uses its local stylesheet plus established `tools.css` and shared Best Next Step CSS (`tools/personal-loan-payment-tracker/index.html:73-76`). The page-design audit reports body class `tools-page`, audited stylesheets `styles/tools.css` and `styles/personal-loan-payment-tracker.css`, and zero hard errors.

[Source] The principal palette is neutral white/blue/green. One warning treatment uses the orange-brown value `rgba(183, 111, 58, 0.75)` for a warning border (`styles/personal-loan-payment-tracker.css:117-119`). It is limited to warning/overpayment presentation rather than a primary brand treatment. This is called out because the integration brief said not to introduce legacy brown/orange styling; it is a review item rather than a design-audit failure.

### Accessibility evidence

[Source] The page has semantic breadcrumb navigation, one H1, labelled forms and fieldsets, step headings, a snapshot aside, table captions and header scopes, visible FAQ details/summary elements, dialogs, descriptive link text, and the required hero alt text. The current source has no duplicate IDs; custom static inspection also found one H1, one canonical, and one Smart App Banner.

[Source] Focus-visible styles add a 3px outline for links, buttons, inputs, selects, and summary controls (`styles/personal-loan-payment-tracker.css:99-105`). Reduced motion reduces transition duration and scroll behavior (`:553-557`). Dialog helpers retain the opener and return focus after close (`scripts/personal-loan-payment-tracker.js:717-727`).

[Browser] Submitting the empty starting form showed the visible `role="alert"` error summary with an anchor to the missing field. Its text was `Check the highlighted fields: Enter the amount owed when tracking begins.` The polite live status element exists, and the active Create button had a computed 3px focus outline.

### Privacy and local behavior

[Source] Sensitive record data is not persisted by default. The local-storage key is `uomi_personal_loan_payment_tracker_v1`; it is written only by explicit save, supports one record, and has restore, replace, and remove dialogs (`scripts/personal-loan-payment-tracker.js:843-958`). The UI explicitly says saved data remains in the browser, is not synced to You Owe Me or analytics, may disappear when browser data is cleared, and cannot be automatically imported (`tools/personal-loan-payment-tracker/index.html:238-246`).

[Source] The tracker script contains no analytics API or event call. Page-level analytics uses the existing shared module only (`tools/personal-loan-payment-tracker/index.html:341`); no names, loan labels, notes, dates, currencies, balances, payment amounts, schedules, or local-storage contents are sent by a tracker-specific event.

### Print/PDF behavior

[Source] Print CSS hides navigation, editable form controls, output controls, Best Next Step, product proof, related tools, FAQ, final CTA, inline edit/delete buttons, and saved-state content. It shows print details, result cards, the full table headers/tables, and hides the app screenshot (`styles/personal-loan-payment-tracker.css:559-603`). The complete schedule is rendered for output before print (`scripts/personal-loan-payment-tracker.js:1017-1022`).

## 8. Metadata, structured data, Smart App Banner, robots, sitemap, and `llms.txt`

[Source] Head metadata is verified at `tools/personal-loan-payment-tracker/index.html:4-65`:

- Title: `Personal Loan Payment Log | Track Actual Repayments`.
- Meta description: `Record actual payments against an agreed personal loan plan. See the remaining balance, installment status, next payment, and projected payoff.`
- Canonical: `https://you-owe-me.com/tools/personal-loan-payment-tracker/`.
- Robots: `index, follow`.
- Open Graph and Twitter title: `Personal Loan Payment Log | Track Actual Repayments`.
- Open Graph and Twitter description: the approved actual-payment description.

[Source] The single JSON-LD block parsed successfully. Its graph contains `WebPage`, `WebApplication`, `BreadcrumbList`, and `FAQPage`; the seven FAQ entities match visible page FAQs. The WebApplication name is `Personal Loan Payment Tracker`, description matches visible page copy, and it declares a zero-price web-browser finance application. No `LoanProduct`, `FinancialProduct`, `Product`, review, or rating schema was found.

[Source][Browser] Exactly one Smart App Banner metadata element exists, with the exact value `app-id=1147058670, affiliate-data=pt=117888502&amp;ct=website_smart_banner` in source (`tools/personal-loan-payment-tracker/index.html:7`). Browser DOM resolves the entity to `...&ct=website_smart_banner`, as expected for parsed HTML.

[Source] `sitemap.xml:184-189` contains the canonical route with `lastmod` `2026-08-02`, `changefreq` `weekly`, and `priority` `0.88`. `robots.txt` allows all listed user agents and contains no route-specific rule or current diff. `llms.txt:97` adds the requested tool entry in the Free tools section.

## 9. Content registry, controlled vocabulary, and App Store routing

[Source] The registry entry at `content/content-registry.mjs:3026-3113` records:

- URL `/tools/personal-loan-payment-tracker/`; title `Personal Loan Payment Tracker`; `pageType: "tool"`; `cluster: "repayments"`.
- The requested primary audience, problem solved, use-when text, parent, related pages, four related tools, and personal-loan solution.
- `appStoreCpp: "general"`, `updated: "2026-08-02"`, `status: "live"`, `priority: "core"`, the required primary CTA, and required next step.
- All eight requested aliases.
- A generated Best Next Step configuration with the requested heading, intro, cards, destinations, priorities, and analytics IDs.

[Source] The registry supports aliases, but no `shortTitle` property was found in the active entry schema. Conversion role and analytics cluster are derived: `pageType: "tool"` maps to `utility`, and `cluster: "repayments"` maps to `money_owed_followups` (`content/content-registry.mjs:76-115`). No unsupported direct fields were added.

### Requested-tag mapping

The exact requested tags that are supported were retained: `personal-loan`, `repayment-plan`, `partial-payment`, `extra-payment`, `remaining-balance`, and `projected-payoff`.

| Requested phrase | Implemented normalized tag | Reason |
| --- | --- | --- |
| `loan-payment-log` | `loan-payment-history` | Existing controlled vocabulary. |
| `actual-payments` | `payment-history` | Existing controlled vocabulary. |
| `planned-vs-actual` | `repayments` | Existing controlled vocabulary. |
| `additional-borrowing` | `loan-already-in-progress` | Nearest existing loan-continuation vocabulary. |
| `next-payment` | No direct tag; represented by plan/reimbursement context | No exact controlled tag was present. |
| `browser-tool` | `tool` | Existing controlled vocabulary. |
| `friends-family` | `friends-and-family` | Existing controlled vocabulary. |

[Source] The current `general` App Store routing value resolves to `https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670`. No active specific personal-loan CPP was found in the inspected source. The default route is therefore the verified choice, and the page does not describe it as a CPP.

[Source][Browser] The new page contains exactly one direct App Store anchor, with the approved label `Create an ongoing loan record in You Owe Me` and the exact default URL. It is in the later product-proof section; it is not a hero CTA, a BNS destination, or an output gate.

## 10. Best Next Step integration

[Source] The generated module is bounded by exactly one `best-next-step:start` and one `best-next-step:end` marker pair, and static inspection found exactly one `best-next-step` module. It sits inside the result-only container after schedule, history, output actions, and the state-aware next-step section, before the rules section (`tools/personal-loan-payment-tracker/index.html:224-287`).

[Source][Browser] After loading the worked example, the result wrapper was visible and its child order was:

1. Planned versus actual repayments.
2. Activity history.
3. Keep a copy of this snapshot.
4. Your next useful step.
5. `Choose the next step that matches the record`.

The BNS card order, destinations, controlled intents, and shared tracking event are:

| Position | Card | Destination | Intent |
| --- | --- | --- | --- |
| 1 | Confirmation — You need to confirm one payment | `/tools/repayment-receipt-generator/` | `confirm_payment` |
| 2 | Communication — A partial payment changed the conversation | `/blog/how-to-follow-up-after-a-partial-repayment/` | `handle_partial_repayment` |
| 3 | Mixed history — The record includes other expenses too | `/tools/running-balance-calculator/` | `calculate_running_balance` |
| 4 | Ongoing record — The loan will keep changing | `/solutions/personal-loan-repayment-tracker/` | `track_ongoing_balance` |

[Source] All four cards have `data-track-event="best_next_step_click"`, and the builder output is marked generated rather than hand-authored. The first card is the requested lowest-friction browser-artifact continuation rather than an App Store promotion.

[Source] `node scripts/build-best-next-steps.mjs` built modules for 74 pages and changed 0 files.

## 11. Outbound links from the new page

[Source] A read-only static link inspection found 43 non-external `href` values on the new page and no missing local targets. The following required relationships are present:

| Relationship | Anchor text | Destination | Placement |
| --- | --- | --- | --- |
| Parent hub | Tools | `/tools/` | Breadcrumb. |
| Initial plan | Create the initial payment plan | `/tools/payment-plan-calculator/` | Plan-routing callout. |
| State-aware solution | See how You Owe Me keeps a personal loan current | `/solutions/personal-loan-repayment-tracker/` | Ongoing state only. |
| Decision solution | See the full personal-loan workflow | `/solutions/personal-loan-repayment-tracker/` | Browser/app decision section. |
| Product-proof solution | Review the full personal-loan workflow | `/solutions/personal-loan-repayment-tracker/` | Product-proof secondary link. |
| Partial repayment | Calculate what remains | `/tools/partial-repayment-calculator/` | Related-tools card. |
| Running balance | Reconstruct the running balance | `/tools/running-balance-calculator/` | Related-tools card. |
| Receipt | Create a repayment confirmation | `/tools/repayment-receipt-generator/` | Related-tools card. |
| Direct App Store | Create an ongoing loan record in You Owe Me | Verified default App Store page | Later product-proof section; exactly one direct App Store anchor. |

The page also has contextual FAQ, BNS, final in-page, and header/footer links. The three solution links use the three specified distinct contexts and labels; they are not duplicates in the same component.

## 12. Inbound links, Tools hub, Find, and intentional omissions

[Source][Browser] The following routes contain the requested crawlable link to the tracker. Browser inspection found each listed anchor in rendered DOM; the repayment-receipt link is intentionally result-only and therefore exists but is not visible until a receipt result is generated.

| Source route | Source file | Anchor | Placement |
| --- | --- | --- | --- |
| `/tools/payment-plan-calculator/` | `tools/payment-plan-calculator/index.html:597-604` | Track actual repayments against the plan | Result-adjacent `Payments already started?` section; solution route retained separately. |
| `/tools/partial-repayment-calculator/` | `tools/partial-repayment-calculator/index.html:575-583` | Compare the payments with the plan | Existing result-adjacent information card; solution/App routes remain. |
| `/tools/running-balance-calculator/` | `tools/running-balance-calculator/index.html:366-379` | Track one loan against its repayment plan | Copy-summary section distinguishing one loan from mixed relationship balance. |
| `/tools/repayment-receipt-generator/` | `tools/repayment-receipt-generator/index.html:417-421` | Continue with the loan payment tracker | Generated receipt output card. |
| `/solutions/personal-loan-repayment-tracker/` | `solutions/personal-loan-repayment-tracker/index.html:246-256` | Track actual repayments in the browser | Post-artifact bridge before the existing direct App Store action. |
| Repayment-plan guide | `blog/how-to-suggest-a-repayment-plan-to-someone-who-owes-you-money/index.html:331` | Track the real payments against the plan | Immediately after plan-agreement content. |
| Partial-repayment follow-up guide | `blog/how-to-follow-up-after-a-partial-repayment/index.html:680-689` | Update the loan payment record | Existing active-repayment product bridge. |

[Source][Browser] The Tools hub card is immediately after Payment Plan Calculator and before Partial Repayment Calculator (`tools/index.html:225-246`), with status chip `Repayment tools`, required description, and `Track actual repayments` CTA.

[Source][Browser] Find has both required placements:

- A Personal loan situation card after the existing personal-loan solution card (`find/index.html:172-189`).
- A crawlable browse-by-situation card after the personal-loan solution browse card (`find/index.html:528-543`), using existing filters `tools repayments someone-owes i-owe` rather than a new taxonomy.

[Source] No tracker card was added to `/solutions/`, `/blog/`, or a comparison page. This is intentional and matches the integration scope: the browser tool is represented in Tools and Find; Blog uses contextual links and the personal-loan solution remains the solution-hub representation.

## 13. Discoverability, analytics, and external-integration boundaries

[Source] Discoverability artifacts are aligned:

- Registry `status: "live"` and `priority: "core"` are present.
- Sitemap is generated and contains the canonical entry and requested date.
- The page is indexable and `robots.txt` allows all relevant crawlers; no crawler-policy change was needed.
- `llms.txt` lists the public tool with the recordkeeping and boundary language.
- Search aliases are registry aliases for this one route; they do not create extra public relationship-specific routes.

[Source] `scripts/analytics.js:106` adds only the existing page-metadata record:

```js
"/tools/personal-loan-payment-tracker/": { page_type: "tool", cluster: "money_owed_followups", app_store_cpp: "default" },
```

No new analytics event name, parameter, helper, taxonomy value, lifecycle event, or calculator-input analytics was added. The page continues to use the established `uomi_web_page_visited`, `uomi_web_app_store_opened`, and BNS click patterns through shared site code; the report does not infer any install, conversion, subscription, or purchase outcome from those events.

## 14. Copy fidelity, deviations, and factual scope notes

### Exact-copy verification

[Source] Required titles, metadata, H1, hero direct answer, privacy/boundary copy, tool prompts, output labels, core calculation rules, BNS heading/intro/cards, App Store label, hub card, Find cards, `llms.txt` line, registry audience/problem/use-when/CTA/next-step, and specified inbound/outbound link copy match the supplied briefs at the cited source locations throughout this report.

### Reported deviation / supersession

| Brief instruction | Current implementation | Reason and status |
| --- | --- | --- |
| Earlier page-build brief: “No decorative hero image.” | One hero illustration is present. | The later explicit user request required exactly one high-quality generated hero illustration with specific placement, dimensions, alt text, and mobile behavior. The integration brief subsequently instructed preservation of the hero illustration. This is a later authorized specification change, not an unreported rewrite. |
| Preferred tags include `next-payment` and other unsupported exact terms. | Controlled-vocabulary mappings listed in section 9. | The integration brief specifically required nearest established normalized tags rather than a new taxonomy. |
| Short title “if schema supports it.” | No `shortTitle` field added. | The active registry entry schema/pattern did not expose a supporting field. |

No other material copy deviation was identified in the inspected current files. This conclusion is limited to the provided build/integration briefs and current checked source, not to unprovided design drafts or past repository revisions.

### Scope confirmations

[Source] The current implementation confirms:

- The specified canonical route exists; no additional route or relationship-specific route was created.
- No CPP URL or CPP key was invented.
- The page has one direct App Store CTA, not an additional CTA block.
- No tool-calculation logic change was made during this reporting pass. Current deterministic tests still pass.
- No personal or financial values were added to analytics.
- No homepage, global navigation, Solutions hub, Blog hub, comparison page, crawler policy, or unrelated analytics taxonomy change appears in the current implementation inventory.
- No commit, deployment, publication, indexing submission, or indexing request was performed in this reporting pass.

## 15. Validation evidence and current worktree inventory

### Commands run

| Command | Result |
| --- | --- |
| `node scripts/build-best-next-steps.mjs` | `Best Next Step modules built for 74 page(s); 0 file(s) changed.` |
| `node scripts/validate-content-registry.js` | `Content registry validation passed for 79 page(s).` |
| `node scripts/audit-content-routing.mjs` | 80 live route files, 79 registry entries, 74 sitemap URLs, 74 strategic BNS URLs, 0 hard errors, 18 warnings. |
| `node scripts/audit-seo-ai-hygiene.mjs` | 80 route files, 79 registry entries, 74 sitemap URLs, 0 hard errors, 2 warnings. |
| `node scripts/audit-page-design.mjs /tools/personal-loan-payment-tracker/` | `Hard errors: 0`; audited `styles/tools.css` and `styles/personal-loan-payment-tracker.css`. |
| `git diff --check` | Exit 0; no output. |
| `node --check scripts/personal-loan-payment-tracker.js` | Exit 0; no output. |
| `node --test scripts/personal-loan-payment-tracker.test.js` | 1 test file, 1 pass, 0 failures; test output states `personal-loan-payment-tracker tests passed`. |

### Additional read-only checks

- [Source] Custom static inspection: one title, one H1, one canonical, one Smart App Banner, no duplicate IDs, one JSON-LD block that parsed, and schema types `WebPage`, `WebApplication`, `BreadcrumbList`, `FAQPage`.
- [Source] Custom local-link inspection: 43 non-external page `href` values and no missing local target.
- [Source] File inspection: hero WebP is decodable VP8 WebP at 1600 × 1200px and 116,108 bytes; app screenshot is decodable VP8 WebP at 1290 × 2796px.
- [Source] Static counts: one BNS marker pair, one generated BNS module, one hero illustration reference, one product screenshot reference, and one direct App Store anchor on the new page.
- [Browser] Local browser checks at 320, 390, 768, 1024, and 1440px showed no document horizontal overflow. Required tracker states and all source/hub links were inspected as described above.
- [Browser] `reviewTab.dev.logs()` returned `[]` after the interaction checks.

### Audit warnings (kept separate from hard errors)

Content-routing audit warnings, all from the current audit output:

1. Related-link-count review warnings for `/find/`, `/features/`, `/tools/`, `/solutions/`, `/solutions/app-to-track-money-owed/`, `/solutions/temporary-financial-support-tracker/`, `/solutions/shared-expense-tracker/`, `/solutions/group-payback-tracker/`, `/tools/split-expense-calculator/`, `/tools/group-payback-calculator/`, `/tools/running-balance-calculator/`, `/blog/how-to-track-who-paid-you-back-for-a-group-expense/`, `/blog/how-to-split-costs-when-people-pay-at-different-times/`, `/blog/how-to-keep-track-of-who-owes-you-money/`, `/compare/best-way-to-track-ious-between-people/`, and `/compare/splitwise-alternative/`.
2. `/solutions/personal-loan-repayment-tracker/` uses the default App Store destination.
3. `/tools/personal-loan-payment-tracker/` uses the default App Store destination.

The tracker’s default-App-Store warning is expected: `general` is the verified default route and the integration brief explicitly directs that choice when no precise active CPP exists. The checked evidence does not establish which of the other warnings pre-dated this implementation, so they are reported as current warnings rather than labelled “pre-existing.”

SEO/AI-hygiene audit warnings are unrelated to this tracker route:

1. `/solutions/personal-loan-repayment-tracker/` has two generic App Store CTA labels.
2. `/blog/how-to-clarify-if-money-was-a-gift-or-a-loan/` has two generic CTA labels.

### Current implementation worktree inventory

[Unverified attribution] Immediately before this report file was added, the current worktree showed these 18 implementation-path changes relative to `HEAD`. Their topic is consistent with the tracker work; their author and timing cannot be established from current status/diff alone.

Modified tracked files:

- `blog/how-to-follow-up-after-a-partial-repayment/index.html`
- `blog/how-to-suggest-a-repayment-plan-to-someone-who-owes-you-money/index.html`
- `content/content-registry.mjs`
- `find/index.html`
- `llms.txt`
- `scripts/analytics.js`
- `sitemap.xml`
- `solutions/personal-loan-repayment-tracker/index.html`
- `tools/index.html`
- `tools/partial-repayment-calculator/index.html`
- `tools/payment-plan-calculator/index.html`
- `tools/repayment-receipt-generator/index.html`
- `tools/running-balance-calculator/index.html`

Untracked implementation paths:

- `images/tools/personal-loan-payment-tracker-hero.webp`
- `scripts/personal-loan-payment-tracker.js`
- `scripts/personal-loan-payment-tracker.test.js`
- `styles/personal-loan-payment-tracker.css`
- `tools/personal-loan-payment-tracker/index.html`

The Markdown report itself is a reporting artifact created after that inventory; it is not an implementation change.

## 16. Remaining concerns and review items

1. **Release state is unverified.** All evidence is local. A reviewer with deployment authority should confirm the deployed route, server headers, production canonical/sitemap availability, and the live App Store target before release.
2. **Default App Store destination remains a deliberate routing warning.** The registry has no precise active CPP for planned-versus-actual personal-loan reconciliation. The required `general` destination is correct under the current source, but a future active, verified personal-loan CPP would need a fresh route-and-screenshot review before replacement.
3. **Image generation provenance is unavailable.** The final asset quality, dimensions, placement, and restrictions were visually checked, but the repository does not retain the generation model/result metadata. Preserve the source asset and the user-supplied brief if provenance is required later.
4. **Print and CSV file artifacts were not captured.** Browser activation and source wiring were verified; the automation surface did not expose a printer dialog or downloaded file to inspect. A manual release QA pass should save one PDF and download/open one CSV in the target browser if those exports are release-critical.
5. **Validation focus behavior deserves optional accessibility review.** The empty-form error summary is a `role="alert"` with anchor links and a visible focus outline, but the observed active element remained the Create button rather than moving to the summary or first invalid field. This is not a current audit failure, but it is an opportunity for a screen-reader/keyboard specialist to confirm the intended flow.
6. **Warning color review.** The page has a limited orange-brown warning border (`rgba(183, 111, 58, 0.75)`), despite the integration brief’s general direction to avoid legacy brown/orange styling. It is a secondary warning treatment, not a primary visual system. No change was made in this report-only pass.
7. **Current warning baseline is unknown.** There is no supplied prior audit log for the 16 link-count warnings or two unrelated generic-CTA warnings. They should be triaged separately rather than attributed to this page without history.

## 17. Final factual readiness assessment

**Ready for review; not released.** The current local implementation meets the supplied page, illustration, and integration requirements that could be verified from source and browser behavior. Required validators, deterministic tests, syntax checking, static metadata/link checks, responsive inspection, and console inspection show no hard failure.

The remaining items are review/release-process items: validate live deployment and production App Store routing, optionally capture a real PDF/CSV export, decide whether the warning-border color merits adjustment, and preserve image-generation provenance if needed. No implementation files were intentionally modified while producing this report.
