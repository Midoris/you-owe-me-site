# Voice Entry website release-readiness review — October 2, 2026

This review supersedes the evergreen release wording recorded in the earlier
landing-page notes. It keeps the existing presentation and corrects availability
claims across Voice to Entry, Features, Quick Start, Privacy and Data, metadata,
FAQ schema, the content registry and llms.txt.

## Release evidence and correction

The public [US App Store listing](https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670)
lists 7.1.7 as its latest version on October 2. Its notes announce multiple
entries, currencies, repeats, interest and due-date reminders, improved dictation
and faster interpretation. They do not announce voice bill splitting,
new-person creation or existing-loan links.

The released native baseline `4f21e7fe` is version 7.1.7/build 206. Direct source
inspection of `FirebaseOpenAIClient.swift` shows batch requests using
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

## Verification before deployment

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

## Production acceptance

Deploy the reviewed commit through the established master-branch GitHub Pages
workflow, wait for success, then compare the live HTML, versioned CSS/script,
social image, AI SVG, sitemap and llms.txt with committed bytes. Independently
inspect live desktop/mobile layouts, preview labels, tabs, deep links and the
Features/Quick Start navigation. Capture final production screenshots and
record the commit and successful workflow in the completion report.
