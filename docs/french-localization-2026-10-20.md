# French release record — 20 October 2026

Five owner-authorized French pages were implemented directly from the current English pages, in the requested order, on `codex/french-localization` from `a2eb93d`. Each page received separate GPT-6.1 Sol/high French-language and technical/product reviews before its scoped commit. These are independent model reviews, not human native-speaker certification. Both independent final batch reviews accepted the complete release candidate with no unresolved material finding; live receipts are recorded below after deployment.

No Google Search Console access, indexing requests, sitemap submission/resubmission, indexing API or indexing follow-up was performed. Indexing remains with the owner. Public discovery and crawl eligibility do not establish indexing, ranking, AI citation or customer impact. Unrelated untracked `audits/`, `tmp/` and `docs/verification/loan-plan-record-once-2026-10-19/` remain untouched.

## Counterpart map recorded before implementation

| English | Spanish | German | Arabic | French |
| --- | --- | --- | --- | --- |
| `/` | `/es/` | `/de/` | `/ar/` | `/fr/` |
| `/solutions/app-to-track-money-owed/` | `/es/soluciones/app-para-registrar-dinero-adeudado/` | `/de/loesungen/app-fuer-geldforderungen/` | `/ar/solutions/app-to-track-money-owed/` | `/fr/solutions/application-suivi-argent-du/` |
| `/blog/how-to-keep-track-of-who-owes-you-money/` | `/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/` | `/de/blog/wer-schuldet-mir-geld/` | `/ar/blog/how-to-keep-track-of-who-owes-you-money/` | `/fr/blog/suivre-qui-vous-doit-de-l-argent/` |
| `/solutions/personal-loan-repayment-tracker/` | `/es/soluciones/seguimiento-de-prestamos-personales/` | `/de/loesungen/private-darlehen-verwalten/` | `/ar/solutions/personal-loan-repayment-tracker/` | `/fr/solutions/suivi-remboursement-pret-personnel/` |
| `/tools/split-expense-calculator/` | `/es/herramientas/calculadora-de-gastos-compartidos/` | `/de/tools/ausgaben-aufteilen/` | `/ar/tools/split-expense-calculator/` | `/fr/outils/calculateur-partage-depenses/` |

French uses stable ASCII slugs under `/fr/`, static `lang="fr"` LTR HTML, self-canonicals and common completed-only generation. Authored localized next-step modules retain ownership; equivalent-language navigation is explicit. No automatic locale redirects. USD examples stay USD; language never selects a country, storefront, converted currency or calendar.

## Scoped implementation and acceptance

| Scope | Accepted change and review repairs | Commit |
| --- | --- | --- |
| Shared foundation | Completed-only five-language routing and reciprocal alternates; French shared labels, campaigns, video fallback, accessibility, typography and page-language priority; fresh shared dependency URLs. Existing campaign identity, timing and analytics contracts retained. | `fc104ff` |
| Homepage | Full static and accessible French; explicitly labeled illustrations; neutral App Store QR; lender-perspective testimonial, nonbreaking typography and fallback-link flow repaired. | `e75b66c` |
| Money-owed solution | Full static/schema copy, two labeled illustrations, eight workflow steps and all 22 related cards. French-only workflow badge reset keeps English fallback text readable. | `0705085` |
| Recordkeeping guide | Full static/schema copy, two scrollable illustration tables and three copy templates. All three controls verified for clipboard success, fallback and failure in every locale. Ledger arithmetic and copied line breaks preserved. | `9d680b4` |
| Personal-loan solution | Full static/schema copy, three labeled illustrations, staged repayment arithmetic, relationship map and 20 mobile table labels. Narrow French layout repairs make stacked headers, download labels and English fallback links readable. | `2be07e5` |
| Split calculator and private continuation | Complete French static/dynamic/accessible copy, strict French money input, neutral native handoff and private French section. Mixed-script copy/share directions repaired with presentation-only isolation. | `eee035d` |

Detailed inventories, independent reviews, repairs, screenshots and acceptance receipts are in [the verification directory](verification/french-localization-2026-10-20/). The reviewed glossary is [french-terminology-2026-10-20.md](french-terminology-2026-10-20.md).

The common generator owns reciprocal alternates, locale navigation, completed counterpart links and appended discovery sections. Localized next-step modules retain authored ownership. Existing English, Spanish, German and Arabic authored page bodies are verified against `a2eb93d`; only generated counterparts and declared cache queries change. The inherited English-only website claim in the authored `llms.txt` introduction was corrected to distinguish the full English website from selected Spanish, German, Arabic and French pages, while retaining the app's ten-language claim.

## Calculator and private boundaries

French text fields accept comma or canonical-dot decimals with at most two fractional digits, plus ordinary, nonbreaking or narrow-nonbreaking grouping spaces. Ambiguous three-digit separator forms, mixed punctuation, malformed grouping, currency/control characters, exponents and sub-cent values fail closed with French guidance. Only a cloned native payload receives canonical amounts; raw inputs survive retry and Back. French numeric restored state also rejects nonfinite and sub-cent values. Existing English/Spanish/German parsing and Arabic input/isolation behavior remain protected. Native preparation, eligibility and rounding code after the blank-field dictionary is byte-identical to `a2eb93d`.

French copied/shared output isolates names, amounts, URLs and lines for readable debt direction when pasted into LTR and RTL contexts. Raw state, native fields and analytics receive no injected direction controls. Actual mixed-script paste and synthetic iPhone transfer checks cover explicit consent, failure, retry with the same reference, raw `90,50` becoming `9050` cents, Back and multipayer fallback. Financial transfers are mocked; no production upload or private financial reference is used in release verification.

The private continuation adds French presentation and hash selection only. Existing four language sections are preserved exactly, and non-split hosted resources remain byte-identical to the accepted baseline. CSP, `noindex`, `no-store` and `no-referrer` remain enforced. Firebase project/target/configuration and privacy contracts are unchanged.

## Final local batch verification

- All 258 repository tests pass, with no failures or skips (`full-suite.tap`).
- Sixteen batch gates pass: all five scoped design audits, routing, SEO, app-language classification, raw HTML checks and byte-idempotent generators across every tracked HTML output, all 25 counterparts, sitemap and discovery (`batch-audits.json`). Routing has zero hard errors and 76 advisory warnings; SEO has zero hard errors and six inherited warnings. Language classification has 101 included, 11 excluded and zero unclassified pages.
- Actual Chrome checks pass all five French pages at 320, 390, 600 and 1440 pixels, substantial no-JavaScript content, static links/assets/fragments, illustrations, arithmetic and overflow boundaries (`final-page-layout-checks.json`). Intentional horizontal review rails/table scroll regions remain local.
- All 200 directed counterpart switches pass at 390 and 1440 pixels, including calculator examples and Arabic-to-LTR direction resets (`local-batch-checks.json`). Separate language review verifies 80 French-to/from-counterpart paths with the 180 USD calculator example; separate technical review independently passes 200 directed paths, 74 focused tests and 13 audits.
- The production-verifier implementation received independent offline adversarial tests for exact-SHA deployment receipts, robot restrictions, reciprocal alternates, safe request/redirect policy, dependency coverage and private headers. No offline receipt is presented as a live deployment.

## Publication and live evidence

Both [final language](verification/french-localization-2026-10-20/batch-language-review.md) and [final technical](verification/french-localization-2026-10-20/batch-technical-review.md) reviews accepted. Final reviewed hashes and live preflight confirm unchanged private resources and policy. Pending the accepted batch commit, coherent public/private deployment and ordinary live verification. This section is completed with actual deployment receipts before final handoff.

## Practical limits

Chrome responsive emulation and synthetic native handoff do not establish physical iPhone/App Clip installation, a completed App Store purchase/download, actual camera QR behavior or Safari rendering. French model review does not replace a human native-speaker review. English app screenshots/video remain explicitly labeled, while French examples are illustrations. No conversions, new app capability, pricing promise, ranking or customer-impact claim is introduced.

The legacy `assets/css/noscript.css` import of missing `font-awesome.min.css` is unchanged and explicitly recorded by the verifier; pages load the existing working `fontawesome-all` dependency. Other missing or changed dependencies fail verification.
