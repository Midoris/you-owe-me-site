# Live Link payment reporting — website update

Date: October 18, 2026. The website presents the feature as available under the
owner's explicit publishing instruction. It makes no App Store version or launch
date claim. The app/backend implementation is outside this website change.

## Placement and copy decisions

The main benefit is “They report a payment. You review it.” One person retains the
record; the recipient has a lightweight browser reply. The dedicated guide carries
the full factual explanation so supporting pages can stay focused.

| Page | Placement |
| --- | --- |
| `/live-link/` | New canonical guide: shared view, illustrated report, three-step invitation/report/review flow, Record/Match/Decline, Refresh, and nine visible FAQs. |
| `/` | Existing Live Link feature card leads with the benefit and links to the guide; Android and participation FAQs distinguish reporting from editing. |
| `/features/` | Existing Live Link card explains optional reports, review choices, invitation compatibility and publication lag; participation table and Balance Sync FAQs agree. |
| `/quick-start/` | Existing sharing module explains enable → invitation → review → Refresh, retaining PDF sharing and the distinct Balance Sync option. |
| `/privacy-and-data/` | Sharing disclosure distinguishes statement access from reporting invitation authority, submitted fields, private receipt status, and owner control; visible FAQ matches schema. |
| `/find/` | Existing no-forced-install choice mentions optional reports and links to the guide. |
| `/solutions/app-to-track-money-owed/` | Main sharing explanation, introductory reassurance and Android/sharing/editing FAQs reflect owner-reviewed reporting. |
| `/solutions/shared-expense-tracker/` | Existing participation card and visibility FAQ include optional reports without shared editing. |
| `/solutions/roommate-expense-tracker/` | Existing one-roommate-maintains-the-record card explains reporting a reimbursement for review. |
| `/solutions/expense-tracker-for-couples/` | Existing one-partner participation card and Live Link update FAQ explain reports and publication lag. |
| `/solutions/family-reimbursement-tracker/` | Existing share-summary step explains no-install reimbursement reports for owner review. |
| `/solutions/client-payment-records/` | Existing sharing comparison and no-app FAQ explain client reports without processing or bank verification. |
| `/tools/running-balance-calculator/` | Existing ongoing-record participation card links to Live Link and distinguishes reporting from automatic recording. |
| `/blog/can-one-person-track-shared-money-without-everyone-installing-an-app/` | One existing product card explains viewing and reporting without forced installation. |
| `/blog/how-to-track-shared-expenses-without-a-joint-account/` | Participation modules and Android/no-app FAQs distinguish reports from editing and Balance Sync. |
| `/blog/what-is-a-running-balance-between-two-people/` | Existing Live Link participation card offers optional reports and links to the guide. |
| `/compare/best-way-to-track-ious-between-people/` | Existing no-install Live Link card explains owner-reviewed reports. |
| `/compare/shared-expense-app-vs-running-balance-app/` | Existing participation comparison and Live Link update FAQ explain reporting, owner review, and publication lag. |
| `/compare/splitwise-alternative/` | Existing Live Link vs Balance Sync choice and no-app FAQs reflect optional reports without collaborative editing. |
| `/events/live-link/` | Legacy noindex redirect now points to the canonical guide instead of the homepage. |

The guide covers positive report amounts, recipient-to-owner direction, currency,
positive/zero/reversed normal balances, normal-vs-loan scope, old bare view URLs,
per-link opt-in, immutable original report values, potentially different recorded
amount/date, and the boundary between an acknowledgment and later payment edits.

Historical reviews and anniversary history remain intact. Loan-specific read-only
guidance remains accurate. Other tools and guides already link into the relevant
sharing/feature pages; they do not need repeated promotional paragraphs. The legal
privacy policy is unchanged; the product trust page explains the feature. Existing
Timeline redirect registry content was restored unchanged after a replacement
spillover was caught during review. Original Published dates are retained.

## Discovery and language architecture

- Human-readable content is present in static HTML, including native FAQ
  disclosures. No feature facts depend on JavaScript rendering.
- New canonical/title/description/Open Graph/Twitter metadata and WebPage,
  BreadcrumbList and FAQPage schema accompany the guide. Features metadata and
  collection schema are aligned; changed FAQ answers match visible text.
- Homepage SoftwareApplication feature list, `llms.txt`, content registry, and
  generated sitemap reflect reporting. Sitemap dates change only for edited
  content pages; the legacy redirect stays excluded.
- The website remains English-only. The existing ten-language app disclosure is
  integrated on the new route; language scope/test counts now include it.
- Existing crawler permissions are unchanged. There is no indexing or AI-answer
  guarantee, new pricing claim, push notification, chat or loan-reporting claim.

## Verification

- All 175 existing Node tests pass, zero skipped. The initial broad run found
  three stale date assertions after genuine page edits; the relevant expectations
  were updated and the affected 21 tests then passed, followed by the full suite.
- Design audits: `/live-link/` and `/features/`, zero hard errors.
- Content registry, routing, SEO/AI hygiene and app-language audits: zero hard
  errors. Existing warning sets remain (one registry, twenty routing, six SEO).
- Sitemap: 82 indexable URLs. Best Next Step generation: 80 modules, no drift.
- Static checks inspect 20 HTML pages, 182 FAQ answers and 1,922 local link/asset
  references: no new missing references, ID collisions, FAQ mismatches or changed
  original publication dates. Twelve exact-text/ID baseline variances remain
  unchanged; these are not introduced by this update.
- Browser: guide at 320, 390, 768, 1024 and 1440px, no horizontal overflow;
  desktop/tablet/mobile screenshots inspected. Native FAQ mouse and keyboard
  disclosure with visible focus, anchor navigation, and error-free guide console
  checked. Homepage desktop, Features desktop/mobile, and Quick Start mobile
  placements visually inspected. Zoom is permitted on the new guide and reduced
  motion is respected by scoped CSS. No native app/backend test is claimed.
- `node --check content/content-registry.mjs` and `git diff --check` pass.

## Publication path

Production remains `https://you-owe-me.com/` through the existing GitHub Pages
build-and-deployment workflow after a push to `master`. SSH access and the previous
successful Pages workflow were verified. Deployment completion and public response
checks are recorded in the publishing chat after the source commit is pushed.
The pre-existing untracked `audits/` directory is excluded from the commit.
