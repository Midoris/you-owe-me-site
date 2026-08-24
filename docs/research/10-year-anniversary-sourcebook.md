# You Owe Me at 10: anniversary research sourcebook

Research snapshot: 24 August 2026
Anniversary: 26 August 2026
Campaign period supplied by the product brief: 26 August–4 September 2026
Purpose: evidence and content direction for a permanent ten-year anniversary page. This is an internal sourcebook, not finished website copy.

## Executive conclusion

The strongest anniversary story is not “we have been in the App Store for ten years” and not “there is a sale.” It is the visible evolution of one durable idea:

> Money between people should stay clear.

In 2016, You Owe Me was a small, focused way to remember people, entries, currencies, and a running balance. In 2026, the same principle now extends to separate Loan Records, repayment plans that adapt to real payments, reminders, recurring entries, Timeline, Group Paybacks, Balance Sync, Live Link, PDFs, supporting photos, Spaces, ten languages, and more.

That continuity is the page's best trust signal. The app did not abandon its original purpose while adding features. It kept turning the same problem—unclear money between people—into progressively clearer records, plans, reminders, and ways to stay aligned.

The evidence also supports a careful version of “thriving and growing”:

- Product scope and development activity have expanded dramatically.
- App Store Connect contains 124 iOS version records from 1.0 through 7.0.6.
- The public App Store currently exposes 25 releases between 2 May and 22 August 2026 alone.
- The source repository contains 1,940 commits, with 137 in 2024, 416 in 2025, and 1,005 already in 2026 through 22 August.
- App Store Connect's Paid Plans metric increased from 41 in August 2025 to 232 on 22 August 2026, about 5.7×.
- First-time downloads did **not** grow year over year: 6,166 from 23 August 2025–22 August 2026 versus 9,627 in the preceding year. The page must not imply broad download or audience growth without a more qualified statement.

The honest story is therefore:

> Ten years of continuity, a major recent expansion in capability, much faster active development, and a growing base of people choosing to support the app.

The exact subscription and download figures are private App Store Connect evidence. They should remain internal unless there is a deliberate decision to publish them.

## Recommended narrative hierarchy

1. **Milestone and gratitude.** Ten years of helping people keep money between them clear.
2. **Continuity.** The app has grown, but the goal has stayed the same.
3. **Then and now.** From a running IOU balance to a complete set of tools for loans, repayment, shared costs, communication, and records.
4. **Loans and repayment plans as the clearest modern proof.** They show how far the app has evolved without losing its human scale.
5. **Customer voice.** Reviewers repeatedly describe the app as useful, easy, reliable, actively improved, and responsive to requests.
6. **What comes next.** A forward-looking close, without vague promises or a roadmap the app may not ship.
7. **Temporary offer.** During the campaign only, a secondary callout below the permanent story—not the main reason the page exists.

## Evidence labels used in this document

- **Confirmed public:** visible on the public App Store or current public website.
- **Confirmed private:** visible in authenticated App Store Connect, Xcode Organizer, local archives, or the private repository.
- **Repository evidence:** dated implementation evidence; useful for chronology, but it may precede public release.
- **Inference:** a reasonable narrative conclusion, not a literal product or analytics fact.

## Foundational facts

| Fact | Evidence | Confidence / use |
|---|---|---|
| Initial repository commit | 2 August 2016, commit `5e4b3be69a74c3b32664fdf69f1f0737744d455c`, “Initial Commit” | Confirmed private |
| Version 1.0 prepared | 24 August 2016, commit `d1eddef4`, “version 1.0” | Confirmed private |
| Original App Store launch | App Store Connect shows version 1.0 “Ready for Sale” on 26 August 2016 at 12:32 AM | Confirmed private; authoritative launch date |
| Tenth anniversary | 26 August 2026 | Direct consequence of launch date |
| Current release at snapshot | 7.0.6, build 185; public release 22 August 2026 | Confirmed public and private |
| App Store version history | 124 records, versions 1.0–7.0.6 | Confirmed private in App Store Connect |
| Local Xcode archives | 168 archives; available locally from 7 November 2023 onward | Confirmed private; not a full ten-year archive |
| Public rating snapshot | 4.6 from 349 ratings in the US storefront on 24 August 2026 | Confirmed public; time-sensitive, avoid hard-coding permanently |
| Current languages | English, Arabic, French, German, Italian, Japanese, Korean, Polish, Portuguese, Spanish | Confirmed public/current repository |
| Anniversary event | “You Owe Me Turns 10,” App Store event ID `6802562970` | Confirmed public |

## Important date discrepancy to resolve

The supplied campaign brief says the anniversary and offer run from 26 August through 4 September 2026. The public App Store event payload on 24 August reports:

- Start: `2026-08-26T07:00:00Z`
- End: `2026-09-06T06:30:00Z`

This may be an intentional wider App Store visibility window, a timezone/configuration detail, or a real mismatch. Verify it in App Store Connect before the website states that the App Store event itself ends on 4 September. The offer may still end on 4 September even if the App Store event remains visible longer; the website should distinguish those dates if so.

## What the growth evidence really says

### Private product-support evidence

App Store Connect Paid Plans by monthly endpoint:

| Month | Paid plans |
|---|---:|
| August 2025 | 41 |
| September 2025 | 54 |
| October 2025 | 73 |
| November 2025 | 88 |
| December 2025 | 101 |
| January 2026 | 120 |
| February 2026 | 132 |
| March 2026 | 159 |
| April 2026 | 178 |
| May 2026 | 188 |
| June 2026 | 204 |
| July 2026 | 223 |
| 22 August 2026 | 232 |

This is the clearest evidence that the project has become more sustainably supported. It is not the same thing as total users, active users, downloads, or revenue.

### Private acquisition evidence

- First-time downloads, 23 August 2025–22 August 2026: **6,166**.
- First-time downloads, 23 August 2024–22 August 2025: **9,627**.
- Change: approximately **−36%**.

Do not publish “our audience is growing rapidly” or imply rising downloads. If the page uses “growing,” attach it to the app, its capabilities, its development, or its supporting customer base—not unqualified user acquisition.

### Development activity

Git commits by year across the iOS repository:

| Year | Commits |
|---|---:|
| 2016 | 81 |
| 2017 | 0 recorded in this repository history |
| 2018 | 160 |
| 2019 | 63 |
| 2020 | 26 |
| 2021 | 2 |
| 2022 | 24 |
| 2023 | 26 |
| 2024 | 137 |
| 2025 | 416 |
| 2026 through 22 August | 1,005 |

Interpretation: the history supports a long period of smaller-scale maintenance followed by a clear acceleration beginning in 2024 and becoming dramatic in 2025–2026.

### Xcode archive cadence

Distinct version labels found in local Xcode archives:

| Archive year | Distinct version labels |
|---|---:|
| 2023, beginning 7 November | 4 |
| 2024 | 12 |
| 2025 | 30 |
| 2026 through 22 August | 49 |

These are archive labels, not guaranteed App Store releases. Some versions have multiple archive builds and some archived versions were not released. Use this only as an internal shipping-cadence signal.

### Current engineering footprint

At the research snapshot, the iOS repository contains:

- 504 Swift files.
- 25 Swift test files matching the repository's current test naming/location patterns.
- 24 Core Data model versions.
- 10 top-level app localization directories including Base.
- Current version 7.0.6, build 185.

These are useful internal signs of depth and long-term migration work, not recommended headline statistics for customers.

## Ten-year product chronology

The older chronology is reconstructed from repository history because neither the App Store public page nor the App Store Connect History screen preserves every historical “What’s New” text. Dates before the recent public history should usually be described by year or era rather than asserted as exact public launch dates.

### 2016 — A focused beginning

Confirmed repository evidence:

- 2 August: development begins.
- Core Data storage, people/borrower records, entry creation and deletion, balance calculation, currencies, dates, and the first screen are implemented during August.
- 3D Touch/quick access work appears before launch.
- 24 August: version 1.0 is committed and sent for review.
- 26 August: version 1.0 becomes Ready for Sale.

Safe anniversary interpretation:

> It began with a focused promise: record what happened and keep a clear balance with each person.

Avoid claiming the exact 1.0 interface or full feature list without retrieving the historical binary/screenshots.

### 2018 — Rebuilding the everyday experience

Repository evidence shows a substantial Swift 4 migration and UI rebuild, followed by versions 2.0 through 3.6. Work included:

- A redesigned person and entry experience.
- Editing and deleting people and entries.
- Clear-balance/reconcile workflows.
- Editable loan dates.
- Authentication/App Lock foundations.
- Month grouping and improved history navigation.
- A running total screen.
- Balance-at-a-point-in-history work—the foundation of what the website now calls Balance Replay.
- Notes/reasons and Core Data migrations.

Safe anniversary interpretation:

> The simple ledger became easier to navigate, correct, and understand over time.

### 2019–2022 — Reliability, continuity, and practical utilities

Repository evidence includes:

- 2019: iCloud synchronization, shareable history, CSV/text export, recurring entries, and a quick split action.
- 2020: Siri Shortcuts, Spotlight integration, and more flexible export/sorting.
- 2021: iCloud sync made available without the former paid restriction.
- 2022: Swift 5 migration, clearer day/time grouping, redesigned direction guidance, dark mode, and ongoing Siri fixes.

This era is important precisely because it was not a dramatic marketing phase. It shows continued maintenance and platform adaptation through lower-activity years.

Safe anniversary interpretation:

> Through changing iPhones and iOS releases, the app kept the record usable, portable, and available when people returned to it.

### 2023–2024 — The modern foundation

Repository and archive evidence shows the beginning of the present-day app:

- Dependency modernization from CocoaPods to Swift Package Manager.
- Version 5.x release work resumes in late 2023.
- Clearer “lent/borrowed” direction language and redesigned balance messages.
- Performance caching and reliability work.
- A shareable mirrored history experience.
- Reordering and tablet support.
- Main-currency selection and conversion.
- A major borrower/start-screen redesign.
- Modernized add/edit flows, profile imagery, icons, haptics, and accessibility-oriented visual cues.
- Version 6.0 in November 2024.

Safe anniversary interpretation:

> The recent expansion was made possible by rebuilding the app’s foundations—not simply adding more buttons.

### 2025 — The app becomes a broader money-between-people toolkit

Strong repository evidence supports the following sequence:

- January: search across entries and access-tier work.
- February–May: independent cloud profiles with migration, offline handling, caching, and device sync; later reframed as Spaces.
- May: quick entry, demo guidance, multi-currency history, and group entries.
- June: milestones and richer reminders.
- July–August: full Payment Reminders with dates, recurrence, overdue states, notification actions, and entry-linked reminders.
- October–November: Voice to Entry and increasingly useful Follow-Up message generation.
- November–December: interest tracking, statements, Split Entry, redesigned recurring entries, and cloud reliability work.

Major first repository evidence:

| Feature | First strong repository evidence | Commit |
|---|---|---|
| Payment Reminder screen | 4 July 2025 | `1af3bbf0` |
| Voice to Entry | 23 October 2025 | `17572203` |
| Interest manager | 29 November 2025 | `82e8eec1` |
| Split Entry experience | 9–12 December 2025 | `366f03b7`, `f6d9fdb6`, `b5c72cff` |
| Redesigned recurring entries | 15 December 2025 | `1064a365` |

Safe anniversary interpretation:

> In the last two years, You Owe Me moved beyond remembering a balance. It began helping people find records, schedule what matters, communicate clearly, and handle repeated or shared costs.

### 2026 — From useful tracker to mature repayment system

This is the most important era for the permanent page because it has exact public release notes and contains the clearest proof of present-day seriousness.

#### Communication and formal records

- Money Messages expanded into Follow-Up, Repayment Update, and Ask for Loan flows.
- PDF statements gained professional configuration, logos, due dates, payment details, loan context, and later supporting-photo appendices.
- Messages can include PDF statements where appropriate.

#### Ways to stay aligned

- **Live Link:** one person maintains the record; the other can see an up-to-date browser view without installing the app.
- **Balance Sync:** two You Owe Me users connect and supported balance entries synchronize across both apps, with explicit conflict resolution.
- **Timeline:** relationship-level history and guidance brings entries, loans, settlements, reminders, shares, Group Paybacks, plans, and messages into one story.

#### Structured money situations

- **Group Paybacks:** one shared cost, multiple people, partial repayments, and person-level balances.
- **Loan Records:** multiple named loans can remain separate while still contributing to the total relationship balance.
- **Repayment Plans:** flexible schedules attached to the real loan ledger; partial, extra, or late payments update progress, projections, and reminders.
- **Spaces:** personal, family, work, and debt records can live in separate top-level contexts with their own totals and cloud backup/sync.
- **Supporting photos:** receipts, invoices, and other evidence can stay with entries and optionally appear in PDFs.

#### Reach and polish

- The app expanded to ten languages.
- Privacy and navigation refinements continued alongside large features.
- Performance work repeatedly targeted large histories and datasets.

Major public release milestones:

| Public date | Version | Milestone |
|---|---:|---|
| 13 May | 6.8.3 | Live Link |
| 18 May | 6.8.5 | Professional PDF statement flow and iOS 26 visual refresh |
| 19 May | 6.8.6 | Use-case modes and richer professional statement details |
| 25 May | 6.8.7 | Loan Records |
| 3 June | 6.8.9 | Timeline |
| 12 June | 6.9.0 | Group Paybacks |
| 18 June | 6.9.1 | Flat interest and improved large-data performance |
| 30 June | 6.9.2 | Rebuilt reminders |
| 16 July | 6.9.4 | Balance Sync; Spanish and German |
| 18 July | 6.9.6 | Arabic, Japanese, French, and Portuguese |
| 26 July | 6.9.8 | Improved Money Messages and PDF attachments |
| 30 July | 7.0.0 | Repayment Plans |
| 10 August | 7.0.3 | Spaces |
| 15 August | 7.0.4 | Italian, Korean, and Polish; ten languages total |
| 19 August | 7.0.5 | Move people between Spaces with linked data preserved |
| 22 August | 7.0.6 | Supporting photos and optional PDF inclusion |

Safe anniversary interpretation:

> The app has grown from a place to remember an IOU into a system for understanding the whole financial relationship—from the first entry to the final repayment.

## Why loans and repayment plans deserve a central place

The attached product brief makes this the strongest “ten years of progress” example.

### The simple positioning

> Loans organize what is owed. Repayment plans organize how it gets paid back.

### What separate Loan Records add

- A person can have multiple named loans without mixing their purposes together.
- Every loan has its own remaining balance, history, currency, interest context, reminders, and settled/archive state.
- Loan activity still contributes to the complete balance with that person.
- The user sees both the individual arrangement and the full relationship.
- Existing loans can be brought into the app partway through without inventing past transactions.

### What makes Repayment Plans more than a calculator

- The plan is attached to the actual loan ledger rather than creating a second balance.
- Users can compare lower, balanced, and faster options or work backward from an amount, payoff date, or number of installments.
- Weekly, every-two-weeks, and monthly schedules are supported.
- Plans support no new interest, a fixed total amount, or reducing-balance annual interest.
- Real partial, exact, extra, early, or late payments update schedule coverage and the projected payoff.
- Additional borrowing can reproject the plan.
- The next reminder updates to the amount and date that are actually relevant.
- Replaced, completed, or ended plans preserve history.
- Timeline can surface what is due, overdue, or next.
- A focused PDF loan record can optionally include the plan summary.

### Human value

The feature is designed for the reality that friends, family, partners, roommates, and private arrangements do not always follow a rigid bank schedule. It reduces stale calculations, uncertainty about what a payment covered, manual rebuilding after a different payment, and awkwardness about the next step.

### Honest boundary

The app tracks, calculates, schedules, reminds, and shares. It does not move money, collect payments, connect to a bank, issue or underwrite loans, enforce repayment, replace a legal agreement, or guarantee that someone will pay.

### Best anniversary framing

Do not turn the anniversary page into a repayment-plan feature page. Use the feature as the most concrete proof of evolution:

> What began as a simple IOU record can now keep each loan separate and build a repayment plan that stays current as real payments happen.

## Current product inventory for anniversary selection

The permanent page should not list everything. This inventory exists so the final page can choose representative proof points.

### Core clarity

- One running balance per person.
- Borrow/lend history and notes.
- Partial repayments and settlements.
- Search and quick entry.
- Balance Replay.
- Multi-currency records and a main-currency view.
- CSV/text history export.

### Loans and structured repayment

- Multiple separate Loan Records with one person.
- Due dates and interest.
- Flexible, adaptive Repayment Plans.
- Weekly, biweekly, and monthly schedules.
- Partial/extra payment reconciliation.
- Dynamic next-payment reminders.
- Loan-focused PDF records.

### Shared costs and schedules

- Split Entry.
- Group Paybacks.
- Equal and custom splits.
- Payment Reminders.
- Recurring entries for bills and repeated costs.

### Understanding the relationship

- Timeline episodes and events.
- On-track, due, overdue, and settled context.
- Smart Money Check-Ins.
- Follow-Up, Repayment Update, and Ask for Loan messages.

### Sharing and coordination

- Shareable summaries and statements.
- Live Link for a read-only browser view without app installation.
- Balance Sync for two app users.
- Professional PDF statements with optional identity/payment details.
- Supporting photos and PDF appendices.

### Organization, privacy, and accessibility

- Spaces with separate totals.
- Cloud backup and cross-device sync.
- Works offline.
- No mandatory sign-up for local use.
- App Lock.
- Voice to Entry.
- Siri Shortcuts.
- Ten languages.
- Light/dark appearances, right-to-left support, and VoiceOver work in modern flows.

## Customer voice

The website review collection provides better trust evidence than generic claims such as “loved by users.” The strongest anniversary themes are longevity, practical reliance, continuous improvement, and developer responsiveness.

### Best review themes for this page

1. **It keeps improving.** This validates the anniversary as an active milestone, not nostalgia for an abandoned app.
2. **People rely on it over time.** Family expenses, loans, bills, and daily logs are ongoing situations.
3. **The record reduces stress and awkwardness.** This connects directly to the app's emotional value.
4. **The developer listens.** This makes the growth feel human and trustworthy.
5. **Simple despite deeper capability.** This answers the risk that ten years of features made the app complicated.

### Strong candidate excerpts already published on the website

- “The app does what it sets out to do. Keeps organized records of IOU’s.” — T11234
- “This app impresses me more and more. It keeps evolving and improving.” — Raismotor
- “It’s taken all the stress out of tracking money between family.” — BorrowedSun
- “Simple, reliable, incredibly useful.” — ThePres_560
- “I use this app more consistently than 99% of all others on my phone.” — Leanne Dawn
- “It’s the only app where the developer truly listens and responds.” — iPepeep
- “The simplest interface with solid functionality.” — Natallia Yablonskaya

Use only two or three on the final anniversary page. The best pair is likely the “keeps evolving” review plus a concrete family/loan reliance review. The Live Link/developer-response review is especially good if the page includes a short “built by listening” section.

## Recommended permanent page structure

### 1. Hero

Possible headline:

> Ten years of clearer money between people.

Possible supporting copy:

> You Owe Me launched in 2016 with a simple goal: make it easier to remember who paid, who borrowed, and what remained. Ten years later, the app can keep separate loans, build repayment plans, organize shared costs, and help people stay aligned—but the goal has stayed the same.

Visual direction: use the native anniversary “10” artwork or a website adaptation, not a discount badge. The first viewport should feel commemorative and established.

### 2. A small “2016 → 2026” comparison

2016:

- People.
- Entries.
- A running balance.
- A clear record on one phone.

2026:

- Separate loans and adaptive repayment plans.
- Timeline, reminders, recurring costs, and Group Paybacks.
- Live Link and Balance Sync.
- Spaces, PDFs, supporting photos, and ten languages.

This should be visually concise. It is not a feature table.

### 3. Selected journey timeline

Use five or six milestones, not 124 versions:

- **2016:** the first clear balance.
- **2019:** recurring entries, sharing, and cloud continuity.
- **2022:** modern platform work, dark mode, and Swift 5.
- **2024:** the modern app experience takes shape.
- **2025:** reminders, voice entry, interest, Split Entry, and clearer communication.
- **2026:** Loan Records, Repayment Plans, Timeline, Group Paybacks, Live Link, Balance Sync, Spaces, and ten languages.

The timeline should communicate eras, not imply that each line is an exact App Store release date.

### 4. The flagship evolution story

Headline direction:

> From “who owes what?” to a clear path to paid back.

Explain separate Loan Records and adaptive Repayment Plans in two or three short paragraphs. Show a loan list, plan dashboard, and schedule/Timeline—not only the plan builder.

### 5. Built around real relationships

Show representative situations:

- A parent keeping family loans clear.
- Friends or roommates handling a shared cost.
- Someone repaying a personal loan responsibly.
- A freelancer or small business keeping a clean client record.

Keep the language human. The app is structured without pretending to be a bank.

### 6. Customer proof

Use two or three existing App Store reviews. Favor reviews about long-term use, continuous improvement, reduced stress, and developer responsiveness.

### 7. Thank-you and future

Possible close:

> Thank you for every entry recorded, every repayment marked, every review, every suggestion, and every year you kept You Owe Me on your phone. The app is ten years old—and still getting better.

For paid customers: emphasize that their support made the recent expansion possible. For everyone else: thank them for being part of the journey.

### 8. Campaign module during 26 August–4 September

Below the permanent content, add a clearly temporary panel:

- Anniversary event dates.
- “Open the 10-year experience” using `youoweme://events/anniversary` where supported.
- App Store fallback/event link.
- Anniversary upgrade offer as a secondary action for eligible free users.
- Explicit 4 September offer end date.

After the campaign, remove or replace this module while keeping the permanent page intact.

## Copy bank

### Headlines

- Ten years of clearer money between people.
- A decade of IOUs, loans, and paybacks—made clearer.
- Built in 2016. Still growing. Still focused on clarity.
- From one running balance to the whole repayment story.
- Ten years old. More useful than ever.

Recommended: **Ten years of clearer money between people.** It is concise, consistent with the app campaign, and does not depend on a sales message.

### Supporting lines

- What began as a simple way to remember who owes what has grown into a complete record for loans, repayment plans, shared costs, and the conversations around them.
- The app has changed enormously. The goal has not: keep money between people simple and understandable.
- From everyday IOUs to long-running loans, You Owe Me has spent a decade turning uncertain details into a clear next step.
- Ten years of new iPhones, new iOS releases, and new ways people use the app—held together by one clear balance.

### Short proof-point labels

- Since 2016.
- 124 App Store versions.
- 10 languages.
- One goal: keep money between people clear.

“124 App Store versions” is accurate in App Store Connect but may feel overly technical. A softer phrase such as “updated across ten years of iOS” may work better in final copy.

### Loans / plans callout

> A personal loan rarely follows a perfect schedule. You Owe Me keeps the plan connected to the real loan, so partial payments, extra payments, and changing circumstances remain part of one clear record.

### Trust callout

> Your records can stay local and work offline. Sign-in is optional unless you choose a connected feature such as Spaces or Balance Sync.

Fact-check the exact dependency of each connected feature before final copy; “no mandatory signup” is safe for core local use, not every feature.

## Claims to avoid

- “Millions of users,” “thousands of active users,” or any audience-size claim not supported by a chosen analytics report.
- “Fastest-growing,” “rapidly growing audience,” or “more users every year.” Recent first-time-download data does not support this.
- “185 releases.” Build 185 is a build number, not the number of App Store releases.
- “168 releases.” There are 168 local archives, many of which are alternate builds.
- “Real-time” for Balance Sync. The current website correctly says synchronization is not instantaneous.
- “Bank-grade,” “legally binding,” “collects payments,” or “automatically processes repayments.”
- “Shared repayment plan” through Balance Sync. Repayment Plans are not currently a synchronized two-party contract.
- “Ten years of the current feature set.” Most advanced features are recent.
- A precise old feature launch date when the only evidence is a source commit; use the year/era and label it as repository evidence.
- “Thriving” without adjacent proof. It is safer as a tone than as a measurable claim.

## Public App Store release-note recovery: latest 25 releases

Apple's public “Version History” currently exposes only these 25 entries. The notes below are faithful research summaries; consult the App Store page for the current exact wording.

### 7.0.6 — 22 August 2026

Supporting photos for entries, including receipts and invoices; optional inclusion in PDF statements; reliability improvements; pre-anniversary thank-you.

### 7.0.5 — 19 August 2026

Move people between Spaces while preserving recurring items, reminders, and Group Payback connections; pre-anniversary thank-you.

### 7.0.4 — 15 August 2026

Italian, Korean, and Polish added, bringing the app to ten languages.

### 7.0.3 — 10 August 2026

Spaces introduced: separate personal, family, work, or other contexts, each with its own people, loans, entries, repayment plans, total, backup, and device sync.

### 7.0.2 — 8 August 2026

Quick privacy control to hide balances/amounts on the start screen; scrolling tab-bar behavior; navigation, visual, and reliability refinements.

### 7.0.1 — 4 August 2026

Quality-of-life, bug, smoothness, and reliability improvements.

### 7.0.0 — 30 July 2026

Repayment Plans introduced: flexible cadence, amount, first date, optional interest, a full schedule, adaptive handling of partial/early payments, progress/payoff context, reminders, and optional PDF inclusion.

### 6.9.8 — 26 July 2026

More natural Follow-Up, Repayment Update, and Ask for Loan messages; PDF statement attachments for Follow-Up and Repayment Update.

### 6.9.7 — 21 July 2026

Quality-of-life, performance, and Arabic-localization refinements.

### 6.9.6 — 18 July 2026

Arabic, Japanese, French, and Portuguese support plus performance work.

### 6.9.4 — 16 July 2026

Balance Sync introduced; Spanish and German added throughout the app, messages, PDFs, and statements.

### 6.9.3 — 9 July 2026

Smoother flip deck, refreshed UI, new icon, and general polish/performance work.

### 6.9.2 — 30 June 2026

Rebuilt reminders for balances, dates, bills, and check-ins, with clearer context and actions such as follow up, record repayment, open, or complete.

### 6.9.1 — 18 June 2026

Owed-view sorting, flat interest, and performance for larger datasets and balance loading.

### 6.9.0 — 12 June 2026

Group Paybacks introduced: one shared cost, participant splits, partial/full repayment states, accurate person histories, and contextual reminders.

### 6.8.9 — 3 June 2026

Timeline introduced, combining entries, loans, settlements, shares, reminders, and Money Message actions with next-step guidance.

### 6.8.8 — 1 June 2026

Loan-detail polish, direct PDF sharing, entry filters for interest/due dates/recurrence/loans, and performance for larger histories.

### 6.8.7 — 25 May 2026

Loan Records introduced: separate important loans with their own balance, notes, due dates, interest, images, repayments, and adjustments while preserving the person-level total.

### 6.8.6 — 19 May 2026

Friends & Family, Clients & Business, and Loans & Repayments modes; Everyday/Professional PDFs; logo, due-date, and payment-detail options.

### 6.8.5 — 18 May 2026

Dedicated, more professional PDF statement workflow, logo and due-date options, and an iOS 26 Liquid Glass refresh.

### 6.8.4 — 14 May 2026

Bug fixes and reliability improvements.

### 6.8.3 — 13 May 2026

Live Link introduced: one persistent link to a current read-only balance and transaction history without requiring an app install.

### 6.8.2 — 8 May 2026

Full borrower history with search by amount/note and filters for direction, plus polish and stability.

### 6.8.1 — 4 May 2026

Large-history performance and bug fixes.

### 6.8.0 — 2 May 2026

Clearer “You paid” / “They paid” direction wording and a broad performance overhaul.

## Historical version index recovered from App Store Connect

App Store Connect exposes the version identifiers and status activity, but not a convenient complete export of all historical “What’s New” text. The recovered version index is:

`1.0`; `2.0`–`2.9`; `3.0`–`3.6`; `4.0`–`4.9.1`; `5.0`, `5.1`, `5.1.1`, `5.2`, `5.3`, `5.4`, `5.5`–`5.5.7`; `6.0.0`, `6.0.1`, `6.1.0`–`6.1.2`, `6.2.0`, `6.3.0`–`6.3.7`, `6.4.0`–`6.4.9`, `6.5.0`–`6.5.9`, `6.6.0`–`6.6.9`, `6.7.0`–`6.7.9`, `6.8.0`–`6.8.9`, `6.9.0`, `6.9.1`, `6.9.2`, `6.9.3`, `6.9.4`, `6.9.6`, `6.9.7`, `6.9.8`, `7.0.0`–`7.0.6`.

Notable gaps such as 6.9.5 may have local archives but no App Store version record. Do not infer a public release from an Xcode archive alone.

## Source map

### Public sources

- App Store product page: <https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670>
- Public anniversary event: <https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?eventid=6802562970>
- Website feature inventory: `features/index.html`
- Website review collection: `reviews/index.html`

### Authenticated Apple sources

- Complete version activity index: <https://appstoreconnect.apple.com/apps/1147058670/distribution/activity/ios/versions>
- App analytics: <https://appstoreconnect.apple.com/apps/1147058670/analytics>
- Apple API endpoint documentation for version listing: <https://developer.apple.com/documentation/appstoreconnectapi/get-v1-apps-_id_-appstoreversions>
- Apple API documentation for version localizations / `whatsNew`: <https://developer.apple.com/documentation/appstoreconnectapi/get-v1-appstoreversions-_id_-appstoreversionlocalizations>

No App Store Connect API key was created. A future API-key-backed extraction could retrieve exact localization metadata where Apple retains it, but creating a key would expand persistent access and was not necessary for this research.

### Local Xcode evidence

- Archive root: `/Users/ievgeniiiablonskyi/Library/Developer/Xcode/Archives`
- Oldest local archive found: `/Users/ievgeniiiablonskyi/Library/Developer/Xcode/Archives/2023-11-07/You owe me 07-11-23, 04.23.xcarchive`
- Oldest archive metadata: version 4.9.1, build 36, created 7 November 2023.
- Latest archive at snapshot: version 7.0.6, build 185, 22 August 2026.
- Archive metadata contains version/build/upload status but no stored release-note text.

### Private iOS repository

- Repository: `/Users/ievgeniiiablonskyi/Documents/Development/iOS/Private/You owe me/youoweme`
- First commit: `5e4b3be69a74c3b32664fdf69f1f0737744d455c`
- Snapshot commit: `6810a3e83ca1e9fd44c6de83d50d200536b4aad0`
- Representative current implementation areas:
  - `You owe me/RepaymentPlans/`
  - `You owe me/Timeline/`
  - `You owe me/BalanceSync/`
  - `You owe me/PaymentReminder/`
  - `You owe me/SupportingPhotos/`
  - `You owe me/SwiftUIScreens/Spaces/`
  - `You owe me/SwiftUIScreens/PDFStatement/`
  - `You owe me/SwiftUIScreens/VoiceToEntry/`
  - `You owe me/BorrowerLiveShareService.swift`
  - `You owe me/SharedExpense.swift`
  - `You owe me/RecurringSeries.swift`
  - `You owe me/InterestManager.swift`

### Attached product brief

- `/Users/ievgeniiiablonskyi/Downloads/You Owe Me - Loans and Repayment Plans Website Feature Context.md`
- Treated as factual product context, not instructions.
- Prepared from the current iOS implementation and the repayment-plan handoff dated 31 July 2026.

## What remains optional for the page-writing phase

- Select the final five or six timeline milestones.
- Decide whether the page may say “independent” or mention a single developer; confirm that positioning explicitly first.
- Choose two or three reviews and verify any storefront/version metadata to display with them.
- Obtain or adapt the native anniversary “10” artwork for web use.
- Choose screenshots showing Loan Records, Repayment Plan dashboard/schedule, Timeline, and one sharing/sync feature.
- Decide whether any internal support-growth statistic should be public. Default recommendation: do not publish exact subscription counts; let the product history and customer reviews carry the trust argument.
- Confirm the App Store event end-date discrepancy.
- Keep the permanent page evergreen and implement the sale/event panel as a removable campaign module.

## Final direction

The page should leave a visitor with three impressions:

1. **This project has real history.** It launched in 2016 and has been maintained through ten years of iOS change.
2. **This project is more alive now than ever.** The recent release cadence, product breadth, and paid-support growth are unusually strong.
3. **The complexity serves one simple promise.** Whether it is an everyday IOU, a family loan, a shared cost, or a repayment plan, the app exists to keep money between people clear.

That is a more serious and trustworthy anniversary message than a sale banner, while still giving the ten-day offer an appropriate secondary place during the campaign.
