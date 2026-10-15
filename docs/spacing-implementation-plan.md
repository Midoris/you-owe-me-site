# Sequential spacing implementation plan

Implement the 26 approved findings from the 15 October 2026 audit, one finding at a time. Findings **14 and 22 are excluded**. The accepted scope covers **82 routes**. Progress: **17 of 26 complete**.

The [scope ledger](spacing-implementation-plan.json) freezes each finding’s affected routes, sections, stylesheets and success criteria. The original [numbered audit](../audits/spacing-2026-10-15/review.html) remains the before reference. After screenshots and measurements are saved under `audits/spacing-implementation-2026-10-15/`.

## Per finding sequence

1. Mark only the next accepted finding active, in number order.
2. Inspect its current UI and code against the frozen scope. Account for any earlier fix that overlaps it.
3. Implement that finding’s change using the existing design system.
4. Review the complete diff. Run the scoped design audit and relevant functional checks. Shared changes must be checked across their affected routes.
5. Verify on localhost at 390px mobile and 1440px desktop; use 360px for header and width changes. Inspect screenshots and relevant calculated spacing, wrapping, overflow and grouping. Exercise affected navigation or calculator interactions.
6. Save evidence and update the ledger with implementation and validation results. Commit that finding and its ledger update only after the checks are satisfactory.
7. Verify the commit and a clean tracked working tree before starting the next finding.
8. After all 26, run a combined regression pass and check the exclusions.

Spacing numbers are design starting points, not blanket padding rules. Keep text, links and calculator values intact. Preserve the homepage capability/poster arrangement excluded by #14 and the Tools introduction content and destination structure excluded by #22. Other approved spacing rules may apply inside those pages.

## Ordered work and progress

| Audit number | Finding | Affected routes | Sizes | Status |
| --- | --- | ---: | --- | --- |
| 01 | Solutions checklist collapses linked text into a zero-width column | 1 | Mobile + Desktop | complete (`86994dd`) |
| 02 | Privacy summary turns into one very long disclosure column | 1 | Mobile + Desktop | complete (`fa09b8e`) |
| 03 | Working-agreement fields have almost no inner padding | 1 | Mobile + Desktop | complete (`473eaee`) |
| 04 | Mobile Menu covers long breadcrumbs | 28 | Mobile | complete (`0d03a8e`) |
| 05 | Invitation-page navigation clips off mobile destinations | 2 | Mobile | complete (`1bfaae3`) |
| 06 | Article titles use an unnecessarily narrow mobile measure | 14 | Mobile | complete (`66e5009`) |
| 07 | Bare mobile text sits too close to the screen edge | 74 | Mobile | complete (`30e497b`) |
| 08 | Separate paragraphs run together into one block | 47 | Mobile + Desktop | complete (`66ed278`) |
| 09 | Actions attach directly to the paragraph above | 20 | Mobile + Desktop | complete (`6204aa8`) |
| 10 | Dense cards need more room around headings | 11 | Mobile + Desktop | complete (`53a50a1`) |
| 11 | Find directory actions stack with no added gap | 1 | Mobile + Desktop | complete (`1053025`) |
| 12 | Notes and new sections hug the edge of the preceding card | 11 | Mobile + Desktop | complete (`0d6bd75`) |
| 13 | Homepage secondary guidance links form a cramped cluster | 1 | Mobile + Desktop | complete (`3dd37c2`) |
| 14 | Homepage capability cards squeeze text beside a narrow poster | 1 | Mobile | excluded |
| 15 | Homepage resource rows give titles and descriptions little separation | 1 | Mobile + Desktop | complete (`d157b60`) |
| 16 | Features participation table is cramped on a phone | 1 | Mobile | complete (`71e3938`) |
| 17 | Privacy table headings keep a narrow desktop column width | 1 | Mobile | complete (`fa94e7c`) |
| 18 | Compare hub keeps dense label/value columns on mobile | 1 | Mobile | complete |
| 19 | “Do not say / Try instead” examples lose their pairing on mobile | 1 | Mobile | pending |
| 20 | Text-heavy desktop grids have too many narrow columns | 26 | Desktop | pending |
| 21 | Tools hub gives long titles a disproportionately small column | 1 | Desktop | pending |
| 22 | Tools hub introduction crowds many pathways before the choices | 1 | Mobile | excluded |
| 23 | Solutions cards crowd tags, status and action together | 1 | Mobile + Desktop | pending |
| 24 | Client example does not clearly separate label/value pairs | 1 | Mobile | pending |
| 25 | Parent-expense example needs stronger grouping inside each entry | 1 | Mobile | pending |
| 26 | Roommate result packs many responsibility labels into one narrow stack | 1 | Mobile + Desktop | pending |
| 27 | Debt page contents links wrap into a tight inline cluster | 1 | Mobile | pending |
| 28 | Blog transition CTA has almost no button padding | 1 | Mobile + Desktop | pending |

## Baseline checks

Baseline commit: `aa1d90a559ed285fa42b89fe50546594df56c88c`. Work branch: `codex/spacing-polish`.

The design audit passes on 81 of the 82 affected routes. `/privacy-policy/` has eight existing missing modern-page tokens in its legal stylesheet; these are recorded in the ledger. Its spacing fix will be checked against that baseline, without expanding this task into a legal-page color/theme redesign.

The full existing test suite passes 174 of 175 tests. The existing EXP-008 metadata test expects an older article modification date. Compare subsequent runs to this baseline; any new failure must be resolved before the relevant fix is committed.

All browser verification uses the analytics-free localhost preview. No production navigation, push, publication or deployment is part of this task. Raw audit images remain local and are not included in the source commits.
