# Roommate template — retained story

October 14, 2026. The owner authorized removing the interactive story from the visible template page, retaining its code, and committing/deploying the change.

The original six-chapter markup is preserved inside the inert `roommate-interactive-story-backup` template in `tools/roommate-expense-tracker-template/index.html`. It produces no layout, scroll track, controls or active CTA. This page no longer loads `money-story.css` or `money-story.mjs`. Shared CSS, module and `roommateStory` data remain unchanged in the repository; the borrower story continues to use them.

Download choices now lead directly into the existing workbook overview, setup and worked example. The completed example, carry-forward guidance, summary message/copy button, existing desktop QR and later contextual app invitation remain intact. No replacement promotional section or analytics event is introduced. The page’s structured modification date and only its sitemap entry use October 14.

## Restoration

Take the contents of `roommate-interactive-story-backup` and replace the entire `money-story:start` / `money-story:end` marker block with those contents between the same markers. Remove the template wrapper and the extra active `money-story-end` anchor. Restore the page’s links to `../../styles/money-story.css?v=20260926-13` and `../../assets/js/money-story.mjs?v=20260926-10` from baseline commit `70ca12430ca425b2bf8e7963a7711c6e9adb84ad`. Preserve other subsequent page work, update release metadata, audit/preview, then commit and deploy normally. Reverting this change’s commit is also an option when it will not undo later work.

Exact release receipt and public verification are in the Business workspace under `workshops/2026-10-14-roommate-story-review/RELEASE.md`. No conversion effect is claimed by this usability change.
