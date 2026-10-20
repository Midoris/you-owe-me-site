# Money-owed recordkeeping guide: independent German language review

20 October 2026. Reviewer: independent GPT-6.1 Sol/high model agent; no human native-speaker certification. Actual `de/blog/wer-schuldet-mir-geld/index.html` compared directly with English `blog/how-to-keep-track-of-who-owes-you-money/index.html`, release terminology and shared `scripts/recordkeeping-guide-es.js`. Read-only page/runtime review; root owns fixes. No indexing or publication.

Decision: **accepted**. No material language, financial-direction, product-meaning or copy-template finding. Informal singular instructions and neutral record-confirmation tone are natural. Two optional polish notes below are not acceptance blockers.

Reviewed hashes after root applied the optional polish (rechecked):

- HTML: `103f09ffa2fdde3013818ec6872e4d51bb7a2a3f84ab2d56f577faeee0a564de`.
- Shared copy runtime: `1e4c78b37d6cd80bb19538f31c5f2ff99043bfc00571c4d4b304672a34ebc73f`.

## Accepted checks

- German title, description, Open Graph/Twitter, icon alt metadata, Article, localized breadcrumbs and FAQ JSON-LD preserve the source meaning. All schema parses. **Seven** visible/structured FAQ pairs match exactly as parsed and faithfully retain the source's distinctions between a note, table, payment history, calculator and ongoing app record.
- Both data tables, captions, column/row headings, statuses, date labels and next actions are German. Alex: 80−30=50 USD; Maya: 18−18=0 USD; Chris: 42−0=42 USD; group gift: 120−75=45 USD. The USD unit is explicit in caption and amounts. Nothing changes currency or suggests mixing currencies. The top illustrative example is correctly labeled as an example rather than an app screenshot and agrees with Alex's row.
- All **three actual static `data-template` values** were inspected, not just visible labels. The blank template has nine real lines when entities decode; it explicitly states `[Name A] schuldet [Name B]`, currency, initial amount, dates, actual payments, sum repaid, balance, status and next check-in. One record per person/currency and one new line per actual repayment are clear.
- Full confirmation neutrally reconciles original/repaid/open amounts for a reason and asks whether the recipient's records agree. Short confirmation neutrally asks the other person to identify any omission. Neither adds threats, payment promises, automatic acceptance or stronger debt/legal assertions. Visible quotations and copied strings match apart from quotation marks, as intended.
- Three copy controls have German labels/aria labels. Shared runtime German `Kopiert`, `Kopiert: `, fallback `Text`, and `Kopieren nicht möglich. Markiere den Text und kopiere ihn manuell.` are clear and idiomatic. The success message includes the German card heading; reset restores the original German label and clears live status. All four Spanish runtime strings remain identical to the accepted `bfd69d7` version. The compatibility filename does not leak into product text.
- All **60** links were enumerated. Every internal English destination outside the explicit English language switch carries `auf Englisch`; reviewed German solution/home links are localized. German navigation, footer, breadcrumb, table regions, copy controls, store controls and language switch have appropriate static labels.
- Loan import is explicitly English, one private loan at a time, checked/corrected before saving, without ongoing spreadsheet synchronization. Browser calculations, copied notes and the maintained iPhone record remain distinct. One person can keep records and share context without requiring the other person to install the app. No unsupported payment execution, debt collection, full browser app or legal/security guarantee is introduced.
- Related cards and final CTAs preserve source scope. The guide recommends the simplest adequate method and keeps private loan planning, group repayments, receipts, partial repayments and running balance concepts distinct. Existing analytics identifiers and success-only runtime event semantics are unchanged by copy wording.

## Optional polish applied and rechecked

- `de/blog/wer-schuldet-mir-geld/index.html:266`: `aria-label="Was du mit diesem Leitfaden festhalten kannst"` now replaces `Was dir dieser Leitfaden hilft festzuhalten`; verified in the saved page.
- FAQ/schema phrase `gelassener zu erinnern` can be made more idiomatic with `gelassener nachzufragen` or `gelassener an Zahlungen zu erinnern`. Root chose `gelassener nachzufragen` in both visible text and schema; verified in the saved page.

This is static language/product review. Actual Clipboard API/fallback/failure interactions, event payload verification, timer behavior, responsive layout and no-JS behavior require the separate root technical evidence. German production completion remains gated during review.

Root acceptance note: both optional reviewer-proposed phrases were subsequently applied verbatim: “Was du mit diesem Leitfaden festhalten kannst” and visible/schema “gelassener nachzufragen”. No template payload or runtime behavior changed.
