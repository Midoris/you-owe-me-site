# Voice Entry website release-readiness review — October 2, 2026

This document preserves the release-readiness review and its deployment history.
The later explicitly authorized pre-release publication decision below supersedes
the review’s public release-label requirement. App Store availability evidence
and the distinction between inspected source and a confirmed live build remain
historical facts; the new website wording does not establish an App Store release.

## Historical release evidence and correction

The public [US App Store listing](https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670)
lists 7.1.7 as its latest version on October 2. Its notes announce multiple
entries, currencies, repeats, interest and due-date reminders, improved dictation
and faster interpretation. They do not announce voice bill splitting,
new-person creation or existing-loan links.

The inspected 7.1.7 Git baseline `4f21e7fe` declares build 206. Git contains
both builds 205 and 206 under marketing version 7.1.7; the public App Store
listing confirms only marketing version 7.1.7. The exact submitted/live build
was not independently established by this website review, so this baseline is
source evidence rather than proof that build 206 is live. Direct inspection of
`FirebaseOpenAIClient.swift` shows batch requests using
`parseEntriesV2`. `RelaunchStartViewController+AiButton.swift` hides the AI button
until a non-demo borrower exists; its recording flow already supports manual
first dictation and eligible automatic starts after successful use.

The prepared 7.1.8/build 207 source inspected at `56d7f734` routes through
`VoiceEntryPersonResolution.modelCandidates`,
`VoiceEntryLoanResolution.modelContext` and `parseEntriesV4`.
Read-only comparisons also covered `VoiceEntryBatchCoordinator.swift`,
`VoiceEntryLoanResolution.swift`, `functions/src/voiceEntry/requestBatchV4.ts`
and `validateBatchV4.ts`. They support explicit new-person confirmation,
review for ambiguous identity, allocated regular split entries, bounded existing
loan context, ownership/eligibility revalidation, conditional automatic saving,
and preserved review/allowance rows. Existing loan linking creates neither a
loan nor a repayment plan and does not change loan terms. Plain repayments do
not acquire loan links just because a loan exists; a clear title in payment
context can identify an existing loan, while generic matching requires one
eligible loan under the matched person.

The previous public website incorrectly presented these prepared additions as
currently available and said people did not need to be added first. The updated
copy labels voice splits, new-person confirmation, existing-loan links, optional
initial person setup and the in-app Voice guide as coming in 7.1.8. It promises
no approval or release date. Current 7.1.7 instructions require a real person.

The hero, Quick Start example and 1200×630 social image now show the released
Alex €50 / Sam €20 two-entry dictation. Future examples retain explicit preview
labels. Both OG and Twitter use the replaced social image with
`?v=20261002-release`; the changed CSS also has a new versioned URL. Normal page
amounts, labels and financial states remain accessible HTML, with the existing
native-inspired AI-button SVG. These are fictional illustrations.

## Historical verification before deployment

- All 154 repository tests passed; four affected page-design audits and content
  registry, routing, SEO/AI and language-support audits have zero hard errors.
  Existing unrelated audit warnings remain unchanged.
- Best Next Step build: 80 modules, zero drift. Sitemap: 81 indexable URLs.
  JavaScript/registry syntax and diff whitespace checks passed.
- All 363 local references and anchors on Voice, Features and Quick Start
  resolve; IDs are unique, images have descriptions, attributed App Store
  links are valid, and the six FAQ schema answers match visible text exactly.
  SVG/sitemap XML is valid.
- Six example states at 1440, 1024, 768, 390 and 320px: no horizontal overflow
  or clipped text; one selected panel and loaded images. Related Features,
  Quick Start and Privacy pages also fit 1440, 390 and 320px.
- Keyboard arrows, Home/End, skip link, native FAQ and mobile-menu Escape/focus
  restoration work. Sampled text has a conservative minimum 5.85:1 contrast.
- A script-blocked 320px fixture displays all six examples and working FAQ.
  Forcing the Reduce Motion CSS branch gives no animation or transition.
  No operating-system preference was changed.

No native/backend files were edited and no native build, simulator test or model
evaluation was run by this website review. Those release checks belong to the
coordinating native review; source inspection does not substitute for them.

## Historical production acceptance

The frontend changes were committed as
`81cbc2f7f3707322ba595783eb21917b1af210e8` and deployed through the established
master-branch GitHub Pages process. [Workflow 37008002084](https://github.com/Midoris/you-owe-me-site/actions/runs/37008002084)
completed successfully at 12:40:21 UTC on October 2, 2026.

All ten checked production resources returned HTTP 200 and matched the
committed bytes by SHA-256: Voice to Entry, Features, Quick Start, Privacy and
Data, versioned voice CSS, versioned voice script, versioned social JPEG, AI
button SVG, sitemap.xml and llms.txt. The attributed App Store CTA also returned
HTTP 200. Both OG and Twitter point to the verified versioned social image.

Live inspection covered all six example states at 1440, 390 and 320px, with one
selected panel, loaded images and no horizontal overflow. Features and Quick
Start links reached the loan preview and selected loan example. Desktop/mobile
preview labels and the released two-entry hero were visually checked. The
coordinating root independently reloaded Voice, Features and Quick Start at
390px and reported correct release labels, canonical URLs, anchors and no
horizontal overflow.

Local completion evidence and production screenshots are saved under
`/Users/ievgeniiiablonskyi/.codex/visualizations/2026/10/01/01a0f9b0-e3c0-77c3-a92c-fca6c7d92c5e/voice-landing/release-readiness/`:

- `completion-evidence.json` and `production-assets.json` record deployment,
  checks, resource hashes and byte comparisons.
- `production-features-desktop.jpg` and `production-features-mobile.jpg` show
  the final Features presentation.
- `production-desktop-hero.jpg`, `production-mobile-hero.jpg` and
  `production-mobile-loan-preview.jpg` show released and preview wording on the
  dedicated Voice page.

This documentation correction does not change frontend resources. A subsequent
docs-only commit or Pages run is separate from the verified frontend deployment
above.


## Explicitly authorized pre-release publication — October 2, 2026

After the review, the user directly asked to present the supported 7.1.7 and
7.1.8 capabilities together as available and to publish now, knowing 7.1.8 was
not yet released. This is an intentional pre-release publication decision, not
a new claim that App Store approval or release was independently verified. The
user’s estimate of the release window is not presented as a promised date.

Voice to Entry, Features, Quick Start, related Privacy and Data text, FAQ/schema,
metadata, the content registry and llms.txt now use evergreen wording without
upcoming/preview version distinctions. The combined presentation includes voice
bill splits, explicit new-person confirmation, existing-loan payment links and
optional initial person setup. The underlying requirements remain: validation
and allowances before saving, review for ambiguity, explicit consent for new
people, and existing eligible loans without creating loans or changing terms.
Internet and plan limits remain clear.

The dedicated hero, Quick Start example and social art again show the fictional
€60 lunch split into two €20 entries, excluding the user's own €20 share. The
main amounts and labels remain accessible HTML. The social image and CSS use
`?v=20261002-evergreen2` to avoid cached release-label assets; OG and Twitter
share the same versioned image URL. Historical review screenshots and resource
hashes above remain evidence of the earlier deployment, not the new wording.

Before this publication, all 154 repository tests passed again. The four page
design audits, registry/routing/SEO/language audits, syntax and whitespace checks
had zero hard errors, with the existing unrelated warnings unchanged. Generated
Best Next Step modules had no drift and the sitemap retained 81 URLs. All 363
local references resolved, six FAQ answers matched their schema, and sampled
text contrast remained at least 5.85:1.

All six examples fit 1440, 390 and 320px, with one selected panel, loaded images
and no clipped text or horizontal overflow. The related three pages fit those
same widths. Keyboard tab selection, skip link, mobile Escape/focus restoration
and incoming loan-example links worked. At 320px the script-blocked fixture
displayed all six examples and a functioning FAQ, with no animation or transition
under the forced Reduce Motion CSS branch.

This publication's evidence and final screenshots are kept separately under the
same visualization root in `voice-landing/evergreen-publication/`; production
resource comparisons and deployment identity are recorded in its completion
evidence and the final completion report.
