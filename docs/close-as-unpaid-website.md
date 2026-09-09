# Close as unpaid website coverage — 2026-09-09

Added a dedicated illustrated section to Features, with supporting mentions on the money-owed solution page, the polite payback guide and the spreadsheet comparison. Updated structured data, sitemap dates and llms.txt. No analytics events or parameters were added.

## Product evidence

Native implementation: `a15a578f2349ebbf686012db91c2f7f953513766` (Add close-as-unpaid ledger write-offs), released in 7.0.9. Reviewed EntryWriteOff eligibility, coordinator, localized action labels and native test coverage. Production Firebase Remote Config `is_close_as_unpaid_creation_enabled` was verified true on 2026-09-09; no configuration was changed.

Copy distinguishes a write-off from a real repayment, preserves history, explains Reopen debt and lists unsupported entry types. The numerical example assumes $60 remains outstanding, rather than implying repayment allocation to a particular entry.

## Illustration

Built-in image generation mode, followed by resize/WebP encoding. The tool does not expose a model-version selector. Published asset: `images/pages/features/close-as-unpaid.webp` (1200 × 800). Editorial art, not an app screenshot.

Prompt:

> Use case: stylized-concept. Asset type: one premium editorial illustration for You Owe Me's website feature 'Close as unpaid'. Communicate preserving a financial record while closing an unpaid chapter, calmly and without suggesting repayment or celebration. Landscape 3:2 composition. A beautifully crafted cream paper ledger rests open on a pale cool-gray surface; one intact leaf is being gently turned and laid flat, with a muted sage-green archival ribbon between the pages. Visible embossed horizontal ledger rules but absolutely no legible text, numbers, checkmarks, coins, money, stamps, hands, people, devices or app UI. The paper remains whole, nothing erased, torn or discarded. Sophisticated tactile 3D still life, subtle paper grain, softly rounded edges, restrained warm-white and sage palette echoing #afe67e accents and #f4f6f8 background, soft natural studio shadows. Close editorial crop with generous breathing room, quiet and reassuring rather than corporate or whimsical. High-end financial app art, not a screenshot, no logos, no text.

## Verification

- Scoped page-design audit: all four affected pages passed, zero hard errors.
- Browser checks at 390px and 1280px: all four pages load, expose feature mentions and have no horizontal overflow.
- Structured JSON-LD parses on all four pages.
- Feature disclosure expands; illustration loads at expected intrinsic size.
- Desktop and mobile feature section visually inspected.
- `git diff --check` passed.

Publishing uses the existing master-branch GitHub Pages deployment. Live verification is performed after push.
