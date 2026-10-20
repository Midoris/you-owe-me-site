# German release record — 20 October 2026

Owner-authorized implementation and public release; indexing is explicitly left to the owner. No Search Console access, indexing requests, sitemap submissions or indexing API calls are in scope. Base `bfd69d7`; branch `codex/german-localization`. Preserve unrelated untracked `audits/`, `tmp/`, and `docs/verification/loan-plan-record-once-2026-10-19/`.

## Route mapping

| English | Spanish | German |
| --- | --- | --- |
| `/` | `/es/` | `/de/` |
| `/solutions/app-to-track-money-owed/` | `/es/soluciones/app-para-registrar-dinero-adeudado/` | `/de/loesungen/app-fuer-geldforderungen/` |
| `/blog/how-to-keep-track-of-who-owes-you-money/` | `/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/` | `/de/blog/wer-schuldet-mir-geld/` |
| `/solutions/personal-loan-repayment-tracker/` | `/es/soluciones/seguimiento-de-prestamos-personales/` | `/de/loesungen/private-darlehen-verwalten/` |
| `/tools/split-expense-calculator/` | `/es/herramientas/calculadora-de-gastos-compartidos/` | `/de/tools/ausgaben-aufteilen/` |

## Language and product conventions

Use natural standard German, informal singular **du/dein**. Prefer **offener Betrag** for money still owed; **laufender Saldo** for running balance; **Rückzahlung**, **Teilrückzahlung**, **Rückzahlungsplan**, **Darlehensübersicht** (explain Loan Record), **Erinnerung**, **gemeinsame Ausgaben**, **Ausgleich**. Retain You Owe Me, Live Link, Balance Sync and Money Conversations as names with German explanations. Language never changes currency, store country, financial values, eligibility or privacy. USD examples remain USD with German number formatting. German examples are explicitly illustrative and never presented as app screenshots. Label remaining English destinations **auf Englisch**.

Independent model reviews use GPT-6.1 Sol/high, matching this chat; they are not human native-speaker certification. Implementation, language review and technical/product review are recorded separately. Only accepted pages join public discovery; deploy the complete batch after final review.

## Acceptance evidence

Foundation: `079abc3`, independently reviewed German shared language and technical/product behavior; 45 focused checks passed. Existing EN/ES authored bodies preserved; six changed shared UI/CSS dependencies plus analytics have centralized cache overrides, including the nested locale-module import.

| Page | Independent language review | Independent technical/product review | Verification | Commit |
| --- | --- | --- | --- | --- |
| Homepage `/de/` | locale_foundation accepted; fixed untranslated rail hints and plural CTA imperatives. | foundation_review accepted; independent 390/1440 browser, QR failure restoration, Store/campaign and product-boundary checks. | 27 relevant tests; design/registry/SEO zero hard errors (six legacy warnings); static links/fragments/assets; no-JS main 21,563 chars; root Chrome 320/390/600/1440, all widths exact; six labeled illustrative examples plus German video poster; reciprocal en/es/de/default; generation idempotent. | `331ca81` |
| Money owed `/de/loesungen/app-fuer-geldforderungen/` | locale_foundation accepted after spacing/singular-address fixes; all 18 FAQ answers preserve source meaning. | foundation_review accepted after fixing independently measured menu overlap at320/390; checked interest/write-off/plans/sharing/download. | 23 relevant tests; design/registry/SEO zero hard errors; raw104links/fragments; no-JS main24,561chars; Chrome320/390/600/1440 zero element/page overflow; two illustrative USD examples; reciprocal switches and generator idempotence. | `3e51f43` |
| Recordkeeping guide `/de/blog/wer-schuldet-mir-geld/` | locale_foundation accepted all body/templates/runtime labels; two proposed wording polishes applied. | foundation_review independently accepted all3copy controls across success/fallback/failure,9lines,event privacy,ledger and tables. |29relevant tests; design/registry/SEO zero hard errors; static60links/fragments; no-JS over13,700chars; Chrome320/390/600/1440; labeled table scrolling; EN/ES copy regressions; all switch directions; shared compatibility runtime/cache and generator idempotence. | This page commit |

Evidence is saved in `docs/verification/german-localization-2026-10-20/`. No public deployment yet; three reviewed German pages are admitted locally. The remaining two German pages remain unadvertised.
