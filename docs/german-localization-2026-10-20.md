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
| Money owed `/de/loesungen/app-fuer-geldforderungen/` | locale_foundation accepted after spacing/singular-address fixes; all 18 FAQ answers preserve source meaning. | foundation_review accepted after fixing independently measured menu overlap at320/390; checked interest/write-off/plans/sharing/download. | 23 relevant tests; design/registry/SEO zero hard errors; raw104links/fragments; no-JS main24,561chars; Chrome 320/390/600/1440 px zero element/page overflow; two illustrative USD examples; reciprocal switches and generator idempotence. | `3e51f43` |
| Recordkeeping guide `/de/blog/wer-schuldet-mir-geld/` | locale_foundation accepted all body/templates/runtime labels; two proposed wording polishes applied. | foundation_review independently accepted all 3 copy controls across success/fallback/failure,9 lines,event privacy,ledger and tables. |29 relevant tests; design/registry/SEO zero hard errors; static 60 links/fragments; no-JS over 13,700 chars; Chrome 320/390/600/1440 px; labeled table scrolling; EN/ES copy regressions; all switch directions; shared compatibility runtime/cache and generator idempotence. | `496ef4e` |
| Personal-loan solution `/de/loesungen/private-darlehen-verwalten/` | locale_foundation accepted all copy, snapshots, table/diagram labels, reminders and boundaries. | foundation_review independently accepted exact amounts/allocation/date/no-interest/initial two-loan snapshot and browser journeys. |21 relevant tests; design/registry/SEO zero hard errors; static 55 links/fragments; no-JS 17,838 chars; Chrome 320/390/600/1440 px, no visible element/page overflow; three labeled examples; all language switches; idempotence. | `eea93d9` |
| Split calculator `/de/tools/ausgaben-aufteilen/` | locale_foundation accepted entire static/dynamic text and private continuation; schema punctuation polished. | foundation_review independently accepted unchanged math/eligibility/schema, exact EN/ES output, all copy/share/fallback/consent/retry/Back paths and effective private CSP. |55 relevant tests; design/registry/SEO zero hard errors; static 95 links; no-JS 15,867 chars; Chrome 320/390/600/1440 px;180 and 98÷8 examples; real comma/dot entry; private 3-language/no-JS checks; all switches;0 production uploads; generator idempotence. | `e630370` |

Evidence is saved in `docs/verification/german-localization-2026-10-20/`. All five reviewed German pages are admitted. The complete batch passed independent German language and technical/product review; public deployment and live verification follow through the established workflow.


## Final batch acceptance

Independent GPT-6.1 Sol/high reviews: `batch-language-review.md` and `batch-technical-review.md`, with actual final HTML/runtime reading, separate financial/privacy checks and independent browser evidence. No material finding remains. Batch polish corrected one plural imperative and removed empty fallback spans; the locale generator also cleans those spans when rewriting newly completed counterparts. English/Spanish authored content preservation tests still pass.

All **229 Node tests pass**, zero failed/cancelled/skipped. All five German design audits, raw HTML/link/fragment checks, registry, SEO/AI hygiene, routing and language-support audits have zero hard errors. The six SEO warnings and running-balance two-card advisory predate this work. Root Chrome passed **60 language-switch paths** across all 15 counterparts at 390/1440 px; independent technical review repeated 30 at 390 px. Per-page responsive checks cover 320/390/600/1440 px. Generator runs preserve all reviewed bytes: locale sync 15 pages; English Best Next Step: 80 modules, 0 changed; sitemap: 92 URLs; nine importer offer blocks match their source. Registry has 97 entries. No-JS public German text is substantial on every page.

Shared ES/DE resource URLs pin 11 changed dependencies; analytics’ nested locale-map import is versioned. Compatibility exports/modules remain available. Full EN/ES summary snapshots, common financial fixtures, rounding, eligibility, input/currency semantics, private schema and events remain unchanged. Actual Chrome comma/dot entry was checked in English and German browser locales. Local transfer tests use mocks only; production uploads: **0**.

Private continuation keeps original EN/ES section bytes, adds German selected by `#de` beside `#en/#es`, and retains the sole `?ref` native contract. The selector reads only the fragment; no reference/input/storage/network/analytics access. All three static sections are readable without JS. Effective CSP and noindex/no-store/no-referrer are unchanged; the five unchanged hosted dependencies passed preflight byte/header checks. No backend or Firebase configuration changes.

Existing `robots.txt` permissions remain unchanged; search/retrieval, user fetchers and training controls are distinct. Static public HTML, normal links, self-canonicals, reciprocal en/es/de/default alternates, sitemap and `llms.txt` support technical crawl/retrieval eligibility. This is not evidence of actual indexing, ranking or AI citation. No hidden crawler-only text, new analytics parameters, paid services or outreach were added.

**Indexing is left to the owner.** No Google Search Console access, indexing request, sitemap submission/resubmission, indexing API or indexing follow-up was performed.
