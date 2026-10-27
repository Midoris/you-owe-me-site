# Roommate move-in checklist implementation QA

Date: 2026-10-27. Status: ready for independent review. No commit or deployment performed by page implementer.

## Scope

Created only the new route `tools/roommate-move-in-checklist/index.html`, page stylesheet `styles/roommate-move-in-checklist.css`, download files `downloads/roommate-move-in-checklist.xlsx` and `.csv`, source generator `scripts/build-roommate-move-in-checklist.mjs`, and this verification folder. Existing unrelated untracked files preserved. Shared integration belongs to the integration agent.

The HTML follows the parent-authored ROOMMATE-SPEC.md, with the semantic example preview, eight ordered sections, six visible FAQs with matching FAQPage JSON-LD, WebPage/BreadcrumbList, canonical/index-follow metadata, original approved app copy and roommate CPP/QR. Existing neutral app icon is the social image. Person name follows the existing author convention with no invented profile URL. The page uses `analytics.js?v=outreach20261027` as directed by integration.

## Checks and evidence

- `design-audit.txt`: scoped design audit, zero hard errors.
- `relevant-tests.tap`: 30 existing handoff, analytics bridge and app-language tests passed.
- `browser-checks.json`: 320/390/768/1440 layouts have pageWidth equal to viewport, no unintended overflow or browser errors, and working XLSX/CSV downloads. Starter anchor works. All six visible FAQ pairs match JSON-LD exactly. Desktop 768/1440 shows QR and hides paired App Store badge; iPhone simulation shows App Store badge, hides QR, and retains the existing smart banner meta. No-JavaScript 390 view retains eight sections, six answers and four download links. Programmatic-focus measurements in this first report reflect mouse modality; actual keyboard checks are recorded separately.
- `keyboard-checks.json`: real Tab then Shift+Tab gives a visible 3px contract outline at390/1440; the table scrolls with ArrowRight on mobile while the page remains within viewport.
- `workbook-verification.json`: independent openpyxl read inspection only, no parser writes. Two exact sheet names, 26 starter items, 100 editable rows, 74 blank rows, correct values in all36 example cells, table A7:L107, freeze C8, typed costs formatted0.00 and blank date column formattedyyyy-mm-dd. No formulas, macros or external links. CSV has one header and26 exact starter rows.
- Seven artifact-tool renders inspected visually: planner-title.png, planner-left.png, planner-right.png, example-title.png, example-left.png, example-right.png and example-note.png. Text and figures are legible, numeric240.00 and80/50 example notes are correct, titles/introduction visible. Partial left-table renders deliberately exclude merged A:L title bands; title renders cover those bands independently.
- Final representative page screenshots: `hero-390.png`, `hero-1440.png`, `app-handoff-1440.png`; iPhone screenshot `ios-handoff-390.png`; full-page viewport evidence `desktop-320.png`, `desktop-390.png`, `desktop-768.png`, `desktop-1440.png`; no-JavaScript `nojs-390.png`.

## Documented implementation detail

Artifact-tool public help advertises `allowBlank: true`, but this bundled runtime rejects that property. Parent approved supported empty choices in dropdown lists. The exported XML was independently inspected: Decision list is `,Undecided,Bring,Buy,Skip`; Status list is `,Not started,Bringing,Ordered,Ready,Skipped`. Cells start blank and there is no error alert. No unsupported XML rewrite was used. A native Excel application interaction was not performed.

The workbook generator uses only the bundled artifact-tool and runtime, and moves its automatic export diagnostic out of public downloads into this evidence folder. No project dependency was installed. No formula-based debt calculation is present.

Local preview server is at `http://127.0.0.1:8817/tools/roommate-move-in-checklist/` (Python http.server session). Independent review and production byte/interaction verification remain with coordinator/release.
