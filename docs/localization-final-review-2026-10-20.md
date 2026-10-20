# Independent localization review — 20 October 2026

Owner asked for a fresh independent review of all five pages in Spanish, German, Arabic and French, correction of confirmed issues, commits and deployment, then raw public URLs for manual indexing. Base: `8ae8c71`; branch: `codex/localization-final-review`.

Three fresh GPT-6.1 Sol/high reviewers inspected Romance copy (ES/FR), German/Arabic language and rendering, and shared technical behavior. Actual source, metadata, runtime, private presentation and rendered pages were reviewed rather than treating prior acceptance reports as proof. No substantive mistranslation, incorrect product boundary or debt-direction error was found. Model language review is not human native-speaker certification.

## Confirmed findings and repairs

1. **Cross-language return-state corruption:** a French calculator amount `90,50` was stored as raw input after explicit App Clip continuation. Switching language on the continuation and returning to EN/ES/DE could reinterpret it as `9050`; Arabic could discard the state. Return restoration now requires equality with the accepted native draft fingerprint. Same-language raw input stays intact; cross-language or legacy snapshots derive canonical decimal amounts from the already accepted integer cents and preserve accepted blank-name/description fallbacks. Malformed/null fingerprints fail safely, only valid references are retained, restoration never uploads, and retry remains explicitly consented. Missing document language defaults to English. No backend/native payload algorithm change.
2. **German mobile compact loan tables:** desktop header widths persisted after cells stacked, splitting words over unnecessary lines. German now receives the same scoped full-width mobile header treatment already used for French. Independently compared 15 locale/width cases: only intended German mobile geometry changes; no new overflow or Arabic/LTR/desktop regression.
3. **Stale homepage language descriptions:** EN/ES/DE/AR still described older language coverage. Each now accurately distinguishes the full English website from selected Spanish/German/Arabic/French pages; French was already correct. Full-body preservation tests allow only these exact dated sentence corrections, generated language blocks and declared cache versions.

Changed calculator/CSS dependencies receive new cache URLs through the existing common locale generator. All other existing authored content, URLs, financial algorithms, private continuation files, Firebase configuration, data contracts, analytics keys and crawler policies are preserved. No Firebase deployment is required for these corrections.

## Verification and release

All **262 repository tests pass**. Four added regression cases exercise actual consent/storage across all 25 source/target language combinations, legacy snapshots, localized digits/grouping, exponent input, empty-name/description fallbacks, retry-reference identity and malformed saved data. Independent technical review additionally passed 200 composed return cases and malformed-state challenges. Actual Chrome verifies 15 cross-language return cases including French and Arabic decimals and English exponent input without uploads.

All **20 localized page-design audits** plus routing, SEO and language classification have zero hard errors. Locale, sitemap and English next-step generators are byte-idempotent across all tracked HTML/discovery outputs. Existing advisory warnings and the unchanged legacy noscript font import are recorded, not presented as newly fixed defects.

Fresh baseline live checks covered all 25 counterpart pages, 111 asset URLs, three discovery files, private privacy/CSP resources and 200 directed public language-switch/calculator paths. Post-release receipts are retained with the final review in the Business workspace at `research/2026-10-20-localization-final-review/`, separately from the earlier Spanish/German/Arabic/French evidence. That review records the exact released SHA, successful deployment and current live checks.

No Search Console, indexing request/submission/follow-up, production financial upload, real customer data or Store action is part of this work. Physical iPhone/Safari/App Clip acceptance and actual indexing/ranking/AI citations remain unverified. The owner handles manual indexing of the 20 public localized URLs; private continuation URLs are excluded.
