# Spanish publication record — 20 October 2026

Scope: five static Spanish publications, international Spanish, one public batch after individual page reviews and commits. Base: `3f78611`. Existing untracked `audits/`, `tmp/`, and `docs/verification/loan-plan-record-once-2026-10-19/` are preserved and excluded. Implementation branch: `codex/spanish-localization`. Model configuration: GPT-6.1 Sol, high; independent reviews use the same model/effort, not human-native certification.

## Routes and terminology

| English | Spanish |
| --- | --- |
| `/` | `/es/` |
| `/solutions/app-to-track-money-owed/` | `/es/soluciones/app-para-registrar-dinero-adeudado/` |
| `/blog/how-to-keep-track-of-who-owes-you-money/` | `/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/` |
| `/solutions/personal-loan-repayment-tracker/` | `/es/soluciones/seguimiento-de-prestamos-personales/` |
| `/tools/split-expense-calculator/` | `/es/herramientas/calculadora-de-gastos-compartidos/` |

Use `saldo pendiente` for remaining balance, `pagos`/`devoluciones` for repayments (context decides), `pago parcial` for partial repayment, `plan de pagos` for repayment plan, `registro de préstamo` for Loan Record, `recordatorio` for reminder, `gastos compartidos` for shared expenses. Retain You Owe Me, Live Link and Balance Sync as product names with Spanish explanations. Avoid region-specific legal/financial guarantees. Language selection never changes currency: dollar examples are explicitly USD where ambiguous. Published examples are illustrative, not fabricated native app captures.

## Foundation

`content/site-locales.mjs` is the route/discovery source. `complete` admits reviewed pages only; `scripts/sync-site-locales.mjs` writes normal HTML alternates, explicit switches, Spanish section links and completed counterpart links. Each page has its own canonical. No browser-language redirect or client translation dependency. Locale registry entries retain source clusters but use the general Store destination; no new analytics keys/events. English source content and assets stay intact.

English text-bearing app captures are replaced by labeled Spanish HTML/SVG examples. Existing secondary English resources, video, and loan-import intake are explicitly labeled `en inglés`; no inline untranslated importer is mounted on Spanish pages. Primary app-download/QR journey is Spanish and uses the storefront-neutral app-ID destination, preserving existing campaign parameters and omitting unverified English custom-product pages. Private continuation remains noindex.

## Page acceptance record

| Page | Language review | Technical/product review | Checks | Commit |
| --- | --- | --- | --- | --- |
| Homepage | Independent model review passed; clarified title and separate-loan wording. Shared dictionaries independently reviewed by page translator. | Independent review passed after fixing text download CTA cascade and stacking mobile text examples. | Design/registry/SEO: zero hard errors; 47 foundation/runtime tests; no-JS HTML 20,020 characters; Chrome 320/390/600/1440 px, images, CTA heights, mobile menu. Seven English image modules replaced with labeled Spanish examples; preserved translated review attribution. | `dae9d2a` (foundation `5510956`) |
| Money owed solution | Independent review passed; fixed spacing and card heading capitalization. | Independent review passed after aligning visible/structured English-hub breadcrumb. Preserved write-off, per-entry interest, actual-payment plans and Live Link/Sync distinctions. | Design/registry/SEO zero hard errors; reciprocal locale checks; Chrome 320/390/600/1440 px, zero element/page overflow, menu and assets; no-JS main text 23,834 characters; two text-bearing visuals replaced with labeled USD examples. | `08e929b` |
| Recordkeeping guide | Independent review passed; polished intro/confirmation wording and tool labels. | Independent review approved ledger math, template direction/newlines, copy fallback and analytics privacy; common shell generation Spanish-only. | Design/registry/SEO zero hard errors; locale checks; Chrome 320/390/600/1440 px and no-JS 13,132 characters; fixed clipped closing buttons. All 3 copy controls passed Clipboard API, legacy fallback, failure, reset and success-only event checks. Labeled scrollable tables intentionally retain horizontal scrolling. | `ee9c6e1` |
| Personal loan solution | Independent review approved all copy, diagram/table labels, monetary snapshots, reminder conditions and product boundaries; wording polish applied. | Independent review approved initial/later snapshot distinction, installment allocation, no double subtraction, currency separation and free-plan scope. | Design/registry/SEO zero hard errors; locale/English preservation checks; Chrome 320/390/600/1440 px, no page overflow and no-JS 16,579 characters. Focused rendered example assertions passed all amounts/due dates, two-loan totals, QR eligibility, download controls and zero module overflow. Three English captures replaced with labeled examples; visually hidden accessible table captions are intentional. | Page commit following `ee9c6e1` |
| Split calculator | Pending | Pending | Pending | Pending |

## Crawl/retrieval audit

Official references checked 20 October 2026: [Google multilingual URLs](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers), [OpenAI crawler roles](https://developers.openai.com/api/docs/bots), [Anthropic crawler roles](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).

Google recommends separate URLs, readable translated content, explicit language choice and reciprocal alternates. Google Search AI features use ordinary search eligibility; Google-Extended separately governs specified training/grounding uses. OAI-SearchBot, Claude-SearchBot and PerplexityBot concern search; user-requested fetchers and training bots have distinct roles. Existing explicit search/fetch/training allowances and wildcard allowance are preserved. The wildcard permits PerplexityBot; no blanket permission changes are needed. Public HTML, normal links, successful responses and existing discovery files establish technical eligibility, not actual indexing, ranking or citations. Live responses and bot/noindex checks will be recorded after release.

## Final review and publication

Pending the complete reviewed batch. GitHub Pages is the existing public-site workflow; private continuation uses the existing Firebase Hosting target if that dependency changes. A commit alone is not a deployment or evidence of indexing.

Final owner instruction: after the reviewed batch is publicly deployed and verified, inspect these five exact Spanish URLs in the existing Search Console property and request indexing where eligible/needed. Check the existing sitemap submission and submit only if necessary. Record requests separately from actual indexing; use no Indexing API for these ordinary pages. An access, quota, CAPTCHA or tool restriction must be reported concretely after unaffected work finishes.
