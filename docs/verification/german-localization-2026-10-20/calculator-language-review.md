# Split calculator: independent German language review

20 October 2026. Independent GPT-6.1 Sol/high model reviewer; no human native-speaker certification. Reviewed actual `de/tools/ausgaben-aufteilen/index.html`, all German entries in `scripts/split-expense-locale.js`, relevant generated strings/formatting/continuation in `scripts/split-expense-calculator.js`, transfer fallback copy in `scripts/tool-transfer.js`, and German private continuation HTML/selector. Compared the current English scope and the runtime English phrase keys, not only the prose page. Read-only page/runtime review; no indexing, private production upload or publication.

Decision: **accepted**. No material German language, money-direction, privacy-consent, currency, continuation or product-meaning issue. Root corrected the minor metadata punctuation polish: spaces before full stops after `(auf Englisch)` in unequal-share/WG/couple FAQ schema answers. The saved page was rechecked; no such pre-period spacing remains and no open language finding remains.

## Static page and schema

- Reviewed all body sections, static/hidden labels, placeholders, input hints, accessible labels, table headers, examples, related cards, CTA language and footer. Singular du/dein instructions are consistent; context about multiple participants is natural.
- **95 links** enumerated. Every internal English destination outside the explicit English switch carries `auf Englisch`; the German reviewed counterparts remain localized. Store links use the neutral app-ID destination. Only one image remains: the German app-Store QR graphic with German alt text, not an English app capture/badge.
- JSON-LD parses. **13 visible and 13 structured FAQ questions/answers** match after whitespace/punctuation normalization and preserve source scope. Metadata describes a free browser calculator, not an automatic money-transfer service.
- Equal splitting, selected participants, multiple payers entered as separate expenses and absence of custom/percentage weights are clear. The static 180 USD example correctly produces **Sam owes Alex 25 USD and Mia 10 USD**; **98÷8 = 12,25 USD** is correct. The payer's own share is already included, so the page does not instruct them to repay themselves.
- German decimal input guidance correctly permits browser-native `12,50`, with `12.50` fallback if required. German output formatting is clearly distinguished from input parsing. Default `$` remains unchanged, and a visible helper says `$` alone does not identify a currency, suggests USD and states no conversion occurs.
- Ordinary App Store links and QR are explicitly described as opening the Store without transferring the result. The distinct eligible transfer action offers an App Clip/continued app record; names/amounts, 24-hour private transfer link and no-account scope are disclosed. General calculation privacy is qualified by the explicit continuation choice.

## Actual generated output and dictionary

The reviewer executed the current shared runtime with its existing DOM harness and inspected the output, in addition to reading the dictionary and root Chrome receipts. For the worked example with currency set to USD it produced:

```text
Gemeinsame Ausgaben insgesamt: 180 USD
Alex hat 90 USD bezahlt
Mia hat 60 USD bezahlt
Sam hat 30 USD bezahlt
Anteil von Alex: 65 USD
Anteil von Mia: 50 USD
Anteil von Sam: 65 USD
Sam schuldet Alex 25 USD
Sam schuldet Mia 10 USD
```

The copied summary ends with the German calculator canonical; the success status is `Zusammenfassung und Link zum Rechner kopiert.` The unedited default still uses trailing dollar labels such as `30 $`, not an inferred EUR conversion.

All German dictionary states were read: generated person/expense names, remove labels, fields and placeholders, payer/participant validation, empty/settled states, positive/negative net labels, owing direction, capacity limits, examples/reset names, ongoing/settled app continuation, total/payment/share/settlement summary, copy/share success, missing-expense validation, unsupported-share clipboard fallback, combined failure, preparing-transfer and retryable-transfer failure. Wording is clear and meaning agrees with English keys. `{from} schuldet {to} {amount}` preserves debtor→creditor direction. Tool-transfer unnamed-person/shared-expense fallbacks are German and keep financial values unchanged.

Root receipts `calculator-checks.json` and `decimal-input-checks.json` were inspected: 390/1440 px result/copy/share/fallback/cancel/failure/empty/negative/no-participant/settled states and 98/8 formatting pass; actual Chrome keyboard input accepts comma and point and normalizes to native numeric input. These are root browser checks, distinct from this reviewer's runtime-harness output. No Safari/physical-iPhone behavior is claimed.

## Private continuation

- German section and title naturally instruct the user to use Apple's App Clip card/banner, review names/currency/balances before keeping repayments, and use Safari outside private browsing if necessary. Device/settings availability remains qualified; installed full-app opening is described accurately.
- 24-hour link expiration is distinct from an already accepted record remaining usable on the device. The bearer-link warning is explicit: anyone with the link can retrieve the split until expiry. No account is required and the return link targets the German calculator.
- Selector's German navigation label, document language/title and visible section are correct; language travels only in `#de`, preserving the sole private `ref` query contract. All three static language sections remain readable with JavaScript unavailable. No browser-language redirect, private-reference read, network or storage behavior is introduced by the locale selector.
- `private-locale-checks.json` was inspected: root reports CSP-constrained German selection, explicit switching, retained English copy, no private-data read/external requests and all-three-language no-JS readability at 390/1440 px. These remain separate technical receipts.

Review hashes at inspection:

- HTML: `da63ccbfbb20d36b15f540450532d244dbcfc4c3d2acc09ba39ae9133517bc09`.
- Dictionary: `b2eee1ed30313aaf724c075dafbadeff4fbf015ae9e27281b908121edc4e6e16`.
- Calculator runtime: `df1a69461f5c2d28327ee0b84bdc5ebee8f6cedf10a2f34c19fb15e19d109711`.
- Transfer runtime: `1aa5301b898e395378d003305983c966500264f10799faaddce696188b5629d3`.
- Private HTML: `3241c2e59e75f2040070745827c0796e57baea1acee4fcd4547849d173293b39`.
- Private selector: `b1591aea5af9ac22d7db420b090b19aa7e42a9eee0c2abde35a2655813834f8f`.

This is language/product-meaning acceptance plus the specific harness output above. It does not certify native App Clip save, live cloud upload, physical iPhone behavior, indexing or publication. Production completion remains gated during review.
