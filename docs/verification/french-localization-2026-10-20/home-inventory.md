# French homepage inventory — 20 October 2026

Source: current `/index.html` (978 lines), read directly in full. Architecture references: accepted `/ar/` and `/de/` homepage, Arabic release record, common locale/runtime sources. Target: `/fr/index.html`. This inventory covers authored and runtime text; acceptance evidence belongs in separate review/check files.

## Static content and metadata

| Area | French coverage / preservation |
| --- | --- |
| Document and discovery | `lang="fr"`, explicit LTR, French title, description, Open Graph/Twitter text, own `/fr/` canonical. Common generator owns reviewed reciprocal alternates and equivalent language switches. |
| Structured data | French WebSite/SoftwareApplication descriptions and all feature-list strings; app identity, ten app languages, free Offer price/currency, author, public identifiers and social links retained. Video text French, original date and English media language explicit. |
| Navigation/footer | All section labels, accessibility labels, privacy/contact/attribution labels; English hub/article fallbacks explicitly marked; language names remain endonyms with Arabic RTL. |
| Hero/download | Eyebrow, h1, lead, accessible app links, mobile sticky link, sale pill. Text buttons have French labels and neutral Store destination with original `pt=117888502`, `ct=website_cta`, `mt=8`; smart banner campaign preserved. |
| iPhone handoff | Title, benefit, camera instruction, Store fallback and QR alt. French QR image contains no text and uses the verified neutral App Store destination. Failure instruction is owned by shared handoff runtime; see runtime inventory below. |
| Active balance example | May–August example, Alex direction, 340 USD advanced / 180 USD repaid / 160 USD remaining; explicit USD, no currency conversion. |
| Inactive animation | Source `<template id="homepage-interactive-story-backup">` omitted, as in accepted localized architecture. It is not active English homepage content. The active static story and end fragment remain. |
| Import offer | All headings, file formats, review/correction, one-loan limit, no spreadsheet sync, iPhone continuation. Out-of-scope browser import explicitly English and linked to existing `#import-loan-history` / `#loan-import-guide`; no English workspace initialized. |
| Teaser/definition | Full translated review excerpt with original attribution and translation label; full lend/borrow/advance distinction, independent tracking, statement/live sharing and ten-language statement. |
| Next-step cards | All three cards and labels, descriptions, original tracking identifiers. French authored ownership noted; links retain working English destinations with labels until counterpart accepted. |
| Proof/reviews | Three proof cards and every review-rail card, titles, bodies, 5/5 accessible labels, attribution/country/version/excerpt labels translated; original names retained. All clearly labeled translations. |
| Video | French introduction, bullets, play label, accessible labels/title and caption; English video explicitly stated. Original embed/content target remains. |
| Review rail | Heading, more-review link, desktop scroll and mobile swipe hints, accessible rail name. |
| Anniversary | Launch date, complete ten-year capability history, inline announcement placeholders, story CTA; English story fallback labeled. |
| Three core capability cards | Separate loan records, realistic plan choices/update behavior, optional Live Link reporting with review decision retained. All headings, body and links translated. |
| Included capabilities | Recurrence, currencies, reminders/Money Conversations, Spaces/device sync/Balance Sync, interest/CSV, feature and quick-start links. |
| Other situations | Find prompt and all eight cards: money owed, temporary support, parent/family costs, couple costs, roommates, ongoing shared expenses, running balance, one-off split; all supporting links/microcopy retained. |
| Research | Full Bankrate 2025 U.S. 70%/55% claim and Caregiving/AARP 63m/half claims retained as U.S. evidence, source destinations and English labels retained; both parent-support links retained. |
| Resource shelf | All setup/comparison links and descriptions, full meaning retained. |
| FAQ | All ten Q&As, including Android/browser/owner review/Balance Sync limits, free limits/monthly/yearly/lifetime/Spaces distinction, app language list and truthful website locale availability, offline/no mandatory account. |
| Final CTA | Complete everyday vs longer-loan distinction, real payments/projection/reminder, app CTA and English solutions fallback. |

## Text-bearing visual assets

| Source asset | French handling |
| --- | --- |
| English Apple badge pixels | Replaced with French HTML text buttons; no external English badge loaded. |
| `images/shared/loan-import-history.webp` | French HTML process illustration, visibly not an app screenshot. |
| `images/pages/10-years/you-owe-me-10-years-hero-wide.webp` | French HTML ten-year illustration; source retained intact. |
| `EN_AppStore_Separate_Loan_Records.webp` | French HTML separate-loan example: 600/400/120 USD, clearly illustrative. |
| `EN_AppStore_Choose_a_Payback_Plan.webp` | French HTML amount/date/count plan options, clearly illustrative. |
| `6.8.5_share_live_balance.webp/png` | French HTML report→review→record illustration; no automatic-recording claim. |
| `6.8.5_share_clear_records.webp/png` | French HTML 340/180/160 USD statement example. |
| English YouTube thumbnail | Separate `/images/fr/home/video-poster.svg`, French visible text and accessible title/description, English destination and illustration status explicit. |
| `images/shared/brand/icon_3_0.png` | Shared brand asset for favicon/social/schema; no translation-bearing UI. |
| `images/shared/iphone-handoff/home.png` | Separate `/images/fr/iphone-handoff/app-store.png`: byte-identical to the accepted Arabic/German text-free neutral QR; adjacent caption French. Encodes `https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_qr_exp006&mt=8`, preserving app/campaign without forcing a national storefront. |

All original-language assets remain untouched. No fabricated localized native screenshot, conversion, real customer record, analytics key/event or financial upload.

## Runtime states to verify

Root owns common French locale configuration/dictionaries and cache URLs. Homepage loads shared `sales.js`, `video-embed.js`, `anniversary-announcement.js`, analytics, `iphone-handoff.mjs`, legacy menu and `app-language-support.js`. Review resizing helper has no user-facing strings. The French page does not load `loan-import-entry.mjs` because its browser import is outside this five-page scope.

- App-language-support injected capsule / availability sheet and Close label: native French dictionary already present; inspect actual rendered result.
- Mobile Menu / Close panel and focus handling: shared French runtime.
- Sale message visible/hidden states: shared French runtime.
- Anniversary inline / banner / close labels and hidden behavior: shared French runtime.
- Video embed iframe title and fallback control: French authored data title plus shared French fallback.
- iPhone desktop QR visibility/replacement, QR failure recovery and Store fallback: static French copy plus shared handoff runtime.
- Screen-reader labels and keyboard focus, desktop review scrolling and mobile swipe indication.
- No-JS substantial French main content, Store CTAs and English import fallback remain usable.
- French↔Arabic transition restores semantic LTR, inherited LTR fonts and Arabic endonym shaping.

## Implementation-time checks

The required `node scripts/audit-page-design.mjs /fr/` recognizes homepage `styles/landing.css` and reports zero hard errors after root’s foundation registration. Translator static checks find 101 direct local references, no missing targets/fragments, no duplicate IDs, six clearly labeled HTML illustrations and 22,085 characters of static main text; no English badge or app-screenshot pixels remain. These checks are saved in `home-author-static-checks.json`. Independent reviews and actual browser acceptance are still required before marking the page complete. No completion flag, registry entry or new French route navigation was registered by the translator.
