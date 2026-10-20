# Arabic terminology and review conventions — 20 October 2026

Applies to the five-page Arabic batch and its necessary shared/private UI. The current English pages define product meaning. Use contemporary, clear Modern Standard Arabic across markets. Independent model language review is not human native-speaker certification.

## Voice and typography

Address one reader naturally, usually with a direct imperative: «سجّل»، «راجع»، «احسب»، «انسخ»، «شارك». Prefer concrete short clauses and «المبلغ» or «الرصيد» to bureaucratic phrasing. Avoid dialect, country-specific assumptions, legal/religious claims, literal English syntax and promises that another person will repay. Standard financial interest is «فائدة»; do not introduce a religious characterization.

Use Arabic punctuation in prose (، ؛ ؟), no forced uppercase or letter spacing, and normal joined Arabic shaping. Preserve Latin product names and extensions. Introduce names with a natural explanation: «رابط Live Link لعرض الرصيد»، «ميزة Balance Sync لمزامنة الرصيد بين مستخدمين». Mark remaining English destinations «بالإنجليزية» at the link or clearly associated text. Label examples honestly: «مثال توضيحي، وليس لقطة من التطبيق» where replacing a screenshot with an illustration.

## Core terms and distinctions

| English meaning | Preferred Arabic | Semantic guardrail |
| --- | --- | --- |
| Money someone owes you | مبالغ مستحقة لك / ما يدين به الآخرون لك | Reader is creditor. Avoid an ambiguous bare «ديونك». |
| Money you owe | مبالغ مستحقة عليك / ما تدين به للآخرين | Reader is debtor. |
| Who owes whom | من يدين لمن | Transfers must name payer and recipient explicitly. |
| IOU | مبلغ مستحق بين شخصين / إقرار بمبلغ مستحق when an actual record is meant | Do not imply a legal instrument or enforceability. |
| Running balance | الرصيد المتغيّر مع كل عملية / الرصيد الجاري after explanation | Includes movement in both directions. |
| Outstanding / remaining balance | الرصيد المتبقي | Does not automatically mean overdue. |
| Overdue amount | المبلغ المتأخر عن موعده | Distinguish future due amounts. |
| Repayment | سداد / دفعة سداد | Use a payment noun when referring to a recorded event. |
| Partial repayment | سداد جزئي / دفعة سداد جزئية | Not necessarily a scheduled installment. |
| Installment | قسط | A scheduled obligation; distinguish whole-loan remaining balance. |
| Unpaid installment amount | المتبقي من القسط | Not «الرصيد المتبقي من القرض». |
| Repayment plan | خطة سداد | Follows recorded actual payments; no automatic collection. |
| Loan Record | سجل قرض | Separate named loan; still contributes to overall balance with the person. |
| Projected payoff | الموعد المتوقع لاكتمال السداد | A projection, not a guaranteed payment date. |
| Loan Outlook | Loan Outlook — نظرة على مواعيد سداد القروض | Upcoming and overdue stay distinct; totals remain in their currencies. |
| Payment reminder | تذكير بالسداد | Personal/enabled reminder, not a payment demand sent automatically. |
| Follow-up message | رسالة متابعة | Distinguish composing a message from automatically sending it. |
| Payment report | بلاغ عن دفعة / إبلاغ عن دفعة | Recipient reports; owner reviews before any record/balance change. |
| Write-off | إغلاق قيد دون سداد / استبعاد مبلغ غير مسدد من الرصيد | Eligible individual entry only; history retained, distinct from actual payment, can reopen. Avoid tax/legal forgiveness implications. |
| Interest | فائدة | Percentage or fixed according to agreed terms; no invented advice. |
| Reducing-balance annual interest | فائدة سنوية على الرصيد المتناقص | Preserve algorithm and source qualifications. |
| Shared expense | مصروف مشترك | «تقسيم المصروفات» for splitting, «تسوية» for transfers. |
| Fair share | الحصة المستحقة على كل شخص / حصة كل شخص | Avoid claiming a moral/legal judgment. |
| Payer | من دفع / الدافع | In expense entry: original payer; in settlement: sender of transfer. |
| Settled | تمت التسوية / مسدّد according to context | Do not represent an expected transfer as already paid. |
| Free plan / free download | الخطة المجانية / تنزيل مجاني | Preserve included limits and optional paid upgrades. One active repayment plan free is not unlimited free plans. |

## Numbers, dates and direction

Display **Western digits 0–9**, a dot decimal separator and comma grouping for financial examples and calculator values. Explicitly request Latin numbering in Arabic formatters. Keep real values, currency codes and money precision. Examples in USD remain USD; language never selects a country, storefront, converted currency or different calendar. Use Gregorian dates, e.g. «1 نوفمبر 2026»; do not silently adopt Hijri dates. Keep exact dates from the source.

At the input boundary, accept ordinary Arabic-Indic digits «٠١٢٣٤٥٦٧٨٩» (and Persian digits where supported), Arabic decimal «٫» and grouping «٬», with explicit validation. Reject malformed/ambiguous combinations with a useful Arabic error. Do not reinterpret a negative value as positive or strip unknown punctuation until it looks valid. Preserve existing en/es/de parsing and financial precision. Browser input acceptance requires a rendered test.

Set Arabic documents to `lang="ar" dir="rtl"`. Use `bdi`/`dir="auto"` for participant names and intentional LTR boundaries for known Latin names, currency codes, amounts, emails and URLs. Do not reverse digits, change calculation/schema values to repair presentation, mirror QR codes/screenshots/logos or put hidden directional characters into financial payloads. Check punctuation and debt direction in visual results **and copied/shared plain text**.

## Financial and product review fixtures

- Loan example: USD 1,200 − payment 150 = whole-loan remainder 1,050; a 200 installment still needs 50. Later payment 300 completes 50, covers next 200 and carries 50 forward, leaving 750; a further 100 borrowed gives 850. The separate two-loan snapshot is after the first payment: 1,050 + 400 = 1,450.
- Live Link: viewing without an app/account; optional reporting invitation; reporting alone never changes the balance. Balance Sync: exactly two app users, supported connected entries, unavailable to an Android participant.
- Browser tool handles a quick split; ongoing records are in the iPhone/iPad app. An App Clip offers the scoped trial/continuation, not a full browser app. Import is one loan at a time, reviewed before saving, supported interest-free schedules only, and does not keep a spreadsheet synchronized.
- Calculator: preserve 180 example, 98 ÷ 8 rounding, zero/negative validation, long mixed-script names, settled/multi-payer/eligible/ineligible states, and unaltered copy/share/continuation consent/schema behavior.

## Accepted stable routes

Use `/ar/` plus the English source slugs: `/ar/`, `/ar/solutions/app-to-track-money-owed/`, `/ar/blog/how-to-keep-track-of-who-owes-you-money/`, `/ar/solutions/personal-loan-repayment-tracker/`, `/ar/tools/split-expense-calculator/`. Arabic titles, navigation and body remain natural Arabic. Stable ASCII slugs avoid percent-encoded/Unicode duplicate-canonical complexity; preserve all existing counterpart routes.
