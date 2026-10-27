# Groups website release — October 27, 2026

Based on current production `30e9b02`, branch `codex/groups-website`. Preserve unrelated untracked `audits/`, `tmp/`, and `docs/verification/loan-plan-record-once-2026-10-19/`.

## Placement

The canonical explanation is `/features/#groups`, next to the existing Spaces documentation. It uses a small static HTML hierarchy example, names/colors, focused balance/history/loan/reminder views, safe deletion, independent filter selection, and a disclosure for management details. Groups organize people within local records or a single Space; Spaces keep separate record contexts and totals. Group Paybacks remains a distinct shared-cost feature.

Home retains device sync and Balance Sync coverage and adds Groups beside Spaces in its existing feature bullet. All four existing homepage locales receive the same bounded change and keep explicit English destination labels. Features and the four contextual routes have no reviewed localized counterparts. Quick Start adds one paragraph beside Spaces. Client Payment Records and the family-money guide explain which organization model fits; the Splitwise comparison and Group Payback Tracker clarify feature boundaries. No new page, generated bitmap, repeated feature blocks, new sharing rules, or export/Loan Outlook filtering claims.

The comparison hub's ambiguous “Groups” label pointing to Splitwise becomes “Shared expenses” through its existing registry/generator. An outdated English-only website sentence on Features now reflects selected ES/DE/AR/FR pages. Rendered QA also repaired two adjacent Arabic feature-list wrappers so English bidi labels stay readable, preserving existing words.

## Sources and discovery

Groups facts came from the verified iOS implementation brief. Current app Spaces localization says that each Space has its own people, entries, balances and groups, with cloud backup and device sync, unlimited Spaces and a one-time purchase. Apple's public lookup returned version 7.2.4, released `2026-10-26T23:05:10Z` (October 27 Bangkok), resolving an older cached 7.2.3 web listing. Public fields are retained in `verification/groups-2026-10-27/app-store.json`.

Groups is static crawlable HTML, including disclosure text and the diagram. Feature metadata, CollectionPage WebPageElement, `llms.txt`, registry modification dates and generated sitemap agree with visible scope. Canonicals and existing reciprocal locale clusters remain intact. A per-page locale modification-date override updates only the four edited homepages, preserving the prior default for every other locale page. Existing robot policies are unchanged. No indexing submission or discovery/ranking promise.

## Verification and deployment

Independent GPT-6.1 Sol/high reviewer accepted the final inputs; see `verification/groups-2026-10-27/independent-review.md`. Full suite: 262/262 passing. Design, registry, routing, language and SEO audits have zero hard errors; existing advisory warnings remain.

Local in-app browser checks cover all 12 edited routes at 390/1440 px, Groups at 320/600 px, functioning disclosure, all five homepage bullet layouts, and Arabic bidi correction. No overflow within the Groups section at tested widths. Screenshots and JSON checks are in the verification folder. Browser checks use the available in-app browser, not physical iPhone/Safari acceptance.

Production uses the established master → GitHub Pages workflow. Firebase continuation assets/configuration are untouched. `verify-release.py --live` requires a successful deployment for exact HEAD SHA and byte equality for 12 public HTML routes, Groups stylesheet, llms.txt, sitemap.xml and robots.txt before accepting production. It also parses static content, anchors, canonicals and JSON-LD. Release receipt and production screenshots are recorded after deployment.
