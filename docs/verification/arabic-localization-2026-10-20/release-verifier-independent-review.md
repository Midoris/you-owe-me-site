# Independent release-verifier review

Decision: accepted for this five-page Arabic release. Review performed by the independent technical/RTL model reviewer on 2026-10-20 against the current `verify-public.py`, with application HEAD `1ff71dd`. This reviews the verifier and exercises its actual parser/graph/request-policy code offline; successful live deployment is established separately by the production receipts. No network requests, private financial references, or uploads were made by this review.

## Reproduced checks

`python3 docs/verification/arabic-localization-2026-10-20/release-verifier-independent-offline.py` passes. The runner extracts the production parser and request handlers through Python AST and executes the production dependency traversal directly. The durable receipt is `release-verifier-independent-offline.json`.

- Parsed all 20 actual raw English, Spanish, German, and Arabic counterpart documents and traversed 106 same-origin resources. Nested module imports, literal dynamic imports, runtime loan-import stylesheet, CSS imports, and webfonts are included. No unexpected missing nested local assets remain.
- Relative HTML resources, both `img` and `source` srcset variants, root paths, and protocol-relative same-origin paths resolve correctly against the document route. The main-text fixture retains content after self-closing image/break tags and excludes surrounding non-main content.
- Actual request-policy fixtures reject HTTP, other origins, `?ref`, `?ref=`, populated financial references, and additional financial query keys before opening a connection. Allowed requests use GET and no request body. The sole permitted query key is `v`; blank query values are included in validation.
- Exact byte fetches refuse redirects. The separate trailing-slash handler refuses HTTP, other origins, and every query-bearing redirect before following it.
- All five tracked non-split private resources independently match `f3aee78`. The configured split CSP is exact and has no `connect-src` permission.

## Source review

The live verifier requires exact reviewed-local bytes for all 20 HTML documents, every collected same-origin resource, robots/sitemap/llms discovery files, private split HTML, locale script, and Arabic CSS. Every public document must retain its own canonical, the exact complete language alternate set, expected language/direction, substantial raw main text, and no public noindex directive. Sitemap checks cover all 20 counterpart routes.

Private checks compare exact response CSP values with the relevant Firebase configuration rule, together with noindex, no-store, and no-referrer. Every non-split tracked private dependency must match both current local bytes and its pre-release `f3aee78` bytes. The existing loan-specific connection allowance remains confined to its existing policy. Release byte checks send no private reference and perform no financial endpoint operation.

Issues found during this independent review were corrected before acceptance: literal dynamic imports and nested CSS/runtime asset traversal; a silent missing-asset skip; the self-closing void-element main-depth bug; blank query-key bypass; and redirect-following before destination validation. The current offline run exercises those fixes.

## Explicit boundaries

One narrowly identified legacy missing import remains: unchanged `assets/css/noscript.css` imports the absent `font-awesome.min.css`. The verifier permits only this exact source/target pair, proves the importing CSS unchanged since `f3aee78`, and records it in the live receipt. Every current document already loads the supported Font Awesome stylesheet. Other missing local graph targets fail.

Asset byte coverage is for same-origin resources used by these reviewed documents. External destinations and computed runtime URLs are outside the static graph; the separate real-browser journey receipts cover interactive runtime behavior. The static parser is not a general browser implementation for arbitrary malformed HTML or data-URL srcset syntax; the actual 20 documents and their resource graph were exercised. The offline receipt is not itself a production availability result. Search Console, indexing requests, bot probing, ranking, and AI-citation checks are outside this release verification.
