# Independent Arabic recordkeeping guide language review

Reviewer: arabic_language, GPT-6.1 Sol/high, independent of page author. Reviewed actual Arabic guide against current English source: complete prose, seven FAQ/JSON-LD pairs, Article/BreadcrumbList metadata, accessible labels, illustration, formula, ledger and method-choice tables, all three visible copy templates and plain `data-template` values, English-resource labels, navigation/footer and shared runtime copy wording.

The guide preserves a practical creditor-facing record with explicit debtor/creditor names, original amount, actual repayments, outstanding balance, status and optional next date. It distinguishes one-note records, a partial-payment calculation, a running balance in both directions, group repayments and continuing app history. The four ledger rows preserve all USD values and Gregorian dates: 80−30=50; 18−18=0; 42−0=42; 120−75=45. The labeled Arabic HTML illustration uses the same 80−30=50 example. One record per person/currency and a separate new line per actual payment remain explicit. No legal enforcement, bank, automatic collection, country/currency or calendar claim was added.

Two clarity refinements proposed and confirmed applied by root in final body/attribute/schema source:

- Short confirmation «المتبقي لديّ عن [السبب]» → «المبلغ المتبقي في سجلّي عن [السبب]» to make this a ledger remainder rather than cash in the speaker's possession, in visible and copied text.
- FAQ/JSON-LD «قد يثبت سجلّ تطبيق الدفع انتقال المال» → «قد يوضّح سجلّ تطبيق الدفع انتقال المال» to preserve source “may show” without a stronger proof implication.

Independent actual Chrome review at 390/1440 with Arabic browser locale confirms shaped readable Arabic heading/prose/illustration and Arabic app-support/menu states. Independently clicked all three live copy controls with a synthetic clipboard, inspected exact copied Arabic and live-region status: the blank record preserves exactly nine lines; full/short messages preserve Arabic placeholders and neutral reconciliation tone; no copied HTML or invisible directional-control payload. Button success is «تم النسخ» and status identifies the copied card. Inspected rendered template and confirmation screenshots. Shared failure message «تعذّر النسخ. حدّد النص وانسخه يدويًا.» was independently accepted before page authoring; root/technical harness owns fallback/failure-event-path acceptance.

Evidence: `language-how-to-keep-track-of-who-owes-you-money-browser.json`, corresponding 390/1440 screenshots, `guide-language-copy.cjs`/`.json`, `language-guide-template-390.png` and `language-guide-confirmation-390.png`.

Repeated actual three-button Chrome copy capture after the repairs confirms the updated short message in the clipboard payload. Final guide language disposition: accepted after these refinements. Independent model review is not human native-speaker certification. Synthetic clipboard only; no private records, uploads, native saving or App Store opening.
