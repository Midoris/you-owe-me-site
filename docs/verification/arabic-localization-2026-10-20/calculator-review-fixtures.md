# Independent Arabic calculator acceptance fixtures

Prepared by `rtl_review` GPT-6.1 Sol/high, before calculator implementation. This is a review plan, not a passing result. Current English calculation and native fixtures remain the source of financial behavior.

## Input boundary and precision

Use real rendered entry, not only a parser unit test. A locale-scoped text input with decimal input mode must retain Arabic-Indic entry long enough for validation. Verify Western `98`, Arabic-Indic `٩٨` and Persian `۹۸`; decimals `90.50`, `٩٠٫٥٠`; correctly grouped `1,234.50` and `١٬٢٣٤٫٥٠`. Display convention is Western digits/dot decimal/comma grouping; these inputs do not select a different currency.

Verify malformed grouping `1,2`, `١٬٢٣`, mixed decimal/group conventions `1.234,50`, duplicate decimals `١٫٢٫٣`, unknown punctuation, blank, zero, negative and nonfinite text. None may silently turn into a different positive amount. If mixed separator systems are rejected, explain that through the Arabic numeric error. Preserve existing en/es/de parsing and existing financial precision/rounding behavior; do not normalize the native payload by stripping arbitrary punctuation.

Input → displayed totals → copied/share totals → transfer preparation must consume one validated canonical numeric interpretation. For example `٩٠٫٥٠` must calculate `90.50` and produce `9050` cents if eligible, without altered raw input/name strings entering event payloads.

## Calculation, names and direction

- Existing 180 multi-payer example: Sam owes Alex 25 and Mia 10. Check the payer and recipient visually and in copied plain text.
- Eight participants and total 98: seven settlement transfers of 12.25. Preserve the source rounding algorithm; changing locale never changes allocation.
- Mixed names `أحمد (Alex 2)` and `Mia — مريم`, long names up to the existing limit, punctuation/parentheses, and a Latin currency code. Check auto-direction text inputs, unknown-direction `bdi` boundaries and explicit LTR amount/code boundaries.
- Keep DOM/focus order coherent and preserve the original mathematical direction. Never reverse amount digit strings or mirror nondirectional assets.
- Check invalid/no-included-person states, empty result, fully settled result, eligible single payer, ineligible multi-payer and capacity limits.
- Copy/share success, share cancellation, share fallback to copy, clipboard failure and manual-copy fallback remain localized. Inspect the actual summary including its canonical URL. Bidi repair must not introduce controls into participant names, descriptions, references or native financial draft fields.

For plain-text copy/share only, necessary tightly wrapped FSI/PDI (`U+2068`/`U+2069`) around unknown-direction names and LRI/PDI (`U+2066`/`U+2069`) around complete known-LTR amount/code and URL tokens are the preferred presentation boundary. Use semantic markup for DOM output. Do not use directional overrides/embeddings, change raw state, or insert presentation controls into the native draft. Test balanced minimal pairs, copied-text rendering in both paragraph directions, and raw native participant names remaining byte-equal to entered names. This follows current [W3C Unicode bidi-controls guidance](https://www.w3.org/International/questions/qa-bidi-unicode-controls) and [inline bidi markup guidance](https://www.w3.org/International/articles/inline-bidi-markup/), reviewed 20 October 2026.

## Native/private continuation

Use mocked transfers and synthetic data only. Preserve the sole `?ref` parameter and locale fragment, unchanged schema/cents, `0.29` rounding ineligibility, explicit user action, same reference on retry, failed-upload recovery, Back restoration then saved-state removal, and the multiple-payer app fallback. Events must retain their limited event-name-only shape.

Private `#ar` selects `lang=ar dir=rtl`; each switch to en/es/de explicitly resets `dir=ltr`. Unknown/no hash defaults consistently. No-JS exposes all four readable sections. The fragment selector must not inspect the reference or financial data, access storage, fetch or emit analytics. Effective deployed CSP/noindex/no-store/no-referrer and original EN/ES/DE section preservation require separate checks.

## Audit extension review

The change in `scripts/audit-seo-ai-hygiene.mjs` from homepage commit `292f0c6` was independently inspected: Arabic example/positioning tokens are selected only for `entry.locale === "ar"`; existing en/es/de paths and hard-error behavior remain unchanged. Accepted as a scoped locale addition.

## Actual presentation finding and repair

Independent actual rendering in a forced LTR paragraph showed that isolated tokens alone do not preserve Arabic clause order. The final copied/shared summary adds a necessary RLI/PDI base-direction boundary to each nonempty Arabic line, while FSI/LRI/PDI retain the mixed-name/amount/URL boundaries inside it. Blank lines remain blank. DOM output uses semantic markup. These presentation controls are never written to raw state, session-restored financial values, native drafts, references or events. Reviewers repeat both RTL and forced-LTR rendering after the repair.
