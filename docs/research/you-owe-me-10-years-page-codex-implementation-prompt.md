# Codex implementation prompt: build the permanent You Owe Me ten-year page

You are working in the You Owe Me website repository. Build the new permanent ten-year product-history and trust page described below.

This is an implementation task, not a strategy task. The content strategy and production copy are approved. Implement them accurately. Do not reconsider the page concept, substitute a sale-led landing page, expand it into a generic About page, or rewrite the supplied copy.

Do not commit, deploy, publish, request indexing, or make unrelated changes.

## Source-of-truth order

Use this order if anything appears ambiguous:

1. This implementation prompt, including its exact production copy and fixed decisions.
2. `docs/research/10-year-anniversary-page-strategy.md`.
3. `docs/research/10-year-anniversary-sourcebook.md`.
4. Current repository facts and existing component/design constraints.
5. Your own judgment only for minor technical choices that are not decided here.

The older file `/Users/ievgeniiiablonskyi/Downloads/you-owe-me-anniversary-website-codex-instructions.md` is superseded. Its sale-led framing, `/10-year-anniversary/` route, title, and infrastructure instructions are not approved for this page. Do not use them.

## Copy fidelity rule

All important visible copy is supplied below. Implement it as written. Do not invent, expand, condense, optimize, or rewrite it.

You may make only a small wording change when required by:

- A verified factual repository contradiction.
- Accessibility.
- Responsive/component constraints.
- Correct grammar after a technical change.

Report every visible-copy deviation in the completion report with the original text, replacement text, and exact reason.

The only visible copy that may be inferred rather than supplied here is:

- The existing global navigation and footer copy, which must be copied verbatim from a current modern page such as `/privacy-and-data/` or `/features/`. Do not add a new global navigation item in this pass.
- The existing shared app-language-support component's localized strings. Reuse that component unchanged; do not author or edit its messages.
- Standard Apple App Store badge text embedded in Apple's existing badge asset, if the existing site pattern requires the badge. This prompt instead calls for a text card in Best Next Step, so an additional badge is not expected.

Everything else must use the supplied copy.

---

## 1. Business goal and page identity

### Page identity

- **URL:** `/10-years/`
- **Canonical URL:** `https://you-owe-me.com/10-years/`
- **Final title tag:** `10 Years of You Owe Me (2016–2026) | Our Story`
- **Final H1:** `Ten years of clearer money between people.`
- **Page type:** permanent product-history and trust page with one date-aware, removable anniversary-campaign module.
- **Conceptual parent:** the product/trust layer; use Home as the breadcrumb parent.
- **Primary App Store route:** the default You Owe Me App Store product page.
- **No Custom Product Page:** this page represents the whole product and must not use a loan-, family-, roommate-, or debt-specific CPP.

### Target reader

The page must serve:

- A prospective customer asking whether a focused money-record app is established and actively maintained.
- An existing paid customer who should receive gratitude, not another sales interruption.
- A free or returning user interested in the anniversary experience or limited offer.
- A reviewer, journalist, search engine, or AI answer system looking for an authoritative launch date and concise product chronology.

### Unique strategic job

The page uniquely answers:

> Is You Owe Me an established, actively maintained product that I can trust for records I may need for months or years?

It deserves a standalone URL because the current site distributes this evidence across Features, Reviews, Quick Start, and Privacy & Data. None of those pages provides an authoritative ten-year history or explains how the product's original purpose survived its expansion.

### Emotional, practical, and conversion jobs

- **Emotional:** create recognition, reassurance, gratitude, and confidence without triumphalism.
- **Practical:** give the visitor a useful four-part clarity framework and an honest comparison of when a note is enough versus when an ongoing record helps.
- **Conversion:** after proving continuity and usefulness, route the visitor calmly to the appropriate next step: Quick Start, Features, Privacy & Data, the running-balance tool, the personal-loan solution, Reviews, the native anniversary experience, or the default App Store page.

### Unique artifact

The primary artifact is `The Clarity Ledger: 2016 → 2026`, a six-era, source-backed timeline structured as:

> What people needed → what You Owe Me added → what stayed true.

It must be prominent, fully understandable without interaction, and useful as first-party product history. Do not replace it with a generic feature timeline or version list.

### Natural product bridge

The app is introduced in the hero as the subject of the history, not as an immediate download pitch. The first permanent product-depth link appears after the timeline. Loans and Repayment Plans provide the single flagship example. The default App Store conversion route appears in the late Best Next Step section. The temporary campaign card may provide an early native deep link because campaign visitors intentionally came for that experience.

### Main guardrail

This is not a sale landing page, changelog, Features duplicate, review wall, company biography, lender page, debt-collection page, or generic anniversary article. It must remain valuable when the campaign module and every App Store action are mentally removed.

---

## 2. Approved strategic decisions

### Decisions you must implement

1. Use `/10-years/`, not `/10-year-anniversary/` and not `/anniversary/`.
2. Use the exact title, H1, metadata, production copy, section order, and CTA labels in this prompt.
3. Keep the permanent story primary and the anniversary offer secondary inside one isolated campaign module.
4. Use “what changed / what never changed” as the editorial structure.
5. Implement the six-era Clarity Ledger as the main artifact.
6. Use Loan Records and Repayment Plans as the only deep product-evolution example.
7. Include the four-part clarity framework and the “note is enough / ongoing record helps” comparison so the page remains useful without downloading the app.
8. Use exactly three existing App Store reviews supplied below; do not add more.
9. Use the existing user-supplied anniversary art for the hero; do not generate or substitute generic imagery.
10. Put the Best Next Step section after `The tenth year was not a victory lap.` and before the final thank-you.
11. Use the default App Store page for the general App Store route. Do not attach a CPP parameter.
12. Do not add an FAQ.
13. Do not add a founder biography or signed creator note in this pass.
14. Do not publish private paid-plan, download, commit, archive, or revenue figures.

### Minor technical choices you may make

- Semantic class names and internal wrapper structure.
- Exact CSS grid definitions and responsive breakpoints, provided the required mobile/desktop behavior is achieved.
- Which installed image conversion tool produces the required WebP assets.
- Whether the six timeline items use an ordered list or equivalent semantic chronology.
- Exact analytics location-string values, but only with analytics attributes already used by the repository. Do not introduce a new event name, parameter name, tracking script, or analytics taxonomy.
- Whether the date-aware campaign copy is updated by text-node replacement or pre-authored hidden state panels, provided every state uses the exact copy below and the no-JavaScript fallback remains truthful.

### Decisions you must not reopen

- Whether the page deserves a standalone URL.
- The route.
- The page's history/trust job.
- The hero promise.
- The six timeline eras.
- The flagship loan/plan story.
- The practical framework.
- The late CTA logic.
- The decision to use no CPP.
- The decision to keep campaign/sale material isolated.
- The decision to omit FAQ, founder biography, exhaustive changelog, and private growth statistics.
- The supplied customer review selection and wording.
- The legal/product-boundary wording.

### Small necessary repository adjustment

The required `node scripts/audit-page-design.mjs /10-years/` audit also runs the shared app-language-support route audit. A new root route is otherwise classified as `unclassified` by `scripts/app-language-support-scope.mjs`.

Make the smallest required adjustment:

- Add `/10-years/` to `INCLUDED_EXACT_ROUTES` in `scripts/app-language-support-scope.mjs`.
- Include `/styles/app-language-support.css` exactly once.
- Include `/scripts/app-language-support.js` exactly once using the same loading pattern as current included pages.
- Add exactly one no-JavaScript-safe `<div data-app-language-support-anchor hidden></div>` slot near the late product-conversion group, following the current audit/component convention.
- Do not change the language-support messages or classify any other route.

This narrow classification edit is allowed because it is required for the page-design validation. All broader infrastructure remains deferred.

---

## 3. Files and patterns to inspect first

Read these completely or inspect the relevant sections before editing:

### Mandatory instructions and evidence

- `AGENTS.md`
- `docs/page-design-contract.md`
- `docs/research/10-year-anniversary-page-strategy.md`
- `docs/research/10-year-anniversary-sourcebook.md`

### Modern shell and trust-page patterns

- `tools/index.html`
- `styles/tools.css`
- `privacy-and-data/index.html`
- `styles/privacy-data.css`
- `quick-start/index.html`
- `styles/quick-start.css`

Use `/tools/` and the page-design contract for the modern full-width shell, canonical background, hero, cards, CTA tokens, and reading width. Use Privacy & Data for a serious trust-page tone and Quick Start for a calm product-explanation pattern.

### Strategically close pages whose jobs must not be copied

- `features/index.html` and `styles/features.css`: inspect current feature names, links, screenshot treatment, and present product facts. Do not reproduce its full inventory or feature-tour structure.
- `reviews/index.html` and `styles/reviews.css`: inspect exact approved review text and review-card semantics. Do not recreate its legitimacy FAQ, rating summary, or review collection.
- `index.html`: inspect current global navigation, footer, default App Store URL, and high-level product positioning. Do not recreate its broad situation router or homepage review wall.
- `solutions/personal-loan-repayment-tracker/index.html`: inspect the destination and product boundaries. Do not copy its task-specific page structure or turn the anniversary page into a loan solution page.

### Shared components and behavior

- `styles/site-nav.css`
- `styles/best-next-step.css`
- `scripts/analytics.js`
- `scripts/app-language-support.js`
- `scripts/app-language-support-scope.mjs`
- `scripts/audit-app-language-support.mjs`
- `scripts/audit-page-design.mjs`
- `scripts/hero-layout.js` only if a current modern hero actually uses it and it helps without changing the approved experience.

Identify which existing CSS/component patterns can be reused. Do not copy a nearby page section-for-section. This page's distinct visual device is the documentary timeline and “what changed / what stayed true” structure.

### Existing product screenshot assets

- `images/shared/app-screenshots/EN_AppStore_Separate_Loan_Records.webp`
- `images/shared/app-screenshots/EN_AppStore_Choose_a_Payback_Plan.webp`
- `images/shared/app-screenshots/relationship-timeline.webp`

### User-supplied anniversary artwork

- Desktop source: `/Users/ievgeniiiablonskyi/Downloads/YouOweMe_10Years_InAppEvent_Card_3840x2160.png`
- Mobile source: `/Users/ievgeniiiablonskyi/Downloads/YouOweMe_10Years_InAppEvent_Details_2160x3840.png`

Inspect both before processing. They are visually matched and approved for this page.

---

## 4. Page structure and exact copy deck

Create:

- `10-years/index.html`
- `styles/ten-years.css`
- `scripts/ten-years.js` only for the campaign phase behavior described below.
- The page-local optimized images named in Section 7.

Use the existing global navigation and footer markup verbatim. Do not add `10 Years` to global navigation or footer in this pass.

The page-local visible order must be exactly:

1. Breadcrumb
2. Hero
3. Date-aware anniversary campaign card
4. Factual proof strip
5. Enduring promise
6. The Clarity Ledger timeline
7. Flagship Loan Records / Repayment Plans evolution
8. Practical clarity framework and note-vs-record comparison
9. Customer proof
10. Present-tense active-development section
11. Best Next Step
12. Closing thank-you

Do not add an FAQ, newsletter signup, founder section, secondary feature grid, release-note archive, or extra final CTA.

### 4.1 Breadcrumb

**Purpose:** establish the page as a permanent first-class product/trust route.

**Exact visible copy:**

- Link: `Home` → `/`
- Separator: `/`
- Current page: `10 Years`

Use `aria-current="page"` on `10 Years`.

### 4.2 Hero

**Purpose:** answer why the page exists before asking for any download.

**Layout:** modern two-column hero on wide screens, copy first and artwork second. On mobile, copy remains first and the portrait art follows without pushing the H1 or opening sentence below the initial viewport. Use the responsive `<picture>` art direction specified in Section 7.

**Exact copy:**

Eyebrow:

> 2016–2026

H1:

> Ten years of clearer money between people.

Lead paragraph:

> You Owe Me launched on August 26, 2016 with one focused idea: when money passes between people, the record should stay clear. Ten years later, the app can handle everything from everyday IOUs to separate loans and repayment plans—but that idea has never changed.

Supporting paragraph:

> This is the story of what changed, what stayed the same, and why You Owe Me is still being actively built today.

Primary in-page CTA:

- Label: `See the ten-year journey`
- Destination: `#clarity-ledger`
- Type: content/in-page action, styled with the canonical lime primary CTA token.

Do not add an App Store badge, download button, rating, sale badge, countdown, or offer copy inside the hero.

### 4.3 Date-aware anniversary campaign card

**Purpose:** connect intentional campaign visitors to the native experience while keeping the campaign separate from the permanent page.

**Placement:** immediately after the hero. Visually compact and clearly secondary to the hero. Use the approved green/cream/gold family, but do not repeat the full hero artwork inside it.

**Campaign date logic:** determine the phase using the visitor's local calendar date.

- Pre-launch: before local `2026-08-26`.
- Active: local `2026-08-26` through local `2026-09-04`, inclusive.
- Retrospective: from local `2026-09-05` onward.

Do not use a countdown. Do not detect whether the app is installed. Do not automatically redirect. Do not claim that every free user is eligible.

#### Truthful no-JavaScript/default copy

Eyebrow:

> 10-year anniversary

Heading:

> Celebrate ten years with You Owe Me.

Body:

> The native anniversary experience begins August 26. The limited upgrade offer is available to eligible free users from August 26 through September 4, 2026.

Primary action:

- Label: `Open the anniversary experience`
- Destination: `youoweme://events/anniversary`

Secondary action:

- Label: `View You Owe Me on the App Store`
- Destination: `https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670`

Note:

> Existing paid customers receive a thank-you experience. The offer appears only for eligible free users.

#### Pre-launch JavaScript state

Eyebrow:

> 10-year anniversary

Heading:

> You Owe Me turns 10 on August 26.

Body:

> The anniversary experience opens in the app on August 26. Eligible free users can also explore a limited upgrade offer through September 4.

Primary action:

- Label: `Open the anniversary preview`
- Destination: `youoweme://events/anniversary`

Secondary action:

- Label: `View the App Store event`
- Destination: `https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?eventid=6802562970`

Note:

> Existing paid customers receive a thank-you experience. The offer appears only for eligible free users.

#### Active JavaScript state

Eyebrow:

> 10-year anniversary

Heading:

> The anniversary experience is live.

Body:

> Open You Owe Me for the native 10-year story. Eligible free users can also explore the anniversary upgrade offer through September 4.

Primary action:

- Label: `Open the 10-year experience`
- Destination: `youoweme://events/anniversary`

Secondary action:

- Label: `View the App Store event`
- Destination: `https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?eventid=6802562970`

Note:

> Existing paid customers receive a thank-you experience. The offer appears only for eligible free users.

#### Retrospective JavaScript state

Eyebrow:

> 10-year anniversary

Heading:

> Thank you for ten years.

Body:

> The anniversary offer has ended, but the story remains. Open You Owe Me to revisit the native ten-year experience.

Primary action:

- Label: `Open the anniversary story`
- Destination: `youoweme://events/anniversary`

Secondary action:

- Label: `View You Owe Me on the App Store`
- Destination: `https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670`

Note:

> The anniversary offer ended September 4, 2026.

The JavaScript must only update this page-local module. It must not touch the existing global sale alert or `scripts/sales.js`.

### 4.4 Factual proof strip

**Purpose:** turn the milestone into concise, verifiable evidence.

Use a semantic list with these exact four items:

- `Launched August 26, 2016`
- `Maintained through ten years of iOS change`
- `Available in 10 languages`
- `Still being actively developed in 2026`

Accessible label:

> Ten-year product facts

Do not add rating counts, paid-user counts, download totals, commit counts, archive counts, build numbers, or `124 App Store versions` here.

### 4.5 Enduring promise

**Purpose:** explain why the history matters before showing dates.

Eyebrow:

> One idea

H2:

> The app changed. The goal did not.

Body paragraph 1:

> Money between friends, family, roommates, partners, and clients becomes harder when memory is the system. A small amount can be simple at first, then become unclear after another expense, a partial repayment, a changed date, or one conversation too many.

Body paragraph 2:

> The first You Owe Me kept a person, dated entries, and one running balance together. Each later capability solved a deeper version of the same problem: what happened, what remains, and what comes next.

Then render three concise cards in this order.

Card 1 heading:

> What happened

Card 1 body:

> Record the amount, date, direction, and reason in language that remains understandable later.

Card 2 heading:

> What remains

Card 2 body:

> Keep the current balance and the history behind it easy to check.

Card 3 heading:

> What happens next

Card 3 body:

> Make the next payment, reminder, update, or calm message easier to see.

Boundary callout:

> You Owe Me is a calm record and communication layer for money between real people. It does not lend money, move payments, collect debts, replace accounting, or create a legal contract.

Do not place a CTA in this section.

### 4.6 Main artifact: The Clarity Ledger

**Section ID:** `clarity-ledger`

**Purpose:** provide the page's original, source-backed, standalone value.

Eyebrow:

> The Clarity Ledger

H2:

> A decade of clearer records

Intro paragraph:

> The app did not grow in one straight line. Some years rebuilt the everyday experience. Some kept it reliable through changing iPhones and iOS releases. The most recent years added much deeper structure. Across every era, the standard stayed the same: make the money story easier to understand.

Implement the following six eras in chronological DOM order. Each era must visibly use the exact labels `What people needed`, `What You Owe Me added`, and `What stayed true`.

#### Era 1

Year:

> 2016

Heading:

> Remember the balance

What people needed:

> Stop relying on memory for who paid, who borrowed, and what remained.

What You Owe Me added:

> People, entries, currencies, dates, and a running balance.

What stayed true:

> One understandable record with each person.

#### Era 2

Year:

> 2019

Heading:

> Keep the record useful over time

What people needed:

> Repeat bills, carry history forward, and take records beyond one moment.

What You Owe Me added:

> Recurring entries, exports, shareable history, and cloud continuity.

What stayed true:

> The record should still make sense when someone returns to it later.

#### Era 3

Year:

> 2022

Heading:

> Stay clear through platform change

What people needed:

> Keep a long-lived app familiar and reliable as iOS and devices changed.

What You Owe Me added:

> Platform modernization, dark mode, clearer date grouping, and clearer direction guidance.

What stayed true:

> Technology should not make the money story harder to read.

#### Era 4

Year:

> 2024

Heading:

> Rebuild the modern foundation

What people needed:

> Faster navigation, clearer direction, better performance, and a stronger base for more complex records.

What You Owe Me added:

> A modern person and start experience, clearer lent and borrowed language, performance work, currency improvements, sharing, and stronger visual cues.

What stayed true:

> Complexity should stay behind a calm everyday interface.

#### Era 5

Year:

> 2025

Heading:

> Make the next action clearer

What people needed:

> Know when to follow up, capture records faster, handle recurring or interest-bearing situations, and say the next thing calmly.

What You Owe Me added:

> Stronger reminders, voice entry, interest handling, Split Entry, statements, and more contextual communication.

What stayed true:

> A useful record should reduce awkwardness, not intensify it.

#### Era 6

Year:

> 2026

Heading:

> Give complex arrangements structure

What people needed:

> Keep important loans separate, build a plan around real repayments, understand the relationship timeline, coordinate shared costs, and share or sync clearer records.

What You Owe Me added:

> Loan Records, Repayment Plans, Timeline, Group Paybacks, Live Link, Balance Sync, Spaces, supporting photos, and support for ten languages.

What stayed true:

> Every added layer should make the current balance and next step easier to understand.

Timeline closing copy:

> Ten years did not turn You Owe Me into a bank or an accounting suite. It made the same personal record more capable when the real situation became more complicated.

Timeline CTA:

- Label: `Explore what You Owe Me can do today`
- Destination: `/features/`
- Type: soft content/product bridge, not an App Store CTA.

Do not require clicks to reveal the six era headings or their three core fields. Progressive detail is allowed only if all core text remains visible and crawlable by default.

### 4.7 Flagship evolution: Loan Records and Repayment Plans

**Purpose:** make the ten-year evolution concrete without creating another Features page.

Eyebrow:

> The clearest example

H2:

> From “who owes what?” to a clear path to paid back

Body paragraph 1:

> A running balance is often enough for an everyday IOU or reimbursement. An important or long-running loan needs more structure: its own name, remaining balance, notes, due date, interest context, repayments, and adjustments—while still counting in the total with that person.

Body paragraph 2:

> A Repayment Plan connects that Loan Record to a weekly, every-two-weeks, or monthly schedule. Real repayments do not always match the first plan. They can be partial, early, extra, or late, so the schedule stays connected to what actually happened.

Body paragraph 3:

> That is the clearest picture of how You Owe Me grew: not by replacing a simple record, but by adding structure when a relationship needs it.

Example callout eyebrow:

> One moving deposit, then and now

Example 2016 label:

> 2016

Example 2016 copy:

> One entry in a running balance could preserve who paid and what remained.

Example 2026 label:

> 2026

Example 2026 copy:

> The same situation can have its own Loan Record, repayment plan, real payment history, next-payment context, reminders, and a shareable PDF—while still counting in the total with that person.

Screenshot sequence heading:

> One record that stays connected as the situation changes

Screenshot 1 caption:

> Keep an important loan separate without losing the total with that person.

Screenshot 2 caption:

> Compare a lower payment, balanced schedule, or faster payoff.

Screenshot 3 caption:

> Keep repayments, reminders, shares, and follow-ups in one history.

Boundary note:

> A Repayment Plan is a personal planning and record tool. It does not process payments, collect money, or become a synchronized legal agreement between two people.

CTA:

- Label: `See loans and repayment plans`
- Destination: `/solutions/personal-loan-repayment-tracker/`
- Type: deeper website solution action.

Do not add a direct App Store CTA or CPP in this section. Do not expand it with interest formulas, every loan feature, or debt-collection language.

### 4.8 Practical clarity framework

**Purpose:** give real value even if the visitor never downloads the app.

Eyebrow:

> A useful record

H2:

> What ten years taught us about keeping money clear

Intro paragraph:

> Whatever tool you use, a good record should lower the amount of remembering, reconstructing, and awkward explaining that two people have to do.

Render the following four ordered checklist cards.

#### Item 1

Heading:

> Name what happened.

Body:

> Record the person, amount, date, direction, and reason in language both people could understand later.

#### Item 2

Heading:

> Separate what matters.

Body:

> Keep an important loan distinct from everyday shared expenses, even when both contribute to one total relationship balance.

#### Item 3

Heading:

> Record real repayments.

Body:

> A plan is useful only when partial, early, extra, or changed payments update the story instead of living in a separate memory.

#### Item 4

Heading:

> Keep the next step visible.

Body:

> The record should make the remaining balance, next date or action, and calm message easier to see.

Comparison eyebrow:

> Choose the lightest useful record

Comparison H3:

> When is a note enough?

Comparison intro:

> More structure is not automatically better. Use only what the situation needs.

Implement this as two accessible responsive comparison cards, not a horizontally scrolling mobile table.

#### Left comparison card

Heading:

> A message or note may be enough

Items:

- `One small amount and one expected repayment.`
- `Both people already agree on the amount and timing.`
- `No detailed history will be needed later.`
- `No reminder or follow-up is likely.`

#### Right comparison card

Heading:

> An ongoing record becomes useful

Items:

- `There are multiple entries or partial repayments.`
- `A due date, recurring cost, interest, or repayment schedule matters.`
- `Either person may need to revisit what happened.`
- `The next step, reminder, or update needs to stay visible.`

Closing paragraph:

> You can use these principles in a note, spreadsheet, or message. You Owe Me becomes useful when the record needs to keep changing over time.

CTA:

- Label: `Try the running balance calculator`
- Destination: `/tools/running-balance-calculator/`
- Type: practical browser-only tool action.

Do not add an App Store action in this section. Do not build a new calculator, download, form, or interactive input for this page.

### 4.9 Customer proof

**Purpose:** validate active improvement, long-term reliance, and relationship relief without duplicating Reviews.

Eyebrow:

> Customer voice

H2:

> Built for records people return to

Intro paragraph:

> The strongest proof is not a broad claim about being “loved.” It is what people say after relying on the app, returning to it, and watching it improve.

Use exactly these three cards and no others.

#### Review 1

Editorial label:

> Continued improvement

Visible rating/source line:

> 5 out of 5 · App Store review · Italy · iOS 7.0.4

Quote:

> “This app impresses me more and more. It keeps evolving and improving. Great job!”

Attribution:

> Raismotor

#### Review 2

Editorial label:

> Less family stress

Visible rating/source line:

> 5 out of 5 · App Store review

Quote:

> “I use You Owe Me to keep track of loans I give to my kids, and it’s been great. The app is very easy to use, even for someone like me who isn’t very tech-savvy. It’s taken all the stress out of tracking money between family.”

Attribution:

> BorrowedSun

#### Review 3

Editorial label:

> Built by listening

Visible rating/source line:

> 5 out of 5 · App Store review

Quote:

> “I’ve used this app for a long time. It’s the only app where the developer truly listens and responds. The interface is very easy to use, transactions are fast, and it supports many currencies, reminders, and recurring entries.”

Attribution:

> iPepeep

CTA:

- Label: `Read real App Store reviews`
- Destination: `/reviews/`
- Type: trust/content action.

Use semantic `<blockquote>` and visible attributions. If star glyphs are used visually, expose an accessible `5 out of 5` label and hide decorative glyphs from assistive technology.

Do not add the 4.6 rating summary, 500+ rating claim, review FAQ, stock portraits, or a carousel.

### 4.10 Present-tense active development

**Purpose:** ensure the page does not feel like a retrospective for a finished or abandoned product.

Eyebrow:

> Still being built

H2:

> The tenth year was not a victory lap.

Body paragraph 1:

> It became the app’s most active period of development. In the months leading to the anniversary, You Owe Me added Loan Records, Repayment Plans, Timeline, Group Paybacks, Live Link, Balance Sync, Spaces, supporting photos, and support for ten languages—alongside continuing performance and reliability work.

Body paragraph 2:

> That is not a promise about an unannounced roadmap. It is evidence that the project is being actively maintained today, with deeper capability still held to the original standard: keep the record understandable.

Body paragraph 3:

> Customer support, reviews, suggestions, and long-term use helped make that continued work possible.

Do not add an App Store CTA, roadmap, future-feature teaser, precise release count, acquisition claim, revenue claim, or creator biography here.

### 4.11 Best Next Step

**Purpose:** let a fully informed visitor choose the right next depth instead of pushing every reader directly to the App Store.

**Exact placement:** immediately after `The tenth year was not a victory lap.` section and immediately before the final thank-you.

Eyebrow:

> Best next step

H2:

> Choose what you want to understand next

Intro:

> You have seen where You Owe Me came from and why it is still being built. Choose the next question you want answered.

Render four cards in this order.

#### Card 1

Label:

> How it works

Title:

> See the core You Owe Me model

Description:

> Start here if you want to understand people, entries, repayments, and one running balance before installing.

Destination:

> `/quick-start/`

#### Card 2

Label:

> Current product

Title:

> Explore current features

Description:

> Use this for the complete present-day view of loans, plans, reminders, sharing, Spaces, Timeline, and more.

Destination:

> `/features/`

#### Card 3

Label:

> Trust

Title:

> Read privacy and data details

Description:

> Use this before installing if you want plain-English detail about local records, optional connected features, sharing, and controls.

Destination:

> `/privacy-and-data/`

#### Card 4

Label:

> Use the app

Title:

> Open You Owe Me on the App Store

Description:

> Use this when you are ready to create a record and keep the history in the app.

Destination:

> `https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670`

Use the existing `best-next-step.css` visual language where appropriate. Do not update `content/content-registry.mjs` in this pass. Because the route is intentionally not being registered yet, do not add generated Best Next Step marker comments unless inspection proves that the current build requires them for the section to render. Preferred approach for this pass: hand-author the supplied section without generator marker comments and report that registry generation remains deferred.

Place the required hidden app-language-support anchor near this conversion group, following the shared component audit's placement rules.

### 4.12 Closing thank-you

**Purpose:** leave gratitude—not a sale or conversion demand—as the final editorial impression.

Eyebrow:

> Thank you

H2:

> Thank you for being part of the record.

Body paragraph 1:

> Thank you for every entry recorded, every repayment marked, every review, every suggestion, and every year You Owe Me stayed on your phone.

Body paragraph 2:

> The app is ten years old—and still getting better.

Do not add another App Store badge, download button, review request, offer reminder, newsletter form, or second router here. The App Store route was already offered in Best Next Step.

---

## 5. UX and CTA plan

Implement only the following major actions.

| Placement | Exact label | Destination | Type | Reader value available before it appears |
|---|---|---|---|---|
| Hero | `See the ten-year journey` | `#clarity-ledger` | In-page content action | The first-screen promise explains why the milestone matters |
| Campaign card, default | `Open the anniversary experience` | `youoweme://events/anniversary` | Native deep link | The campaign card explains dates and eligibility |
| Campaign card, pre-launch | `Open the anniversary preview` | `youoweme://events/anniversary` | Native deep link | The visitor knows the experience opens August 26 |
| Campaign card, active | `Open the 10-year experience` | `youoweme://events/anniversary` | Native deep link | The visitor knows the native story and offer eligibility |
| Campaign card, retrospective | `Open the anniversary story` | `youoweme://events/anniversary` | Native deep link | The visitor knows the offer ended but the story remains |
| Campaign card, pre/active | `View the App Store event` | Event URL with `eventid=6802562970` | App Store event action | The visitor intentionally wants the event or install route |
| Campaign card, default/post | `View You Owe Me on the App Store` | Default App Store page | App Store action | The event may not be active; the general listing remains useful |
| Timeline close | `Explore what You Owe Me can do today` | `/features/` | Content/product bridge | The visitor has understood the ten-year history |
| Loan evolution | `See loans and repayment plans` | `/solutions/personal-loan-repayment-tracker/` | Deeper solution action | The flagship evolution has been explained |
| Practical framework | `Try the running balance calculator` | `/tools/running-balance-calculator/` | Browser tool action | The visitor has learned when a simple tool is enough |
| Customer proof | `Read real App Store reviews` | `/reviews/` | Trust action | The visitor has seen three representative proof points |
| Best Next Step cards | Supplied card titles | Supplied routes | Guide, product, trust, and App Store choices | The complete history/trust job has been fulfilled |

Use real `<a href>` links and descriptive anchor text. Do not replace them with JavaScript-only controls. For the in-page anchor, support keyboard use and respect reduced-motion preferences; smooth scrolling is optional and must not override `prefers-reduced-motion`.

Do not add CTAs to the factual proof strip, enduring promise cards, individual timeline eras, present-tense section, or closing thank-you.

Use the existing analytics conventions only. Do not add a new analytics event or script. If current page links use `data-cta-location` or `data-track-location`, use the same attribute names and a consistent page-local value prefix such as `ten_years_`; do not create new parameter names.

---

## 6. Best Next Step treatment

The Best Next Step section belongs after the active-development section because the visitor has then received:

- The authoritative launch fact.
- The original product purpose.
- The six-era history.
- The flagship modern product example.
- Practical guidance that works without the app.
- Customer proof.
- Evidence of current maintenance.

Placing it after the hero would route the visitor away before the page proves its unique value. Placing it after the final thank-you would weaken the emotional close.

In this first page-local pass:

- Render the exact four supplied cards.
- Reuse the existing Best Next Step visual component styles where safe.
- Do not update the content registry.
- Prefer no generated marker comments because this route has not entered the registry yet.
- If marker comments are technically required for rendering, add only the normal start/end markers around the exact supplied HTML and report the constraint. Do not add a registry entry merely to generate this block.

Defer all broader Best Next Step work—registry ownership, analytics cluster metadata, generated routing attributes, related-page relationships, and hub integration—to the later infrastructure pass.

---

## 7. Image-generation and asset plan

Imagery is required because the approved anniversary artwork is product-specific and materially strengthens the milestone, while the current screenshots make the evolution concrete.

No image generation is needed. Do not invoke Image Generation for this first pass. Do not substitute a generic stock image.

### 7.1 Hero wide asset

Source:

`/Users/ievgeniiiablonskyi/Downloads/YouOweMe_10Years_InAppEvent_Card_3840x2160.png`

Output filename:

`images/pages/10-years/you-owe-me-10-years-hero-wide.webp`

Output guidance:

- 16:9.
- Maximum raster size 1920×1080.
- WebP quality approximately 82–88, adjusted only enough to avoid visible banding or detail loss in the cream background and transaction cards.
- Preserve the full sculpted `10`, people cards, arrows, and enough surrounding whitespace.
- Do not add text, a logo, a badge, price copy, borders, gradients, or another confetti layer inside the image.

Placement:

- Hero visual on tablet/desktop.
- Eager loading, `fetchpriority="high"`, explicit width and height.

Exact alt text:

> A sculpted number 10 made from person and transaction cards with green and gold borrowed and lent arrows.

### 7.2 Hero portrait asset

Source:

`/Users/ievgeniiiablonskyi/Downloads/YouOweMe_10Years_InAppEvent_Details_2160x3840.png`

Output filename:

`images/pages/10-years/you-owe-me-10-years-hero-portrait.webp`

Output guidance:

- 9:16.
- Maximum raster size 1080×1920.
- Same WebP quality and preservation requirements as the wide asset.
- Do not crop away the upper transaction-card structure of the `1` or the two people inside the `0`.

Placement:

- Use as the mobile `<source>` in the same hero `<picture>`.
- The `<img>` carries the exact hero alt text; do not duplicate alt text on `<source>`.

### 7.3 Open Graph asset

Source:

- Derive from the approved 3840×2160 wide artwork.

Output filename:

`images/pages/10-years/you-owe-me-10-years-og.webp`

Output guidance:

- 2400×1260 or 1200×630, exactly 1.91:1.
- Center crop with the full `10` readable and both green/gold relationship markers preserved.
- WebP, optimized for social preview.
- No text overlay. The title and description will be supplied by metadata.

Exact Open Graph image alt text:

> You Owe Me ten-year anniversary artwork with a sculpted 10 made from people, records, and borrowed and lent indicators.

### 7.4 Existing product screenshots

Reuse these existing WebP files without regenerating their UI:

1. `images/shared/app-screenshots/EN_AppStore_Separate_Loan_Records.webp`
   - Exact alt: `You Owe Me showing separate Loan Records with individual remaining balances and a repayment plan.`
2. `images/shared/app-screenshots/EN_AppStore_Choose_a_Payback_Plan.webp`
   - Exact alt: `You Owe Me repayment plan builder comparing lower-payment, balanced, and faster-payoff schedules.`
3. `images/shared/app-screenshots/relationship-timeline.webp`
   - Exact alt: `You Owe Me Timeline showing a loan, follow-up, shared statement, and repayment progress in one history.`

Placement:

- In the flagship Loan Records / Repayment Plans section.
- Three-column narrative sequence on large desktop; one-column stack on small screens.
- Use the exact captions supplied in the copy deck.
- Lazy-load these non-hero screenshots with explicit intrinsic dimensions.

If the embedded App Store marketing headlines make the section excessively repetitive, you may use CSS cropping/object positioning or a non-destructive page-local wrapper to emphasize the authentic UI. Do not rewrite the artwork, alter UI text, or manufacture cleaner screenshots.

### 7.5 What all imagery must avoid

- Stock photos of cash, handshakes, debt stress, or people exchanging banknotes.
- Cakes, balloons, trophies, fireworks, or heavy animated confetti.
- Sale badges or price text in the permanent hero.
- Growth charts.
- Fake 2016 screenshots or a retro-styled current interface.
- A wall of phone screenshots beyond the approved three-view sequence.
- New AI-generated imagery when the approved assets are available.

If image conversion is unavailable, keep the page implementation complete, document the exact outstanding conversion task, and do not insert a stock or unrelated fallback. Do not reference the Downloads PNG directly from production HTML.

---

## 8. Design and responsive requirements

### Modern shell

Follow `docs/page-design-contract.md` exactly:

- Full-width modern shell.
- Hide legacy `#header` and `#wrapper > .bg`.
- Full-width `#nav`, `#main`, and `#copyright`.
- Canonical page background:
  `radial-gradient(circle at top left, rgba(175, 230, 126, 0.16), transparent 30%), linear-gradient(180deg, #fbfdff 0%, #f4f6f8 76%)`.
- Canonical hero gradient, border, radius, and shadow.
- Canonical card border, 20px radius, and shadow.
- Canonical lime primary CTA `#afe67e`, hover `#bcf18c`, and dark text `#18212b`.
- Canonical focus outline using `rgba(53, 84, 40, 0.32)`.
- No old brown/orange palette, dark-green primary button, visible legacy header, or centered white sheet.

Use a page body class such as `ten-years-page` and keep the page-specific shell rules scoped to it. Make no unrelated global CSS changes.

### Content width and reading flow

- Use the modern shared maximum row around 1220px, consistent with Tools and Privacy & Data.
- Keep the main flow left aligned.
- Body paragraphs should generally remain around 60–72 characters per line where they are the dominant reading element, without narrowing full-width artifacts and grids into a centered article column.
- Use generous section separation without turning every paragraph into a card.
- The timeline, screenshot sequence, practical framework, and reviews should share the same page content row.

### Mobile-first requirements

Check at minimum 360px and 390px widths.

On the first mobile screen, show:

- `2016–2026`.
- The complete H1.
- At least the first full lead sentence.
- The `See the ten-year journey` action.

The artwork may begin below that copy. Do not let a tall image appear before the H1 or force the first answer below the fold.

On mobile:

- Stack the hero copy before the portrait image.
- Keep campaign actions full-width or comfortably wrapping, with at least 44px touch targets.
- Show timeline items in chronological one-column order; year, heading, and all three labels must remain easy to scan.
- Stack the three screenshot cards; do not use a swipe-only carousel.
- Stack the four clarity checklist cards.
- Stack the note-vs-record comparison cards; do not create horizontal scrolling.
- Stack or use a two-column layout for reviews only when readable.
- Best Next Step cards must not produce horizontal overflow.

### Desktop behavior

Check at minimum 1280px and 1440px widths.

- Hero copy and wide artwork form a balanced two-column composition.
- The wide 16:9 art must remain large enough for the transaction-card details to be legible.
- The Clarity Ledger should use a visible year rail plus a content card. Inside each content card, the three fields may form three columns when there is sufficient space.
- The flagship screenshot sequence may use three equal columns.
- Avoid large empty gaps created solely to make the page feel cinematic.

### Accessibility

- Semantic headings with one H1 and a logical H2/H3 hierarchy.
- Semantic `<nav aria-label="Breadcrumb">`.
- Use an ordered list or equivalent semantic chronology for the timeline.
- Real anchor links for every CTA.
- Visible keyboard focus.
- Minimum 44px interactive targets where practical.
- No information communicated by color alone.
- Accessible review quotations and source labels.
- Meaningful images use the exact alt text; purely decorative accents use empty alt text and must not duplicate the hero description.
- Avoid automatic animation. If any subtle reveal is reused from an existing pattern, respect `prefers-reduced-motion` and keep content visible without it.
- Do not create a carousel, scroll trap, countdown, auto-redirect, or modal.
- Ensure campaign phase updates do not steal focus or announce unnecessarily on page load. The initial content is sufficient; no live region is required.

### Reuse and CSS boundaries

- Reuse `styles/site-nav.css`, `styles/best-next-step.css`, and other existing shared styles only when they genuinely match.
- New styling belongs in `styles/ten-years.css`.
- Do not edit shared/global CSS unless an unavoidable bug prevents this page from rendering; report before broadening scope.
- No unrelated global selector changes.

---

## 9. SEO and AI-search requirements

### Exact metadata

Title:

> 10 Years of You Owe Me (2016–2026) | Our Story

Meta description:

> You Owe Me launched in 2016 to keep money between people clear. See how it grew from running IOUs to loans, repayment plans, reminders, and sharing.

Canonical:

> https://you-owe-me.com/10-years/

Robots:

> index, follow

Open Graph title:

> Ten years of clearer money between people | You Owe Me

Open Graph description:

> You Owe Me launched in 2016 to keep money between people clear. See how it grew from running IOUs to loans, repayment plans, reminders, and sharing.

Open Graph type:

> website

Open Graph URL:

> https://you-owe-me.com/10-years/

Open Graph image:

> https://you-owe-me.com/images/pages/10-years/you-owe-me-10-years-og.webp

Open Graph image alt:

> You Owe Me ten-year anniversary artwork with a sculpted 10 made from people, records, and borrowed and lent indicators.

Twitter card:

> summary_large_image

Twitter title, description, and image must exactly match the Open Graph values above.

Include the existing smart App Banner meta pattern unchanged:

`app-id=1147058670, affiliate-data=pt=117888502&ct=website_smart_banner`

Encode `&` correctly in HTML.

### Structured data

Add one valid JSON-LD graph with:

1. `AboutPage`
2. `BreadcrumbList`

Use these exact meaningful values:

- AboutPage `@id`: `https://you-owe-me.com/10-years/#webpage`
- AboutPage `name`: `10 Years of You Owe Me (2016–2026)`
- AboutPage `description`: the exact meta description.
- AboutPage `url`: `https://you-owe-me.com/10-years/`
- AboutPage `image`: the exact Open Graph image URL.
- `isPartOf`: a `WebSite` named `You Owe Me` at `https://you-owe-me.com/`.
- `about`: a `SoftwareApplication` named `You Owe Me`, category `FinanceApplication`, operating system `iOS`, with `datePublished` `2016-08-26` and the default App Store URL.
- `publisher`: a `Person` named `Ievgenii Iablonskyi`, matching current product identity.
- Breadcrumb item 1: `Home`, `https://you-owe-me.com/`.
- Breadcrumb item 2: `10 Years`, `https://you-owe-me.com/10-years/`.

Do not add `FAQPage`, `Review`, `AggregateRating`, `Article`, fabricated organization facts, private metrics, or invisible timeline text to schema. Do not add a webpage `datePublished` unless the actual deployment/publication date is known; do not guess it.

### Visible search/answer requirements

- The first screen must visibly state the 2016 launch and the ten-year purpose.
- The six eras and exact product boundaries must be visible/crawlable.
- Metadata must match visible content.
- Use descriptive headings and anchors.
- Do not target generic anniversary traffic or stuff `loan tracker`, `IOU app`, or `best app` phrases.
- Do not add hidden text, machine-only summaries, or unsupported claims.
- Do not make `is You Owe Me legit?` the page title or H1; Reviews owns that intent.
- Do not make the page a feature inventory; Features owns that intent.
- Do not add FAQ schema because no visible FAQ is approved.

---

## 10. Scope boundaries

### This pass must create or change only what is necessary for the page

Expected changes:

- `10-years/index.html`
- `styles/ten-years.css`
- `scripts/ten-years.js`
- `images/pages/10-years/you-owe-me-10-years-hero-wide.webp`
- `images/pages/10-years/you-owe-me-10-years-hero-portrait.webp`
- `images/pages/10-years/you-owe-me-10-years-og.webp`
- One exact route addition in `scripts/app-language-support-scope.mjs`.

Additional page-local files are allowed only if a verified repository convention requires them. Explain them in the completion report.

### Do not change in this pass

- `content/content-registry.mjs`.
- Hubs or parent-hub pages.
- `/find/`.
- `sitemap.xml` or sitemap generation.
- `robots.txt` or AI crawler policy files.
- Global navigation or footer link sets.
- Homepage, Features, Reviews, Quick Start, Privacy & Data, solution pages, tools, or unrelated routes.
- Broad internal-link infrastructure or inbound links.
- Best Next Step registry/generator data.
- Other Custom Product Page routes.
- Existing analytics taxonomy, event names, parameter names, or tracking scripts.
- Existing review copy or schema elsewhere.
- Global/shared CSS except for an unavoidable rendering bug.
- Global sale-alert logic or `scripts/sales.js`.
- The approved strategy, section order, route, or copy.

Do not create a redirect from the old provisional `/10-year-anniversary/` route in this pass. That is infrastructure work for the later pass if it is needed.

Stop and report rather than guessing if:

- The default App Store URL or anniversary event URL no longer resolves to this app.
- The custom deep link is contradicted by the current iOS repository.
- The supplied artwork cannot be read or converted.
- A product fact in the exact copy is contradicted by current repository/app evidence.
- The required design audit forces a broader change than the single route classification described above.

---

## 11. Acceptance criteria

The work is complete only when all of the following are true:

- `/10-years/` renders as a complete standalone page.
- The title, metadata, H1, headings, body copy, labels, examples, comparison items, review excerpts, CTA labels, alt text, and campaign states match this prompt.
- The first mobile screen clearly answers why the page exists before promoting the app.
- The approved hero wide/portrait artwork is optimized and used responsively.
- The six-era Clarity Ledger is prominent, chronological, readable without interaction, and fully crawlable.
- The flagship Loan Records / Repayment Plans section uses the approved three screenshots and remains a concise evolution example rather than a Features duplicate.
- The practical four-part framework and note-vs-record comparison are usable without installing the app.
- Exactly three approved reviews appear, with accurate attribution.
- The campaign card has truthful default, pre-launch, active, and retrospective copy and does not use a countdown or redirect.
- General App Store actions use the default product page without a CPP.
- The App Store event action uses `eventid=6802562970` only during the pre-launch/active JavaScript states.
- Best Next Step appears after the active-development section and before the thank-you.
- The final editorial impression is gratitude, not a sale or download demand.
- The page uses the modern full-width design system and passes the page-design audit.
- There is no horizontal overflow at 360px, 390px, 768px, 1280px, or 1440px.
- Keyboard focus, heading hierarchy, link semantics, image alt text, and reduced-motion behavior are sound.
- JSON-LD parses and matches visible content.
- Every page-local link and CTA has the specified destination.
- The route classification change is limited to `/10-years/`.
- No FAQ, founder biography, private growth statistics, unsupported rating claims, generic stock image, or extra CTA has been added.
- No unrelated file or infrastructure has changed.
- The result is ready for the later registry, sitemap, hub, Find, inbound-link, global navigation/footer, and routing pass.

---

## 12. Validation commands and checks

Run at minimum:

```bash
node scripts/audit-page-design.mjs /10-years/
node --check scripts/ten-years.js
node scripts/app-language-support.test.js
node scripts/audit-app-language-support.mjs
git diff --check
```

The page-design audit is mandatory because this page adds page-specific CSS.

Also perform these validations:

### HTML, route, and metadata

- Discover whether the repository already has an HTML validation command and run it if available.
- Parse every JSON-LD block with `JSON.parse`; do not rely only on visual inspection.
- Confirm exactly one H1.
- Confirm title, meta description, canonical, robots, Open Graph, Twitter, icon, and smart App Banner tags.
- Confirm the hero image and all three screenshot files resolve from `/10-years/`.
- Confirm all local destinations exist:
  - `/features/`
  - `/solutions/personal-loan-repayment-tracker/`
  - `/tools/running-balance-calculator/`
  - `/reviews/`
  - `/quick-start/`
  - `/privacy-and-data/`
- Confirm the default App Store URL retains app ID `1147058670`.
- Confirm the event URL retains app ID `1147058670` and event ID `6802562970`.
- Confirm the native deep link remains exactly `youoweme://events/anniversary`.

Do not require `scripts/audit-seo-ai-hygiene.mjs`, `scripts/audit-content-routing.mjs`, or registry validation to pass in this page-local phase: those audits are expected to depend on the intentionally deferred content registry, sitemap, and routing integration. If you run them for information, report only the expected new-route failures and do not broaden scope to fix them.

### Campaign state behavior

Test all three JavaScript phases with a controllable date or isolated phase function:

- A date before August 26, 2026.
- A date between August 26 and September 4, 2026, inclusive.
- A date on or after September 5, 2026.

Confirm each state changes heading, body, labels, destinations, and note exactly as specified. Confirm the page remains truthful and usable when JavaScript is disabled.

Do not add a public query-string test override or hidden production debug control.

### Browser and responsive QA

Serve the repository locally using its existing local-server pattern. If none exists, use a simple static server such as:

```bash
python3 -m http.server 8000
```

Open `/10-years/` in a real browser and inspect at minimum:

- 360×800
- 390×844
- 768×1024
- 1280×900
- 1440×1000

Check:

- First-screen copy priority.
- Hero wide/portrait art direction.
- No horizontal overflow.
- Timeline order and legibility.
- Screenshot captions and stacking.
- Comparison-card responsiveness.
- Review layout.
- Best Next Step placement.
- Keyboard navigation and focus visibility.
- Campaign actions and all internal links.
- Long copy wrapping without orphaned buttons or clipped text.
- No legacy centered sheet, brown/orange styling, dark-green primary CTA, or visible legacy header.

Run any additional repository-local accessibility, broken-link, metadata, or static-route validation you discover, provided it does not require unrelated infrastructure changes. Report the exact commands and outcomes.

---

## 13. Completion report

When finished, report:

1. Files created and changed.
2. Page route.
3. Major components implemented:
   - responsive hero art,
   - campaign phase card,
   - proof strip,
   - Clarity Ledger,
   - loan/plan evolution sequence,
   - practical framework,
   - reviews,
   - active-development section,
   - Best Next Step,
   - thank-you close.
4. Every visible-copy deviation and the reason. If none, explicitly say `No supplied copy was changed.`
5. Image processing results, output dimensions, formats, and file sizes. If an image task remains, state exactly why.
6. Every CTA destination actually implemented, including which campaign phase uses which App Store URL.
7. The app-language-support route classification and anchor placement.
8. Responsive widths checked and any fixes made.
9. Accessibility checks performed.
10. Commands run and results, including page-design audit and `git diff --check`.
11. Any deferred work for the later infrastructure pass:
    - content registry,
    - Best Next Step registry/generation,
    - sitemap,
    - hubs,
    - Find page,
    - inbound internal links,
    - global navigation/footer placement,
    - redirect decisions,
    - wider analytics/routing integration.
12. Confirmation that no unrelated content or infrastructure was changed.

Do not commit, deploy, publish, request indexing, or alter external App Store state.
