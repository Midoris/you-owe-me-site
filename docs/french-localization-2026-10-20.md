# French release record — 20 October 2026

Owner-authorized five-page French implementation and coherent public release. Base `a2eb93d` on `codex/french-localization`; protected unrelated untracked `audits/`, `tmp/`, and `docs/verification/loan-plan-record-once-2026-10-19/` remain untouched. All translation meaning comes directly from the current English pages. Work proceeds in route order with separate model language and technical/product reviews before each scoped page commit. Publication waits for the complete accepted batch.

No Google Search Console access, indexing requests, sitemap submission/resubmission, indexing API or indexing follow-up. Indexing remains with the owner. Normal public discovery is maintained; crawl eligibility does not establish indexing, ranking, AI citation or customer impact.

## Counterpart map recorded before implementation

| English | Spanish | German | Arabic | French |
| --- | --- | --- | --- | --- |
| `/` | `/es/` | `/de/` | `/ar/` | `/fr/` |
| `/solutions/app-to-track-money-owed/` | `/es/soluciones/app-para-registrar-dinero-adeudado/` | `/de/loesungen/app-fuer-geldforderungen/` | `/ar/solutions/app-to-track-money-owed/` | `/fr/solutions/application-suivi-argent-du/` |
| `/blog/how-to-keep-track-of-who-owes-you-money/` | `/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/` | `/de/blog/wer-schuldet-mir-geld/` | `/ar/blog/how-to-keep-track-of-who-owes-you-money/` | `/fr/blog/suivre-qui-vous-doit-de-l-argent/` |
| `/solutions/personal-loan-repayment-tracker/` | `/es/soluciones/seguimiento-de-prestamos-personales/` | `/de/loesungen/private-darlehen-verwalten/` | `/ar/solutions/personal-loan-repayment-tracker/` | `/fr/solutions/suivi-remboursement-pret-personnel/` |
| `/tools/split-expense-calculator/` | `/es/herramientas/calculadora-de-gastos-compartidos/` | `/de/tools/ausgaben-aufteilen/` | `/ar/tools/split-expense-calculator/` | `/fr/outils/calculateur-partage-depenses/` |

French uses stable ASCII slugs under `/fr/`, static `lang="fr"` LTR HTML, self-canonicals and common completed-only generation. Authored localized next-step modules retain ownership; equivalent-language navigation is explicit. No automatic locale redirects. USD examples stay USD; language never selects a country, storefront, converted currency or calendar.

## Foundation

Common configuration adds five planned French routes with completion flags initially false. Shared labels, campaign display, anniversary states, video fallback, mobile menu accessibility and localized styles support French. Campaign identity/timing and analytics payloads are unchanged. French page-language priority repairs a shared availability-message gap; French pages use French regardless of browser language. Changed dependencies and analytics’ nested locale import receive `fr20261020` cache URLs across all existing counterparts. Arabic shaping/isolation remains scoped and intact on LTR pages.

Independent GPT-6.1 Sol/high reviews and evidence live in `docs/verification/french-localization-2026-10-20/`. These are model reviews, not human native-speaker certification. Tests verify gated five-language clusters, idempotence, all 20 existing authored page bodies against `a2eb93d`, campaign privacy/identity, and French availability-message direction/linking across browser languages. Browser and page-specific acceptance follows separately.

Foundation commit: `fc104ff`. Both independent reviews accepted after the French availability-message priority repair; 55 focused tests and 27 independent Chrome fixture/old-language transition checks pass.

## Page acceptance

| Page | Independent reviews and repairs | Verification | Commit |
| --- | --- | --- | --- |
| Homepage `/fr/` | Separate language and technical/product reviews; lender-perspective testimonial, neutral campaign QR, App Store nonbreaking typography and text-link fallback flow repaired. | 32 focused tests; design audit zero hard errors; 82 static links/assets/fragments; substantial no-JS main; Chrome 320/390/600/1440; 40 directed language-switch paths at 390/1440; QR failure recovery and neutral Store/campaign; generated files byte-idempotent. | `e75b66c`. |

Homepage audit integration now classifies French routes and checks their actual language; the SEO auditor uses French example/positioning phrases. Routing has zero hard errors and 62 advisory warnings; SEO has zero hard errors and the same six pre-existing warnings. No incomplete French page is published.

Money-owed solution `/fr/solutions/application-suivi-argent-du/`: static/schema/accessible copy and two labeled HTML illustrations retain the current English source’s product boundaries, eight workflow steps and all 22 related cards. Review repairs cover punctuation/spacing and heading capitalization. Root Chrome verifies 320/390/600/1440, substantial no-JS main (25,340 characters before minor punctuation polish) and all 40 directed counterpart switches. A French-scoped style reset prevents a workflow number-badge rule from styling a nested English fallback as a badge. Separate independent language and technical/product acceptance are recorded in the per-page review files. Scoped commit is recorded in the following page record.

Money-owed scoped accepted commit: `0705085`.

Recordkeeping guide `/fr/blog/suivre-qui-vous-doit-de-l-argent/`: all static/structured/accessible content, two labeled scroll tables and three copy templates localized. USD ledger equations remain 80−30=50, 18−18=0, 42−0=42 and 120−75=45. Root checks pass four widths, substantial no-JS main, all 40 directed language switches and all three copy controls in success/fallback/failure across all five locales. Copied text/line breaks match templates; failure sends no copy event; temporary fields are removed. Separate French language and technical reviews are in the verification directory. Final scoped commit follows independent acceptance.

Recordkeeping guide scoped accepted commit: `9d680b4`.

Personal-loan solution `/fr/solutions/suivi-remboursement-pret-personnel/`: full static/schema/accessible French, three labeled HTML illustrations, relationship map and 20 mobile table labels. Root Chrome verifies exact staged USD arithmetic and separate first-payment two-loan snapshot at all four widths, conditional 50 USD reminder, neutral QR/download and no-JS main over17,000 characters. All40 directed switches pass. Independent rendered review found inherited 50% compact table headers too narrow in stacked mobile rows; a French-only736px rule gives those headers their full card width while desktop and other locales retain their source rules. Final independent acceptance and scoped commit follow the targeted recheck.

Loan rendered acceptance also restores a readable225px desktop download label and normal inline flow for English fallback text in French loan buttons. These narrow CSS repairs retain all other language rules.

Personal-loan solution scoped accepted commit: `2be07e5`.

Calculator `/fr/outils/calculateur-partage-depenses/` and necessary private French continuation: complete static/no-JS content, metadata/schema, all dynamic messages and native blank-field fallbacks. French text inputs accept strict comma/dot decimal forms and ordinary/nonbreaking/narrow-nonbreaking grouping spaces, at most two decimal places; ambiguous3-digit separator and malformed/mixed inputs are rejected with explicit French help. Only cloned native amounts are canonicalized; raw inputs are retained, including on retry/Back. Existing en/es/de parsing and Arabic input/bidi behavior remain protected, and native preparation/rounding/eligibility code after the fallback dictionary is byte-identical to `a2eb93d`.

Independent real paste testing found a mixed-name bidi defect in French copied/shared lines. Presentation-only name/amount/URL token isolates plus per-line LTR isolation now preserve readable debt direction in both LTR and RTL paste contexts. Native payloads/state/event metadata receive no added controls. Root checks pass40 focused tests, four-width calculator rendering with zero overflow, over16,000 no-JS main characters, all40 directed calculator switches/example results and mocked explicit-consent/failure/retry/same-reference/Back with90,50→9050cents. Existing private English/Spanish/German/Arabic sections and Firebase policy bytes remain intact. Final page acceptance and batch/publication are recorded after independent technical sign-off.
