# Arabic release record — 20 October 2026

Owner-authorized Arabic implementation and coherent public release. Base `f3aee78` was confirmed identical to production master. Branch `codex/arabic-localization`. Unrelated untracked `audits/`, `tmp/`, and `docs/verification/loan-plan-record-once-2026-10-19/` remain untouched.

No Google Search Console access, indexing requests, sitemap submission/resubmission, indexing API or indexing follow-up is authorized. The owner handles indexing personally. Crawlable HTML and normal public discovery are required but do not establish actual indexing, rankings or AI citations.

## Route mapping

| English | Spanish | German | Arabic |
| --- | --- | --- | --- |
| `/` | `/es/` | `/de/` | `/ar/` |
| `/solutions/app-to-track-money-owed/` | `/es/soluciones/app-para-registrar-dinero-adeudado/` | `/de/loesungen/app-fuer-geldforderungen/` | `/ar/solutions/app-to-track-money-owed/` |
| `/blog/how-to-keep-track-of-who-owes-you-money/` | `/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/` | `/de/blog/wer-schuldet-mir-geld/` | `/ar/blog/how-to-keep-track-of-who-owes-you-money/` |
| `/solutions/personal-loan-repayment-tracker/` | `/es/soluciones/seguimiento-de-prestamos-personales/` | `/de/loesungen/private-darlehen-verwalten/` | `/ar/solutions/personal-loan-repayment-tracker/` |
| `/tools/split-expense-calculator/` | `/es/herramientas/calculadora-de-gastos-compartidos/` | `/de/tools/ausgaben-aufteilen/` | `/ar/tools/split-expense-calculator/` |

ASCII source slugs under the stable `/ar/` prefix deliberately avoid Unicode/percent-encoding duplicate variants. Visible titles, navigation and content are Arabic. Full Spanish/German equivalents remain in `content/site-locales.mjs` and are included in each generated reciprocal cluster.

## Foundation

Shared locale configuration gates Arabic discovery on reviewed completion flags. The common generator retains existing compatibility exports and preserves English/Spanish/German authored bodies. Cache overrides pin changed shared resources and analytics' nested locale import to `ar20261020`. Arabic switches declare direction and isolate names without altering LTR authored content. Semantic `dir=rtl` belongs in HTML; scoped CSS adapts alignment/typography without reversing DOM order, data strings or imagery. Arabic examples/calculator use Western digits and retain source currencies; language does not select country or calendar.

Independent GPT-6.1 Sol/high language and technical review records are in `docs/verification/arabic-localization-2026-10-20/`; these are model reviews, not human native-speaker certification. Forty-two focused tests pass. Actual typography, page geometry and journeys require per-page rendered acceptance. An audit fix explicitly identifies homepage landing CSS rather than accidentally substring-matching short locale roots to auxiliary stylesheet names.

Implementation follows [W3C structural direction guidance](https://www.w3.org/International/questions/qa-html-dir), [W3C inline bidirectional markup](https://www.w3.org/International/articles/inline-bidi-markup/) and [MDN logical CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values). Terminology, product boundaries and numeral conventions are in `docs/arabic-terminology-2026-10-20.md`.

## Per-page and release acceptance

Foundation commit `6fe7611`.

| Page | Independent reviews | Verification | Commit |
| --- | --- | --- | --- |
| Homepage `/ar/` | Arabic language and technical/product/RTL accepted; repaired wording, inherited fonts/alignment, mixed CTA wrapping and keyboard focus. | 42 focused tests; design/routing/SEO zero hard errors (six legacy SEO warnings); 81 static links with no missing fragments/assets; no-JS main 16,072 characters; Chrome 320/390/600/1440, QR failure recovery and neutral Store/campaign; reciprocal en/es/de/ar/default; generation idempotent. | `292f0c6` |
| Money owed `/ar/solutions/app-to-track-money-owed/` | Independent Arabic language and technical/product/RTL accepted, spacing/benefit wording polished. | 31 focused tests; design zero hard errors; 105 static links; Chrome all four widths zero overflow; 24 language-switch paths; QR failure, keyboard/menu/FAQ; generation idempotent. | `85081ee` |
| Recordkeeping guide `/ar/blog/how-to-keep-track-of-who-owes-you-money/` | Independent language and technical/product/RTL accepted; clarified neutral wording and kept amount/code together. | 27 focused tests; design zero hard errors; 61 static links; 3 copy controls in success/fallback/failure across all four languages; 24 switch paths; four-width responsive and keyboard table-scroll checks; idempotent generation. | `e9064c8` |
| Personal-loan solution `/ar/solutions/personal-loan-repayment-tracker/` | Independent language and technical/product/RTL accepted; repaired mobile pseudo-labels, logical callout border, known-value wrapping, desktop CTA and anchor offset. | 15 focused tests; design/routing/SEO zero hard errors (six legacy warnings); 56 static links; exact staged USD math and separate 1,450 total; four-width real rendering; 24 switch paths; idempotent generation. | `e0cae7c` |

| Split-expense calculator `/ar/tools/split-expense-calculator/` | Independent language and technical/product/RTL accepted; actual copied/shared RTL/LTR text, Arabic numeral boundary, consent/retry/Back and four-language private direction reviewed. | 56 focused tests; design zero hard errors; 96 static links; no-JS main 12,027 characters; 320/390/600/1440 render; exact native fixtures, rejected ambiguous separators, 98/8 rounding, two-person 90.50 retry; private exact-CSP simulation; no production uploads. | `29a4f0a` |

### Calculator boundaries and reviewed shared changes

Arabic number parsing accepts Western, Arabic-Indic and Persian digits with one valid separator system and rejects ambiguous/mixed punctuation. Canonical numeric strings enter a cloned native-transfer state; raw names/descriptions/inputs remain unchanged. DOM `bdi` isolates names and amounts. Copied/shared summaries use presentation-only isolates, including per-line RTL isolation required by actual pasted LTR rendering; these controls do not enter native payloads or analytics.

Testing found a pre-existing native eligibility mismatch: 90.50 split three ways would import 30.17 + 30.17 although browser settlements are 30.17 + 30.16. A narrow shared guard now withholds native continuation when native debts exceed the displayed organizer credit. The browser calculation and native allocation algorithms remain unchanged; supported 10/3 residual behavior and existing fixtures pass. This deliberate eligibility repair is independently reviewed and tested in English and Arabic.

The private split page adds an Arabic section and stylesheet. Existing English/Spanish/German section bytes, sole-reference/native schema, hash-only locale selection, explicit consent and noindex/no-store/no-referrer/CSP remain intact. Private loan resources and Firebase policies are unchanged. Actual Chrome tests cover all direction transitions and no-JS content; mocked transfers send zero production uploads.

Declared changed shared assets receive fresh cache URLs on all 20 counterpart pages, preserving authored relative/absolute paths. A narrow shared rule keeps the Arabic language-link font and connected-script typography correct on LTR pages. Authored English/Spanish/German content preservation tests allow only generated language blocks and declared cache queries.

No incomplete Arabic batch is deployed.


## Coherent batch acceptance

Independent final language and technical/product/RTL reviews accepted all five Arabic pages and all 20 counterpart pages. Root Chrome verifies 120 directed language-switch paths at 390/1440 px; independent technical review verifies 60 paths at 390 px and language review verifies 60 Arabic↔LTR paths at 390/1440 px. All 235 repository tests pass. Five actual Arabic page-design audits, raw static link/asset/fragment checks, registry/routing audit, SEO audit and app-language-support audit report zero hard errors. Routing has 62 advisory warnings and SEO retains six existing warnings; these are recorded rather than presented as zero warnings.

Generation of language clusters, discovery, sitemap and the 80 English next-step modules is byte-idempotent across all 20 counterparts and discovery files. There are 97 sitemap URLs, 102 registry entries and 107 route files. All five reviewed Arabic URLs are discoverable and have own canonicals and reciprocal en/es/de/ar/x-default alternates. Private preflight confirms five unchanged non-split resources and privacy headers match their deployed bytes.

Release evidence: `batch-audits.json`, `full-suite.tap`, `local-batch-checks.json`, `batch-language-review.md`, `batch-technical-review.md`, `batch-independent-cache-checks.json` and individual page reviews in the Arabic verification directory. Application publication and live byte/CSP verification follow this accepted batch; their receipts are appended below after success.

Residual limits: model language review is not human native-speaker certification. Chrome mobile viewports/iPhone user-agent and mocked transfers do not establish physical iPhone, Safari, App Clip/native save, real QR scanning or an actual Store journey. Zero real financial uploads/customer records are used. Successful release does not establish indexing, ranking, AI citation or customer impact.
