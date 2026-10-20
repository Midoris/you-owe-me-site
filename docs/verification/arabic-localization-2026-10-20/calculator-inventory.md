# Split-expense calculator inventory — 20 October 2026

Author read current English public calculator, shared locale dictionary, private continuation HTML, and independent `calculator-review-fixtures.md`. Target `/ar/tools/split-expense-calculator/`. Prerequisite fourth-page acceptance `e0cae7c`.

## Static surfaces and assets

Complete title/description/social metadata, WebPage/Breadcrumb/13 FAQ schema, navigation/switch/Arabic section, hero, currency help, people/expense controls, input help, result/actions/privacy/transfer/App Clip text, detail labels, QR/Store journeys, examples/methods/related resources/FAQs/closing CTA. Preserve equal/selective splitting boundary and no custom/weighted shares. Amount/code display uses Western digits/dot decimal; original USD/$ semantics unchanged. Numeric help states Western/Arabic-Indic input, decimal `.` or `٫`, correct `,` or `٬` grouping and no mixing systems. Add a useful Arabic no-JS explanation alongside substantial static guidance.

Source assets: decorative text-free calculator illustration remains unchanged; text-free brand social icon has translated alt. Neutral Arabic QR reused without mirroring. Store badge is Arabic HTML CTA. No screenshot invention or untranslated text-bearing image remains.

## Dynamic localization owned by author

Add `arabic` frozen dictionary and `ar` mapping in `scripts/split-expense-locale.js`, preserving existing Spanish/German blocks byte-for-byte. Translate row labels, participant defaults/accessibility, validation/capacity/errors, example descriptions, summary/detail/settled states, copy/share success/failure/fallback and transfer preparation states. Settlement names payer and recipient explicitly: «على {from} سداد {amount} إلى {to}». Root owns numeric normalization, unknown-name/amount bidi isolation, plain-text presentation, transfer/consent retry/Back/native behavior and additional invalid-format key. Plain copied/shared presentation and accessible labels may use necessary balanced FSI/LRI/PDI isolates; raw participant state and native names/financial draft fields remain unchanged and free of presentation controls.

Public page loads new `/scripts/arabic-number-input.js?v=ar20261020` before calculator runtime. Existing runtime/cache IDs remain unchanged.

## Private continuation author scope

Append Arabic `lang=ar dir=rtl` section and Arabic nav link; retain exact EN/ES/DE sections. All four sections remain readable without JS. Arabic explains App Clip/Safari/private-browsing/device conditions, review names/currency/balances, optional full-app opening, no account, private reference lifetime 24 hours and already-accepted local record. Arabic return points to public Arabic calculator. Root owns selector direction reset and private CSS/cache pins.

## Required independent runtime evidence

180 example (Sam → Alex25, Mia10), 98÷8=12.25, zero/negative/invalid/grouped/Arabic-Indic inputs, mixed/long names, settled/empty/multiple-payer/eligible/ineligible states, actual copy/share/fallback/cancel/error, consent/retry/Back mocks and unchanged native cents/names/schema. Synthetic data only; no real financial uploads. Public/private no-JS and deployed effective policies remain release checks. No author commit before independent acceptance.
