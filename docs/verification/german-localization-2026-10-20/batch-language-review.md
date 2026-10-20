# Final German batch: independent language acceptance

20 October 2026. Independent GPT-6.1 Sol/high model review; no human native-speaker certification. Reviewed the final five German public HTML files after all five completion flags were enabled, plus common navigation/discovery and required shared/private German copy. This is a new final-source review, including the generator's completed-counterpart rewrites and differences since each accepted page commit, not reliance on prior acceptance reports alone.

**Accepted for publication from the language/product-meaning perspective. No open material findings.** Root corrected the final small du/dein inconsistency (`Legt fest` → `Lege fest`) and removed the eight inert empty fallback spans; both corrections were rechecked in actual saved HTML. No visible or accessible empty language labels remain.

## Final-source findings

- All five German section navigations now contain all five accepted pages. All localized counterpart links point to the intended German content and drop `auf Englisch`; every remaining internal English resource outside the explicit language switch keeps its language notice. No empty anchors, German destinations falsely labeled English, unlabeled English internal destinations, stale Spanish UI strings or untranslated English instructions were found. The explicit English/Español/Deutsch switch and intentional product names remain correct.
- Terminology is coherent across the release: offener Betrag, laufender Saldo, Rückzahlung/Teilrückzahlung, Rückzahlungsplan, Darlehensübersicht, Erinnerung, gemeinsame Ausgaben and Ausgleich. Informal singular instructions are consistent; contextual descriptions of a couple/group correctly use ihr/euch. German route/discovery labels accurately distinguish app solutions, the recordkeeping guide and the browser calculator.
- Titles, descriptions, social metadata, structured language, breadcrumbs, FAQ answers, copy-template attributes and accessible labels remain German and agree with the final visible content. The loan page remains an app solution rather than an interactive browser tracker. The guide's seven, money solution's eighteen and calculator's thirteen FAQ pairs preserve the accepted meaning. JSON-LD parses across the batch.
- Rechecked key money directions and examples: homepage 340−180=160 USD; money solution 120−30=90 USD; guide Alex 80−30=50, Maya 18−18=0, Chris 42−0=42 and group 120−75=45 USD; calculator 180 USD yields Sam→Alex 25 and Sam→Mia 10, and 98÷8=12,25 USD. Dollar/default labels are not converted by language.
- Loan initial snapshot remains 1 November 2026, USD, no interest: 1,200−150=1,050 whole-loan balance and 200−150=50 installment due 1 November. Later 300 is allocated 50+200+50, leaving 750; additional borrowing 100 gives 850. The two-loan diagram is explicitly the first-payment snapshot, 1,050+400=1,450. Starting-balance instructions forbid double subtraction. Reminders are conditional on activation and follow the next unpaid installment and original date.
- Core boundaries remain intact: write-offs are distinct from actual payments and may reopen; interest is per entry; named loans contribute to the person's full balance; plans follow actual payments; Live Link reports require owner review; supported Balance Sync editing is exactly two app users. Free scope, offline/account qualifiers, one active free plan, browser/app/import distinctions and PDF/non-bank/non-payment-service limitations are unchanged in meaning.
- All meaningful visual text is German HTML or labeled English video. There are twelve explicitly illustrative/no-screenshot example cards across home/solution/guide/loan plus the German video poster; the only body images are the neutral German App Store QR graphics. Review identities and translation attribution remain intact. The homepage's 21 review cards retain their original authors, unnamed review, country/version and excerpt qualifications.
- Re-read shared German sales/anniversary, app-language support, mobile-menu/video labels, recordkeeping copy states, calculator fields/validation/results/copy/share/fallback/failure/limits/continuation and private continuation. No English or Spanish runtime fallback is required for a supported German state. The private German block preserves no-account/device qualifications, 24-hour link expiry, retained accepted record and bearer-link warning. Explicit transfer remains distinct from ordinary Store/QR navigation.

## Verification and review limits

Final parser inventory: guide 62 links; homepage 84; money solution 107; loan solution 56; calculator 95. Each has five section links, no empty fallback spans, and no flagged link-language inconsistency. The locale test file was independently rerun during this final review: **9/9 passed**, including English preservation against the accepted base and Spanish preservation against `bfd69d7` with only owned locale blocks and approved shared-cache query updates excluded. Final cleanup changes only German copy/empty wrappers; English/Spanish source content was not modified by this reviewer.

Final reviewed HTML SHA-256 values:

| Route | SHA-256 |
| --- | --- |
| `/de/` | `5cceb53e1d38e4757d96decc629ed899b4b50773a6ec08c8a696796906527177` |
| `/de/loesungen/app-fuer-geldforderungen/` | `85c5a4c0fbc3c774ba5d365d1456746a084b85a28dbbb570b1906fb3a1a72452` |
| `/de/blog/wer-schuldet-mir-geld/` | `4d55a1a2d57ef70c649345127f518044a0c6fd3599ae4a2acd7a332c5739c6b3` |
| `/de/loesungen/private-darlehen-verwalten/` | `6bcc27d3ea27af745e4841f0ee2849da22da5155f5bb8d5f1a0856c2c85956da` |
| `/de/tools/ausgaben-aufteilen/` | `b10dccfdcbc76adc4fae86383eedb17beb88984264c55b42461582c07f89fb8e` |

This acceptance covers final language, static and reviewed generated text, cross-page consistency and product meaning. Root's broader tests, responsive browser matrix, mocked transfer/privacy checks and release verification are separate technical evidence. No claim of human native review, physical iPhone/native save, live private transfer, indexing or AI inclusion is made. No Search Console/indexing action, deployment or page/runtime edit was performed by this reviewer; only this review report was written.
