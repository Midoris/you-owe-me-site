# Homepage money story

The approved Quiet Focus story sits after the homepage hero. It replaces the small loan-repaid-in-part example; the hero is focused on the download action, with real app screenshots retained in the feature section. The original released version ended at Paid in full with no extra promotional outro. The September 26 uncommitted preview adds a restrained eighth chapter after that payoff.

`styles/money-story.css` scopes the presentation to `#money-story`. The deliberate design exception is a centered, lighter-weight system-font display inside this self-contained narrative; surrounding site typography remains unchanged. The white introduction and pale stage use the site’s ink and lime palette.

`assets/js/money-story.mjs` exports `initMoneyStory(root, data)` and uses `money-story-data.mjs` for seven narrative chapters plus a final app invitation. Other stories reuse the renderer with their own chapter data and matching static fallback. Reminder and statement chapters do not alter the balance. The final amount animates to zero, then disappears in favor of Paid in full; the invitation follows as a separate chapter. Reverse navigation cancels pending animation. Reduced motion snaps to each result.

Without JavaScript, the eight-step ordered list and its App Store action remain usable. Chapter buttons and a Skip story link provide alternatives to scrolling. No wheel or touch events are intercepted. The homepage shell changes overflow from scroll-container clipping to visible ancestors plus body clipping so sticky positioning works on mobile. The stage leaves 52px for the mobile menu.

The eighth chapter keeps the same scroll interval as the previous seven. Its copy and action sit directly on the pale stage, with no enclosing card. The official App Store badge appears on mobile; eligible desktops use the existing QR handoff behavior and image. Existing analytics events use separate homepage-story CTA locations. No new event schema or experiment is introduced by this preview.

## Homepage cleanup (local, September 26)

The sequence is hero → story → existing-loan import → review teaser → concise product definition → three situation paths. The two former how-it-works summaries are removed. The definition keeps the language-availability line and an official App Store badge for visitors who have just seen the story. Offline use remains explained in the FAQ; privacy remains linked in the footer.

The hero’s screenshot and competing situation/import text links are removed. The existing desktop QR handoff moves into the second hero column, keeping its destination, eligibility and tracking. Mobile keeps the primary App Store action. Real app screenshots remain in three feature cards: Loan Records, Repayment Plans and Live Link. A four-item summary replaces the long feature inventory and points to Features and Quick Start. Reviews, the ten-year story, further situations, resources, FAQ and closing download action remain.

`styles/landing-cleanup.css` contains scoped layout adjustments; generated situation markup remains intact and its registry placement is now `after-definition`. No event schema is changed.

## Final refinement and release authorization

On September 26 the owner authorized commit and production deployment after final verification. Hero reassurance copy is removed, the review teaser is a prominent testimonial card, and the video heading uses the full available column instead of a 15-character measure. The import guide and website-to-iPhone explanation are retained. Story subtitles explicitly center their last line to override the legacy paragraph rule.

Publish through the existing master-branch GitHub Pages workflow. Verify the released HTML, styles and story modules match the committed files and inspect desktop and iPhone layouts after publication.


## October 14, 2026 · Static homepage balance (local implementation)

The owner selected the green compact “May → August” workshop with its original “$340 covered · $180 repaid” wording. The active homepage block is now one static illustration: $160, Alex owes you, and those totals. The story remains after the hero and before loan import. Desktop scales the same card to 530px wide / roughly 320px tall with surrounding space; mobile keeps the compact 340px maximum width. No extra narrative, story controls, sticky track or viewport-height requirement is added. The existing hero App Store action and desktop QR remain intact.

This self-contained display deliberately retains the workshop’s lighter system-font typography, neutral line, pale lime background and thin green border; the surrounding homepage design contract is unchanged. The illustration is synthetic: $300 bill + $40 groceries − $100 repayment − $80 repayment = $160. The compact totals aggregate that example over May–August; there is no new event schema or automatic-payment claim.

The original eight-chapter markup remains inside the inert `homepage-interactive-story-backup` template. Shared story CSS/JS/data remain in the repository and continue to serve the borrower and roommate pages. To restore the homepage story, replace the active block with that template’s content, remove the template, and restore the homepage stylesheet/module links from the previous Git revision. The static CSS is isolated to the homepage. Existing hero/definition/closing handoffs and tracking are retained; old story CTA locations are now inactive.

Implementation is local and uncommitted, not a production release. The clearer-label alternative is kept in the Business workshop for comparison; it is not the selected homepage wording.

### October 14 publication follow-through

The owner subsequently approved committing and deploying this selected version. The local/uncommitted paragraph above records the pre-publication stage. Final commit, deployment receipt and live verification are recorded in the Business workspace under `workshops/2026-10-14-static-homepage-stories/implementation/RELEASE.md`. The retained template and the restoration instructions above remain part of the deployed source.
