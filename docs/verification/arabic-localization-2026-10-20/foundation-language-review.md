# Independent Arabic shared-language review

Reviewer: arabic_language, GPT-6.1 Sol/high, independent of shared implementation author. Reviewed actual `arabicPages`/`arabicShared` strings in `content/site-locales.mjs`, `scripts/sales.js`, `scripts/anniversary-announcement.js`, `scripts/app-language-support.js`, `scripts/video-embed.js` and `assets/js/main.js` against existing English meanings on 20 October 2026.

Accepted contemporary MSA terminology, singular address, creditor-specific money-owed title, natural menu/open-close names, footer/navigation terms, iframe fallback, app-language-support message, US campaign distinctions, eligibility, original September 4 end date and labels for English story destinations. Existing Arabic-support message retains brand isolation with `bdi`; document-specific link behavior points to `/ar/`.

Three small repairs proposed and confirmed applied by root:

- Discovery canonical sentence: «لكل صفحة عنوان أساسي مستقل» → «لكل صفحة رابط أساسي مستقل» so it means a URL rather than a page title.
- Anniversary active body: «عرض ترقية محدود» → «عرض ترقية لفترة محدودة» to explicitly preserve the time qualifier.
- Anniversary final CTA: «اكتشف الذكرى السنوية (بالإنجليزية)» → «اكتشف قصة الذكرى السنوية (بالإنجليزية)» for natural destination wording.

The terminology guide records the coordinator's selected ASCII routes and MSA/numeral/product guardrails. This is a model language review of actual source strings, not human native-speaker certification or a substitute for the separate rendered RTL and product review.

Foundation shared-language disposition: accepted after these repairs.

Also reviewed Arabic-only matching added in `scripts/audit-seo-ai-hygiene.mjs`: «مثال / توضيحي / النتيجة / النتائج» correctly identify example/illustrative/result/results wording; the positioning terms correctly match authored money-between-people, outstanding-money, repayment, balance, shared-expense and loan language. Accepted as localized audit matching, not evidence that merely matching one word proves factual quality.
