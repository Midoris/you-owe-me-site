# Voice to Entry website update — October 2, 2026

The Features page now introduces voice capture in the hero, links to it from the
feature shortcuts, presents Voice Entry 2.0 immediately below those shortcuts,
and places its teaser second in the showcase. The two old voice presentations
and their 6.8.5 screenshots are replaced with a single consistent presentation.

## Release and product evidence

The US App Store listing for app 1147058670 listed **7.1.6** when checked on
October 2, 2026. The main section, teaser, included list, metadata, collection
schema, content registry, and llms.txt therefore label the improvements
**coming in 7.1.7**. No assertion about Apple's internal review status is made.

The supplied product facts were cross-checked against the current native
repository's voice-entry batch integration, Undo, and automatic-dictation notes.
Copy explains validation and allowance checks before automatic saving, review
of unsaved entries, explicit person selection, limits and Upgrade, the AI button
on Home after a real person is added, currency fallback, and supported financial
details. Regular entries remain distinct from the dedicated loan, repayment
plan, Group Payback, and shared-bill features. The offline card and included list
explicitly distinguish manual/local use from voice's internet requirement.

## Visual and accessibility decisions

The main illustration is HTML: one example dictation becomes two saved result
cards for fictional Alex and Sam. Amounts, directions, purposes, dates, saved
states, and Edit/Undo labels are readable text. It is explicitly labeled an
illustration, not a screenshot; its labels are explanatory rather than fake
interactive buttons.

`images/pages/features/voice-ai-button.svg` matches the current native
`VoiceEntryFloatingButton`: lime circular gradient, five white bars, 3.2-point
bar widths, 6.2-point spacing, and resting heights 9/16/23/16/9. The website SVG
uses the site's sRGB lime palette to represent the native Display P3 colors.
Older capture fixtures were inspected but predated Undo, so they are not used
as current screenshots.

Desktop places the illustration beside the introduction and supporting copy.
Tablet and mobile place it directly after the introduction. Narrow screens
stack the two result cards and retain at least 14px transaction notes and 16px
dictation text. The demonstration is static; no JavaScript or animation is
required. Reduced-motion styles also suppress inherited transitions.

The page now permits zoom and has a main landmark, named primary navigation,
current-page indication, a keyboard skip link, native disclosures, descriptive
image text, and strengthened focus indicators on the new controls.

## Verification before publication

- `node scripts/build-best-next-steps.mjs`: built 80 modules, zero generated drift.
- `node --test scripts/*.test.js scripts/*.test.mjs tests/*.test.cjs`: 152 passed.
- Page-design audit for `/features/`: zero hard errors.
- Content registry validation, content-routing audit, SEO/AI hygiene audit:
  zero hard errors. Existing warnings concern related-link counts, generic
  App Store labels on other routes, and another route's date mismatch.
- `node --check content/content-registry.mjs` and `git diff --check` passed.
- HTML validation: unique IDs, all fragment targets and 68 local asset
  references exist, two JSON-LD blocks parse, four App Store links retain the
  correct app ID and attribution, and the SVG/sitemap XML parse.
- Browser checks at 320, 390, 768, 1024, and 1440px: no page overflow or clipped
  voice content. First three showcase cards are Money between people, Voice,
  and Spaces. Desktop, tablet, and mobile screenshots visually inspected.
- Keyboard disclosure expansion/collapse and visible focus verified. New text
  colors have a conservative minimum 5.58:1 contrast against the palette's
  white, gray, pale green, and lime backgrounds; the lime background is darker
  than the actual demonstration surfaces.
- A temporary local fixture blocked page scripts, applied the existing
  no-script fallback stylesheet, and activated the reduced-motion rule.
  All content, both results, the badge, and keyboard disclosures worked;
  animations were `none` and transitions `0s`. This exercised the fallback
  styles rather than changing the user's OS/browser motion preference.

## Publication

The established production process is a push to `master`, followed by the
GitHub **pages build and deployment** workflow. Existing SSH access was checked
with a dry run; the local HTTPS credential helper was unavailable. The origin
configuration is retained. After publication, verify the deployed HTML, versioned
stylesheet, SVG, metadata, shortcuts, disclosures, App Store destinations, and
responsive layout, and capture desktop/mobile screenshots from production.

When 7.1.7 is publicly listed, recheck the App Store before changing release
wording in all the locations listed above.
