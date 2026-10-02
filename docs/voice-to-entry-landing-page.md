# Voice to Entry landing page — October 2, 2026

Canonical route: https://you-owe-me.com/voice-to-entry/

This evergreen feature page explains everyday voice or typed capture, multiple
regular entries, shared-bill splits, explicit new-person confirmation and
financial settings. The owner authorized publishing the supported capabilities,
including next-release additions, using evergreen wording. Public version and
“coming in 7.1.7” claims have therefore been removed from the Features and Quick
Start sections, metadata, content registry and llms discovery descriptions.

## Product evidence and scope

The current native repository documents are authoritative:
`docs/voice-entry-guide-and-discovery-7.1.8.md`,
`docs/voice-entry-new-person-7.1.8.md` and
`docs/voice-entry-split-v3-contract.md`. No iOS/backend file was edited here.
The original app guide and current five-bar lime AI artwork informed the web
presentation. Regular split entries remain distinct from Group Paybacks,
separate Loan Records, repayment plans and a collaborative ledger.

The €60 lunch hero shows two €20 entries, excluding the user's own €20 share.
Five local examples show two named people, one name carried into a repayment,
three €125 shares from a €500 four-person bill, a mixed saved/new-person batch,
and recurrence/interest/currency/due date settings. The split explanation also
shows an explicit half share. New Maya is labeled Add person and Not saved.
No invented note is added to the repayment. “Calculated equal share” is an
explanatory calculation label. All names are fictional; saved states explicitly
assume unique existing identities, complete details and an available allowance.

No example calls a model, accesses a microphone, accepts personal input or
creates records. The small script only selects prewritten HTML panels. Native
FAQ disclosures work without scripting. When JavaScript is absent, all five
examples are visible; the unused tab controls remain hidden.

## Visual, accessibility and discovery

The main visual uses editable HTML and the current AI-button SVG. The social
card is a 1200×630 JPEG captured from a temporary HTML composition of that same
hero. Important page wording and amounts remain selectable, accessible text.
No AI-generated bitmap or obsolete screenshot is used. Main cards use the page
contract; the 16px result-card radii represent a smaller illustrative app UI.

The page uses the established full-width shell, mobile navigation, brand lime,
Merriweather/Source Sans typography and attributed App Store CTA. The main
landmark has a keyboard skip target, the tabs use roving focus with Left/Right,
Home/End and named panels, and FAQ answers remain native disclosures. New
controls have dark focus outlines; tab colors override the inherited cyan
hover rule. Tab changes are static, with no animation. Reduce Motion suppresses
inherited transitions. The footer text is dark on the light page background. The inherited mobile
menu close icon has a readable label and Escape closes it and restores focus.

Metadata includes a unique title/description, canonical, OG/Twitter art and
image descriptions, breadcrumbs and FAQ JSON-LD matching the five visible
answers exactly. The content registry and sitemap include the new route;
llms.txt, Features, Quick Start and two directly relevant existing mentions
link to it. Language support includes the new acquisition route and its hidden
no-script-safe anchor. The page's explicit start/guide/feature links replace a
duplicative Best Next Step module; the registry documents this decision.

## Verification

- 154 repository tests passed. The inclusion-count test changes from 79 to 80
  because this new acquisition page joins the language-support scope.
- Static Best Next Step build: 80 modules, zero generated drift. Sitemap: 81
  indexable URLs. Content registry: 86 entries.
- Page-design audits for the new page, Features and Quick Start; content
  registry/routing, SEO/AI and language audits: zero hard errors. Existing
  warnings concern unrelated link counts, CTA labels and a historical date.
- Script/registry syntax and diff whitespace checks passed. HTML IDs, 358 local
  links/assets across the three relevant pages, anchors, attributed App Store
  targets, image descriptions and SVG/sitemap XML were validated.
- All five example states tested at 1440, 1024, 768, 390 and 320px: no overflow
  or clipped example content; quote/body text is at least 16px. Images loaded.
  Features and Quick Start were also checked at 1440, 390 and 320px, including
  the actual link navigation to the new page.
- Keyboard tab selection, focus, Home/End, skip link and FAQ toggling exercised.
  The rendered text styles have a conservative minimum 5.64:1 contrast;
  selected/hover/focused tab text is dark on lime.
- Temporary preview fixture blocked all scripts, applied the existing no-script
  fallback and forced the Reduce Motion CSS branch. All five examples and FAQ
  worked; animations were none, transitions zero and no overflow appeared.
  No OS/browser preference was changed.

## Production

Use the established master-branch GitHub Pages deployment. Wait for successful
build/deployment, compare production HTML/CSS/script/social art and discovery
files with the committed bytes, inspect the page in the live browser, exercise
its tabs and incoming/outgoing links, and capture production screenshots.
Search Console indexing remains with the orchestrating iOS task; this task does
not operate Safari or the user's private browsing windows.

## Existing-loan linking update — October 2, 2026

A compact loan-payment presentation follows the hero, ahead of the flow and
examples. The second example tab shows a fictional €50 Alex → You repayment
and €100 You → Alex principal advance, each visibly linked to the existing Car
loan. Both can be spoken individually or in a batch. The illustrated result
labels describe the transfer; they do not invent a dictated note or interest
setting. The existing hero and social image remain suitable.

The FAQ and matching structured data describe named unique loans, the generic
single-eligible-loan rule, preservation for review on unclear/duplicate/missing
matches, explicit scoped split linking and identity/eligibility revalidation.
A plain repayment does not acquire a loan link automatically. Loan creation,
terms and repayment-plan changes remain outside voice capture; interest stays
with the loan. Date, note, currency, recurrence and due-reminder support remain.
Facts came from the coordinating native task; no native repository or Simulator
was operated for this website change. The coordinating task confirmed the final app facts and approved commit and
production deployment after local review.

Features, Quick Start, the privacy AI-context paragraph, registry and llms
summary are aligned. The privacy section now describes conditional automatic
saving and candidate existing loan names/identifiers. Canonical route, sitemap,
in-app guide route, social assets and attributed App Store links are stable.

Verification before publishing: 154 repository tests pass; all four affected
page design audits have zero errors. Registry/routing/SEO/language audits have
zero hard errors, with existing unrelated warnings. Generated Best Next Step
modules and the 81-route sitemap have no drift. Six visible FAQ answers match
schema text exactly; 363 local references/anchors across the three acquisition
pages resolve. All 30 example/viewport combinations (1440/1024/768/390/320)
show one selected panel, loaded images and no overflow or clipped text. Keyboard
arrows, Home/End, skip link, mobile Escape dismissal, FAQ and initial/repeated
loan deep links work. Features and Quick Start links reach the correct section
or selected loan panel. The script-disabled 320px fixture displays all six
examples and a working loan FAQ; forcing the Reduce Motion CSS branch produces
no animation or transition. These are the local checks preceding production deployment.

Recording instructions retain the actual visible Create entry label: first capture
starts manually through Dictate, while eligible future sessions may record on
opening the AI button. The Voice page, Features and Quick Start use the same
short flow. The coordinating task approved linked recurrence/due-reminder
support and privacy context wording.
