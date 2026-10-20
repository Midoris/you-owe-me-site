# Arabic release record — 20 October 2026

Owner-authorized Arabic implementation and coherent public release. Base `f3aee78` was confirmed identical to production master. Branch `codex/arabic-localization`. Unrelated untracked `audits/`, `tmp/`, and `docs/verification/loan-plan-record-once-2026-10-19/` remain untouched.

No Google Search Console access, indexing requests, sitemap submission/resubmission, indexing API or indexing follow-up is authorized. The owner handles indexing personally. Crawlable HTML and normal public discovery are required but do not establish actual indexing, rankings or AI citations.

## Route mapping

| English | Arabic |
| --- | --- |
| `/` | `/ar/` |
| `/solutions/app-to-track-money-owed/` | `/ar/solutions/app-to-track-money-owed/` |
| `/blog/how-to-keep-track-of-who-owes-you-money/` | `/ar/blog/how-to-keep-track-of-who-owes-you-money/` |
| `/solutions/personal-loan-repayment-tracker/` | `/ar/solutions/personal-loan-repayment-tracker/` |
| `/tools/split-expense-calculator/` | `/ar/tools/split-expense-calculator/` |

ASCII source slugs under the stable `/ar/` prefix deliberately avoid Unicode/percent-encoding duplicate variants. Visible titles, navigation and content are Arabic. Full Spanish/German equivalents remain in `content/site-locales.mjs` and are included in each generated reciprocal cluster.

## Foundation

Shared locale configuration gates Arabic discovery on reviewed completion flags. The common generator retains existing compatibility exports and preserves English/Spanish/German authored bodies. Cache overrides pin changed shared resources and analytics' nested locale import to `ar20261020`. Arabic switches declare direction and isolate names without altering LTR authored content. Semantic `dir=rtl` belongs in HTML; scoped CSS adapts alignment/typography without reversing DOM order, data strings or imagery. Arabic examples/calculator use Western digits and retain source currencies; language does not select country or calendar.

Independent GPT-6.1 Sol/high language and technical review records are in `docs/verification/arabic-localization-2026-10-20/`; these are model reviews, not human native-speaker certification. Forty-two focused tests pass. Actual typography, page geometry and journeys require per-page rendered acceptance. An audit fix explicitly identifies homepage landing CSS rather than accidentally substring-matching short locale roots to auxiliary stylesheet names.

Implementation follows [W3C structural direction guidance](https://www.w3.org/International/questions/qa-html-dir), [W3C inline bidirectional markup](https://www.w3.org/International/articles/inline-bidi-markup/) and [MDN logical CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values). Terminology, product boundaries and numeral conventions are in `docs/arabic-terminology-2026-10-20.md`.

## Per-page and release acceptance

Foundation commit `6fe7611`.

| Page | Independent reviews | Verification | Commit |
| --- | --- | --- | --- |
| Homepage `/ar/` | Arabic language and technical/product/RTL accepted; repaired wording, inherited fonts/alignment, mixed CTA wrapping and keyboard focus. | 42 focused tests; design/routing/SEO zero hard errors (six legacy SEO warnings); 81 static links with no missing fragments/assets; no-JS main 16,072 characters; Chrome 320/390/600/1440, QR failure recovery and neutral Store/campaign; reciprocal en/es/de/ar/default; generation idempotent. | recorded in next page commit |

No incomplete Arabic batch is deployed.
