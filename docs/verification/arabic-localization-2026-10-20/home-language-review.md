# Independent Arabic homepage language review

Reviewer: arabic_language, GPT-6.1 Sol/high; independent of page author. Reviewed actual final Arabic HTML against the current English homepage, full visible body, title/description/social metadata, SoftwareApplication/WebSite/VideoObject JSON-LD, links/accessibility labels, testimonial attribution, six HTML illustrations, neutral QR alt/caption and Arabic SVG poster source. Ran independent Chrome at 390/1440 with Arabic browser locale, analytics and external requests blocked; captures and runtime text are `language-home-*.png` and `language-home-browser.json`.

Language disposition: accepted after three repairs applied by the author:

- Removed `bdi` markup from raw-text `<title>`; actual Chrome document title now plain Arabic/brand text.
- Changed «تتحدّث الخطة» to «تُحدَّث الخطة» to clearly mean the plan is updated, not that it speaks.
- Changed «أداة مجانية لحساب واحد» to «أداة مجانية لإجراء حساب لمرة واحدة» to clearly mean a one-time calculation, not one account.

MSA text reads naturally across markets. Creditor/debtor direction stays explicit; example 340 USD paid on Alex's behalf minus 180 USD repaid leaves 160 USD owed to the reader. Western digits and USD remain unchanged. Six replacement illustrations have Arabic pixels/HTML and explicit illustrative/non-screenshot labels; the separate Arabic SVG poster labels its English video honestly. QR code stays unmirrored and the neutral app-ID destination retains the existing campaign. Translated testimonials retain their original reviewer handles and are labeled translations, not Arabic customer reviews.

Product boundaries remain correct: app versus browser tools; iPhone/iPad versus Android; Live Link viewing and optional owner-reviewed payment reports without automatic record changes; exactly two app users for Balance Sync; actual-payment plan updates; optional upgrades and separate Spaces purchase; offline/no mandatory registration; one-loan reviewed import without spreadsheet sync. Unlocalized resources/video are labeled English. Brand/product names are preserved with bidi isolation in rendered prose. JSON-LD retains real product names and original video language/date rather than invented Arabic video claims.

Runtime language checks confirm Arabic app-support message, Arabic menu toggle/close label, `lang="ar" dir="rtl"`, loaded Arabic poster and neutral QR, and Arabic font stack in final repeated capture. Three rendered observations were resolved before language acceptance:

- 390 px hero element capture appeared clipped; this is an element-capture artifact. Inspected technical review's `independent-home-390.png` viewport screenshot and confirmed complete readable H1 inside the viewport.
- Live Link CTA initially split Arabic/Latin/fallback spans into narrow columns. Repeated independent capture of current CSS now shows natural inline wrapping and separated fallback.
- Initial menu snapshot preceded the panel transition; repeated with 700 ms transition wait confirms seven navigation links and Arabic close label. Final screenshot is `language-home-menu-390.png`.

Final homepage language disposition: accepted. Separate technical/product/RTL acceptance remains the technical reviewer's responsibility.

This is independent model language review, not human native-speaker certification. No native saving, real transfer, App Store opening or customer data was used.
